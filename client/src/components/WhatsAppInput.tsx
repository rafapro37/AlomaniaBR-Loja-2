import { formatPhoneForDisplay, isValidPhone } from "@/lib/whatsapp";
import { useState, useEffect } from "react";

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export default function WhatsAppInput({
  value,
  onChange,
  error,
  placeholder = "(11) 98765-4321",
  required = false,
}: WhatsAppInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Permite apenas números
    const numbersOnly = input.replace(/\D/g, "");
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limited = numbersOnly.slice(0, 11);
    
    // Atualiza o valor armazenado (apenas números)
    onChange(limited);
    
    // Atualiza a exibição formatada
    if (limited.length === 0) {
      setDisplayValue("");
    } else if (limited.length <= 2) {
      setDisplayValue(`(${limited}`);
    } else if (limited.length <= 7) {
      setDisplayValue(`(${limited.slice(0, 2)}) ${limited.slice(2)}`);
    } else {
      setDisplayValue(`(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`);
    }
  };

  const isValid = value.length === 0 || isValidPhone(value);

  return (
    <div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
          error || !isValid ? "border-[#EF4444]" : "border-[#334155]"
        } focus:border-[#FFC107] outline-none transition-colors`}
      />
      {error && <p className="text-[#EF4444] text-xs mt-1">{error}</p>}
      {!isValid && value.length > 0 && (
        <p className="text-[#EF4444] text-xs mt-1">
          Número inválido. Use DDD + 8 ou 9 dígitos
        </p>
      )}
      {value.length > 0 && isValid && (
        <p className="text-[#10B981] text-xs mt-1">✓ Número válido</p>
      )}
    </div>
  );
}
