import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { StockMovement } from '@/contexts/DataContext';

interface UseBipagemState {
  modo: 'entrada' | 'saída';
  ultimoProduto: any | null;
  ultimaMovimentacao: StockMovement | null;
  movimentacoes: StockMovement[];
  loading: boolean;
  error: string | null;
  sucesso: boolean;
}

export function useBipagem() {
  const { products, updateProduct, addStockMovement, stockMovements } = useData();
  const [state, setState] = useState<UseBipagemState>({
    modo: 'entrada' as const,
    ultimoProduto: null,
    ultimaMovimentacao: null,
    movimentacoes: [],
    loading: false,
    error: null,
    sucesso: false,
  });

  // Carregar ultimas movimentacoes ao montar
  useEffect(() => {
    carregarMovimentacoes();
  }, [stockMovements]);

  // Carregar ultimas movimentacoes
  const carregarMovimentacoes = useCallback(() => {
    try {
      // Pegar as últimas 15 movimentações
      const ultimas = stockMovements.slice(-15).reverse();
      setState((prev) => ({ ...prev, movimentacoes: ultimas }));
    } catch (error) {
      console.error('Erro ao carregar movimentacoes:', error);
    }
  }, [stockMovements]);

  // Processar bipagem de produto
  const processarBipagem = useCallback(
    (ean: string) => {
      try {
        console.log('Processando bipagem:', ean);
        setState((prev) => ({ ...prev, loading: true, error: null, sucesso: false }));

        // Buscar produto por EAN (remover espaços e quebras de linha)
        const eanLimpo = ean.trim().toLowerCase();
        const produtoEncontrado = products.find(
          (p) => p.ean && p.ean.trim().toLowerCase() === eanLimpo
        );

        if (!produtoEncontrado) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Produto com EAN ${ean} não encontrado`,
            ultimoProduto: null,
          }));
          return null;
        }

        // Calcular nova quantidade
        let novaQuantidade = produtoEncontrado.quantity;
        if (state.modo === 'entrada') {
          novaQuantidade += 1;
        } else {
          // Validar se há estoque para saída
          if (produtoEncontrado.quantity <= 0) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: `Estoque insuficiente para ${produtoEncontrado.name}`,
              ultimoProduto: null,
            }));
            return null;
          }
          novaQuantidade -= 1;
        }

        // Atualizar produto no contexto
        updateProduct(produtoEncontrado.id, { quantity: novaQuantidade });

        // Registrar movimentacao
        const tipoMovimentacao: 'entrada' | 'saída' = state.modo === 'entrada' ? 'entrada' : 'saída';
        const movimentacao: Omit<StockMovement, 'id' | 'date'> = {
          productId: produtoEncontrado.id,
          productName: produtoEncontrado.name,
          productCode: produtoEncontrado.code,
          type: tipoMovimentacao,
          quantity: 1,
          reason: 'Bipagem',
          previousQuantity: produtoEncontrado.quantity,
          newQuantity: novaQuantidade,
          userId: 'bipagem',
          userName: 'Sistema de Bipagem',
        };
        addStockMovement(movimentacao);

        // Atualizar estado com sucesso
        const produtoAtualizado = {
          ...produtoEncontrado,
          quantity: novaQuantidade,
        };

        setState((prev) => ({
          ...prev,
          ultimoProduto: produtoAtualizado,
          ultimaMovimentacao: { ...movimentacao, id: Date.now().toString(), date: new Date().toISOString() },
          loading: false,
          sucesso: true,
        }));

        // Limpar sucesso apos 2 segundos
        setTimeout(() => {
          setState((prev) => ({ ...prev, sucesso: false }));
        }, 2000);

        return produtoAtualizado;
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro ao processar bipagem';
        console.error('Erro ao processar bipagem:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: mensagem,
          ultimoProduto: null,
        }));
        return null;
      }
    },
    [state.modo, products, updateProduct, addStockMovement]
  );

  // Alternar modo
  const alternarModo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modo: prev.modo === 'entrada' ? 'saída' : 'entrada',
      error: null,
      sucesso: false,
    }));
  }, []);

  // Limpar erro
  const limparErro = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    processarBipagem,
    alternarModo,
    limparErro,
    carregarMovimentacoes,
  };
}
