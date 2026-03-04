#!/usr/bin/env node
"use strict";

const { spawn } = require("child_process");

const shopifyRunJsPath = process.argv[2];
if (!shopifyRunJsPath) {
  process.stderr.write("Missing Shopify CLI run.js path.\n");
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [shopifyRunJsPath, "theme", "language-server"],
  {
    stdio: ["pipe", "pipe", "inherit"],
    env: process.env,
  },
);

class LspParser {
  constructor(onMessage) {
    this.onMessage = onMessage;
    this.buffer = Buffer.alloc(0);
  }

  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.parse();
  }

  parse() {
    while (true) {
      const headerEnd = this.buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return;
      }

      const header = this.buffer.slice(0, headerEnd).toString("utf8");
      const lengthMatch = header.match(/content-length:\s*(\d+)/i);
      if (!lengthMatch) {
        this.buffer = this.buffer.slice(headerEnd + 4);
        continue;
      }

      const bodyLength = Number(lengthMatch[1]);
      const messageEnd = headerEnd + 4 + bodyLength;
      if (this.buffer.length < messageEnd) {
        return;
      }

      const body = this.buffer
        .slice(headerEnd + 4, messageEnd)
        .toString("utf8");
      this.buffer = this.buffer.slice(messageEnd);

      try {
        this.onMessage(JSON.parse(body));
      } catch (error) {
        process.stderr.write(`Failed to parse LSP payload: ${error}\n`);
      }
    }
  }
}

function writeLspMessage(stream, message) {
  const payload = JSON.stringify(message);
  stream.write(
    `Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n${payload}`,
  );
}

function hasResponseId(message) {
  return Object.prototype.hasOwnProperty.call(message, "id");
}

function isDefinitionRequest(message) {
  return (
    message &&
    message.method === "textDocument/definition" &&
    hasResponseId(message)
  );
}

function isEmptyDefinitionResult(result) {
  if (result == null) {
    return true;
  }
  if (Array.isArray(result)) {
    return result.length === 0;
  }
  return false;
}

function isPositionInRange(position, range) {
  if (!position || !range) {
    return false;
  }
  if (position.line < range.start.line || position.line > range.end.line) {
    return false;
  }
  if (
    position.line === range.start.line &&
    position.character < range.start.character
  ) {
    return false;
  }
  if (
    position.line === range.end.line &&
    position.character > range.end.character
  ) {
    return false;
  }
  return true;
}

function normalizeTargetUri(target) {
  if (typeof target !== "string" || target.length === 0) {
    return null;
  }
  const fragmentIndex = target.indexOf("#");
  return fragmentIndex === -1 ? target : target.slice(0, fragmentIndex);
}

const pendingDefinitionFallbacks = new Map();
const pendingInternalRequests = new Map();
let internalIdCounter = 1;

function forwardToClient(message) {
  writeLspMessage(process.stdout, message);
}

function forwardToServer(message) {
  writeLspMessage(child.stdin, message);
}

function sendDefinitionResult(parentRequestId, result) {
  forwardToClient({
    jsonrpc: "2.0",
    id: parentRequestId,
    result,
  });
}

function pickMatchingDocumentLink(links, position) {
  if (!Array.isArray(links)) {
    return null;
  }
  const exactMatch = links.find(
    (link) =>
      typeof link?.target === "string" &&
      isPositionInRange(position, link.range),
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Fallback: allow go-to-definition when cursor is on the same Liquid tag line.
  return (
    links.find(
      (link) =>
        typeof link?.target === "string" &&
        link?.range &&
        link.range.start.line === position?.line,
    ) || null
  );
}

function buildLocationFromTarget(targetUri) {
  return {
    uri: targetUri,
    range: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    },
  };
}

function requestDocumentLinks(
  parentRequestId,
  requestContext,
  emptyDefinitionResult,
) {
  const internalRequestId = `proxy-doclink-${internalIdCounter++}`;
  pendingInternalRequests.set(internalRequestId, {
    parentRequestId,
    position: requestContext.position,
    emptyDefinitionResult,
  });

  forwardToServer({
    jsonrpc: "2.0",
    id: internalRequestId,
    method: "textDocument/documentLink",
    params: {
      textDocument: requestContext.textDocument,
    },
  });
}

function handleClientMessage(message) {
  if (isDefinitionRequest(message)) {
    pendingDefinitionFallbacks.set(message.id, {
      textDocument: message.params?.textDocument,
      position: message.params?.position,
    });
  }
  forwardToServer(message);
}

function handleInternalRequestResponse(message, pendingRequest) {
  pendingInternalRequests.delete(message.id);

  if (message.error) {
    sendDefinitionResult(
      pendingRequest.parentRequestId,
      pendingRequest.emptyDefinitionResult,
    );
    return;
  }

  const matchingLink = pickMatchingDocumentLink(
    message.result,
    pendingRequest.position,
  );
  if (!matchingLink) {
    sendDefinitionResult(
      pendingRequest.parentRequestId,
      pendingRequest.emptyDefinitionResult,
    );
    return;
  }

  const targetUri = normalizeTargetUri(matchingLink.target);
  if (!targetUri) {
    sendDefinitionResult(
      pendingRequest.parentRequestId,
      pendingRequest.emptyDefinitionResult,
    );
    return;
  }

  sendDefinitionResult(pendingRequest.parentRequestId, [
    buildLocationFromTarget(targetUri),
  ]);
}

function handleDefinitionResponse(message, definitionContext) {
  pendingDefinitionFallbacks.delete(message.id);

  if (message.error || !isEmptyDefinitionResult(message.result)) {
    forwardToClient(message);
    return;
  }

  if (!definitionContext?.textDocument || !definitionContext?.position) {
    forwardToClient(message);
    return;
  }

  requestDocumentLinks(message.id, definitionContext, message.result);
}

function handleServerMessage(message) {
  if (!hasResponseId(message)) {
    forwardToClient(message);
    return;
  }

  const internalRequest = pendingInternalRequests.get(message.id);
  if (internalRequest) {
    handleInternalRequestResponse(message, internalRequest);
    return;
  }

  const definitionContext = pendingDefinitionFallbacks.get(message.id);
  if (definitionContext) {
    handleDefinitionResponse(message, definitionContext);
    return;
  }

  forwardToClient(message);
}

const clientParser = new LspParser(handleClientMessage);
const serverParser = new LspParser(handleServerMessage);

process.stdin.on("data", (chunk) => clientParser.push(chunk));
child.stdout.on("data", (chunk) => serverParser.push(chunk));

process.stdin.on("end", () => {
  child.stdin.end();
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.stderr.write(
      `Shopify language server exited with signal ${signal}\n`,
    );
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  process.stderr.write(`Failed to start Shopify language server: ${error}\n`);
  process.exit(1);
});
