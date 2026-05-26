import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useLogo } from "@/contexts/LogoContext";
import LogoManager from "./LogoManager";
import {
  LayoutDashboard, Package, Wrench, ShoppingCart, Users,
  Menu, X, LogOut, Settings, History, Shield, ScanBarcode, Clock,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useState(() => {
    window.addEventListener('pwaInstallAvailable', () => {
      setPwaPrompt((window as any).__pwaPrompt);
    });
    window.addEventListener('appinstalled', () => {
      setPwaInstalled(true);
      setPwaPrompt(null);
    });
  });

  const handleInstallPWA = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') setPwaInstalled(true);
    setPwaPrompt(null);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoManager, setShowLogoManager] = useState(false);
  const { logout, currentUser } = useUser();
  const { logoUrl, storeName } = useLogo();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const allItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["admin","tecnico","atendente","caixa"] },
    { id: "products", label: "Produtos", icon: Package, href: "/produtos", roles: ["admin","atendente"] },
    { id: "services", label: "Serviços Técnicos", icon: Wrench, href: "/servicos", roles: ["admin","tecnico","atendente"] },
    { id: "sales", label: "Vendas", icon: ShoppingCart, href: "/vendas", roles: ["admin","caixa","atendente"] },
    { id: "clients", label: "Clientes", icon: Users, href: "/clientes", roles: ["admin","atendente","tecnico"] },
    { id: "aparelhos", label: "Aguardando Retirada", icon: Clock, href: "/aparelhos-aguardando", roles: ["admin","atendente","caixa"] },
    { id: "historico", label: "Histórico Estoque", icon: History, href: "/historico-estoque", roles: ["admin","atendente"] },
    { id: "consulta-garantia", label: "Consulta Garantia", icon: Shield, href: "/consulta-garantia", roles: ["admin","atendente","caixa"] },
    { id: "bipagem", label: "Bipagem de Produtos", icon: ScanBarcode, href: "/bipagem", roles: ["admin","atendente"] },
    { id: "configuracoes", label: "Configurações", icon: Settings, href: "/configuracoes", roles: ["admin"] },
  ];
  const menuItems = allItems.filter(i => i.roles.includes(currentUser?.role || ""));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full z-40 md:z-auto bg-blue-700 text-white flex flex-col border-r border-blue-800 shadow-xl transition-all duration-300 overflow-hidden ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"} md:w-16 md:hover:w-64 group/sidebar`}>
        {/* Logo */}
        <div className="p-3 border-b border-blue-800 flex items-center gap-3 min-h-[60px]">
          <button onClick={() => setShowLogoManager(true)} className="flex-shrink-0" title="Gerenciar logo">
            <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/10" />
          </button>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 md:group-hover/sidebar:opacity-100"}`}>
            <p className="font-bold text-sm">{storeName}</p>
            <p className="text-xs text-blue-200">Painel Gerenciador</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-1 hover:bg-blue-800 rounded flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map(({ id, label, icon: Icon, href }) => {
            const active = currentPage === id;
            return (
              <Link key={id} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg transition-all whitespace-nowrap overflow-hidden ${active ? "bg-amber-500 text-white font-semibold" : "text-blue-100 hover:bg-blue-800"}`}
                title={label}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`text-sm transition-all duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 md:group-hover/sidebar:opacity-100"}`}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-blue-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-blue-100 hover:bg-blue-800 transition-all whitespace-nowrap overflow-hidden" title="Sair">
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`text-sm ${sidebarOpen ? "opacity-100" : "opacity-0 md:group-hover/sidebar:opacity-100"}`}>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
              <Menu size={22} />
            </button>
            <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain hidden md:block" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold leading-tight">{storeName}</h1>
              <p className="text-xs text-muted-foreground">Painel Gerenciador</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pwaPrompt && !pwaInstalled && (
              <button
                onClick={handleInstallPWA}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors"
                title="Instalar como app"
              >
                📲 Instalar App
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow">
              {currentUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background p-3 md:p-5">
          {children}
        </main>
      </div>

      <LogoManager isOpen={showLogoManager} onClose={() => setShowLogoManager(false)} />
    </div>
  );
}
