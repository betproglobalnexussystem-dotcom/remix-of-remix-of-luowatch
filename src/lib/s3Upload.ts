const UPLOAD_ENDPOINT = "https://upload.livrauganda.workers.dev/";

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Upload a file to Cloudflare R2 via Worker.
 * Returns the final public URL of the uploaded file.
 */
export async function uploadToS3(
  file: File,
  folder: string = "source",
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_ENDPOINT, true);

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
