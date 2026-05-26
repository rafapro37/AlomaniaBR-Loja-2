import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useSupabaseProdutos } from '@/hooks/useSupabaseProdutos';
import { Plus, Trash2, AlertCircle, Loader } from 'lucide-react';
// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function ProdutosSupabase() {
  const {
    produtos,
    loading,
    error,
    adicionando,
    adicionarProduto,
    deletarProduto,
    atualizarProduto,
    limparErro,
  } = useSupabaseProdutos();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    estoque: '',
  });

  // Filtrar produtos por nome
  const filteredProdutos = produtos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetar formulário
  const resetForm = () => {
    setFormData({ nome: '', preco: '', estoque: '' });
    setEditingId(null);
    setShowModal(false);
  };

  // Adicionar novo produto
  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.preco || formData.estoque === '') {
      alert('Preencha todos os campos');
      return;
    }

    try {
      console.log('Adicionando produto:', formData);
      const resultado = await adicionarProduto({
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque),
      });
      console.log('Produto adicionado com sucesso:', resultado);
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao adicionar produto: ${mensagem}`);
    }
  };

  // Deletar produto
  const handleDeleteProduto = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await deletarProduto(id);
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
      }
    }
  };

  // Atualizar estoque
  const handleUpdateEstoque = async (id: string, novoEstoque: string) => {
    try {
      await atualizarProduto(id, { estoque: parseInt(novoEstoque) });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
    }
  };

  return (
    <DashboardLayout currentPage="produtos">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0F172A]">Produtos Supabase</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FFC107] text-[#0F172A] font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        {/* Barra de busca */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-white placeholder-[#64748B] focus:border-[#FFC107] outline-none transition-colors"
          />
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg p-4 flex items-gap-3">
            <AlertCircle size={20} className="text-[#DC2626]" />
            <div className="flex-1">
              <p className="text-[#DC2626] font-semibold">Erro</p>
              <p className="text-[#991B1B]">{error}</p>
            </div>
            <button
              onClick={limparErro}
              className="text-[#DC2626] hover:text-[#991B1B] font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-[#FFC107]" />
            <span className="ml-3 text-[#64748B]">Carregando produtos...</span>
          </div>
        )}

        {/* Tabela de produtos */}
        {!loading && (
          <div className="bg-[#1E293B] rounded-lg overflow-hidden border border-[#334155]">
            {filteredProdutos.length === 0 ? (
              <div className="p-8 text-center text-[#64748B]">
                <p>Nenhum produto encontrado</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#0F172A] border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[#94A3B8] font-semibold">Nome</th>
                    <th className="px-6 py-3 text-left text-[#94A3B8] font-semibold">Preço</th>
                    <th className="px-6 py-3 text-left text-[#94A3B8] font-semibold">Estoque</th>
                    <th className="px-6 py-3 text-left text-[#94A3B8] font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProdutos.map((produto) => (
                    <tr
                      key={produto.id}
                      className="border-b border-[#334155] hover:bg-[#0F172A] transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">{produto.nome}</td>
                      <td className="px-6 py-4 text-[#94A3B8]">
                        {formatCurrency(produto.preco)}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={produto.estoque}
                          onChange={(e) =>
                            handleUpdateEstoque(produto.id, e.target.value)
                          }
                          className="w-20 px-2 py-1 rounded bg-[#0F172A] text-white border border-[#334155] focus:border-[#FFC107] outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleDeleteProduto(produto.id)}
                          className="bg-[#EF4444] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#DC2626] transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Modal de adicionar produto */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-[#334155]">
              <h2 className="text-2xl font-bold text-white mb-6">Novo Produto</h2>

              <form onSubmit={handleAddProduto} className="space-y-4">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[#0F172A] text-white border border-[#334155] focus:border-[#FFC107] outline-none"
                    placeholder="Nome do produto"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[#0F172A] text-white border border-[#334155] focus:border-[#FFC107] outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-2">Estoque</label>
                  <input
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[#0F172A] text-white border border-[#334155] focus:border-[#FFC107] outline-none"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-[#64748B] text-white font-semibold py-2 rounded-lg hover:bg-[#475569] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={adicionando}
                    className="flex-1 bg-[#FFC107] text-[#0F172A] font-semibold py-2 rounded-lg hover:bg-[#FFD54F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adicionando ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Adicionar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
