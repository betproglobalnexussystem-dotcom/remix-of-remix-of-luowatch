const MUSIC_UPLOAD_ENDPOINT = "https://musicupload.mainplatform-nexus.workers.dev/";

export interface R2UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Upload a file to Cloudflare R2 via the music upload Worker.
 * Supports video and image files up to 200MB client-side (100MB server limit).
 * Returns the public URL of the uploaded file.
 */
export async function uploadToR2(
  file: File,
  onProgress?: (progress: R2UploadProgress) => void
): Promise<string> {
  const maxSize = 200 * 1024 * 1024; // 200MB client limit
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 200MB.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", MUSIC_UPLOAD_ENDPOINT, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            resolve(data.url);
          } else {
            reject(new Error(data.error || "Upload failed"));
          }
        } catch {
          reject(new Error("Invalid response from upload server"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed (network error)"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    xhr.send(formData);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
