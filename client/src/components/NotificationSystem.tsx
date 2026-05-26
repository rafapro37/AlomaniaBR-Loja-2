import { useEffect, useRef } from "react";
import { useData } from "@/contexts/DataContext";
import { useUser } from "@/contexts/UserContext";

export default function NotificationSystem() {
  const { sales, services } = useData();
  const { currentUser } = useUser();
  const prevSalesCount = useRef(sales.length);
  const prevServicesCount = useRef(services.length);
  const initialized = useRef(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; prevSalesCount.current = sales.length; return; }
    if (sales.length > prevSalesCount.current && currentUser?.role === "admin") {
      const lastSale = sales[0];
      if (lastSale) {
        showNotification("💰 Nova Venda!", `R$ ${lastSale.total.toFixed(2)} — ${lastSale.paymentMethod}`);
      }
    }
    prevSalesCount.current = sales.length;
  }, [sales.length]);

  useEffect(() => {
    if (!initialized.current) return;
    const readyServices = services.filter(s => s.status === "Aguardando retirada");
    if (services.length > prevServicesCount.current) {
      const lastService = services[0];
      if (lastService?.status === "Aguardando retirada") {
        showNotification("🔧 OS Pronta!", `${lastService.clientName} — ${lastService.deviceType} aguardando retirada`);
      }
    }
    prevServicesCount.current = services.length;
  }, [services.length]);

  const showNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/manifest.json" });
    }
    // Toast visual
    const toast = document.createElement("div");
    toast.innerHTML = `<div style="position:fixed;top:20px;right:20px;z-index:9999;background:#1E293B;border:1px solid #334155;border-left:4px solid #FFC107;padding:12px 16px;border-radius:8px;color:white;font-size:14px;max-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.5)"><strong>${title}</strong><br/><span style="color:#94A3B8">${body}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  return null;
}
