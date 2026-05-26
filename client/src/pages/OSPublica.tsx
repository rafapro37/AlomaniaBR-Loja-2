import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, Wrench, Package, AlertCircle, Phone } from "lucide-react";

const STATUS_INFO: Record<string, { color: string; icon: React.ElementType; label: string; desc: string }> = {
  "Aguardando análise": { color: "bg-gray-500", icon: Clock, label: "Aguardando Análise", desc: "Seu aparelho foi recebido e está na fila para análise." },
  "Em análise": { color: "bg-yellow-500", icon: Clock, label: "Em Análise", desc: "Nosso técnico está analisando o seu aparelho." },
  "Aguardando aprovação": { color: "bg-blue-500", icon: AlertCircle, label: "Aguardando Aprovação", desc: "O orçamento foi enviado. Aguardando sua aprovação." },
  "Em manutenção": { color: "bg-blue-600", icon: Wrench, label: "Em Manutenção", desc: "Seu aparelho está sendo reparado pelo nosso técnico." },
  "Finalizado": { color: "bg-green-500", icon: CheckCircle, label: "Finalizado", desc: "O reparo foi concluído com sucesso!" },
  "Aguardando pagamento": { color: "bg-amber-500", icon: AlertCircle, label: "Aguardando Pagamento", desc: "Reparo concluído. Aguardando pagamento para retirada." },
  "Aguardando retirada": { color: "bg-purple-500", icon: Package, label: "Pronto para Retirada", desc: "Seu aparelho está pronto! Venha buscar na loja." },
  "Entregue": { color: "bg-green-600", icon: CheckCircle, label: "Entregue", desc: "Aparelho entregue ao cliente." },
  "Abandonado": { color: "bg-red-500", icon: AlertCircle, label: "Abandonado", desc: "OS encerrada por abandono." },
};

export default function OSPublica() {
  const osNumber = window.location.pathname.split("/os/")[1];
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!osNumber) { setNotFound(true); setLoading(false); return; }
    loadOS();
  }, [osNumber]);

  const loadOS = async () => {
    try {
      const { data, error } = await supabase
        .from("service_orders")
        .select("*")
        .eq("os_number", osNumber)
        .single();
      if (error || !data) { setNotFound(true); }
      else { setService(data); }
    } catch { setNotFound(true); }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="text-center text-white">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h1 className="text-2xl font-bold mb-2">OS não encontrada</h1>
        <p className="text-[#94A3B8]">Verifique o número da ordem de serviço.</p>
      </div>
    </div>
  );

  const statusInfo = STATUS_INFO[service.status] || STATUS_INFO["Aguardando análise"];
  const StatusIcon = statusInfo.icon;
  const allStatuses = Object.keys(STATUS_INFO);
  const currentIdx = allStatuses.indexOf(service.status);

  return (
    <div className="min-h-screen bg-[#0F172A] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl font-black text-[#0F172A]">AB</span>
          </div>
          <h1 className="text-white font-bold text-xl">Alomania BR</h1>
          <p className="text-[#94A3B8] text-sm">Acompanhamento de Ordem de Serviço</p>
        </div>

        {/* OS Card */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8] text-sm">Número da OS</span>
            <span className="font-bold text-white text-lg">{service.os_number}</span>
          </div>

          {/* Status */}
          <div className={`${statusInfo.color} rounded-xl p-4 mb-4 text-white`}>
            <div className="flex items-center gap-3 mb-2">
              <StatusIcon size={24} />
              <span className="font-bold text-lg">{statusInfo.label}</span>
            </div>
            <p className="text-sm opacity-90">{statusInfo.desc}</p>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Cliente</span>
              <span className="text-white font-medium">{service.client_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Aparelho</span>
              <span className="text-white font-medium">{service.device_type}{service.brand ? ` — ${service.brand}` : ""}</span>
            </div>
            {service.model && (
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Modelo</span>
                <span className="text-white font-medium">{service.model}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Problema</span>
              <span className="text-white font-medium text-right max-w-[60%]">{service.issue}</span>
            </div>
            {service.budget && (
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Orçamento</span>
                <span className="text-green-400 font-bold">R$ {parseFloat(service.budget).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Entrada</span>
              <span className="text-white">{new Date(service.created_at).toLocaleDateString("pt-BR")} {new Date(service.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 mb-4">
          <h3 className="text-white font-bold mb-4">Progresso</h3>
          <div className="space-y-3">
            {["Aguardando análise", "Em análise", "Em manutenção", "Finalizado", "Aguardando retirada", "Entregue"].map((status, idx) => {
              const done = allStatuses.indexOf(service.status) >= allStatuses.indexOf(status);
              const current = service.status === status;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 ${done ? "bg-amber-500 border-amber-500" : "border-[#475569] bg-transparent"} ${current ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#1E293B]" : ""}`} />
                  <span className={`text-sm ${done ? "text-white font-medium" : "text-[#64748B]"}`}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contato */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 text-center">
          <Phone size={20} className="mx-auto mb-2 text-amber-400" />
          <p className="text-[#94A3B8] text-sm">Dúvidas? Entre em contato com a loja</p>
        </div>
      </div>
    </div>
  );
}
