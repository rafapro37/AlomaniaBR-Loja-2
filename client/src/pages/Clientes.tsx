import DashboardLayout from "@/components/DashboardLayout";
import WhatsAppInput from "@/components/WhatsAppInput";
import { useData, Client } from "@/contexts/DataContext";
import { formatPhoneForDisplay } from "@/lib/whatsapp";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  MessageCircle,
  History,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Clientes() {
  const { clients, addClient, updateClient, deleteClient, sales, services } =
    useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
  });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.whatsapp.includes(searchTerm)
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.whatsapp.trim())
      newErrors.whatsapp = "WhatsApp é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingId) {
      updateClient(editingId, {
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email,
      });
    } else {
      addClient({
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email,
      });
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      whatsapp: "",
      email: "",
    });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      whatsapp: client.whatsapp,
      email: client.email || "",
    });
    setEditingId(client.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      deleteClient(id);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const getClientHistory = (clientId: string) => {
    const history: string[] = [];

    // Vendas do cliente
    sales.forEach((sale) => {
      if (sale.clientId === clientId) {
        history.push(
          `Venda em ${sale.date}: R$ ${sale.total.toFixed(2)} (${sale.paymentMethod})`
        );
      }
    });

    // Serviços do cliente
    services.forEach((service) => {
      if (service.clientId === clientId) {
        history.push(
          `Serviço ${service.osNumber}: ${service.issue} - ${service.status}`
        );
      }
    });

    return history.sort().reverse();
  };

  const getClientStats = (clientId: string) => {
    const clientSales = sales.filter((s) => s.clientId === clientId);
    const clientServices = services.filter((s) => s.clientId === clientId);

    return {
      totalSpent: clientSales.reduce((sum, s) => sum + s.total, 0),
      servicesCount: clientServices.length,
    };
  };

  return (
    <DashboardLayout currentPage="clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Clientes</h2>
            <p className="text-muted-foreground text-sm">
              Gerenciamento de clientes e histórico
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#F59E0B] text-white font-medium py-2.5 px-5 rounded-md hover:bg-[#D97706] transition-all duration-200 flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="bg-card rounded-md p-4 border border-border shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input text-foreground pl-10 pr-4 py-2 rounded-md border border-border focus:border-ring outline-none transition-colors"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div className="bg-card rounded-md p-12 border border-border text-center shadow-sm">
            <p className="text-muted-foreground text-sm">Nenhum cliente cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const stats = getClientStats(client.id);
              return (
                <div
                  key={client.id}
                  className="bg-card rounded-md p-5 border border-border hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-1">
                        {client.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatPhoneForDisplay(client.whatsapp)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center font-bold text-white shadow-sm">
                      {client.name.charAt(0)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-amber-50 rounded-md p-3 border border-amber-100">
                      <p className="text-xs font-600 uppercase tracking-wide text-amber-900 mb-1">Total Gasto</p>
                      <p className="text-base font-bold text-amber-700">
                        R$ {stats.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-md p-3 border border-emerald-100">
                      <p className="text-xs font-600 uppercase tracking-wide text-emerald-900 mb-1">Serviços</p>
                      <p className="text-base font-bold text-emerald-700">
                        {stats.servicesCount}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelectClient(client)}
                      className="flex-1 bg-[#2563EB] text-white font-semibold py-2 rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <History size={16} />
                      Histórico
                    </button>
                    <button
                      onClick={() => handleEdit(client)}
                      className="flex-1 bg-[#2563EB] text-white font-semibold py-2 rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Total de Clientes</p>
            <p className="text-3xl font-bold text-white">{clients.length}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Total Gasto (Todos)</p>
            <p className="text-3xl font-bold text-[#FFC107]">
              R${" "}
              {clients
                .reduce((sum, c) => sum + getClientStats(c.id).totalSpent, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-2">Ticket Médio</p>
            <p className="text-3xl font-bold text-[#10B981]">
              R${" "}
              {clients.length > 0
                ? (
                    clients.reduce(
                      (sum, c) => sum + getClientStats(c.id).totalSpent,
                      0
                    ) / clients.length
                  ).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-md w-full border border-[#334155]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingId ? "Editar Cliente" : "Novo Cliente"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-[#94A3B8] hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-[#94A3B8] block mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                    errors.name ? "border-[#EF4444]" : "border-[#334155]"
                  } focus:border-[#FFC107] outline-none transition-colors`}
                />
                {errors.name && (
                  <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-[#94A3B8] block mb-2">
                  WhatsApp *
                </label>
                <WhatsAppInput
                  value={formData.whatsapp}
                  onChange={(value) =>
                    setFormData({ ...formData, whatsapp: value })
                  }
                  error={errors.whatsapp}
                />
              </div>

              <div>
                <label className="text-sm text-[#94A3B8] block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="cliente@email.com"
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#FFC107] text-[#0F172A] font-semibold py-2 rounded-lg hover:bg-[#FFD54F] transition-colors"
              >
                {editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-2xl w-full border border-[#334155] max-h-96 overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {selectedClient.name}
                </h3>
                <p className="text-[#94A3B8]">{formatPhoneForDisplay(selectedClient.whatsapp)}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0F172A] rounded p-4">
                <p className="text-[#94A3B8] text-sm mb-1">Total Gasto</p>
                <p className="text-2xl font-bold text-[#FFC107]">
                  R$ {getClientStats(selectedClient.id).totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0F172A] rounded p-4">
                <p className="text-[#94A3B8] text-sm mb-1">Serviços</p>
                <p className="text-2xl font-bold text-[#10B981]">
                  {getClientStats(selectedClient.id).servicesCount}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">Histórico</h4>
              {getClientHistory(selectedClient.id).length === 0 ? (
                <p className="text-[#94A3B8]">Nenhum histórico</p>
              ) : (
                <div className="space-y-2">
                  {getClientHistory(selectedClient.id).map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0F172A] rounded p-3 border border-[#334155]"
                    >
                      <p className="text-white text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-6 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
