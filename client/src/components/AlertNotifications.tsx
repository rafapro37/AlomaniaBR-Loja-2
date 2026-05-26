import { useAutoAlerts, Alert } from "@/hooks/useAutoAlerts";
import { X, Bell, AlertCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function AlertNotifications() {
  const alerts = useAutoAlerts();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.includes(a.id));

  const dismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const getAlertIcon = (tipo: Alert["tipo"]) => {
    switch (tipo) {
      case "30dias":
        return <Clock size={20} className="text-blue-500" />;
      case "60dias":
        return <AlertCircle size={20} className="text-yellow-500" />;
      case "85dias":
        return <AlertTriangle size={20} className="text-red-500" />;
    }
  };

  const getAlertColor = (tipo: Alert["tipo"]) => {
    switch (tipo) {
      case "30dias":
        return "border-blue-500 bg-blue-50";
      case "60dias":
        return "border-yellow-500 bg-yellow-50";
      case "85dias":
        return "border-red-500 bg-red-50";
    }
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-md z-40">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 p-4 rounded-lg shadow-lg ${getAlertColor(alert.tipo)} flex items-start gap-3`}
        >
          <div className="flex-shrink-0">{getAlertIcon(alert.tipo)}</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {alert.osNumber} - {alert.clientName}
            </p>
            <p className="text-sm text-gray-700 mt-1">{alert.mensagem}</p>
            <p className="text-xs text-gray-500 mt-2">
              📞 {alert.whatsapp} | {alert.dias} dias aguardando
            </p>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
