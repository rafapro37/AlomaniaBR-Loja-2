/**
 * Utilitário para gerar links do WhatsApp
 * Formata números de telefone e cria URLs de mensagem
 */

/**
 * Formata número de telefone para o padrão internacional
 * Remove caracteres especiais e adiciona código do país
 * @param phone - Número com DDD (ex: 11987654321 ou (11)98765-4321)
 * @returns Número formatado para WhatsApp (ex: 5511987654321)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");

  // Se não tiver 11 dígitos (DDD + 9 dígitos), retorna como está
  if (cleaned.length < 10) {
    return cleaned;
  }

  // Se tiver 10 ou 11 dígitos, adiciona código do país (55 para Brasil)
  if (!cleaned.startsWith("55")) {
    return "55" + cleaned;
  }

  return cleaned;
}

/**
 * Valida se o número de telefone é válido
 * @param phone - Número com DDD
 * @returns true se válido, false caso contrário
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // Deve ter pelo menos 10 dígitos (DDD + 8 dígitos) ou 11 (DDD + 9 dígitos)
  return cleaned.length >= 10 && cleaned.length <= 13;
}

/**
 * Formata número de telefone para exibição
 * @param phone - Número com DDD
 * @returns Número formatado (ex: (11) 98765-4321)
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    // (XX) 9XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    // (XX) XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
}

/**
 * Gera URL do WhatsApp com mensagem pré-preenchida
 * @param phone - Número com DDD (ex: 11987654321)
 * @param message - Mensagem a enviar
 * @returns URL do WhatsApp
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Abre WhatsApp em nova aba com mensagem pré-preenchida
 * @param phone - Número com DDD
 * @param message - Mensagem a enviar
 */
export function openWhatsApp(phone: string, message: string): void {
  if (!isValidPhone(phone)) {
    alert("Número de telefone inválido!");
    return;
  }

  const link = generateWhatsAppLink(phone, message);
  window.open(link, "_blank");
}
