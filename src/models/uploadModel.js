const STORAGE_KEY = "videoUploads";

export const mockUploadToS3 = (file, title) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: title || file.name,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        s3Key: `uploads/${file.name}`,
      });
    }, 900);
  });

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(1)} ${sizes[index]}`;
}

export function loadUploads() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveUploads(uploads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
}
