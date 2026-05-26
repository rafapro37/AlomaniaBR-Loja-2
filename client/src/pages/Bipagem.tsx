import { useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useBipagem } from '@/hooks/useBipagem';
import { Barcode, AlertCircle, CheckCircle, Loader, Package } from 'lucide-react';

export default function Bipagem() {
  const {
    modo,
    ultimoProduto,
    ultimaMovimentacao,
    movimentacoes,
    loading,
    error,
    sucesso,
    processarBipagem,
    alternarModo,
    limparErro,
  } = useBipagem();

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus no input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Processar entrada do input
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.currentTarget.value;

    if (valor.includes('\n') || valor.includes('\r')) {
      // Remover quebras de linha
      const ean = valor.replace(/[\n\r]/g, '').trim();
      
      if (ean.length > 0) {
        await processarBipagem(ean);
        e.currentTarget.value = '';
      }
    }
  };

  // Processar ao pressionar Enter
  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const ean = e.currentTarget.value.trim();
      
      if (ean.length > 0) {
        await processarBipagem(ean);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <DashboardLayout currentPage="bipagem">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Barcode className="w-7 h-7 text-amber-500" />
            <h1 className="text-3xl font-bold">Bipagem de Produtos</h1>
          </div>
          <p className="text-muted-foreground text-sm">Leia o código de barras para registrar movimentações</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Coluna Principal - Input e Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Entrada */}
            <div className="bg-card rounded-md border border-border p-6 shadow-sm">
              <div className="mb-5">
                <label className="block text-xs font-600 uppercase tracking-wide text-muted-foreground mb-3">
                  Modo: <span className="text-base font-bold text-amber-600">{modo === 'entrada' ? '📥 Entrada' : '📤 Saída'}</span>
                </label>
                <button
                  onClick={alternarModo}
                  className={`w-full py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                    modo === 'entrada'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {modo === 'entrada' ? '📥 Modo Entrada' : '📤 Modo Saída'}
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-600 uppercase tracking-wide text-muted-foreground mb-2">
                  Código de Barras (EAN)
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Aponte o leitor de código de barras aqui..."
                  className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring text-lg font-mono transition-colors"
                  autoFocus
                />
              </div>

              {/* Status de Carregamento */}
              {loading && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-blue-900 text-sm font-medium">Processando bipagem...</span>
                </div>
              )}

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 text-sm font-medium">{error}</p>
                    <button
                      onClick={limparErro}
                      className="text-xs text-red-700 hover:text-red-900 mt-2 underline font-medium"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}

              {/* Mensagem de Sucesso */}
              {sucesso && ultimoProduto && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-md mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-900 font-semibold text-sm">{ultimoProduto.nome}</p>
                    <p className="text-emerald-800 text-xs">
                      Estoque: {ultimoProduto.estoque} unidades
                    </p>
                    <p className="text-emerald-800 text-xs">
                      {modo === 'entrada' ? '✅ Entrada registrada' : '✅ Saída registrada'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Último Produto Processado */}
            {ultimoProduto && !loading && (
              <div className="bg-card rounded-md border border-border p-6 shadow-sm">
                <h3 className="text-sm font-600 uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  Último Produto
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground mb-1">Nome</p>
                    <p className="text-lg font-semibold">{ultimoProduto.nome}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground mb-1">EAN</p>
                      <p className="text-sm font-mono text-foreground">{ultimoProduto.ean}</p>
                    </div>
                    <div>
                      <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground mb-1">Estoque Atual</p>
                      <p className="text-2xl font-bold text-amber-600">{ultimoProduto.estoque}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coluna Lateral - Últimas Movimentações */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-md border border-border p-6 shadow-sm sticky top-4">
              <h3 className="text-sm font-600 uppercase tracking-wide text-muted-foreground mb-4">Últimas Movimentações</h3>

              {movimentacoes.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-8">Nenhuma movimentação ainda</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {movimentacoes.map((mov) => (
                    <div
                      key={mov.id}
                      className={`p-3 rounded-md border-l-4 text-sm ${
                        mov.type === 'entrada'
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-red-50 border-red-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-xs truncate ${
                            mov.type === 'entrada' ? 'text-emerald-900' : 'text-red-900'
                          }`}>
                            {mov.productName || 'Produto'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {mov.type === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${
                            mov.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {mov.type === 'entrada' ? '+' : '-'}{mov.quantity}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(mov.date).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
