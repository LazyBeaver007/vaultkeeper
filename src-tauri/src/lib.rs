use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::read_to_string;
use std::path::{Path, PathBuf};
use uuid::{Uuid};




#[tauri::command]
fn create_page(vault_path:String, title:String) -> Result<String,String>
{
    let pages_dir = pages_dir(&vault_path);

    let file_path = pages_dir.join(format!("{}.vkp", title));

    if file_path.exists() 
    {
        return Err("Page already exists".into());
    }

    let page = serde_json::json!(
    {
        "id": Uuid::new_v4().to_string(),
        "title":title,
        "content": "<p></p>"
    });

    fs::write(file_path, serde_json::to_string_pretty(&page).unwrap())
        .map_err(|e| e.to_string())?;

    Ok("Page created".into())
}




#[tauri::command]
fn list_pages(vault_path:String) -> Result<Vec<String>,String>
{
    let pages_dir = pages_dir(&vault_path);

    let mut pages = vec![];

    for entry in fs::read_dir(pages_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        pages.push(name);
    }

    Ok(pages)
}



#[tauri::command]
fn read_page(vault_path: String, file_name: String) -> Result<String, String> {
    let file_path = page_file_path(&vault_path, &file_name);

    let content = fs::read_to_string(file_path)
        .map_err(|e| e.to_string())?;

    Ok(content)
}

#[tauri::command]
fn save_page(vault_path: String, file_name: String, content: String) -> Result<(), String> {
    let file_path = page_file_path(&vault_path, &file_name);

    let existing = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let mut json: serde_json::Value =
        serde_json::from_str(&existing).map_err(|e| e.to_string())?;

    json["content"] = serde_json::Value::String(content);

    fs::write(
        file_path,
        serde_json::to_string_pretty(&json).unwrap(),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn trash_page(vault_path: String, file_name: String) -> Result<(), String> {
    let source_path = page_file_path(&vault_path, &file_name);

    if !source_path.exists() {
        return Err("Page not found".into());
    }

    let trash_dir = ensure_vault_trash(&vault_path)?;
    let destination = trash_dir.join(&file_name);

    if destination.exists() {
        return Err("A trashed page with the same name already exists".into());
    }

    fs::rename(source_path, destination).map_err(|e| e.to_string())?;

    Ok(())
}



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
    fs::create_dir_all(vault_path.join(".trash/pages")).map_err(|e| e.to_string())?;
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
        .invoke_handler(tauri::generate_handler![
            create_vault,
            open_vault,
            create_page,
            list_pages,
            read_page,
            save_page,
            trash_page
        ])
        .run(tauri::generate_context!())
        .expect("error running app");
}
fn pages_dir(vault_path: &str) -> PathBuf {
    Path::new(vault_path).join("pages")
}

fn trash_pages_dir(vault_path: &str) -> PathBuf {
    Path::new(vault_path).join(".trash").join("pages")
}

fn page_file_path(vault_path: &str, file_name: &str) -> PathBuf {
    pages_dir(vault_path).join(file_name)
}

fn ensure_vault_trash(vault_path: &str) -> Result<PathBuf, String> {
    let trash_dir = trash_pages_dir(vault_path);
    fs::create_dir_all(&trash_dir).map_err(|e| e.to_string())?;
    Ok(trash_dir)
}
