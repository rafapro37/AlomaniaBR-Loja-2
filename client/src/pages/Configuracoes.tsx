import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLogo } from "@/contexts/LogoContext";
import { useData } from "@/contexts/DataContext";
import { useUser } from "@/contexts/UserContext";
import { useState, useRef } from "react";
import { Settings, User, Lock, Plus, Edit2, Trash2, X, Check, Eye, EyeOff, Image, Store, History, Bell } from "lucide-react";

type Tab = "loja" | "conta" | "usuarios" | "setores" | "historico";

const SECTORS_KEY = "alomania_store_sectors";
const DEFAULT_SECTORS = [
  { id: "1", name: "Recepção / Atendimento" },
  { id: "2", name: "Bancada Técnica" },
  { id: "3", name: "Estoque" },
  { id: "4", name: "Caixa / Financeiro" },
];

function getSectors() {
  try { return JSON.parse(localStorage.getItem(SECTORS_KEY) || "null") || DEFAULT_SECTORS; }
  catch { return DEFAULT_SECTORS; }
}


function NotificationButton() {
  const [status, setStatus] = React.useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  const handleClick = async () => {
    if (!("Notification" in window)) { alert("Seu navegador não suporta notificações."); return; }
    if (status === "granted") {
      alert("Para desativar, acesse as configurações do seu navegador.");
      return;
    }
    const perm = await Notification.requestPermission();
    setStatus(perm);
    if (perm === "granted") {
      new Notification("Notificações ativadas! 🔔", { body: "Você receberá alertas de vendas e OS.", icon: "/icon-192.png" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={"px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 " + (status === "granted" ? "bg-green-600 text-white hover:bg-green-700" : "bg-amber-500 text-white hover:bg-amber-600")}
    >
      <Bell size={14} />
      {status === "granted" ? "✅ Notificações Ativas" : status === "denied" ? "❌ Bloqueado no navegador" : "Ativar Notificações"}
    </button>
  );
}

export default function Configuracoes() {
  const { currentUser, users, updateUser, addUser, deleteUser } = useUser();
  const { stockMovements, deleteStockMovement } = useData();
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const { logoUrl, setLogoUrl, storeName, setStoreName } = useLogo();
  const [activeTab, setActiveTab] = useState<Tab>("loja");
  const fileRef = useRef<HTMLInputElement>(null);

  // Loja
  const [nameInput, setNameInput] = useState(storeName);
  const [logoSaved, setLogoSaved] = useState(false);

  // Minha conta
  const [myName, setMyName] = useState(currentUser?.name || "");
  const [myEmail, setMyEmail] = useState(currentUser?.email || "");
  const [myPw, setMyPw] = useState("");
  const [myPwConfirm, setMyPwConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accountMsg, setAccountMsg] = useState("");

  // Usuários
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "atendente" });
  const [showUserPw, setShowUserPw] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);

  // Setores
  const [sectors, setSectors] = useState(getSectors());
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [editSectorId, setEditSectorId] = useState<string | null>(null);
  const [sectorName, setSectorName] = useState("");
  const [confirmDeleteSector, setConfirmDeleteSector] = useState<string | null>(null);

  const saveSectors = (s: any[]) => { setSectors(s); localStorage.setItem(SECTORS_KEY, JSON.stringify(s)); };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setLogoUrl(ev.target?.result as string); setLogoSaved(true); setTimeout(() => setLogoSaved(false), 2000); };
    reader.readAsDataURL(file);
  };

  const handleSaveAccount = () => {
    if (!myName.trim() || !myEmail.trim()) { setAccountMsg("Nome e login são obrigatórios."); return; }
    if (myPw && myPw !== myPwConfirm) { setAccountMsg("As senhas não conferem."); return; }
    const updates: any = { name: myName, email: myEmail };
    if (myPw) updates.password = myPw;
    updateUser(currentUser!.id, updates);
    setMyPw(""); setMyPwConfirm("");
    setAccountMsg("✅ Conta atualizada!");
    setTimeout(() => setAccountMsg(""), 3000);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) return;
    if (!editUserId && !userForm.password) return;
    if (editUserId) {
      const u: any = { name: userForm.name, email: userForm.email, role: userForm.role };
      if (userForm.password) u.password = userForm.password;
      updateUser(editUserId, u);
    } else {
      addUser({ name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role as any });
    }
    setShowUserModal(false);
  };

  const tabs = [
    { id: "loja" as Tab, label: "Loja", icon: Image },
    { id: "conta" as Tab, label: "Minha Conta", icon: User },
    { id: "usuarios" as Tab, label: "Usuários", icon: Lock },
    { id: "setores" as Tab, label: "Setores", icon: Store },
    { id: "historico" as Tab, label: "Histórico", icon: History },
  ];

  return (
    <DashboardLayout currentPage="configuracoes">
      <div className="max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings size={24} className="text-amber-500" /> Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie a loja e os usuários</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === id ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* ABA LOJA */}
        {activeTab === "loja" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <img src={logoUrl} alt="Logo" className="w-32 h-32 rounded-2xl object-contain bg-muted border-4 border-amber-400 shadow-xl" />
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold">Trocar Logo</p>
                </div>
              </div>
              <button onClick={() => fileRef.current?.click()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${logoSaved ? "bg-green-600 text-white" : "bg-amber-500 text-white hover:bg-amber-600"}`}>
                {logoSaved ? <><Check size={16} /> Salvo!</> : <><Image size={16} /> Trocar Logo</>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Nome da Loja</label>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                className="w-full bg-background px-4 py-2.5 rounded-lg border border-border focus:border-ring outline-none text-sm" />
            </div>
            <button onClick={() => { setStoreName(nameInput); }}
              className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-600">
              Salvar Nome
            </button>
          </div>
        )}

        {/* ABA MINHA CONTA */}
        {activeTab === "conta" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
              </div>
            </div>
            {accountMsg && <p className="text-sm font-semibold text-green-500">{accountMsg}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Nome</label>
                <input value={myName} onChange={e => setMyName(e.target.value)} className="w-full bg-background px-4 py-2.5 rounded-lg border border-border focus:border-ring outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Login</label>
                <input value={myEmail} onChange={e => setMyEmail(e.target.value)} className="w-full bg-background px-4 py-2.5 rounded-lg border border-border focus:border-ring outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Nova Senha</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={myPw} onChange={e => setMyPw(e.target.value)} placeholder="Nova senha" className="w-full bg-background px-4 py-2.5 pr-10 rounded-lg border border-border focus:border-ring outline-none text-sm" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-muted-foreground">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Confirmar Senha</label>
                <input type="password" value={myPwConfirm} onChange={e => setMyPwConfirm(e.target.value)} className="w-full bg-background px-4 py-2.5 rounded-lg border border-border focus:border-ring outline-none text-sm" />
              </div>
            </div>
            <button onClick={handleSaveAccount} className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-600">Salvar</button>
          </div>
        )}

        {/* ABA USUÁRIOS */}
        {activeTab === "usuarios" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Usuários</h2>
              <button onClick={() => { setUserForm({ name: "", email: "", password: "", role: "atendente" }); setEditUserId(null); setShowUserModal(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg font-semibold text-sm hover:bg-amber-600">
                <Plus size={14} /> Novo
              </button>
            </div>
            {users.map(u => (
              <div key={u.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{u.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{u.name} {u.id === currentUser?.id && <span className="text-xs text-amber-500">(você)</span>}</p>
                  <p className="text-xs text-muted-foreground">{u.email} · {u.role}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setUserForm({ name: u.name, email: u.email, password: "", role: u.role }); setEditUserId(u.id); setShowUserModal(true); }} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Edit2 size={13} /></button>
                  {u.id !== currentUser?.id && <button onClick={() => setConfirmDeleteUser(u.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={13} /></button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA SETORES */}
        {activeTab === "setores" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Setores da Loja</h2>
              <button onClick={() => { setSectorName(""); setEditSectorId(null); setShowSectorModal(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg font-semibold text-sm hover:bg-amber-600">
                <Plus size={14} /> Novo
              </button>
            </div>
            {sectors.map((s: any) => (
              <div key={s.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0"><Store size={16} className="text-white" /></div>
                <p className="flex-1 font-semibold text-sm">{s.name}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => { setSectorName(s.name); setEditSectorId(s.id); setShowSectorModal(true); }} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Edit2 size={13} /></button>
                  <button onClick={() => setConfirmDeleteSector(s.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ABA HISTÓRICO */}
        {activeTab === "historico" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Limpar Histórico</h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Histórico de Estoque</p>
                  <p className="text-xs text-muted-foreground">{stockMovements.length} registros</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Tem certeza que deseja limpar todo o histórico de estoque?")) {
                      stockMovements.forEach(m => deleteStockMovement(m.id));
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Limpar Tudo
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Notificações</p>
                  <p className="text-xs text-muted-foreground">Ativar alertas de vendas e OS</p>
                </div>
<NotificationButton />
              </div>
            </div>
          </div>
        )}

      {/* Modal Usuário */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-card rounded-t-2xl sm:rounded-xl border border-border p-5 w-full sm:max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editUserId ? "Editar Usuário" : "Novo Usuário"}</h3>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[{ label: "Nome", key: "name", placeholder: "Nome completo" }, { label: "Login", key: "email", placeholder: "login" }].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm text-muted-foreground block mb-1">{label}</label>
                  <input value={(userForm as any)[key]} onChange={e => setUserForm({ ...userForm, [key]: e.target.value })} placeholder={placeholder} className="w-full bg-background px-4 py-2.5 rounded-lg border border-border focus:border-ring outline-none text-sm" />
                </div>
              ))}
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Senha {editUserId && <span className="text-xs opacity-50">(em branco = manter)</span>}</label>
                <div className="relative">
                  <input type={showUserPw ? "text" : "password"} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="Senha" className="w-full bg-background px-4 py-2.5 pr-10 rounded-lg border border-border outline-none text-sm" />
                  <button type="button" onClick={() => setShowUserPw(!showUserPw)} className="absolute right-3 top-2.5 text-muted-foreground">{showUserPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Perfil</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full bg-background px-4 py-2.5 rounded-lg border border-border outline-none text-sm">
                  <option value="admin">Administrador</option>
                  <option value="tecnico">Técnico</option>
                  <option value="atendente">Atendente</option>
                  <option value="caixa">Caixa</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowUserModal(false)} className="flex-1 bg-muted text-foreground py-2.5 rounded-lg font-semibold text-sm">Cancelar</button>
              <button onClick={handleSaveUser} className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-600">{editUserId ? "Salvar" : "Criar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setor */}
      {showSectorModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-card rounded-t-2xl sm:rounded-xl border border-border p-5 w-full sm:max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editSectorId ? "Editar Setor" : "Novo Setor"}</h3>
              <button onClick={() => setShowSectorModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Nome do Setor</label>
              <input value={sectorName} onChange={e => setSectorName(e.target.value)} placeholder="Ex: Bancada Técnica" className="w-full bg-background px-4 py-2.5 rounded-lg border border-border focus:border-ring outline-none text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowSectorModal(false)} className="flex-1 bg-muted text-foreground py-2.5 rounded-lg font-semibold text-sm">Cancelar</button>
              <button onClick={() => {
                if (!sectorName.trim()) return;
                if (editSectorId) saveSectors(sectors.map((s: any) => s.id === editSectorId ? { ...s, name: sectorName } : s));
                else saveSectors([...sectors, { id: Date.now().toString(), name: sectorName }]);
                setShowSectorModal(false);
              }} className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-bold text-sm">{editSectorId ? "Salvar" : "Criar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete usuário */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-sm w-full">
            <h3 className="font-bold mb-2">Excluir Usuário</h3>
            <p className="text-muted-foreground text-sm mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteUser(null)} className="flex-1 bg-muted py-2.5 rounded-lg text-sm font-semibold">Cancelar</button>
              <button onClick={() => { deleteUser(confirmDeleteUser); setConfirmDeleteUser(null); }} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete setor */}
      {confirmDeleteSector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-sm w-full">
            <h3 className="font-bold mb-2">Excluir Setor</h3>
            <p className="text-muted-foreground text-sm mb-4">Tem certeza?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteSector(null)} className="flex-1 bg-muted py-2.5 rounded-lg text-sm font-semibold">Cancelar</button>
              <button onClick={() => { saveSectors(sectors.filter((s: any) => s.id !== confirmDeleteSector)); setConfirmDeleteSector(null); }} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm limpar histórico */}
      {confirmClearHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2 text-red-400">⚠️ Limpar Histórico</h3>
            <p className="text-muted-foreground text-sm mb-5">Isso vai apagar <strong>todo</strong> o histórico de movimentações de estoque. Esta ação não pode ser desfeita!</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClearHistory(false)} className="flex-1 bg-muted py-2.5 rounded-lg text-sm font-semibold">Cancelar</button>
              <button onClick={async () => {
                for (const m of stockMovements) { await deleteStockMovement(m.id); }
                setConfirmClearHistory(false);
              }} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold">Limpar Tudo</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
