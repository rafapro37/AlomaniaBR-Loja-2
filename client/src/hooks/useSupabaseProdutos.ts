import { useState, useEffect, useCallback, useRef } from 'react';
import { produtosAPI, ProdutoSupabase, supabase } from '@/lib/supabase';

interface UseProdutosState {
  produtos: ProdutoSupabase[];
  loading: boolean;
  error: string | null;
  adicionando: boolean;
}

export function useSupabaseProdutos() {
  const [state, setState] = useState<UseProdutosState>({
    produtos: [],
    loading: true,
    error: null,
    adicionando: false,
  });

  const subscriptionRef = useRef<any>(null);

  // Função para carregar produtos
  const carregarProdutos = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const dados = await produtosAPI.buscarTodos();
      setState((prev) => ({ ...prev, produtos: dados, loading: false }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao carregar produtos';
      setState((prev) => ({ ...prev, error: mensagem, loading: false }));
    }
  }, []);

  // Buscar produtos ao montar o componente e inscrever-se em mudanças
  useEffect(() => {
    carregarProdutos();

    // Inscrever-se em mudanças em tempo real
    subscriptionRef.current = supabase
      .channel('produtos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos',
        },
        () => {
          carregarProdutos();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [carregarProdutos]);

  // Função para adicionar produto
  const adicionarProduto = useCallback(
    async (produto: Omit<ProdutoSupabase, 'id' | 'created_at'>) => {
      try {
        console.log('Hook: Adicionando produto', produto);
        setState((prev) => ({ ...prev, adicionando: true, error: null }));
        const novoProduto = await produtosAPI.adicionar(produto);
        console.log('Hook: Produto adicionado com sucesso', novoProduto);
        setState((prev) => ({
          ...prev,
          produtos: [novoProduto, ...prev.produtos],
          adicionando: false,
        }));
        return novoProduto;
      } catch (error) {
        console.error('Hook: Erro ao adicionar produto', error);
        const mensagem = error instanceof Error ? error.message : 'Erro ao adicionar produto';
        setState((prev) => ({ ...prev, error: mensagem, adicionando: false }));
        throw error;
      }
    },
    []
  );

  // Função para atualizar produto
  const atualizarProduto = useCallback(
    async (id: string, updates: Partial<ProdutoSupabase>) => {
      try {
        setState((prev) => ({ ...prev, error: null }));
        const produtoAtualizado = await produtosAPI.atualizar(id, updates);
        setState((prev) => ({
          ...prev,
          produtos: prev.produtos.map((p) => (p.id === id ? produtoAtualizado : p)),
        }));
        return produtoAtualizado;
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro ao atualizar produto';
        setState((prev) => ({ ...prev, error: mensagem }));
        throw error;
      }
    },
    []
  );

  // Função para deletar produto
  const deletarProduto = useCallback(async (id: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      await produtosAPI.deletar(id);
      setState((prev) => ({
        ...prev,
        produtos: prev.produtos.filter((p) => p.id !== id),
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao deletar produto';
      setState((prev) => ({ ...prev, error: mensagem }));
      throw error;
    }
  }, []);

  // Função para buscar com filtro
  const buscarComFiltro = useCallback(
    async (filtro: {
      nome?: string;
      precoMin?: number;
      precoMax?: number;
      estoqueMin?: number;
    }) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const dados = await produtosAPI.buscarComFiltro(filtro);
        setState((prev) => ({ ...prev, produtos: dados, loading: false }));
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro ao buscar produtos';
        setState((prev) => ({ ...prev, error: mensagem, loading: false }));
      }
    },
    []
  );

  // Função para limpar erro
  const limparErro = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    carregarProdutos,
    adicionarProduto,
    atualizarProduto,
    deletarProduto,
    buscarComFiltro,
    limparErro,
  };
}
