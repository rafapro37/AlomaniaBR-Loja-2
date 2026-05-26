import { useState, useRef } from "react";
import { Upload, X, Eye } from "lucide-react";

interface ImageUploadProps {
  onImageAdd: (image: { id: string; url: string; name: string }) => void;
  maxImages?: number;
  label?: string;
}

export default function ImageUpload({
  onImageAdd,
  maxImages = 5,
  label = "Adicionar Imagem",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [useUrl, setUseUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onImageAdd({
          id: Date.now().toString(),
          url: url,
          name: file.name,
        });
        setPreviewUrl("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageAdd({
        id: Date.now().toString(),
        url: urlInput,
        name: urlInput.split("/").pop() || "imagem",
      });
      setUrlInput("");
      setUseUrl(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition-colors"
        >
          <Upload size={16} />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(!useUrl)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <Eye size={16} />
          Por Link
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {useUrl && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Cole a URL da imagem"
            className="flex-1 bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none"
            onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-[#FFC107] text-[#0F172A] px-4 py-2 rounded-lg font-semibold hover:bg-[#FFD54F] transition-colors"
          >
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

interface ImageGalleryProps {
  images: Array<{ id: string; url: string; name: string }>;
  onRemove: (id: string) => void;
}

export function ImageGallery({ images, onRemove }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-[#64748B]">
        Nenhuma imagem adicionada
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-24 object-cover rounded-lg border border-[#334155] cursor-pointer hover:border-[#FFC107] transition-colors"
              onClick={() => setSelectedImage(image.url)}
            />
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1 right-1 bg-[#EF4444] text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-2xl max-h-[80vh] relative">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-[#EF4444] text-white p-2 rounded-lg hover:bg-[#DC2626]"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
