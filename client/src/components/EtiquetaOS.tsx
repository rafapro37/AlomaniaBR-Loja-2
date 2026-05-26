import { useEffect, useRef } from "react";
import { X, Printer } from "lucide-react";

interface EtiquetaOSProps {
  osNumber: string;
  clientName: string;
  deviceType: string;
  brand?: string;
  model?: string;
  issue: string;
  createdAt: string;
  baseUrl: string;
  onClose: () => void;
}

export default function EtiquetaOS({ osNumber, clientName, deviceType, brand, model, issue, createdAt, baseUrl, onClose }: EtiquetaOSProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const osUrl = `${baseUrl}/os/${osNumber}`;

  useEffect(() => {
    // Carregar QRCode library dinamicamente
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      if (qrRef.current && (window as any).QRCode) {
        qrRef.current.innerHTML = "";
        new (window as any).QRCode(qrRef.current, {
          text: osUrl,
          width: 120,
          height: 120,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: (window as any).QRCode.CorrectLevel.M,
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [osUrl]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const qrImg = qrRef.current?.querySelector("img")?.src || qrRef.current?.querySelector("canvas")?.toDataURL() || "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiqueta OS ${osNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; }
          .etiqueta { width: 80mm; border: 2px solid #000; padding: 8px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px solid #000; pb: 4px; margin-bottom: 6px; }
          .loja { font-size: 14px; font-weight: bold; }
          .os-num { font-size: 20px; font-weight: bold; color: #000; }
          .info { font-size: 10px; margin: 2px 0; }
          .label { font-weight: bold; }
          .qr-section { display: flex; align-items: center; gap: 8px; margin-top: 6px; border-top: 1px dashed #000; padding-top: 6px; }
          .qr-text { font-size: 8px; color: #666; }
          img { width: 80px; height: 80px; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="etiqueta">
          <div class="header">
            <div class="loja">Alomania BR</div>
            <div class="os-num">${osNumber}</div>
          </div>
          <div class="info"><span class="label">Cliente:</span> ${clientName}</div>
          <div class="info"><span class="label">Aparelho:</span> ${deviceType}${brand ? ` ${brand}` : ""}${model ? ` ${model}` : ""}</div>
          <div class="info"><span class="label">Problema:</span> ${issue.substring(0, 60)}${issue.length > 60 ? "..." : ""}</div>
          <div class="info"><span class="label">Entrada:</span> ${new Date(createdAt).toLocaleDateString("pt-BR")} ${new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
          <div class="qr-section">
            ${qrImg ? `<img src="${qrImg}" />` : ""}
            <div class="qr-text">Escaneie para<br/>ver o status<br/>da OS online</div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm text-black shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Etiqueta da OS</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        {/* Preview da etiqueta */}
        <div className="border-2 border-black rounded-lg p-3 mb-4">
          <div className="text-center border-b border-black pb-2 mb-2">
            <p className="font-bold text-sm">Alomania BR</p>
            <p className="font-black text-2xl">{osNumber}</p>
          </div>
          <p className="text-xs mb-1"><strong>Cliente:</strong> {clientName}</p>
          <p className="text-xs mb-1"><strong>Aparelho:</strong> {deviceType}{brand ? ` ${brand}` : ""}{model ? ` ${model}` : ""}</p>
          <p className="text-xs mb-1"><strong>Problema:</strong> {issue.substring(0, 50)}{issue.length > 50 ? "..." : ""}</p>
          <p className="text-xs mb-3"><strong>Entrada:</strong> {new Date(createdAt).toLocaleDateString("pt-BR")}</p>
          <div className="flex items-center gap-3 border-t border-dashed border-gray-400 pt-2">
            <div ref={qrRef} className="flex-shrink-0" />
            <p className="text-xs text-gray-500">Escaneie para ver o status online</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200">Fechar</button>
          <button onClick={handlePrint} className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-600 flex items-center justify-center gap-2">
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
