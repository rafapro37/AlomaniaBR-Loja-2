import { Warranty, ServiceOrder, Sale, SaleItem, Product, WarrantyConfig } from "@/contexts/DataContext";

/**
 * Gera uma garantia de serviço técnico
 */
export function generateServiceWarranty(
  service: ServiceOrder,
  warrantyConfig: WarrantyConfig | null
): Omit<Warranty, "id" | "createdAt"> {
  const daysOfWarranty = warrantyConfig?.serviceWarrantyDays || 90;
  const emissionDate = service.dataPronto || new Date().toISOString();
  const validityDate = new Date(emissionDate);
  validityDate.setDate(validityDate.getDate() + daysOfWarranty);

  return {
    type: "servico",
    osId: service.id,
    clientId: service.clientId,
    clientName: service.clientName,
    clientWhatsapp: service.whatsapp,
    serviceDescription: `${service.brand} ${service.model} - ${service.issue}`,
    emissionDate: emissionDate,
    validityDate: validityDate.toISOString(),
    daysOfWarranty,
    isActive: true,
    pdfGenerated: false,
  };
}

/**
 * Gera uma garantia de produto vendido
 */
export function generateProductWarranty(
  sale: Sale,
  saleItem: SaleItem,
  product: Product,
  warrantyConfig: WarrantyConfig | null,
  clientName: string,
  clientWhatsapp: string,
  clientId: string
): Omit<Warranty, "id" | "createdAt"> {
  // Buscar dias de garantia por categoria do produto
  const daysOfWarranty =
    warrantyConfig?.productWarrantyDays[product.category] || 30;

  const emissionDate = sale.date;
  const validityDate = new Date(emissionDate);
  validityDate.setDate(validityDate.getDate() + daysOfWarranty);

  return {
    type: "produto",
    saleId: sale.id,
    clientId: clientId,
    clientName: clientName,
    clientWhatsapp: clientWhatsapp,
    productName: product.name,
    productBrand: product.brand,
    productModel: product.model,
    emissionDate: emissionDate,
    validityDate: validityDate.toISOString(),
    daysOfWarranty,
    isActive: true,
    pdfGenerated: false,
  };
}

/**
 * Verifica e atualiza status de garantias expiradas
 */
export function checkExpiredWarranties(warranties: Warranty[]): Warranty[] {
  const today = new Date().toISOString();
  return warranties.map((warranty) => {
    if (warranty.isActive && warranty.validityDate < today) {
      return { ...warranty, isActive: false };
    }
    return warranty;
  });
}

/**
 * Calcula dias restantes de garantia
 */
export function getDaysRemainingWarranty(validityDate: string): number {
  const today = new Date();
  const expiry = new Date(validityDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formata data para exibição
 */
export function formatWarrantyDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
