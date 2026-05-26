import EtiquetaOS from "@/components/EtiquetaOS";
import SignaturePad from "@/components/SignaturePad";
import DashboardLayout from "@/components/DashboardLayout";
import WhatsAppInput from "@/components/WhatsAppInput";
import ImageUpload, { ImageGallery } from "@/components/ImageUpload";
import { useData, ServiceOrder } from "@/contexts/DataContext";
import { useLogo } from "@/contexts/LogoContext";
import { formatPhoneForDisplay, openWhatsApp } from "@/lib/whatsapp";
import { generateBudgetPDF, generateWarrantyPDF } from "@/lib/pdf-generator";
import { generateServiceWarranty } from "@/lib/warranty-generator";
import {
  Plus,
  MessageCircle,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Download,
  FileText,
  Award,
} from "lucide-react";
import { useState } from "react";

export default function Servicos() {
  const { services, clients, addService, updateService, deleteService, warranties, addWarranty, warrantyConfig } =
    useData();
  const { logoUrl } = useLogo();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showMaintenanceValueModal, setShowMaintenanceValueModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceOrder | null>(
    null
  );
  const [budgetValue, setBudgetValue] = useState("");
  const [budgetDescription, setBudgetDescription] = useState("");
  const [maintenanceValue, setMaintenanceValue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSignature, setShowSignature] = useState<string | null>(null);
  const [showEtiqueta, setShowEtiqueta] = useState<ServiceOrder | null>(null);

  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    whatsapp: "",
    deviceType: "",
    brand: "",
    model: "",
    issue: "",
    notes: "",
    paymentMethods: [] as ("Pix" | "Dinheiro" | "Cartão")[],
    images: [] as Array<{ id: string; url: string; name: string }>,
  });
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<("Pix" | "Dinheiro" | "Cartão")[]>([]);

  const statusColors: Record<string, string> = {
    "Aguardando análise": "bg-[#64748B]",
    "Em análise": "bg-[#FFC107]",
    "Aguardando aprovação": "bg-[#2563EB]",
    "Em manutenção": "bg-[#2563EB]",
    Finalizado: "bg-[#10B981]",
    "Aguardando pagamento": "bg-[#F59E0B]",
    Entregue: "bg-[#10B981]",
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim())
      newErrors.clientName = "Nome do cliente é obrigatório";
    if (!formData.whatsapp.trim())
      newErrors.whatsapp = "WhatsApp é obrigatório";
    if (!formData.brand.trim()) newErrors.brand = "Marca é obrigatória";
    if (!formData.model.trim()) newErrors.model = "Modelo é obrigatório";
    if (!formData.issue.trim()) newErrors.issue = "Descrição do problema é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const osNumber = `OS-${String(services.length + 1).padStart(3, "0")}`;

    if (editingId) {
      updateService(editingId, {
        clientName: formData.clientName,
        whatsapp: formData.whatsapp,
        deviceType: formData.deviceType,
        brand: formData.brand,
        model: formData.model,
        issue: formData.issue,
        notes: formData.notes,
        paymentMethods: selectedPaymentMethods,
        images: formData.images,
      });
    } else {
      addService({
        osNumber,
        clientId: formData.clientId,
        clientName: formData.clientName,
        whatsapp: formData.whatsapp,
        deviceType: formData.deviceType,
        brand: formData.brand,
        model: formData.model,
        issue: formData.issue,
        status: "Aguardando análise",
        notes: formData.notes,
        paymentMethods: selectedPaymentMethods,
        images: formData.images,
      });
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      clientName: "",
      whatsapp: "",
      deviceType: "",
      brand: "",
      model: "",
      issue: "",
      notes: "",
      paymentMethods: [],
      images: [],
    });
    setSelectedPaymentMethods([]);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (service: ServiceOrder) => {
    setFormData({
      clientId: service.clientId,
      clientName: service.clientName,
      whatsapp: service.whatsapp,
      deviceType: service.deviceType,
      brand: service.brand,
      model: service.model,
      issue: service.issue,
      notes: service.notes,
      paymentMethods: service.paymentMethods || [],
      images: service.images,
    });
    setSelectedPaymentMethods(service.paymentMethods || []);
    setEditingId(service.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta O.S.?")) {
      deleteService(id);
    }
  };

  const handleGenerateBudgetPDF = async () => {
    if (selectedService && budgetValue) {
      await generateBudgetPDF({
        osNumber: selectedService.osNumber,
        clientName: selectedService.clientName,
        whatsapp: selectedService.whatsapp,
        deviceType: selectedService.deviceType,
        brand: selectedService.brand,
        model: selectedService.model,
        issue: selectedService.issue,
        serviceDescription: budgetDescription || "Serviço de manutenção técnica",
        budgetValue: parseFloat(budgetValue),
        date: new Date().toISOString(),
        paymentMethods: selectedService.paymentMethods,
        logoUrl: logoUrl,
      });
    }
  };

  const handleSendBudget = () => {
    if (selectedService && budgetValue) {
      const message = `Olá ${selectedService.clientName}, seu orçamento está pronto: R$ ${budgetValue}. Podemos prosseguir com o serviço?`;
      openWhatsApp(selectedService.whatsapp, message);
      setShowBudgetModal(false);
      setBudgetValue("");
      setBudgetDescription("");
    }
  };

  return (
    <DashboardLayout currentPage="services">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Serviços Técnicos
            </h2>
            <p className="text-[#94A3B8]">
              Gerenciamento de ordens de serviço e manutenção
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#FFC107] text-[#0F172A] font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nova O.S.
          </button>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="bg-[#1E293B] rounded-lg p-12 border border-[#334155] text-center">
              <p className="text-[#94A3B8]">Nenhuma ordem de serviço cadastrada</p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1E293B] rounded-lg p-6 border border-[#334155] hover:border-[#2563EB] transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-[#94A3B8]">OS Número</p>
                        <p className="text-xl font-bold text-white">
                          {service.osNumber}
                        </p>
                      </div>
                      <span
                        className={`${statusColors[service.status]} text-white px-4 py-2 rounded-full text-sm font-semibold`}
                      >
                        {service.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-xs text-[#94A3B8]">Cliente</p>
                        <p className="text-white font-semibold">
                          {service.clientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">WhatsApp</p>
                        <p className="text-white">{formatPhoneForDisplay(service.whatsapp)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    {service.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-[#94A3B8] mb-2">Imagens</p>
                        <div className="flex gap-2 flex-wrap">
                          {service.images.map((img) => (
                            <img
                              key={img.id}
                              src={img.url}
                              alt={img.name}
                              className="w-16 h-16 rounded object-cover border border-[#334155]"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-xs text-[#94A3B8]">Aparelho</p>
                        <p className="text-white font-semibold">
                          {service.brand} {service.model} ({service.deviceType})
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">Problema</p>
                        <p className="text-white">{service.issue}</p>
                      </div>
                    </div>

                    {service.budget && (
                      <div className="bg-[#0F172A] rounded p-2 mb-2">
                        <p className="text-xs text-[#94A3B8]">Orçamento</p>
                        <p className="text-lg font-bold text-[#FFC107]">
                          R$ {service.budget.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {service.paymentMethods && service.paymentMethods.length > 0 && (
                      <div className="bg-[#0F172A] rounded p-2">
                        <p className="text-xs text-[#94A3B8]">Formas de Pagamento</p>
                        <p className="text-sm text-[#10B981]">
                          {service.paymentMethods.join(" / ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {service.notes && (
                  <div className="bg-[#0F172A] rounded p-3 my-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Observações</p>
                    <p className="text-white text-sm">{service.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowBudgetModal(true);
                    }}
                    className="bg-[#FFC107] text-[#0F172A] font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Orçamento
                  </button>


                  <button
                    onClick={() => setShowEtiqueta(service)}
                    className="bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2"
                  >
                    <QrCode size={16} />
                    Etiqueta
                  </button>


                  {service.status === "Aguardando retirada" && (
                    <button
                      onClick={() => {
                        const warranty = generateServiceWarranty(service, warrantyConfig);
                        addWarranty(warranty);
                        generateWarrantyPDF(warranty);
                      }}
                      className="bg-[#8B5CF6] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#7C3AED] transition-colors flex items-center gap-2"
                    >
                      <Award size={16} />
                      Gerar Garantia
                    </button>
                  )}

                  {service.status === "Finalizado" && (
                    <button
                      onClick={() => {
                        updateService(service.id, {
                          status: "Aguardando pagamento",
                        });
                      }}
                      className="bg-[#10B981] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Enviar para Caixa
                    </button>
                  )}

                  <select
                    value={service.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ServiceOrder["status"];
                      if (newStatus === "Em manutenção" && !service.budget) {
                        setSelectedService(service);
                        setMaintenanceValue("");
                        setShowMaintenanceValueModal(true);
                      } else {
                        updateService(service.id, {
                          status: newStatus,
                        });
                      }
                    }}
                    className="bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
                  >
                    <option value="Aguardando análise">Aguardando análise</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Aguardando aprovação">Aguardando aprovação</option>
                    <option value="Em manutenção">Em manutenção</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Aguardando pagamento">Aguardando pagamento</option>
                    <option value="Entregue">Entregue</option>
                  </select>

                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-[#2563EB] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(service.id)}
                    className="bg-[#EF4444] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#DC2626] transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-2xl w-full border border-[#334155] max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingId ? "Editar O.S." : "Nova Ordem de Serviço"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.clientName ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.clientName && (
                    <p className="text-[#EF4444] text-xs mt-1">
                      {errors.clientName}
                    </p>
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
                    Tipo de Aparelho
                  </label>
                  <input type="text" value={formData.deviceType} onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })} placeholder="Ex: Celular, Notebook, PS5, TV..." className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors" />
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.brand ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.brand && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.model ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.model && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.model}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Descrição do Problema *
                  </label>
                  <textarea
                    value={formData.issue}
                    onChange={(e) =>
                      setFormData({ ...formData, issue: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.issue ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                    rows={3}
                  />
                  {errors.issue && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.issue}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors"
                    rows={2}
                  />
                </div>

              {/* Formas de Pagamento */}
              <div className="md:col-span-2">
                <label className="text-sm text-[#94A3B8] block mb-3">
                  Formas de Pagamento Aceitas
                </label>
                <div className="flex gap-4">
                  {(["Pix", "Dinheiro", "Cartao"] as const).map((method) => {
                    const displayMethod = method === "Cartao" ? "Cartão" : method;
                    const typedMethod = displayMethod as "Pix" | "Dinheiro" | "Cartão";
                    return (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPaymentMethods.includes(typedMethod)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPaymentMethods([...selectedPaymentMethods, typedMethod]);
                            } else {
                              setSelectedPaymentMethods(
                                selectedPaymentMethods.filter((m) => m !== typedMethod)
                              );
                            }
                          }}
                          className="w-4 h-4 accent-[#FFC107]"
                        />
                        <span className="text-sm text-[#E2E8F0]">{displayMethod}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="border-t border-[#334155] pt-4 mt-4">
              <label className="text-sm text-[#94A3B8] block mb-3">
                Imagens do Aparelho
              </label>
              <ImageUpload
                onImageAdd={(image) =>
                  setFormData({
                    ...formData,
                    images: [...formData.images, image],
                  })
                }
              />
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <ImageGallery
                    images={formData.images}
                    onRemove={(id) =>
                      setFormData({
                        ...formData,
                        images: formData.images.filter((img) => img.id !== id),
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
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
                {editingId ? "Atualizar" : "Criar O.S."}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Value Modal */}
      {showMaintenanceValueModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-md w-full border border-[#334155]">
            <h3 className="text-xl font-bold text-white mb-4">
              Definir Valor da Manutenção
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Cliente</p>
                <p className="text-white font-semibold">
                  {selectedService.clientName}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Aparelho</p>
                <p className="text-white font-semibold">
                  {selectedService.brand} {selectedService.model}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Problema</p>
                <p className="text-white text-sm">
                  {selectedService.issue}
                </p>
              </div>

              <div>
                <label className="text-sm text-[#94A3B8] block mb-2">
                  Valor da Manutenção (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={maintenanceValue}
                  onChange={(e) => setMaintenanceValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Formas de Pagamento Aceitas</p>
                <p className="text-sm text-[#10B981]">
                  {selectedService.paymentMethods?.join(" / ") || "Não especificado"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMaintenanceValueModal(false);
                  setMaintenanceValue("");
                  setSelectedService(null);
                }}
                className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!maintenanceValue || parseFloat(maintenanceValue) <= 0) {
                    alert("Por favor, insira um valor válido");
                    return;
                  }
                  updateService(selectedService.id, {
                    status: "Em manutenção",
                    budget: parseFloat(maintenanceValue),
                  });
                  setShowMaintenanceValueModal(false);
                  setMaintenanceValue("");
                  setSelectedService(null);
                }}
                className="flex-1 bg-[#FFC107] text-[#0F172A] font-semibold py-2 rounded-lg hover:bg-[#FFD54F] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-md w-full border border-[#334155]">
            <h3 className="text-xl font-bold text-white mb-4">
              Enviar Orçamento via WhatsApp
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Cliente</p>
                <p className="text-white font-semibold">
                  {selectedService.clientName}
                </p>
              </div>

              <div>
                <label className="text-sm text-[#94A3B8] block mb-2">
                  Descrição do Serviço
                </label>
                <textarea
                  value={budgetDescription}
                  onChange={(e) => setBudgetDescription(e.target.value)}
                  placeholder="Ex: Troca de bateria, limpeza interna..."
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-[#94A3B8] block mb-2">
                  Valor do Orçamento (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none"
                />
              </div>

              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Mensagem a Enviar</p>
                <div className="bg-[#0F172A] rounded p-3 text-white text-sm border border-[#334155] max-h-32 overflow-y-auto">
                  <p>Olá {selectedService.clientName},</p>
                  <p className="mt-2">Seu orçamento está pronto:</p>
                  <p className="font-bold text-[#FFC107] mt-2">R$ {budgetValue || "0.00"}</p>
                  <p className="mt-2">Podemos prosseguir com o serviço?</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateBudgetPDF}
                className="flex-1 bg-[#2563EB] text-white font-semibold py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                PDF
              </button>
              <button
                onClick={handleSendBudget}
                className="flex-1 bg-[#10B981] text-white font-semibold py-2 rounded-lg hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assinatura */}
      {showEtiqueta && (
        <EtiquetaOS
          osNumber={showEtiqueta.osNumber}
          clientName={showEtiqueta.clientName}
          deviceType={showEtiqueta.deviceType}
          brand={showEtiqueta.brand}
          model={showEtiqueta.model}
          issue={showEtiqueta.issue}
          createdAt={showEtiqueta.createdAt}
          baseUrl={window.location.origin}
          onClose={() => setShowEtiqueta(null)}
        />
      )}

      {showSignature && (
        <SignaturePad
          signerName={services.find(s => s.id === showSignature)?.clientName}
          onSave={(sig) => {
            updateService(showSignature, { notes: (services.find(s => s.id === showSignature)?.notes || '') + ' [Assinado]' });
            setShowSignature(null);
          }}
          onCancel={() => setShowSignature(null)}
        />
      )}
    </DashboardLayout>
  );
}
