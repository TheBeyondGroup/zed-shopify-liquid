use std::{env, fs};
use zed::settings::LspSettings;
use zed_extension_api::{self as zed, serde_json, Result};

struct LiquidExtension {
    did_find_server: bool,
}

const SERVER_PATH: &str = "node_modules/@shopify/theme-language-server-node/dist/index.js";
const PROXY_PATH: &str = "lsp-proxy.js";
const PACKAGE_NAME: &str = "@shopify/theme-language-server-node";
const PROXY_SCRIPT: &str = include_str!("../lsp-proxy.js");

impl LiquidExtension {
    fn ensure_proxy_script(&self) -> Result<()> {
        match fs::read_to_string(PROXY_PATH) {
            Ok(existing) if existing == PROXY_SCRIPT => Ok(()),
            _ => {
                fs::write(PROXY_PATH, PROXY_SCRIPT)
                    .map_err(|error| format!("failed to write '{PROXY_PATH}': {error}"))?;
                Ok(())
            }
        }
    }

    fn server_exists(&self) -> bool {
        fs::metadata(SERVER_PATH).map_or(false, |stat| stat.is_file())
    }

    fn server_script_path(&mut self, language_server_id: &zed::LanguageServerId) -> Result<String> {
        let server_exists = self.server_exists();
        if self.did_find_server && server_exists {
            return Ok(SERVER_PATH.to_string());
        }

        zed::set_language_server_installation_status(
            language_server_id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );
        let version = zed::npm_package_latest_version(PACKAGE_NAME)?;

        if !server_exists
            || zed::npm_package_installed_version(PACKAGE_NAME)?.as_ref() != Some(&version)
        {
            zed::set_language_server_installation_status(
                language_server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );
            let result = zed::npm_install_package(PACKAGE_NAME, &version);
            match result {
                Ok(()) => {
                    if !self.server_exists() {
                        Err(format!(
                            "installed package '{PACKAGE_NAME}' did not contain expected path '{SERVER_PATH}'",
                        ))?;
                    }
                }
                Err(error) => {
                    if !self.server_exists() {
                        Err(error)?;
                    }
                }
            }
        }

        self.did_find_server = true;
        Ok(SERVER_PATH.to_string())
    }
}

impl zed::Extension for LiquidExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        self.ensure_proxy_script()?;
        let server_path = self.server_script_path(language_server_id)?;
        let cwd = env::current_dir().unwrap();
        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![
                cwd.join(PROXY_PATH).to_string_lossy().to_string(),
                cwd.join(&server_path).to_string_lossy().to_string(),
            ],
            env: Default::default(),
        })
    }

    fn language_server_workspace_configuration(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree("liquid", worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.settings.clone())
            .unwrap_or_default();

        Ok(Some(serde_json::json!({
            "liquid": settings
        })))
    }
}

zed::register_extension!(LiquidExtension);
