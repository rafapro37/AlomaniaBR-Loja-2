import DashboardLayout from "@/components/DashboardLayout";
import { useData, Warranty } from "@/contexts/DataContext";
import { Search, CheckCircle, XCircle, Download, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { generateWarrantyPDF } from "@/lib/pdf-generator";
import { getDaysRemainingWarranty, formatWarrantyDate } from "@/lib/warranty-generator";

export default function ConsultaGarantia() {
  const { warranties } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"cliente" | "os" | "produto">("cliente");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredWarranties = useMemo(() => {
    let filtered = warranties;

    if (searchTerm) {
      filtered = filtered.filter((w) => {
        switch (searchType) {
          case "cliente":
            return (
              w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              w.clientWhatsapp.includes(searchTerm)
            );
          case "os":
            return w.osId?.includes(searchTerm);
          case "produto":
            return (
              w.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              w.productBrand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          default:
            return true;
        }
      });
    }

    // Ordenar por data de validade (mais próximas primeiro)
    return filtered.sort((a, b) => new Date(a.validityDate).getTime() - new Date(b.validityDate).getTime());
  }, [warranties, searchTerm, searchType]);

  // Paginação
  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Métricas
  const metrics = useMemo(() => {
    const active = warranties.filter((w) => w.isActive).length;
    const expired = warranties.filter((w) => !w.isActive).length;
    const services = warranties.filter((w) => w.type === "servico").length;
    const products = warranties.filter((w) => w.type === "produto").length;

    return { active, expired, services, products };
  }, [warranties]);

  const handleDownloadWarranty = (warranty: Warranty) => {
    generateWarrantyPDF({
      clientName: warranty.clientName,
      clientWhatsapp: warranty.clientWhatsapp,
      serviceDescription: warranty.serviceDescription,
      productName: warranty.productName,
      productBrand: warranty.productBrand,
      productModel: warranty.productModel,
      emissionDate: warranty.emissionDate,
      validityDate: warranty.validityDate,
      daysOfWarranty: warranty.daysOfWarranty,
      osId: warranty.osId,
      saleId: warranty.saleId,
      type: warranty.type,
    });
  };

  const handleSendWhatsApp = (warranty: Warranty) => {
    const daysRemaining = getDaysRemainingWarranty(warranty.validityDate);
    const message = `Olá ${warranty.clientName}! 👋\n\nAqui está o comprovante de sua garantia:\n\n${
      warranty.type === "servico"
        ? `Serviço: ${warranty.serviceDescription}\n`
        : `Produto: ${warranty.productName}\n`
    }Data de Emissão: ${formatWarrantyDate(warranty.emissionDate)}\nData de Validade: ${formatWarrantyDate(
      warranty.validityDate
    )}\nDias Restantes: ${daysRemaining} dias\n\nQualquer dúvida, entre em contato!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${warranty.clientWhatsapp.replace(/\D/g, "")}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <DashboardLayout currentPage="consulta-garantia">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Consulta de Garantias</h1>
          <p className="text-[#94A3B8]">Busque e gerencie garantias de serviços e produtos</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Garantias Ativas</p>
            <p className="text-3xl font-bold text-[#10B981]">{metrics.active}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Garantias Expiradas</p>
            <p className="text-3xl font-bold text-[#EF4444]">{metrics.expired}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Garantias de Serviço</p>
            <p className="text-3xl font-bold text-[#3B82F6]">{metrics.services}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Garantias de Produto</p>
            <p className="text-3xl font-bold text-[#8B5CF6]">{metrics.products}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155] space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search size={20} className="absolute left-3 top-3 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Buscar por cliente, OS, CPF ou produto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#0F172A] text-white pl-10 pr-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tipo de busca */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value as "cliente" | "os" | "produto");
                setCurrentPage(1);
              }}
              className="bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
            >
              <option value="cliente">Buscar por Cliente</option>
              <option value="os">Buscar por OS</option>
              <option value="produto">Buscar por Produto</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden shadow-md">
          {paginatedWarranties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#94A3B8]">Nenhuma garantia encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-[#334155]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Validade
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWarranties.map((warranty) => {
                    const daysRemaining = getDaysRemainingWarranty(warranty.validityDate);
                    return (
                      <tr
                        key={warranty.id}
                        className="border-b border-[#334155] hover:bg-[#0F172A] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-white font-semibold">{warranty.clientName}</p>
                            <p className="text-xs text-[#94A3B8]">{warranty.clientWhatsapp}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                              warranty.type === "servico" ? "bg-[#3B82F6]" : "bg-[#8B5CF6]"
                            }`}
                          >
                            {warranty.type === "servico" ? "Serviço" : "Produto"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#94A3B8]">
                          {warranty.type === "servico"
                            ? warranty.serviceDescription
                            : `${warranty.productBrand} ${warranty.productModel}`}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {formatWarrantyDate(warranty.validityDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {warranty.isActive ? (
                              <>
                                <CheckCircle size={18} className="text-[#10B981]" />
                                <span className="text-[#10B981]">Ativa ({daysRemaining}d)</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={18} className="text-[#EF4444]" />
                                <span className="text-[#EF4444]">Expirada</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadWarranty(warranty)}
                              className="p-2 rounded bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors"
                              title="Baixar PDF"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleSendWhatsApp(warranty)}
                              className="p-2 rounded bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {paginatedWarranties.length > 0 && (
            <div className="bg-[#0F172A] border-t border-[#334155] px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-[#94A3B8]">
                Página {currentPage} de {totalPages} ({filteredWarranties.length} itens)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-[#334155] text-white hover:bg-[#475569] disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-[#334155] text-white hover:bg-[#475569] disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
