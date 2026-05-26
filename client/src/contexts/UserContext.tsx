import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { USERS_CONFIG, validateLogin } from "@/lib/users-config";

export type UserRole = "admin" | "tecnico" | "atendente" | "caixa";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  hasPermission: (action: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_USERS: User[] = USERS_CONFIG as User[];

const PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "view_dashboard",
    "manage_users",
    "manage_products",
    "manage_services",
    "manage_sales",
    "manage_clients",
    "view_reports",
    "edit_settings",
  ],
  tecnico: [
    "view_services",
    "edit_services",
    "view_clients",
    "upload_images",
    "generate_budget",
  ],
  atendente: [
    "create_services",
    "view_clients",
    "manage_clients",
    "create_sales",
    "view_services",
  ],
  caixa: [
    "view_sales",
    "finalize_sales",
    "view_services",
    "process_payment",
    "generate_receipt",
  ],
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  // Inicializar usuários ao montar o componente
  useEffect(() => {
    console.log("UserProvider inicializando com DEFAULT_USERS:", DEFAULT_USERS);
    setUsers(DEFAULT_USERS);
    localStorage.setItem("alomania_users", JSON.stringify(DEFAULT_USERS));

    // Carregar usuário logado
    const storedUser = localStorage.getItem("alomania_current_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (error) {
        console.error("Erro ao carregar usuário logado:", error);
        localStorage.removeItem("alomania_current_user");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = validateLogin(email, password);
    if (user) {
      setCurrentUser(user as User);
      localStorage.setItem("alomania_current_user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("alomania_current_user");
  };

  const addUser = (user: Omit<User, "id">) => {
    const newUser: User = {
      ...user,
      id: String(users.length + 1),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("alomania_users", JSON.stringify(updatedUsers));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updatedUsers);
    localStorage.setItem("alomania_users", JSON.stringify(updatedUsers));

    // Atualizar usuário logado se for o mesmo
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem("alomania_current_user", JSON.stringify(updated));
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("alomania_users", JSON.stringify(updatedUsers));
  };

  const hasPermission = (action: string): boolean => {
    if (!currentUser) return false;
    return PERMISSIONS[currentUser.role]?.includes(action) ?? false;
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
}
