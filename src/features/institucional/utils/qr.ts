import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { QRCodeCanvas } from "qrcode.react";

// Gera o dataURL (PNG) de um QR Code sob demanda, renderizando o componente
// React fora da tela e lendo o canvas. Client-only; retorna null se falhar.
export function makeQrDataUrl(value: string, size = 260): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-99999px;top:0;pointer-events:none;";
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(
      createElement(QRCodeCanvas, {
        value,
        size,
        level: "M",
        marginSize: 2,
        bgColor: "#ffffff",
        fgColor: "#0d1b2a",
      }),
    );
    setTimeout(() => {
      let url: string | null = null;
      try {
        const canvas = host.querySelector("canvas");
        url = canvas ? canvas.toDataURL("image/png") : null;
      } catch {
        url = null;
      }
      try {
        root.unmount();
        host.remove();
      } catch {
        /* noop */
      }
      resolve(url);
    }, 70);
  });
}
