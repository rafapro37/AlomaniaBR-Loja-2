import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  code: string;
  name: string;
  ean?: string;
  category: string;
  brand: string;
  model: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  images: Array<{ id: string; url: string; name: string }>;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  clientId: string;
  clientName: string;
  whatsapp: string;
  deviceType: string;
  brand: string;
  model: string;
  issue: string;
  status: "Aguardando análise" | "Em análise" | "Aguardando aprovação" | "Em manutenção" | "Finalizado" | "Aguardando pagamento" | "Aguardando retirada" | "Entregue" | "Abandonado";
  budget?: number;
  paymentMethods?: ("Pix" | "Dinheiro" | "Cartão")[];
  notes: string;
  images: Array<{ id: string; url: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: string;
  dataEntrada?: string;
  dataPronto?: string;
  dataLimiteRetirada?: string;
  diasAguardando?: number;
  notaEmitida?: boolean;
  alertas30dias?: boolean;
  alertas60dias?: boolean;
  alertas85dias?: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: "Pix" | "Dinheiro" | "Cartão";
  clientId?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: "entrada" | "saída";
  quantity: number;
  reason: string;
  previousQuantity: number;
  newQuantity: number;
  userId: string;
  userName: string;
  date: string;
  notes?: string;
}

export interface Warranty {
  id: string;
  type: "servico" | "produto";
  osId?: string;
  saleId?: string;
  clientId: string;
  clientName: string;
  clientWhatsapp: string;
  serviceDescription?: string;
  productName?: string;
  productBrand?: string;
  productModel?: string;
  emissionDate: string;
  validityDate: string;
  daysOfWarranty: number;
  isActive: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  createdAt: string;
}

export interface WarrantyConfig {
  id: string;
  serviceWarrantyDays: number;
  productWarrantyDays: Record<string, number>;
  createdAt: string;
}

interface DataContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  services: ServiceOrder[];
  addService: (service: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateService: (id: string, service: Partial<ServiceOrder>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  sales: Sale[];
  addSale: (sale: Omit<Sale, "id">) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  stockMovements: StockMovement[];
  addStockMovement: (movement: Omit<StockMovement, "id" | "date">) => Promise<void>;
  deleteStockMovement: (id: string) => Promise<void>;
  warranties: Warranty[];
  addWarranty: (warranty: Omit<Warranty, "id" | "createdAt">) => Promise<void>;
  updateWarranty: (id: string, warranty: Partial<Warranty>) => Promise<void>;
  warrantyConfig: WarrantyConfig | null;
  updateWarrantyConfig: (config: Partial<WarrantyConfig>) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const toProduct = (r: any): Product => ({
  id: r.id, code: r.code, name: r.name, ean: r.ean,
  category: r.category, brand: r.brand, model: r.model,
  costPrice: r.cost_price, salePrice: r.sale_price,
  quantity: r.quantity, images: r.images || [], createdAt: r.created_at,
});

const toClient = (r: any): Client => ({
  id: r.id, name: r.name, whatsapp: r.whatsapp,
  email: r.email, createdAt: r.created_at,
});

const toService = (r: any): ServiceOrder => ({
  id: r.id, osNumber: r.os_number, clientId: r.client_id || "",
  clientName: r.client_name, whatsapp: r.whatsapp,
  deviceType: r.device_type, brand: r.brand || "", model: r.model || "",
  issue: r.issue, status: r.status, budget: r.budget,
  paymentMethods: r.payment_methods, notes: r.notes || "",
  images: r.images || [], createdAt: r.created_at, updatedAt: r.updated_at,
  createdBy: r.created_by, assignedTo: r.assigned_to,
  dataPronto: r.data_pronto, dataLimiteRetirada: r.data_limite_retirada,
  diasAguardando: r.dias_aguardando, notaEmitida: r.nota_emitida,
  alertas30dias: r.alertas_30dias, alertas60dias: r.alertas_60dias, alertas85dias: r.alertas_85dias,
});

const toSale = (r: any): Sale => ({
  id: r.id, date: r.date, items: r.items || [],
  total: r.total, paymentMethod: r.payment_method, clientId: r.client_id,
});

const toMovement = (r: any): StockMovement => ({
  id: r.id, productId: r.product_id, productName: r.product_name,
  productCode: r.product_code, type: r.type, quantity: r.quantity,
  reason: r.reason, previousQuantity: r.previous_quantity,
  newQuantity: r.new_quantity, userId: r.user_id, userName: r.user_name,
  date: r.date, notes: r.notes,
});

const toWarranty = (r: any): Warranty => ({
  id: r.id, type: r.type, osId: r.os_id, saleId: r.sale_id,
  clientId: r.client_id, clientName: r.client_name, clientWhatsapp: r.client_whatsapp,
  serviceDescription: r.service_description, productName: r.product_name,
  productBrand: r.product_brand, productModel: r.product_model,
  emissionDate: r.emission_date, validityDate: r.validity_date,
  daysOfWarranty: r.days_of_warranty, isActive: r.is_active,
  pdfGenerated: r.pdf_generated, pdfUrl: r.pdf_url, createdAt: r.created_at,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceOrder[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [warrantyConfig, setWarrantyConfig] = useState<WarrantyConfig | null>({
    id: "default", serviceWarrantyDays: 90,
    productWarrantyDays: { Celular: 30, Videogame: 90, "Acessório": 7 },
    createdAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!supabase) return;
    const channels = [
      supabase.channel("rt-products").on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => loadProducts()).subscribe(),
      supabase.channel("rt-clients").on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => loadClients()).subscribe(),
      supabase.channel("rt-services").on("postgres_changes", { event: "*", schema: "public", table: "service_orders" }, () => loadServices()).subscribe(),
      supabase.channel("rt-sales").on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => loadSales()).subscribe(),
      supabase.channel("rt-movements").on("postgres_changes", { event: "*", schema: "public", table: "stock_movements" }, () => loadMovements()).subscribe(),
    ];
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadClients(), loadServices(), loadSales(), loadMovements(), loadWarranties()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data.map(toProduct));
  };

  const loadClients = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (data) setClients(data.map(toClient));
  };

  const loadServices = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false });
    if (data) setServices(data.map(toService));
  };

  const loadSales = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("sales").select("*").order("date", { ascending: false });
    if (data) setSales(data.map(toSale));
  };

  const loadMovements = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("stock_movements").select("*").order("date", { ascending: false });
    if (data) setStockMovements(data.map(toMovement));
  };

  const loadWarranties = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("warranties").select("*").order("created_at", { ascending: false });
    if (data) setWarranties(data.map(toWarranty));
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    if (!supabase) return;
    await supabase.from("products").insert([{
      code: product.code, name: product.name, ean: product.ean,
      category: product.category, brand: product.brand, model: product.model,
      cost_price: product.costPrice, sale_price: product.salePrice,
      quantity: product.quantity, images: product.images,
    }]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!supabase) return;
    const row: any = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.ean !== undefined) row.ean = updates.ean;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.brand !== undefined) row.brand = updates.brand;
    if (updates.model !== undefined) row.model = updates.model;
    if (updates.costPrice !== undefined) row.cost_price = updates.costPrice;
    if (updates.salePrice !== undefined) row.sale_price = updates.salePrice;
    if (updates.quantity !== undefined) row.quantity = updates.quantity;
    if (updates.images !== undefined) row.images = updates.images;
    await supabase.from("products").update(row).eq("id", id);
  };

  const deleteProduct = async (id: string) => {
    if (!supabase) return;
    await supabase.from("products").delete().eq("id", id);
  };

  const addClient = async (client: Omit<Client, "id" | "createdAt">) => {
    if (!supabase) return;
    await supabase.from("clients").insert([{ name: client.name, whatsapp: client.whatsapp, email: client.email }]);
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (!supabase) return;
    await supabase.from("clients").update({ name: updates.name, whatsapp: updates.whatsapp, email: updates.email }).eq("id", id);
  };

  const deleteClient = async (id: string) => {
    if (!supabase) return;
    await supabase.from("clients").delete().eq("id", id);
  };

  const addService = async (service: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => {
    if (!supabase) return;
    await supabase.from("service_orders").insert([{
      os_number: service.osNumber, client_id: service.clientId,
      client_name: service.clientName, whatsapp: service.whatsapp,
      device_type: service.deviceType, brand: service.brand, model: service.model,
      issue: service.issue, status: service.status, budget: service.budget,
      payment_methods: service.paymentMethods, notes: service.notes,
      images: service.images, created_by: service.createdBy,
    }]);
  };

  const updateService = async (id: string, updates: Partial<ServiceOrder>) => {
    if (!supabase) return;
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.budget !== undefined) row.budget = updates.budget;
    if (updates.notes !== undefined) row.notes = updates.notes;
    if (updates.images !== undefined) row.images = updates.images;
    if (updates.paymentMethods !== undefined) row.payment_methods = updates.paymentMethods;
    if (updates.assignedTo !== undefined) row.assigned_to = updates.assignedTo;
    if (updates.dataPronto !== undefined) row.data_pronto = updates.dataPronto;
    if (updates.dataLimiteRetirada !== undefined) row.data_limite_retirada = updates.dataLimiteRetirada;
    if (updates.diasAguardando !== undefined) row.dias_aguardando = updates.diasAguardando;
    if (updates.notaEmitida !== undefined) row.nota_emitida = updates.notaEmitida;
    await supabase.from("service_orders").update(row).eq("id", id);
  };

  const deleteService = async (id: string) => {
    if (!supabase) return;
    await supabase.from("service_orders").delete().eq("id", id);
  };

  const addSale = async (sale: Omit<Sale, "id">) => {
    if (!supabase) return;
    await supabase.from("sales").insert([{
      date: sale.date, items: sale.items, total: sale.total,
      payment_method: sale.paymentMethod, client_id: sale.clientId,
    }]);
    for (const item of sale.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) await updateProduct(item.productId, { quantity: Math.max(0, product.quantity - item.quantity) });
    }
  };

  const deleteSale = async (id: string) => {
    if (!supabase) return;
    await supabase.from("sales").delete().eq("id", id);
  };

  const addStockMovement = async (movement: Omit<StockMovement, "id" | "date">) => {
    if (!supabase) return;
    await supabase.from("stock_movements").insert([{
      product_id: movement.productId, product_name: movement.productName,
      product_code: movement.productCode, type: movement.type,
      quantity: movement.quantity, reason: movement.reason,
      previous_quantity: movement.previousQuantity, new_quantity: movement.newQuantity,
      user_id: movement.userId, user_name: movement.userName,
      date: new Date().toISOString(), notes: movement.notes,
    }]);
  };

  const deleteStockMovement = async (id: string) => {
    if (!supabase) return;
    await supabase.from("stock_movements").delete().eq("id", id);
  };

  const addWarranty = async (warranty: Omit<Warranty, "id" | "createdAt">) => {
    if (!supabase) return;
    await supabase.from("warranties").insert([{
      type: warranty.type, os_id: warranty.osId, sale_id: warranty.saleId,
      client_id: warranty.clientId, client_name: warranty.clientName,
      client_whatsapp: warranty.clientWhatsapp, service_description: warranty.serviceDescription,
      product_name: warranty.productName, product_brand: warranty.productBrand,
      product_model: warranty.productModel, emission_date: warranty.emissionDate,
      validity_date: warranty.validityDate, days_of_warranty: warranty.daysOfWarranty,
      is_active: warranty.isActive, pdf_generated: warranty.pdfGenerated,
    }]);
  };

  const updateWarranty = async (id: string, updates: Partial<Warranty>) => {
    if (!supabase) return;
    await supabase.from("warranties").update({ is_active: updates.isActive, pdf_generated: updates.pdfGenerated, pdf_url: updates.pdfUrl }).eq("id", id);
  };

  const updateWarrantyConfig = async (config: Partial<WarrantyConfig>) => {
    setWarrantyConfig(prev => prev ? { ...prev, ...config } : null);
  };

  return (
    <DataContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      clients, addClient, updateClient, deleteClient,
      services, addService, updateService, deleteService,
      sales, addSale, deleteSale,
      stockMovements, addStockMovement, deleteStockMovement,
      warranties, addWarranty, updateWarranty,
      warrantyConfig, updateWarrantyConfig,
      loading,
    }}>
      {loading ? (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-white text-sm">Carregando...</p>
          </div>
        </div>
      ) : children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
