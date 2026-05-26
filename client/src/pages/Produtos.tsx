import DashboardLayout from "@/components/DashboardLayout";
import ImageUpload, { ImageGallery } from "@/components/ImageUpload";
import { useData, Product } from "@/contexts/DataContext";
import { useUser } from "@/contexts/UserContext";
import { Plus, Edit2, Trash2, Search, Filter, X, AlertTriangle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Produtos() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [showBipagemModal, setShowBipagemModal] = useState(false);
  const [bipagemEAN, setBipagemEAN] = useState("");
  const [bipagemResult, setBipagemResult] = useState<Product | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    ean: "",
    category: "",
    brand: "",
    model: "",
    costPrice: "",
    salePrice: "",
    quantity: "",
    images: [] as Array<{ id: string; url: string; name: string }>,
  });

  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "Todos" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.brand.trim()) newErrors.brand = "Marca é obrigatória";
    if (!formData.model.trim()) newErrors.model = "Modelo é obrigatório";
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0)
      newErrors.costPrice = "Preço de custo inválido";
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0)
      newErrors.salePrice = "Preço de venda inválido";
    if (!formData.quantity || parseInt(formData.quantity) < 0)
      newErrors.quantity = "Quantidade inválida";

    if (formData.ean.trim()) {
      const eanExists = products.some(
        (p) => p.ean === formData.ean && p.id !== editingId
      );
      if (eanExists) {
        newErrors.ean = "Este código de barras já existe";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const code = `${formData.category.substring(0, 3).toUpperCase()}-${String(products.length + 1).padStart(3, "0")}`;

    if (editingId) {
      updateProduct(editingId, {
        name: formData.name,
        ean: formData.ean,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        quantity: parseInt(formData.quantity),
        images: formData.images,
      });
    } else {
      addProduct({
        code,
        name: formData.name,
        ean: formData.ean,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        quantity: parseInt(formData.quantity),
        images: formData.images,
      });
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      ean: "",
      category: "",
      brand: "",
      model: "",
      costPrice: "",
      salePrice: "",
      quantity: "",
      images: [],
    });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      ean: product.ean || "",
      category: product.category,
      brand: product.brand,
      model: product.model,
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      quantity: product.quantity.toString(),
      images: product.images,
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      deleteProduct(id);
    }
  };

  const handleBipagem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const ean = bipagemEAN.trim();
      const produto = products.find(
        (p) => p.code.toLowerCase() === ean.toLowerCase()
      );
      setBipagemResult(produto || null);
      setBipagemEAN("");
    }
  };

  const abrirBipagem = () => {
    setShowBipagemModal(true);
    setBipagemEAN("");
    setBipagemResult(null);
  };

  return (
    <DashboardLayout currentPage="products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Produtos</h2>
            <p className="text-muted-foreground text-sm">
              Gerenciamento de estoque e produtos
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#F59E0B] text-white font-medium py-2.5 px-5 rounded-md hover:bg-[#D97706] transition-all duration-200 flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            Novo Produto
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-md p-4 border border-border flex flex-col md:flex-row gap-3 shadow-sm">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input text-foreground pl-10 pr-4 py-2 rounded-md border border-border focus:border-ring outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-input text-foreground px-4 py-2 rounded-md border border-border focus:border-ring outline-none transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={abrirBipagem}
            className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-medium rounded-md transition-all duration-200 active:scale-95"
          >
            Bipar
          </button>
          <Link
            href="/bipagem"
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium rounded-md transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95"
            title="Clique para acessar a página de bipagem de produtos"
          >
            Ir para Bipagem
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-5 border border-blue-200 shadow-sm">
            <p className="text-blue-900 text-xs font-600 uppercase tracking-wide mb-2">Total de Produtos</p>
            <p className="text-3xl font-bold text-blue-900">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-md p-5 border border-amber-200 shadow-sm">
            {isAdmin && <p className="text-amber-900 text-xs font-600 uppercase tracking-wide mb-2">Valor Total Estoque</p>}
            <p className="text-3xl font-bold text-amber-900">
              R${" "}
              {products
                .reduce((sum, p) => sum + p.salePrice * p.quantity, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-md p-5 border border-red-200 shadow-sm">
            <p className="text-red-900 text-xs font-600 uppercase tracking-wide mb-2">Produtos Baixo Estoque</p>
            <p className="text-3xl font-bold text-red-900">
              {products.filter((p) => p.quantity <= 2).length}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden shadow-md">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#94A3B8]">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-[#334155]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Preço Custo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Preço Venda
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Estoque
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b transition-colors ${
                        product.quantity <= 2
                          ? "bg-[#1E1B2E] border-[#EF4444] hover:bg-[#2A2639]"
                          : "border-[#334155] hover:bg-[#0F172A]"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          {product.images.length > 0 && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-white font-semibold">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                              {product.brand} - {product.model}
                            </p>
                            {product.images.length > 0 && (
                              <p className="text-xs text-[#10B981]">
                                {product.images.length} imagem(ns)
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        {isAdmin ? `R$ ${product.costPrice.toFixed(2)}` : "---"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        R$ {product.salePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full font-semibold ${
                              product.quantity <= 2
                                ? "bg-[#EF4444] text-white"
                                : "bg-[#10B981] text-white"
                            }`}
                          >
                            {product.quantity}
                          </span>
                          {product.quantity <= 2 && (
                            <div title="Estoque baixo">
                              <AlertTriangle size={18} className="text-[#EF4444]" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF] transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-2xl w-full border border-[#334155] max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-[#94A3B8] hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.name ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.name && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Código de Barras (EAN)
                  </label>
                  <input
                    type="text"
                    value={formData.ean}
                    onChange={(e) =>
                      setFormData({ ...formData, ean: e.target.value })
                    }
                    placeholder="Ex: 7898765432109"
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.ean ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.ean && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.ean}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Categoria *
                  </label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Celular, Notebook, Acessório..." className="w-full bg-[#0F172A] text-white px-4 py-3 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors" />
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.brand ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.brand && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.model ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.model && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.model}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Preço de Custo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.costPrice ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.costPrice && (
                    <p className="text-[#EF4444] text-xs mt-1">
                      {errors.costPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.salePrice ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.salePrice && (
                    <p className="text-[#EF4444] text-xs mt-1">
                      {errors.salePrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] block mb-2">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className={`w-full bg-[#0F172A] text-white px-4 py-2 rounded-lg border ${
                      errors.quantity ? "border-[#EF4444]" : "border-[#334155]"
                    } focus:border-[#FFC107] outline-none transition-colors`}
                  />
                  {errors.quantity && (
                    <p className="text-[#EF4444] text-xs mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="border-t border-[#334155] pt-4 mt-4">
              <label className="text-sm text-[#94A3B8] block mb-3">
                Imagens do Produto
              </label>
              <ImageUpload
                onImageAdd={(image) =>
                  setFormData({
                    ...formData,
                    images: [...formData.images, image],
                  })
                }
              />
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <ImageGallery
                    images={formData.images}
                    onRemove={(id) =>
                      setFormData({
                        ...formData,
                        images: formData.images.filter((img) => img.id !== id),
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#FFC107] text-[#0F172A] font-semibold py-2 rounded-lg hover:bg-[#FFD54F] transition-colors"
              >
                {editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bipagem Rápida */}
      {showBipagemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-lg p-6 w-96 border border-[#334155]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Bipar Produto</h3>
              <button
                onClick={() => setShowBipagemModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Digite ou aponte o código de barras..."
                value={bipagemEAN}
                onChange={(e) => setBipagemEAN(e.target.value)}
                onKeyPress={handleBipagem}
                autoFocus
                className="w-full bg-[#0F172A] text-white px-4 py-3 rounded-lg border border-[#334155] focus:border-[#FFC107] outline-none transition-colors font-mono text-lg"
              />

              {bipagemResult ? (
                <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                  <p className="text-green-200 font-semibold text-sm mb-2">Produto Encontrado!</p>
                  <p className="text-white font-bold">{bipagemResult.name}</p>
                  <p className="text-[#94A3B8] text-sm">Código: {bipagemResult.code}</p>
                  <p className="text-[#94A3B8] text-sm">Estoque: {bipagemResult.quantity}</p>
                </div>
              ) : bipagemEAN ? (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200 text-sm">Produto não encontrado</p>
                </div>
              ) : null}

              <button
                onClick={() => setShowBipagemModal(false)}
                className="w-full bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
