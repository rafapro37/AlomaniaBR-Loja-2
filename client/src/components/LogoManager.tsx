import { useState } from "react";
import { useLogo } from "@/contexts/LogoContext";
import { Upload, Link as LinkIcon, RotateCcw, X } from "lucide-react";

interface LogoManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoManager({ isOpen, onClose }: LogoManagerProps) {
  const { logoUrl, setLogoUrl, resetLogo } = useLogo();
  const [logoInput, setLogoInput] = useState("");
  const [useUrl, setUseUrl] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPreview(url);
        setLogoUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (logoInput.trim()) {
      setPreview(logoInput);
      setLogoUrl(logoInput);
      setLogoInput("");
      setUseUrl(false);
    }
  };

  const handleReset = () => {
    resetLogo();
    setPreview("");
    setLogoInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E293B] rounded-lg shadow-xl max-w-md w-full border border-[#334155]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#334155]">
          <h3 className="text-lg font-semibold text-white">Gerenciar Logo</h3>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div>
            <label className="text-sm text-[#94A3B8] block mb-2">Preview</label>
            <div className="bg-[#0F172A] rounded-lg border border-[#334155] p-4 flex items-center justify-center h-32">
              <img
                src={logoUrl}
                alt="Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Upload File */}
          <div>
            <label className="text-sm text-[#94A3B8] block mb-2">Upload</label>
            <label className="flex items-center justify-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition-colors cursor-pointer">
              <Upload size={16} />
              Selecionar Arquivo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* URL Input */}
          <div>
            <button
              onClick={() => setUseUrl(!useUrl)}
              className="flex items-center justify-center gap-2 w-full bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              <LinkIcon size={16} />
              {useUrl ? "Cancelar" : "Usar Link"}
            </button>

            {useUrl && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="Cole a URL da logo"
                  className="flex-1 bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none"
                  onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
                />
                <button
                  onClick={handleUrlSubmit}
                  className="bg-[#FFC107] text-[#0F172A] px-4 py-2 rounded-lg font-semibold hover:bg-[#FFD54F] transition-colors"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 bg-[#64748B] text-white px-4 py-2 rounded-lg hover:bg-[#475569] transition-colors"
          >
            <RotateCcw size={16} />
            Restaurar Padrão
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#334155]">
          <button
            onClick={onClose}
            className="flex-1 bg-[#10B981] text-white font-semibold py-2 rounded-lg hover:bg-[#059669] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
