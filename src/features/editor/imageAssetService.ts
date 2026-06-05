import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface ImportedImageAsset {
  relativePath: string;
  absolutePath: string;
}

interface ResolvedImageAsset {
  absolutePath: string;
  bytes: number[];
  mimeType: string;
  relativePath: string;
}

export const SUPPORTED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;
export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export function isSupportedImageFileName(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  return SUPPORTED_IMAGE_EXTENSIONS.includes(extension as (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]);
}

export function isSupportedImageMimeType(mimeType: string): mimeType is SupportedImageMimeType {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType);
}

export function resolveVaultAssetFilePath(vaultPath: string, relativePath: string): string {
  const cleanVaultPath = vaultPath.replace(/[\\/]+$/, "");

  if (/^[a-zA-Z]:[\\/]/.test(cleanVaultPath) || cleanVaultPath.startsWith("\\\\")) {
    return `${cleanVaultPath}\\${relativePath.replace(/\//g, "\\")}`;
  }

  return `${cleanVaultPath}/${relativePath.replace(/\\/g, "/")}`;
}

const imageUrlCache = new Map<string, string>();

export async function pickAndImportImage(vaultPath: string): Promise<ImportedImageAsset | null> {
  const selected = await open({
    title: "Insert image",
    multiple: false,
    filters: [
      {
        name: "Images",
        extensions: [...SUPPORTED_IMAGE_EXTENSIONS],
      },
    ],
  });

  if (!selected || Array.isArray(selected)) {
    return null;
  }

  return importImageFromPath(vaultPath, selected);
}

export async function importImageFromPath(
  vaultPath: string,
  sourcePath: string,
): Promise<ImportedImageAsset> {
  return invoke<ImportedImageAsset>("import_image_file", {
    vaultPath,
    sourcePath,
  });
}

export async function importImageFromFile(
  vaultPath: string,
  file: File,
): Promise<ImportedImageAsset> {
  const fileWithPath = file as File & { path?: string };

  if (fileWithPath.path) {
    return importImageFromPath(vaultPath, fileWithPath.path);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  return invoke<ImportedImageAsset>("import_image_bytes", {
    vaultPath,
    fileName: file.name || null,
    mimeType: file.type || null,
    bytes,
  });
}

export async function loadVaultImageUrl(
  vaultPath: string,
  relativePath: string,
): Promise<string> {
  const cacheKey = `${vaultPath}::${relativePath}`;
  const cachedUrl = imageUrlCache.get(cacheKey);

  if (cachedUrl) {
    return cachedUrl;
  }

  const asset = await invoke<ResolvedImageAsset>("resolve_image_asset", {
    vaultPath,
    relativePath,
  });

  const blob = new Blob([new Uint8Array(asset.bytes)], {
    type: asset.mimeType,
  });
  const objectUrl = URL.createObjectURL(blob);
  imageUrlCache.set(cacheKey, objectUrl);
  return objectUrl;
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}
