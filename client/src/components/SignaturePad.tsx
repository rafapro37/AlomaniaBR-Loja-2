import { useRef, useState, useEffect } from "react";
import { X, Check, RotateCcw } from "lucide-react";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function SignaturePad({ onSave, onCancel, title = "Assinatura do Responsável" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-[#334155] rounded-lg text-[#94A3B8]"><X size={20} /></button>
        </div>

        <div className="border-2 border-dashed border-[#334155] rounded-xl overflow-hidden mb-4 touch-none">
          <canvas
            ref={canvasRef}
            width={600}
            height={250}
            className="w-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <p className="text-xs text-[#64748B] text-center mb-4">Assine acima com o dedo ou mouse</p>

        <div className="flex gap-3">
          <button onClick={clear} className="flex items-center gap-2 px-4 py-2.5 bg-[#334155] text-white rounded-lg font-semibold text-sm hover:bg-[#475569]">
            <RotateCcw size={15} /> Limpar
          </button>
          <button onClick={onCancel} className="flex-1 bg-[#475569] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#64748B]">
            Cancelar
          </button>
          <button onClick={save} disabled={isEmpty} className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-2">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
