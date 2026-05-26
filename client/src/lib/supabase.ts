import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// IMPORTANTE: Substitua com suas próprias credenciais
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qhldryghfjclfomvikam.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8s2jUvOnQQ_At_-Pi6jcCA_0UNhOmot';

// Validar se as credenciais estão configuradas
console.log('=== SUPABASE CONFIG ===');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 30) + '...' : 'NAO DEFINIDA');
console.log('=== FIM CONFIG ===');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'ERRO: Supabase nao esta configurado! Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel de Secrets.'
  );
}

// Criar cliente Supabase (pode falhar se credenciais inválidas)
let supabase: any = null;
let supabaseError: string | null = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log('Tentando conectar ao Supabase...');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Cliente Supabase criado com sucesso');
  } else {
    supabaseError = 'Credenciais do Supabase nao configuradas. Usando modo offline.';
    console.warn(supabaseError);
    supabase = null;
  }
} catch (error) {
  supabaseError = `Erro ao criar cliente Supabase: ${error}. Usando modo offline.`;
  console.warn(supabaseError);
  supabase = null;
}

export { supabase };

// Tipos para Produtos
export interface ProdutoSupabase {
  id: string;
  created_at: string;
  nome: string;
  preco: number;
  estoque: number;
}

// Funções para gerenciar produtos
export const produtosAPI = {
  // Buscar todos os produtos
  async buscarTodos(): Promise<ProdutoSupabase[]> {
    try {
      if (!supabase) throw new Error('Supabase não configurado');

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  async buscarPorId(id: string): Promise<ProdutoSupabase | null> {
    try {
      if (!supabase) throw new Error('Supabase não configurado');

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  // Adicionar novo produto
  async adicionar(produto: Omit<ProdutoSupabase, 'id' | 'created_at'>): Promise<ProdutoSupabase> {
    try {
      if (!supabase) throw new Error('Supabase não configurado');

      console.log('=== SUPABASE INSERT ===');
      console.log('Enviando produto:', produto);

      const { data, error } = await supabase
        .from('produtos')
        .insert([produto])
        .select()
        .single();

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('ERRO DO SUPABASE:', error);
        throw error;
      }

      console.log('Produto inserido com sucesso:', data);
      return data;
    } catch (error) {
      console.error('ERRO AO ADICIONAR PRODUTO:', error);
      throw error;
    }
  },

  // Atualizar produto
  async atualizar(id: string, updates: Partial<ProdutoSupabase>): Promise<ProdutoSupabase> {
    try {
      if (!supabase) throw new Error('Supabase não configurado');

      const { data, error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar produto
  async deletar(id: string): Promise<void> {
    try {
      if (!supabase) throw new Error('Supabase não configurado');

      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  // Buscar com filtro
  async buscarComFiltro(filtro: {
    nome?: string;
    precoMin?: number;
    precoMax?: number;
    estoqueMin?: number;
  }): Promise<ProdutoSupabase[]> {
    try {
      if (!supabase) throw new Error('Supabase não configurado');

      let query = supabase.from('produtos').select('*');

      if (filtro.nome) {
        query = query.ilike('nome', `%${filtro.nome}%`);
      }

      if (filtro.precoMin !== undefined) {
        query = query.gte('preco', filtro.precoMin);
      }

      if (filtro.precoMax !== undefined) {
        query = query.lte('preco', filtro.precoMax);
      }

      if (filtro.estoqueMin !== undefined) {
        query = query.gte('estoque', filtro.estoqueMin);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar com filtro:', error);
      throw error;
    }
  },

  // Inscrever-se em mudanças em tempo real
  onChanges(callback: (payload: any) => void) {
    if (!supabase) {
      console.warn('Supabase não configurado, não é possível inscrever-se em mudanças');
      return null;
    }

    const subscription = supabase
      .channel('produtos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos',
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};


// Tipos para Bipagem
export interface Movimentacao {
  id: string;
  produto_id: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  produto?: {
    nome: string;
    ean: string;
  };
}

export interface ProdutoComEAN extends ProdutoSupabase {
  ean: string;
}

// Armazenamento local de movimentações (fallback quando Supabase não está disponível)
let movimentacoesLocais: Movimentacao[] = [];

// API para Bipagem
export const bipagemAPI = {
  // Buscar produto por EAN
  async buscarPorEAN(ean: string): Promise<ProdutoComEAN | null> {
    try {
      console.log('Buscando produto com EAN:', ean);

      if (!supabase) {
        console.warn('Supabase não configurado, retornando null');
        return null;
      }

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ean', ean)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('Produto encontrado:', data);
      return data || null;
    } catch (error) {
      console.error('Erro ao buscar produto por EAN:', error);
      return null;
    }
  },

  // Registrar movimentacao
  async registrarMovimentacao(
    produtoId: string,
    tipo: 'entrada' | 'saida',
    quantidade: number = 1
  ): Promise<Movimentacao> {
    try {
      console.log('Registrando movimentacao:', { produtoId, tipo, quantidade });

      if (!supabase) {
        console.warn('Supabase não configurado, usando armazenamento local');
        
        // Criar movimentação local
        const movimentacao: Movimentacao = {
          id: `local-${Date.now()}`,
          produto_id: produtoId,
          tipo,
          quantidade,
          data: new Date().toISOString(),
        };

        movimentacoesLocais.unshift(movimentacao);
        console.log('Movimentação registrada localmente:', movimentacao);
        return movimentacao;
      }

      // Buscar produto atual
      const { data: produto, error: erroFetch } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', produtoId)
        .single();

      if (erroFetch) throw erroFetch;

      // Calcular novo estoque
      const novoEstoque = tipo === 'entrada'
        ? produto.estoque + quantidade
        : Math.max(0, produto.estoque - quantidade);

      // Atualizar estoque
      const { error: erroUpdate } = await supabase
        .from('produtos')
        .update({ estoque: novoEstoque })
        .eq('id', produtoId);

      if (erroUpdate) throw erroUpdate;

      // Registrar movimentacao
      const { data: movimentacao, error: erroInsert } = await supabase
        .from('movimentacoes')
        .insert([
          {
            produto_id: produtoId,
            tipo,
            quantidade,
            data: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (erroInsert) throw erroInsert;

      console.log('Movimentacao registrada:', movimentacao);
      return movimentacao;
    } catch (error) {
      console.error('Erro ao registrar movimentacao:', error);
      throw error;
    }
  },

  // Buscar ultimas movimentacoes - COM FALLBACK PARA DADOS LOCAIS
  async buscarUltimasMovimentacoes(limite: number = 10): Promise<Movimentacao[]> {
    try {
      console.log('Buscando ultimas movimentacoes...');

      if (!supabase) {
        console.warn('Supabase não configurado, retornando movimentações locais');
        return movimentacoesLocais.slice(0, limite);
      }

      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .order('data', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao buscar movimentacoes no Supabase:', error);
        // Fallback para dados locais
        return movimentacoesLocais.slice(0, limite);
      }

      console.log('Movimentacoes encontradas:', data);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar movimentacoes:', error);
      // Fallback para dados locais em caso de erro
      return movimentacoesLocais.slice(0, limite);
    }
  },

  // Inscrever-se em mudancas de movimentacoes
  onMovimentacoesChanges(callback: (payload: any) => void) {
    if (!supabase) {
      console.warn('Supabase não configurado, não é possível inscrever-se em mudanças');
      return null;
    }

    const subscription = supabase
      .channel('movimentacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'movimentacoes',
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
