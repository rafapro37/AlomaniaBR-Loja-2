import { useState } from "react";
import { X, Send, Copy, Check } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";

interface WhatsAppMessageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  initialMessage: string;
  onSend?: () => void;
}

export default function WhatsAppMessageEditor({
  isOpen,
  onClose,
  phoneNumber,
  initialMessage,
  onSend,
}: WhatsAppMessageEditorProps) {
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  const handleSend = () => {
    openWhatsApp(phoneNumber, message);
    onSend?.();
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E293B] rounded-lg shadow-xl max-w-md w-full border border-[#334155]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#334155]">
          <h3 className="text-lg font-semibold text-white">Editar Mensagem</h3>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Número de telefone */}
          <div>
            <label className="text-sm text-[#94A3B8] block mb-2">
              Número de WhatsApp
            </label>
            <div className="bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] text-sm">
              {phoneNumber}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className="text-sm text-[#94A3B8] block mb-2">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0F172A] text-white px-4 py-3 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none resize-none h-32"
              placeholder="Digite sua mensagem..."
            />
            <p className="text-xs text-[#64748B] mt-2">
              {message.length} caracteres
            </p>
          </div>

          {/* Preview */}
          <div>
            <label className="text-sm text-[#94A3B8] block mb-2">
              Preview
            </label>
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3 text-white text-sm max-h-24 overflow-y-auto">
              <p className="whitespace-pre-wrap break-words">{message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#334155]">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-semibold py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={16} />
                Copiar
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] text-white font-semibold py-2 rounded-lg hover:bg-[#059669] transition-colors"
          >
            <Send size={16} />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
