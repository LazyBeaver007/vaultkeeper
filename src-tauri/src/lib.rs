use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::read_to_string;
use std::path::Path;

#[tauri::command]
fn open_vault(path: String) -> Result<String, String> {
    let file_path = Path::new(&path).join("vault.json");

    if !file_path.exists() {
        return Err("vault.json not found".into());
    }

    let content = read_to_string(file_path).map_err(|e| e.to_string())?;

    Ok(content)
}

#[derive(Serialize, Deserialize)]
struct VaultMeta {
    name: String,
    version: String,
    theme: String,
}

#[tauri::command]
fn create_vault(base_path: String, vault_name: String) -> Result<String, String> {
    let vault_path = Path::new(&base_path).join(&vault_name);

    if vault_path.exists() {
        return Err("Folder already exist".into());
    }

    fs::create_dir_all(vault_path.join("pages")).map_err(|e| e.to_string())?;
    fs::create_dir_all(vault_path.join("boards")).map_err(|e| e.to_string())?;
    fs::create_dir_all(vault_path.join("themes")).map_err(|e| e.to_string())?;
    fs::create_dir_all(vault_path.join("assets/fonts")).map_err(|e| e.to_string())?;

    let meta = VaultMeta {
        name: vault_name.clone(),
        version: "0.1".into(),
        theme: "codeon".into(),
    };

    let json = serde_json::to_string_pretty(&meta).map_err(|e| e.to_string())?;

    fs::write(vault_path.join("vault.json"), json).map_err(|e| e.to_string())?;

    Ok(vault_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![create_vault, open_vault])
        .run(tauri::generate_context!())
        .expect("error running app");
}
