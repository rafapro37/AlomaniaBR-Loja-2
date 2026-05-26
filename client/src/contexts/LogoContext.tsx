import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface LogoContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  storeName: string;
  setStoreName: (name: string) => void;
  resetLogo: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const DEFAULT_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23FFC107' width='100' height='100' rx='10'/%3E%3Ctext x='50' y='65' font-size='60' font-weight='bold' text-anchor='middle' fill='%230F172A'%3EAB%3C/text%3E%3C/svg%3E";

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrlState] = useState<string>(
    () => localStorage.getItem("alomania_logo") || DEFAULT_LOGO
  );
  const [storeName, setStoreNameState] = useState<string>(
    () => localStorage.getItem("alomania_store_name") || "Alomania BR"
  );

  useEffect(() => { loadFromSupabase(); }, []);

  const loadFromSupabase = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from("store_config").select("*").eq("key", "config").single();
      if (!error && data) {
        if (data.logo_url) { setLogoUrlState(data.logo_url); localStorage.setItem("alomania_logo", data.logo_url); }
        if (data.store_name) { setStoreNameState(data.store_name); localStorage.setItem("alomania_store_name", data.store_name); }
      }
    } catch (e) { console.log("store_config não encontrado"); }
  };

  const saveToSupabase = async (logo: string, name: string) => {
    try {
      if (!supabase) return;
      await supabase.from("store_config").upsert({ key: "config", logo_url: logo, store_name: name, updated_at: new Date().toISOString() }, { onConflict: "key" });
    } catch (e) { console.warn("Erro ao salvar no Supabase"); }
  };

  const setLogoUrl = (url: string) => {
    setLogoUrlState(url);
    localStorage.setItem("alomania_logo", url);
    saveToSupabase(url, storeName);
  };

  const setStoreName = (name: string) => {
    setStoreNameState(name);
    localStorage.setItem("alomania_store_name", name);
    saveToSupabase(logoUrl, name);
  };

  const resetLogo = () => {
    setLogoUrlState(DEFAULT_LOGO);
    localStorage.removeItem("alomania_logo");
  };

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl, storeName, setStoreName, resetLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (!context) throw new Error("useLogo deve ser usado dentro de LogoProvider");
  return context;
}
