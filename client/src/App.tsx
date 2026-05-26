import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NotificationSystem from "./components/NotificationSystem";
import { DataProvider } from "./contexts/DataContext";
import { LogoProvider } from "./contexts/LogoContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Servicos from "./pages/Servicos";
import Vendas from "./pages/Vendas";
import Clientes from "./pages/Clientes";
import AparelhosAguardando from "./pages/AparelhosAguardando";
import HistoricoEstoque from "./pages/HistoricoEstoque";
import ConsultaGarantia from "./pages/ConsultaGarantia";
import Bipagem from "./pages/Bipagem";
import Configuracoes from "./pages/Configuracoes";
import OSPublica from "./pages/OSPublica";
import AlertNotifications from "./components/AlertNotifications";
import Login from "./pages/Login";
import TestSupabase from "./pages/TestSupabase";

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType<any>;
}) {
  const { currentUser } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser && location !== "/login") {
      setLocation("/login");
    }
  }, [currentUser, location, setLocation]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC107] mx-auto mb-4"></div>
          <p className="text-white text-sm">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const { currentUser } = useUser();
  const [location, setLocation] = useLocation();

  // Se usuário está autenticado e tenta acessar /login, redireciona para home
  useEffect(() => {
    if (currentUser && location === "/login") {
      setLocation("/");
    }
  }, [currentUser, location, setLocation]);

  return (
    <>
      <Switch>
        <Route path={"/os/:osNumber"} component={OSPublica} />
      <Route path={"/login"} component={Login} />
        <Route path={"/produtos"} component={() => <ProtectedRoute component={Produtos} />} />
        <Route path={"/servicos"} component={() => <ProtectedRoute component={Servicos} />} />
        <Route path={"/vendas"} component={() => <ProtectedRoute component={Vendas} />} />
        <Route path={"/clientes"} component={() => <ProtectedRoute component={Clientes} />} />
        <Route path={"/aparelhos-aguardando"} component={() => <ProtectedRoute component={AparelhosAguardando} />} />
        <Route path={"/historico-estoque"} component={() => <ProtectedRoute component={HistoricoEstoque} />} />
        <Route path={"/consulta-garantia"} component={() => <ProtectedRoute component={ConsultaGarantia} />} />
        <Route path={"/configuracoes"} component={() => <ProtectedRoute component={Configuracoes} />} />
        <Route path={"/bipagem"} component={() => <ProtectedRoute component={Bipagem} />} />
        <Route path={"/test-supabase"} component={TestSupabase} />
        <Route path={"/404"} component={NotFound} />
        <Route path={"/"} component={() => <ProtectedRoute component={Dashboard} />} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
      <AlertNotifications />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LogoProvider>
          <UserProvider>
            <DataProvider>
      <NotificationSystem />
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </DataProvider>
          </UserProvider>
        </LogoProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
