import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { ServiceOrder } from "@/contexts/DataContext";

export interface Alert {
  id: string;
  osNumber: string;
  clientName: string;
  whatsapp: string;
  dias: number;
  tipo: "30dias" | "60dias" | "85dias";
  mensagem: string;
  data: string;
}

export function useAutoAlerts() {
  const { services, updateService } = useData();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];

    services.forEach((service) => {
      // Apenas processar OS em "Aguardando retirada"
      if (service.status !== "Aguardando retirada" || !service.dataPronto) {
        return;
      }

      const dias = service.diasAguardando || 0;
      const hoje = new Date().toISOString();

      // Alerta de 30 dias
      if (dias === 30 && !service.alertas30dias) {
        newAlerts.push({
          id: `${service.id}-30`,
          osNumber: service.osNumber,
          clientName: service.clientName,
          whatsapp: service.whatsapp,
          dias: 30,
          tipo: "30dias",
          mensagem: `Seu aparelho está pronto para retirada há 30 dias. Após 90 dias poderá receber outro destino conforme termo da ordem de serviço.`,
          data: hoje,
        });

        // Marcar alerta como enviado
        updateService(service.id, { alertas30dias: true });
      }

      // Alerta de 60 dias
      if (dias === 60 && !service.alertas60dias) {
        newAlerts.push({
          id: `${service.id}-60`,
          osNumber: service.osNumber,
          clientName: service.clientName,
          whatsapp: service.whatsapp,
          dias: 60,
          tipo: "60dias",
          mensagem: `LEMBRETE: Seu aparelho está pronto há 60 dias. Retire em até 30 dias ou será considerado abandonado.`,
          data: hoje,
        });

        // Marcar alerta como enviado
        updateService(service.id, { alertas60dias: true });
      }

      // Alerta de 85 dias
      if (dias === 85 && !service.alertas85dias) {
        newAlerts.push({
          id: `${service.id}-85`,
          osNumber: service.osNumber,
          clientName: service.clientName,
          whatsapp: service.whatsapp,
          dias: 85,
          tipo: "85dias",
          mensagem: `AVISO FINAL: Seu aparelho será considerado abandonado em 5 dias. Retire agora para evitar perda do equipamento.`,
          data: hoje,
        });

        // Marcar alerta como enviado
        updateService(service.id, { alertas85dias: true });
      }
    });

    setAlerts(newAlerts);
  }, [services, updateService]);

  return alerts;
}
