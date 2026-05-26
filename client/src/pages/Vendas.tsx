import DashboardLayout from "@/components/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { useUser } from "@/contexts/UserContext";
import { useLogo } from "@/contexts/LogoContext";
import { generatePaymentPDF } from "@/lib/pdf-generator";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  DollarSign,
  CreditCard,
  X,
  Download,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export default function Vendas() {
  const { products, sales, services, addSale, deleteSale, updateService } = useData();
  const { logoUrl } = useLogo();
  const { currentUser } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Pix" | "Dinheiro" | "Cartão">("Pix");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState<string | null>(null);
  const [servicePaymentMethod, setServicePaymentMethod] = useState<"Pix" | "Dinheiro" | "Cartão">("Pix");

  const servicesAwaitingPayment = services.filter((s) => s.status === "Aguardando pagamento");

  const addToCart = (product: (typeof products)[0]) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.salePrice,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const product = products.find((p) => p.id === productId);
      if (product && quantity > product.quantity) {
        alert(`Quantidade indisponível. Estoque: ${product.quantity}`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    const saleId = `VND-${String(sales.length + 1).padStart(3, "0")}`;
    const saleDate = new Date().toISOString();

    addSale({
      date: saleDate,
      items: cart,
      total,
      paymentMethod,
    });

    // Gerar PDF do comprovante
    await generatePaymentPDF({
      id: saleId,
      date: saleDate,
      clientName: "Cliente",
      items: cart.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      subtotal: total,
      total: total,
      paymentMethod,
      logoUrl: logoUrl,
    });

    setCart([]);
    setShowConfirmation(false);
  };

  return (
    <DashboardLayout currentPage="sales">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Vendas</h2>
          <p className="text-[#94A3B8]">
            Gerenciamento de vendas e caixa
          </p>
        </div>

        {/* OS Aguardando Pagamento */}
        {servicesAwaitingPayment.length > 0 && (
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#F59E0B]">
            <h3 className="text-xl font-bold text-[#FFC107] mb-4">Ordens de Serviço Aguardando Pagamento</h3>
            <div className="space-y-4">
              {servicesAwaitingPayment.map((service) => (
                <div key={service.id} className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#94A3B8]">OS Número</p>
                      <p className="text-lg font-bold text-white">{service.osNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Cliente</p>
                      <p className="text-white font-semibold">{service.clientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Aparelho</p>
                      <p className="text-white">{service.brand} {service.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Orçamento</p>
                      <p className="text-lg font-bold text-[#FFC107]">R$ {(service.budget || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E293B] rounded p-3 mb-4">
                    <p className="text-xs text-[#94A3B8] mb-2">Formas de Pagamento Aceitas</p>
                    <p className="text-sm text-[#10B981]">{service.paymentMethods?.join(" / ") || "Não especificado"}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={selectedServiceForPayment === service.id ? servicePaymentMethod : ""}
                      onChange={(e) => {
                        setSelectedServiceForPayment(service.id);
                        setServicePaymentMethod(e.target.value as "Pix" | "Dinheiro" | "Cartão");
                      }}
                      className="flex-1 bg-[#0F172A] text-white px-3 py-2 rounded border border-[#334155] focus:border-[#FFC107] outline-none text-sm"
                    >
                      <option value="">Selecionar forma de pagamento</option>
                      {service.paymentMethods?.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (!selectedServiceForPayment || selectedServiceForPayment !== service.id) {
                          alert("Selecione uma forma de pagamento");
                          return;
                        }
                        
                        updateService(service.id, {
                          status: "Entregue",
                          finalPaymentMethod: servicePaymentMethod,
                          paymentConfirmedBy: currentUser?.name || "Caixa",
                          paymentConfirmedAt: new Date().toISOString(),
                        });

                        await generatePaymentPDF({
                          id: service.id,
                          date: new Date().toLocaleDateString("pt-BR"),
                          clientName: service.clientName,
                          items: [
                            {
                              name: `${service.brand} ${service.model} - ${service.issue}`,
                              quantity: 1,
                              unitPrice: service.budget || 0,
                              total: service.budget || 0,
                            },
                          ],
                          subtotal: service.budget || 0,
                          total: service.budget || 0,
                          paymentMethod: servicePaymentMethod,
                          logoUrl: logoUrl,
                        });

                        setSelectedServiceForPayment(null);
                        alert("Pagamento confirmado! Notinha gerada.");
                      }}
                      className="bg-[#10B981] text-white font-semibold py-2 px-4 rounded hover:bg-[#059669] transition-colors flex items-center gap-2 text-sm"
                    >
                      <Check size={16} />
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h3 className="text-xl font-bold text-white mb-4">Produtos Disponíveis</h3>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#94A3B8]">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0}
                      className={`border-2 rounded-lg p-4 transition-colors text-center ${
                        product.quantity === 0
                          ? "bg-[#0F172A] border-[#64748B] opacity-50 cursor-not-allowed"
                          : "bg-[#0F172A] border-[#334155] hover:border-[#FFC107]"
                      }`}
                    >
                      <p className="text-white font-semibold text-sm mb-2">
                        {product.name}
                      </p>
                      <p className="text-[#FFC107] font-bold mb-2">
                        R$ {product.salePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        Est: {product.quantity}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sales History */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h3 className="text-xl font-bold text-white mb-4">
                Histórico de Vendas
              </h3>
              {sales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#94A3B8]">Nenhuma venda realizada</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sales.slice().reverse().map((sale) => (
                    <div
                      key={sale.id}
                      className="bg-[#0F172A] rounded p-4 border border-[#334155] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-semibold">{sale.date}</p>
                        <p className="text-sm text-[#94A3B8]">
                          {sale.items.length} item(ns) - {sale.paymentMethod}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[#FFC107] font-bold">
                          R$ {sale.total.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteSale(sale.id)}
                          className="p-1 text-[#EF4444] hover:text-[#DC2626]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155] sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={24} className="text-[#FFC107]" />
                <h3 className="text-xl font-bold text-white">Carrinho</h3>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart
                    size={48}
                    className="text-[#64748B] mx-auto mb-2 opacity-50"
                  />
                  <p className="text-[#94A3B8]">Carrinho vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-[#0F172A] rounded p-3 border border-[#334155]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">
                              {item.productName}
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                              R$ {item.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-[#EF4444] hover:text-[#DC2626]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="bg-[#334155] text-white p-1 rounded hover:bg-[#475569]"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.productId,
                                parseInt(e.target.value)
                              )
                            }
                            className="bg-[#1E293B] text-white w-12 text-center rounded border border-[#334155] py-1"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="bg-[#334155] text-white p-1 rounded hover:bg-[#475569]"
                          >
                            <Plus size={14} />
                          </button>
                          <span className="text-white font-semibold ml-auto text-sm">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#334155] pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#94A3B8]">Subtotal:</span>
                      <span className="text-white font-semibold">
                        R$ {total.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm text-[#94A3B8] block mb-2">
                        Forma de Pagamento
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "Pix" | "Dinheiro" | "Cartão"
                          )
                        }
                        className="w-full bg-[#0F172A] text-white px-3 py-2 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none"
                      >
                        <option value="Pix">Pix</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão">Cartão</option>
                      </select>
                    </div>

                    <div className="bg-[#FFC107] rounded p-3">
                      <p className="text-[#0F172A] text-sm font-semibold mb-1">
                        Total
                      </p>
                      <p className="text-[#0F172A] text-2xl font-bold">
                        R$ {total.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowConfirmation(true)}
                      className="w-full bg-[#10B981] text-white font-semibold py-3 rounded-lg hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard size={20} />
                      Finalizar Venda
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-md w-full border border-[#334155]">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirmar Venda
            </h3>

            <div className="space-y-4 mb-6">
              <div className="bg-[#0F172A] rounded p-4">
                <p className="text-[#94A3B8] text-sm mb-1">Itens</p>
                <p className="text-white font-semibold">{cart.length} produto(s)</p>
              </div>

              <div className="bg-[#0F172A] rounded p-4">
                <p className="text-[#94A3B8] text-sm mb-1">Forma de Pagamento</p>
                <p className="text-white font-semibold">{paymentMethod}</p>
              </div>

              <div className="bg-[#FFC107] rounded p-4">
                <p className="text-[#0F172A] text-sm font-semibold mb-1">Total</p>
                <p className="text-[#0F172A] text-3xl font-bold">
                  R$ {total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizeSale}
                className="flex-1 bg-[#10B981] text-white font-semibold py-2 rounded-lg hover:bg-[#059669] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
