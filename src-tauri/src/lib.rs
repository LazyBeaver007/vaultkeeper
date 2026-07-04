use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::read_to_string;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
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
fn open_vault(app: AppHandle, path: String) -> Result<String, String> {
    let file_path = Path::new(&path).join("vault.json");

    if !file_path.exists() {
        return Err("vault.json not found".into());
    }

    allow_vault_scope(&app, Path::new(&path))?;

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
    fs::create_dir_all(vault_path.join("assets/images")).map_err(|e| e.to_string())?;
    fs::create_dir_all(vault_path.join("assets/thumbnails")).map_err(|e| e.to_string())?;
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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ImportedImageAsset {
    relative_path: String,
    absolute_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ResolvedImageAsset {
    relative_path: String,
    absolute_path: String,
    mime_type: String,
    bytes: Vec<u8>,
}

#[tauri::command]
fn import_image_file(
    app: AppHandle,
    vault_path: String,
    source_path: String,
) -> Result<ImportedImageAsset, String> {
    let source = Path::new(&source_path);

    if !source.exists() {
        return Err("Selected image does not exist".into());
    }

    let extension = extension_from_path(source)?;
    let destination = next_image_path(&vault_path, &extension);

    copy_image_to_vault(source, &destination)?;
    allow_vault_scope(&app, Path::new(&vault_path))?;
    build_imported_asset(&vault_path, destination)
}

#[tauri::command]
fn resolve_image_asset(
    vault_path: String,
    relative_path: String,
) -> Result<ResolvedImageAsset, String> {
    let absolute_path = Path::new(&vault_path).join(&relative_path);

    if !absolute_path.exists() {
        return Err(format!("Image file not found: {}", absolute_path.to_string_lossy()));
    }

    let bytes = fs::read(&absolute_path).map_err(|e| e.to_string())?;
    let mime_type = mime_type_for_path(&absolute_path);

    Ok(ResolvedImageAsset {
        relative_path,
        absolute_path: absolute_path.to_string_lossy().to_string(),
        mime_type,
        bytes,
    })
}

#[tauri::command]
fn import_image_bytes(
    app: AppHandle,
    vault_path: String,
    file_name: Option<String>,
    mime_type: Option<String>,
    bytes: Vec<u8>,
) -> Result<ImportedImageAsset, String> {
    if bytes.is_empty() {
        return Err("No image data was provided".into());
    }

    let extension = extension_from_name_or_mime(file_name.as_deref(), mime_type.as_deref())?;
    let destination = next_image_path(&vault_path, &extension);

    ensure_assets_images_dir(&vault_path)?;
    fs::write(&destination, bytes).map_err(|e| e.to_string())?;
    allow_vault_scope(&app, Path::new(&vault_path))?;
    build_imported_asset(&vault_path, destination)
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
            trash_page,
            import_image_file,
            import_image_bytes,
            resolve_image_asset
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

fn ensure_assets_images_dir(vault_path: &str) -> Result<PathBuf, String> {
    let images_dir = Path::new(vault_path).join("assets").join("images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    Ok(images_dir)
}

fn next_image_path(vault_path: &str, extension: &str) -> PathBuf {
    Path::new(vault_path)
        .join("assets")
        .join("images")
        .join(format!("{}.{}", Uuid::new_v4(), extension))
}

fn copy_image_to_vault(source: &Path, destination: &Path) -> Result<(), String> {
    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::copy(source, destination).map_err(|e| e.to_string())?;
    Ok(())
}

fn build_imported_asset(vault_path: &str, absolute_path: PathBuf) -> Result<ImportedImageAsset, String> {
    let vault_root = Path::new(vault_path);
    let relative_path = absolute_path
        .strip_prefix(vault_root)
        .map_err(|_| "Failed to compute image path relative to vault".to_string())?
        .to_string_lossy()
        .replace('\\', "/");

    Ok(ImportedImageAsset {
        relative_path,
        absolute_path: absolute_path.to_string_lossy().to_string(),
    })
}

fn allow_vault_scope(app: &AppHandle, vault_path: &Path) -> Result<(), String> {
    let scopes = app.state::<tauri::scope::Scopes>();
    scopes
        .allow_directory(vault_path, true)
        .map_err(|e| e.to_string())
}

fn extension_from_path(path: &Path) -> Result<String, String> {
    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .ok_or_else(|| "Image file is missing an extension".to_string())?;

    normalize_image_extension(extension)
}

fn extension_from_name_or_mime(
    file_name: Option<&str>,
    mime_type: Option<&str>,
) -> Result<String, String> {
    if let Some(name) = file_name {
        if let Some(extension) = Path::new(name).extension().and_then(|ext| ext.to_str()) {
            return normalize_image_extension(extension);
        }
    }

    match mime_type {
        Some("image/png") => Ok("png".into()),
        Some("image/jpeg") => Ok("jpg".into()),
        Some("image/webp") => Ok("webp".into()),
        Some(other) => Err(format!("Unsupported image type: {other}")),
        None => Err("Unsupported image type".into()),
    }
}

fn normalize_image_extension(extension: &str) -> Result<String, String> {
    match extension.to_ascii_lowercase().as_str() {
        "png" => Ok("png".into()),
        "jpg" | "jpeg" => Ok("jpg".into()),
        "webp" => Ok("webp".into()),
        other => Err(format!("Unsupported image type: {other}")),
    }
}

fn mime_type_for_path(path: &Path) -> String {
    match path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "png" => "image/png".into(),
        "jpg" | "jpeg" => "image/jpeg".into(),
        "webp" => "image/webp".into(),
        _ => "application/octet-stream".into(),
    }
}
