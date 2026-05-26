import DashboardLayout from "@/components/DashboardLayout";
import { useData, StockMovement } from "@/contexts/DataContext";
import { Search, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo } from "react";
import { generateStockHistoryPDF } from "@/lib/pdf-generator";

export default function HistoricoEstoque() {
  const { stockMovements, products } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "entrada" | "saída">("todos");
  const [filterProduct, setFilterProduct] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredMovements = useMemo(() => {
    let filtered = stockMovements;

    // Filtrar por tipo
    if (filterType !== "todos") {
      filtered = filtered.filter((m) => m.type === filterType);
    }

    // Filtrar por produto
    if (filterProduct !== "Todos") {
      filtered = filtered.filter((m) => m.productId === filterProduct);
    }

    // Buscar por nome ou código
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stockMovements, filterType, filterProduct, searchTerm]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const entradas = filteredMovements.filter((m) => m.type === "entrada");
    const saidas = filteredMovements.filter((m) => m.type === "saída");
    const totalEntrada = entradas.reduce((sum, m) => sum + m.quantity, 0);
    const totalSaida = saidas.reduce((sum, m) => sum + m.quantity, 0);

    return {
      total: filteredMovements.length,
      entradas: entradas.length,
      saidas: saidas.length,
      totalEntrada,
      totalSaida,
    };
  }, [filteredMovements]);

  // Paginação
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportPDF = () => {
    generateStockHistoryPDF(filteredMovements, metrics);
  };

  return (
    <DashboardLayout currentPage="historico">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Histórico de Estoque</h1>
          <p className="text-[#94A3B8]">Auditoria completa de movimentações de produtos</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Total de Movimentações</p>
            <p className="text-3xl font-bold text-white">{metrics.total}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Entradas</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-[#10B981]">{metrics.entradas}</p>
              <TrendingUp size={24} className="text-[#10B981]" />
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">{metrics.totalEntrada} unidades</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Saídas</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-[#EF4444]">{metrics.saidas}</p>
              <TrendingDown size={24} className="text-[#EF4444]" />
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">{metrics.totalSaida} unidades</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Saldo</p>
            <p className={`text-3xl font-bold ${
              metrics.totalEntrada - metrics.totalSaida >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
            }`}>
              {metrics.totalEntrada - metrics.totalSaida}
            </p>
            <p className="text-sm text-[#94A3B8] mt-1">unidades</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155] space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search size={20} className="absolute left-3 top-3 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Buscar por produto, código ou usuário..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#0F172A] text-white pl-10 pr-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-lg bg-[#10B981] text-white hover:bg-[#059669] flex items-center gap-2 font-semibold transition-colors"
            >
              <Download size={18} />
              Exportar PDF
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#94A3B8]" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as "todos" | "entrada" | "saída");
                  setCurrentPage(1);
                }}
                className="bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
              >
                <option value="todos">Todos os tipos</option>
                <option value="entrada">Entradas</option>
                <option value="saída">Saídas</option>
              </select>
            </div>
            <select
              value={filterProduct}
              onChange={(e) => {
                setFilterProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
            >
              <option value="Todos">Todos os produtos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden shadow-md">
          {paginatedMovements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#94A3B8]">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-[#334155]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Quantidade
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Motivo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Antes/Depois
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Usuário
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-[#334155] hover:bg-[#0F172A] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        {new Date(movement.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="text-white font-semibold">{movement.productName}</p>
                          <p className="text-xs text-[#94A3B8]">{movement.productCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 w-fit ${
                            movement.type === "entrada"
                              ? "bg-[#10B981]"
                              : "bg-[#EF4444]"
                          }`}
                        >
                          {movement.type === "entrada" ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          {movement.type === "entrada" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {movement.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        <span className="text-[#94A3B8]">{movement.previousQuantity}</span>
                        <span className="text-[#FFC107] mx-1">→</span>
                        <span className="font-semibold">{movement.newQuantity}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {movement.userName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {paginatedMovements.length > 0 && (
            <div className="bg-[#0F172A] border-t border-[#334155] px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-[#94A3B8]">
                Página {currentPage} de {totalPages} ({filteredMovements.length} itens)
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
