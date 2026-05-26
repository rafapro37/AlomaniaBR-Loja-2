import QRCode from "qrcode";
/**
 * Utilitário para gerar notinhas em PDF
 * Usa a biblioteca jsPDF para criar PDFs profissionais com logo dinâmica
 */

import jsPDF from "jspdf";

interface BudgetData {
  osNumber: string;
  clientName: string;
  whatsapp: string;
  deviceType: string;
  brand: string;
  model: string;
  issue: string;
  serviceDescription: string;
  budgetValue: number;
  date: string;
  paymentMethods?: ("Pix" | "Dinheiro" | "Cartão")[];
  logoUrl?: string;
}

interface PaymentData {
  id: string;
  date: string;
  clientName: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentMethod: "Pix" | "Dinheiro" | "Cartão";
  change?: number;
  logoUrl?: string;
}

/**
 * Formata moeda para Real
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata data para formato brasileiro
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Converte URL de imagem para base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao converter imagem:", error);
    return "";
  }
}

/**
 * Gera notinha de orçamento em PDF
 */
export async function generateBudgetPDF(data: BudgetData): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Cores
    const primaryColor = [30, 64, 175]; // Azul
    const accentColor = [255, 193, 7]; // Amarelo
    const textColor = [15, 23, 42]; // Preto

    // Header com cor de fundo
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Adicionar logo se disponível
    if (data.logoUrl) {
      try {
        const logoBase64 = await imageUrlToBase64(data.logoUrl);
        if (logoBase64) {
          doc.addImage(logoBase64, "PNG", margin, yPosition + 2, 12, 12);
        }
      } catch (error) {
        console.error("Erro ao adicionar logo:", error);
        // Fallback: desenhar círculo amarelo com AB
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.circle(margin + 6, yPosition + 8, 6, "F");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("AB", margin + 6, yPosition + 10);
      }
    } else {
      // Fallback: logo padrão (círculo amarelo com AB)
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin + 6, yPosition + 8, 6, "F");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("AB", margin + 6, yPosition + 10);
    }

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Alomania BR", margin + 15, yPosition + 8);

    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Assistência Técnica - Itapevi, SP", margin + 15, yPosition + 14);

    // Número da OS
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`OS: ${data.osNumber}`, pageWidth - margin - 30, yPosition + 10);

    yPosition += 40;

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    // Seção: Dados do Cliente
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DADOS DO CLIENTE", margin, yPosition);

    yPosition += 8;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nome: ${data.clientName}`, margin, yPosition);

    yPosition += 6;
    doc.text(`WhatsApp: ${data.whatsapp}`, margin, yPosition);

    yPosition += 10;

    // Seção: Aparelho
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("APARELHO", margin, yPosition);

    yPosition += 8;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Tipo: ${data.deviceType}`, margin, yPosition);

    yPosition += 6;
    doc.text(`Marca/Modelo: ${data.brand} ${data.model}`, margin, yPosition);

    yPosition += 6;
    doc.text(`Problema: ${data.issue}`, margin, yPosition);

    yPosition += 10;

    // Seção: Descrição do Serviço
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DESCRIÇÃO DO SERVIÇO", margin, yPosition);

    yPosition += 8;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const descriptionLines = doc.splitTextToSize(data.serviceDescription, pageWidth - 2 * margin);
    doc.text(descriptionLines, margin, yPosition);

    yPosition += descriptionLines.length * 5 + 5;

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    // Valor do orçamento
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, "F");

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("VALOR DO ORÇAMENTO", margin + 3, yPosition + 10);

    doc.setFontSize(14);
    doc.text(formatCurrency(data.budgetValue), pageWidth - margin - 3, yPosition + 10, { align: "right" });

    yPosition += 25;

    // Seção: Formas de Pagamento
    if (data.paymentMethods && data.paymentMethods.length > 0) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("FORMAS DE PAGAMENTO", margin, yPosition);

      yPosition += 8;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(data.paymentMethods.join(" / "), margin, yPosition);

      yPosition += 10;
    }

    // Data
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Data: ${formatDate(data.date)}`, pageWidth / 2, yPosition, { align: "center" });

    yPosition += 8;

    // Rodapé
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Este orçamento é válido por 7 dias", pageWidth / 2, yPosition, { align: "center" });

    yPosition += 10;

    // QR Code para acompanhar OS online
    try {
      const qrUrl = window.location.origin + "/os/" + data.osNumber;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 80, margin: 1 });
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 38, "S");
      
      doc.setTextColor(30, 64, 175);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ACOMPANHE SUA OS ONLINE", margin + 5, yPosition + 7);
      
      doc.addImage(qrDataUrl, "PNG", margin + 3, yPosition + 10, 25, 25);
      
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Escaneie o QR Code com seu celular", margin + 33, yPosition + 18);
      doc.text("para ver o status da sua OS em tempo real.", margin + 33, yPosition + 24);
      
      yPosition += 45;
    } catch(e) {
      yPosition += 5;
    }

    // Linhas de assinatura
    yPosition += 5;
    const colWidth = (pageWidth - 2 * margin - 10) / 2;
    
    // Assinatura do cliente
    doc.setDrawColor(80, 80, 80);
    doc.line(margin, yPosition + 15, margin + colWidth, yPosition + 15);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Assinatura do Cliente", margin + colWidth / 2, yPosition + 20, { align: "center" });
    doc.text(data.clientName, margin + colWidth / 2, yPosition + 25, { align: "center" });

    // Assinatura do responsável
    const col2x = margin + colWidth + 10;
    doc.line(col2x, yPosition + 15, col2x + colWidth, yPosition + 15);
    doc.text("Assinatura do Responsável", col2x + colWidth / 2, yPosition + 20, { align: "center" });
    doc.text("Alomania BR", col2x + colWidth / 2, yPosition + 25, { align: "center" });

    // Salvar PDF
    doc.save(`orcamento-${data.osNumber}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF de orçamento:", error);
    alert("Erro ao gerar PDF. Tente novamente.");
  }
}

/**
 * Gera notinha de pagamento em PDF
 */
export async function generatePaymentPDF(data: PaymentData): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Cores
    const primaryColor = [30, 64, 175]; // Azul
    const accentColor = [255, 193, 7]; // Amarelo
    const textColor = [15, 23, 42]; // Preto
    const successColor = [16, 185, 129]; // Verde

    // Header com cor de fundo
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Adicionar logo se disponível
    if (data.logoUrl) {
      try {
        const logoBase64 = await imageUrlToBase64(data.logoUrl);
        if (logoBase64) {
          doc.addImage(logoBase64, "PNG", margin, yPosition + 2, 12, 12);
        }
      } catch (error) {
        console.error("Erro ao adicionar logo:", error);
        // Fallback: desenhar círculo amarelo com AB
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.circle(margin + 6, yPosition + 8, 6, "F");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("AB", margin + 6, yPosition + 10);
      }
    } else {
      // Fallback: logo padrão
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin + 6, yPosition + 8, 6, "F");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("AB", margin + 6, yPosition + 10);
    }

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Alomania BR", margin + 15, yPosition + 8);

    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Comprovante de Pagamento", margin + 15, yPosition + 14);

    yPosition += 40;

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    // Dados básicos
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Comprovante: ${data.id}`, margin, yPosition);

    yPosition += 6;
    doc.text(`Data: ${formatDate(data.date)}`, margin, yPosition);

    yPosition += 6;
    doc.text(`Cliente: ${data.clientName}`, margin, yPosition);

    yPosition += 12;

    // Seção: Itens
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ITENS", margin, yPosition);

    yPosition += 8;

    // Cabeçalho da tabela
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, "F");

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Descrição", margin + 2, yPosition);
    doc.text("Qtd", margin + 80, yPosition);
    doc.text("Unitário", margin + 100, yPosition);
    doc.text("Total", pageWidth - margin - 2, yPosition, { align: "right" });

    yPosition += 8;

    // Itens da venda
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    data.items.forEach((item) => {
      doc.text(item.name, margin + 2, yPosition);
      doc.text(item.quantity.toString(), margin + 80, yPosition);
      doc.text(formatCurrency(item.unitPrice), margin + 100, yPosition);
      doc.text(formatCurrency(item.total), pageWidth - margin - 2, yPosition, { align: "right" });
      yPosition += 6;
    });

    yPosition += 4;

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    // Totais
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(data.subtotal)}`, pageWidth - margin - 2, yPosition, { align: "right" });

    yPosition += 8;

    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(data.total)}`, pageWidth - margin - 2, yPosition, { align: "right" });

    yPosition += 12;

    // Forma de pagamento
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("FORMA DE PAGAMENTO", margin, yPosition);

    yPosition += 8;

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Método: ${data.paymentMethod}`, margin, yPosition);

    yPosition += 6;

    if (data.change && data.change > 0) {
      doc.text(`Troco: ${formatCurrency(data.change)}`, margin, yPosition);
    }

    // Rodapé
    yPosition = pageHeight - 20;
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Obrigado pela preferência!", pageWidth / 2, yPosition, { align: "center" });

    yPosition += 6;
    doc.setFontSize(8);
    doc.text("© 2026 Alomania BR - Itapevi, SP", pageWidth / 2, yPosition, { align: "center" });

    // Salvar PDF
    doc.save(`comprovante-${data.id}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF de pagamento:", error);
    alert("Erro ao gerar PDF. Tente novamente.");
  }
}


/**
 * Gera Nota Fiscal de Serviço em PDF
 */
export async function generateInvoicePDF(data: {
  osNumber: string;
  clientName: string;
  whatsapp: string;
  brand: string;
  model: string;
  issue: string;
  serviceValue: number;
  date: string;
  invoiceNumber: string;
  logoUrl?: string;
}): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Cores
  const primaryColor = [15, 23, 42]; // #0F172A
  const accentColor = [255, 193, 7]; // #FFC107
  const textColor = [0, 0, 0];

  // Fundo
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Cabeçalho
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, "F");

  // Logo (se disponível)
  if (data.logoUrl) {
    try {
      const imgData = await imageUrlToBase64(data.logoUrl);
      doc.addImage(imgData, "PNG", margin, 5, 15, 15);
    } catch (e) {
      console.error("Erro ao carregar logo:", e);
    }
  }

  // Título
  doc.setTextColor(255, 193, 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NOTA FISCAL DE SERVIÇO", margin + 20, 15);

  doc.setFontSize(10);
  doc.text("Alomania BR - Assistência Técnica", margin + 20, 22);

  // Número da nota
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`NFS: ${data.invoiceNumber}`, pageWidth - margin - 30, 12);
  doc.text(`Data: ${data.date}`, pageWidth - margin - 30, 18);

  yPosition = 45;

  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 8;

  // Dados do Cliente
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CLIENTE", margin, yPosition);

  yPosition += 8;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome: ${data.clientName}`, margin, yPosition);

  yPosition += 6;
  doc.text(`WhatsApp: ${data.whatsapp}`, margin, yPosition);

  yPosition += 12;

  // Dados do Aparelho
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("APARELHO", margin, yPosition);

  yPosition += 8;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Marca/Modelo: ${data.brand} ${data.model}`, margin, yPosition);

  yPosition += 6;
  doc.text(`Problema: ${data.issue}`, margin, yPosition);

  yPosition += 12;

  // Tabela de Serviços
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SERVIÇO REALIZADO", margin, yPosition);

  yPosition += 8;

  // Cabeçalho da tabela
  doc.setFillColor(255, 193, 7);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Descrição", margin + 2, yPosition + 6);
  doc.text("Valor", pageWidth - margin - 20, yPosition + 6);

  yPosition += 10;

  // Linha da tabela
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Serviço de Reparo e Manutenção", margin + 2, yPosition);
  doc.text(formatCurrency(data.serviceValue), pageWidth - margin - 20, yPosition);

  yPosition += 10;

  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 8;

  // Total
  doc.setFillColor(255, 193, 7);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, "F");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("VALOR TOTAL", margin + 3, yPosition + 10);
  doc.text(formatCurrency(data.serviceValue), pageWidth - margin - 3, yPosition + 10, { align: "right" });

  yPosition += 25;

  // Observações
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Nota: Este é um comprovante de serviço realizado.", margin, yPosition);
  yPosition += 4;
  doc.text("Válido como recibo de pagamento.", margin, yPosition);

  yPosition += 15;

  // Rodapé
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("Alomania BR - Assistência Técnica de Celulares", pageWidth / 2, pageHeight - 10, { align: "center" });
  doc.text("Gerado em: " + new Date().toLocaleString("pt-BR"), pageWidth / 2, pageHeight - 5, { align: "center" });

  // Download
  doc.save(`NFS-${data.invoiceNumber}.pdf`);
}


/**
 * Gera PDF de Termo de Garantia
 */
export function generateWarrantyPDF(data: {
  clientName: string;
  clientWhatsapp: string;
  serviceDescription?: string;
  productName?: string;
  productBrand?: string;
  productModel?: string;
  emissionDate: string;
  validityDate: string;
  daysOfWarranty: number;
  osId?: string;
  saleId?: string;
  type: "servico" | "produto";
  logoUrl?: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Cabeçalho com logo (apenas se for uma URL válida)
  if (data.logoUrl && data.logoUrl.startsWith("http")) {
    try {
      doc.addImage(data.logoUrl, "JPEG", margin, yPosition, 20, 20);
    } catch (e) {
      // Ignorar erro silenciosamente se logo não conseguir ser adicionada
    }
  }

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("TERMO DE GARANTIA", pageWidth / 2, yPosition + 5, { align: "center" });

  yPosition += 30;

  // Número do documento
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const docNumber = data.type === "servico" ? `OS-${data.osId}` : `VENDA-${data.saleId}`;
  doc.text(`Documento: ${docNumber}`, margin, yPosition);
  yPosition += 6;

  // Dados do cliente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("DADOS DO CLIENTE", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Nome: ${data.clientName}`, margin + 2, yPosition);
  yPosition += 5;
  doc.text(`WhatsApp: ${data.clientWhatsapp}`, margin + 2, yPosition);
  yPosition += 10;

  // Dados do serviço/produto
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(data.type === "servico" ? "DADOS DO SERVIÇO" : "DADOS DO PRODUTO", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  if (data.type === "servico") {
    doc.text(`Descrição: ${data.serviceDescription || "N/A"}`, margin + 2, yPosition);
    yPosition += 5;
  } else {
    doc.text(`Produto: ${data.productName || "N/A"}`, margin + 2, yPosition);
    yPosition += 5;
    if (data.productBrand) {
      doc.text(`Marca: ${data.productBrand}`, margin + 2, yPosition);
      yPosition += 5;
    }
    if (data.productModel) {
      doc.text(`Modelo: ${data.productModel}`, margin + 2, yPosition);
      yPosition += 5;
    }
  }

  yPosition += 5;

  // Informações de garantia
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INFORMAÇÕES DE GARANTIA", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const emissionDateFormatted = new Date(data.emissionDate).toLocaleDateString("pt-BR");
  const validityDateFormatted = new Date(data.validityDate).toLocaleDateString("pt-BR");

  doc.text(`Data de Emissão: ${emissionDateFormatted}`, margin + 2, yPosition);
  yPosition += 5;
  doc.text(`Data de Validade: ${validityDateFormatted}`, margin + 2, yPosition);
  yPosition += 5;
  doc.text(`Prazo de Garantia: ${data.daysOfWarranty} dias`, margin + 2, yPosition);
  yPosition += 10;

  // Termos e condições
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TERMOS E CONDIÇÕES", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  const terms = [
    "1. A garantia cobre apenas o serviço realizado ou o produto fornecido.",
    "2. Não inclui danos causados por mau uso, quedas, contato com água ou líquidos.",
    "3. Não cobre danos físicos, rachaduras ou deformações.",
    "4. A garantia é válida apenas com apresentação deste termo.",
    "5. Serviços adicionais não cobertos pela garantia serão cobrados separadamente.",
    "6. A garantia é intransferível e pessoal.",
  ];

  terms.forEach((term) => {
    const splitText = doc.splitTextToSize(term, pageWidth - margin * 2 - 4);
    splitText.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 2, yPosition);
      yPosition += 4;
    });
  });

  yPosition += 10;

  // Assinatura
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("_______________________________", margin + 20, yPosition);
  yPosition += 4;
  doc.setFontSize(8);
  doc.text("Assinatura / Carimbo da Loja", margin + 20, yPosition);

  yPosition += 15;

  // Rodapé
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("Alomania BR - Assistência Técnica", pageWidth / 2, pageHeight - 10, { align: "center" });
  doc.text("Gerado em: " + new Date().toLocaleString("pt-BR"), pageWidth / 2, pageHeight - 5, { align: "center" });

  // Download
  const fileName = data.type === "servico" ? `Garantia-OS-${data.osId}.pdf` : `Garantia-Produto-${data.saleId}.pdf`;
  doc.save(fileName);
}

/**
 * Gera PDF de Histórico de Estoque
 */
export function generateStockHistoryPDF(
  movements: any[],
  metrics: {
    total: number;
    entradas: number;
    saidas: number;
    totalEntrada: number;
    totalSaida: number;
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("HISTÓRICO DE MOVIMENTAÇÃO DE ESTOQUE", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Data de geração
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, yPosition);
  yPosition += 8;

  // Métricas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("RESUMO DE MOVIMENTAÇÕES", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total de Movimentações: ${metrics.total}`, margin + 2, yPosition);
  yPosition += 4;
  doc.text(`Entradas: ${metrics.entradas} (${metrics.totalEntrada} unidades)`, margin + 2, yPosition);
  yPosition += 4;
  doc.text(`Saídas: ${metrics.saidas} (${metrics.totalSaida} unidades)`, margin + 2, yPosition);
  yPosition += 4;
  doc.text(`Saldo: ${metrics.totalEntrada - metrics.totalSaida} unidades`, margin + 2, yPosition);
  yPosition += 10;

  // Tabela de movimentações
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const tableHeaders = ["Data", "Produto", "Tipo", "Qtd", "Motivo", "Antes/Depois"];
  const tableData = movements.map((m) => [
    new Date(m.date).toLocaleDateString("pt-BR"),
    m.productName.substring(0, 15),
    m.type === "entrada" ? "E" : "S",
    m.quantity.toString(),
    m.reason.substring(0, 12),
    `${m.previousQuantity}→${m.newQuantity}`,
  ]);

  // Usar autoTable se disponível, caso contrário criar tabela manual
  doc.setFontSize(8);
  let tableY = yPosition;

  // Cabeçalho da tabela
  doc.setFillColor(220, 220, 220);
  tableHeaders.forEach((header, i) => {
    const colWidth = (pageWidth - margin * 2) / tableHeaders.length;
    doc.rect(margin + i * colWidth, tableY, colWidth, 5, "F");
    doc.text(header, margin + i * colWidth + 1, tableY + 3.5);
  });

  tableY += 5;

  // Linhas da tabela
  tableData.slice(0, 20).forEach((row) => {
    if (tableY > pageHeight - 20) {
      doc.addPage();
      tableY = margin;
    }

    row.forEach((cell, i) => {
      const colWidth = (pageWidth - margin * 2) / tableHeaders.length;
      doc.rect(margin + i * colWidth, tableY, colWidth, 4);
      doc.text(cell, margin + i * colWidth + 1, tableY + 2.5);
    });

    tableY += 4;
  });

  // Rodapé
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("Alomania BR - Controle de Estoque", pageWidth / 2, pageHeight - 5, { align: "center" });

  // Download
  doc.save(`Historico-Estoque-${new Date().toISOString().split("T")[0]}.pdf`);
}
