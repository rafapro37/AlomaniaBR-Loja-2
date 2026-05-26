export const USERS_CONFIG = [
  {
    id: "1",
    name: "Administrador",
    email: "admin",
    role: "admin" as const,
    password: "admin123",
  },
  {
    id: "2",
    name: "Técnico",
    email: "tecnico",
    role: "tecnico" as const,
    password: "tecnico123",
  },
  {
    id: "3",
    name: "Atendente",
    email: "atendente",
    role: "atendente" as const,
    password: "atendente123",
  },
  {
    id: "4",
    name: "Caixa",
    email: "caixa",
    role: "caixa" as const,
    password: "caixa123",
  },
];

export function validateLogin(email: string, password: string) {
  return USERS_CONFIG.find(u => u.email === email && u.password === password);
}
