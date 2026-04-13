import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { STORAGE_PATHS } from "@/lib/constants";

/** Sanitize a filename: keep alphanumerics, hyphens, dots; collapse the rest. */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

/**
 * Upload a news image to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadNewsImage(file: File): Promise<string> {
  const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const storageRef = ref(storage, `${STORAGE_PATHS.newsImages}/${filename}`);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}

/**
 * Delete a news image from Firebase Storage.
 * Fails silently — deletion errors must not block parent operations.
 */
export async function deleteNewsImage(imageUrl: string): Promise<void> {
  try {
    // Firebase Storage download URLs contain the path after /o/ (URL-encoded)
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    if (!pathMatch) return;

    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch {
    // Silently ignore — the image may already be deleted or the URL malformed
  }
}
