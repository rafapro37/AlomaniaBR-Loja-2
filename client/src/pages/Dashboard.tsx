import DashboardLayout from "@/components/DashboardLayout";
import { useUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import { Link } from "wouter";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === "admin";
  const { products, services, sales, clients } = useData();

  // Calcular estatísticas
  const vendidoHoje = sales
    .filter((s) => {
      const saleDate = new Date(s.date);
      const today = new Date();
      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, s) => sum + s.total, 0);

  const servicosEmAndamento = services.filter(
    (s) =>
      s.status === "Em análise" ||
      s.status === "Aguardando aprovação" ||
      s.status === "Em manutenção"
  ).length;

  const servicosConcluidos = services.filter((s) => s.status === "Finalizado" || s.status === "Entregue").length;

  const produtosBaixoEstoque = products.filter((p) => p.quantity <= 2).length;

  const stats = [
    {
      title: "Vendas Hoje",
      value: `R$ ${vendidoHoje.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-gradient-to-br from-amber-50 to-amber-100",
      textColor: "text-amber-900",
      borderColor: "border-amber-200",
    },
    {
      title: "Serviços em Andamento",
      value: servicosEmAndamento.toString(),
      icon: Clock,
      color: "bg-gradient-to-br from-blue-50 to-blue-100",
      textColor: "text-blue-900",
      borderColor: "border-blue-200",
    },
    {
      title: "Serviços Concluídos",
      value: servicosConcluidos.toString(),
      icon: CheckCircle,
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      textColor: "text-emerald-900",
      borderColor: "border-emerald-200",
    },
    {
      title: "Produtos Baixo Estoque",
      value: produtosBaixoEstoque.toString(),
      icon: AlertCircle,
      color: "bg-gradient-to-br from-red-50 to-red-100",
      textColor: "text-red-900",
      borderColor: "border-red-200",
    },
  ];

  const recentServices = services.slice(-4).reverse();
  const lowStockProducts = products.filter((p) => p.quantity <= 2).slice(0, 5);

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2">
          <h2 className="text-3xl font-bold mb-1">
            Bem-vindo ao Painel
          </h2>
          <p className="text-muted-foreground text-sm">
            Aqui você gerencia toda a loja, estoque e serviços técnicos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`${stat.color} ${stat.textColor} rounded-md p-6 shadow-sm border ${stat.borderColor} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-600 uppercase tracking-wide opacity-75">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon size={32} className="opacity-80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Services */}
          <div className="lg:col-span-2 bg-[#1E293B] rounded-lg p-6 border border-[#334155] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Serviços Recentes</h3>
              <Link
                href="/servicos"
                className="text-[#FFC107] hover:text-[#FFD54F] text-sm font-semibold cursor-pointer"
              >
                Ver Todos →
              </Link>
            </div>

            {recentServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#94A3B8]">Nenhum serviço cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-[#0F172A] rounded-lg p-4 border border-[#334155] hover:border-[#2563EB] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {service.clientName}
                        </p>
                        <p className="text-sm text-[#94A3B8]">
                          {service.brand} {service.model} - {service.issue}
                        </p>
                      </div>
                      <span className="bg-[#FFC107] text-[#0F172A] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155] shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={24} className="text-[#EF4444]" />
              <h3 className="text-xl font-bold text-white">Estoque Baixo</h3>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#94A3B8]">Estoque normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {product.category}
                        </p>
                      </div>
                      <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded">
                        {product.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/produtos"
              className="w-full mt-4 bg-[#FFC107] text-[#0F172A] font-semibold py-2 rounded-lg hover:bg-[#FFD54F] transition-colors block text-center cursor-pointer"
            >
              Gerenciar Estoque
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-1">Total Produtos</p>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-1">Total Clientes</p>
            <p className="text-2xl font-bold text-white">{clients.length}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-1">Total Vendas</p>
            <p className="text-2xl font-bold text-[#FFC107]">{sales.length}</p>
          </div>
          {isAdmin && (
          <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-1">Faturamento Total</p>
            <p className="text-2xl font-bold text-[#10B981]">
              R$ {sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
            </p>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
