import { useData } from "@/contexts/DataContext";
import { useState, useMemo } from "react";
import { Package, AlertTriangle, Clock, DollarSign, Search, Download, FileText, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type FilterType = "todos" | "60dias";

export default function AparelhosAguardando() {
  const { services, updateService } = useData();
  const [filter, setFilter] = useState<FilterType>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar serviços que estão aguardando retirada
  const servicesFiltered = useMemo(() => {
    let filtered = services.filter(
      (s) => s.status === "Aguardando retirada"
    );

    // Aplicar filtro
    if (filter === "60dias") {
      filtered = filtered.filter(
        (s) => s.diasAguardando && s.diasAguardando >= 60 && s.diasAguardando < 90
      );
    }

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.whatsapp.includes(searchTerm) ||
          s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [services, filter, searchTerm]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const aguardando = services.filter((s) => s.status === "Aguardando retirada");
    const proximos60 = services.filter(
      (s) => s.diasAguardando && s.diasAguardando >= 60 && s.diasAguardando < 90
    );
    const totalParado = services
      .filter((s) => s.status === "Aguardando retirada")
      .reduce((sum, s) => sum + (s.budget || 0), 0);

    return {
      aguardando: aguardando.length,
      proximos60: proximos60.length,
      totalParado,
    };
  }, [services]);

  // Paginação
  const totalPages = Math.ceil(servicesFiltered.length / itemsPerPage);
  const paginatedServices = servicesFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Função para obter cor baseada em dias
  const getStatusColor = (dias?: number) => {
    if (!dias) return "bg-gray-500";
    if (dias < 60) return "bg-green-500";
    if (dias < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (dias?: number) => {
    if (!dias) return "Novo";
    if (dias < 60) return "Normal";
    if (dias < 90) return "Atenção";
    return "Abandonado";
  };

  return (
    <DashboardLayout currentPage="aparelhos">
      <div className="flex-1 overflow-auto bg-[#0F172A] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Aparelhos Aguardando Retirada
            </h1>
            <p className="text-[#94A3B8]">
              Controle de aparelhos prontos e em espera de retirada pelos clientes
            </p>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Aguardando */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#94A3B8] mb-2">Total Aguardando</p>
                  <p className="text-3xl font-bold text-[#10B981]">
                    {metrics.aguardando}
                  </p>
                </div>
                <Package size={40} className="text-[#10B981] opacity-20" />
              </div>
            </div>

            {/* Próximos do Prazo */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#94A3B8] mb-2">Próximos do Prazo</p>
                  <p className="text-3xl font-bold text-[#FFC107]">
                    {metrics.proximos60}
                  </p>
                </div>
                <Clock size={40} className="text-[#FFC107] opacity-20" />
              </div>
            </div>

            {/* Total Parado */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#94A3B8] mb-2">Total Parado</p>
                  <p className="text-3xl font-bold text-[#3B82F6]">
                    R$ {metrics.totalParado.toFixed(2)}
                  </p>
                </div>
                <DollarSign size={40} className="text-[#3B82F6] opacity-20" />
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155] mb-6">
            <div className="flex flex-col gap-4">
              {/* Busca */}
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-[#64748B]"
                />
                <input
                  type="text"
                  placeholder="Buscar por cliente, telefone, marca ou modelo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#0F172A] text-white px-10 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setFilter("todos");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === "todos"
                      ? "bg-[#FFC107] text-[#0F172A]"
                      : "bg-[#334155] text-white hover:bg-[#475569]"
                  }`}
                >
                  Todos
                </button>

                <button
                  onClick={() => {
                    setFilter("60dias");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === "60dias"
                      ? "bg-[#FFC107] text-[#0F172A]"
                      : "bg-[#334155] text-white hover:bg-[#475569]"
                  }`}
                >
                  +60 dias
                </button>

              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
            {paginatedServices.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={48} className="text-[#64748B] mx-auto mb-4 opacity-50" />
                <p className="text-[#94A3B8]">Nenhum aparelho encontrado</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#0F172A] border-b border-[#334155]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Cliente
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Telefone
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Aparelho
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Serviço
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Valor
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Dias
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedServices.map((service) => (
                        <tr
                          key={service.id}
                          className="border-b border-[#334155] hover:bg-[#0F172A] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-white font-semibold">
                            {service.clientName}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#94A3B8]">
                            {service.whatsapp}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {service.brand} {service.model}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#94A3B8]">
                            {service.issue}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#FFC107]">
                            R$ {(service.budget || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-white">
                            {service.diasAguardando || 0} dias
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getStatusColor(
                                service.diasAguardando
                              )}`}
                            >
                              {getStatusText(service.diasAguardando)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => updateService(service.id, { status: "Entregue" })}
                              className="px-3 py-1 rounded bg-[#10B981] text-white hover:bg-[#059669] flex items-center gap-1 text-xs font-semibold"
                              title="Entregar Aparelho"
                            >
                              <Check size={14} />
                              Entregar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-[#334155] flex items-center justify-between">
                    <p className="text-sm text-[#94A3B8]">
                      Página {currentPage} de {totalPages} ({servicesFiltered.length} itens)
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
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-[#334155] text-white hover:bg-[#475569] disabled:opacity-50"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
