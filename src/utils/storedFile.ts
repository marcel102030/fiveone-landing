import { StoredFile } from "../services/platformContent";

function createBlobUrlFromDataUrl(dataUrl: string, fallbackType: string): string {
  const parts = dataUrl.split(",");
  if (parts.length < 2) return dataUrl;
  const meta = parts[0];
  const base64 = parts.slice(1).join(",");
  if (!meta.includes(";base64")) {
    return dataUrl;
  }
  const mimeMatch = meta.match(/^data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : fallbackType;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType || "application/octet-stream" });
  return URL.createObjectURL(blob);
}

export function openStoredFile(file?: StoredFile | null): void {
  if (!file) return;
  const directUrl = file.url;
  if (directUrl && /^https?:/i.test(directUrl)) {
    window.open(directUrl, "_blank", "noopener");
    return;
  }
  const href = file.dataUrl;
  if (!href) return;
  if (/^https?:/i.test(href)) {
    window.open(href, "_blank", "noopener");
    return;
  }
  if (href.startsWith("data:")) {
    let url = href;
    try {
      url = createBlobUrlFromDataUrl(href, file.type || "application/octet-stream");
      const win = window.open(url, "_blank", "noopener");
      if (win) {
        win.addEventListener("beforeunload", () => URL.revokeObjectURL(url), { once: true });
      } else {
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (error) {
      console.warn("Não foi possível abrir o arquivo armazenado", error);
      window.open(href, "_blank", "noopener");
    }
    return;
  }
  window.open(href, "_blank", "noopener");
}
