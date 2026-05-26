# Integração Supabase - Guia de Configuração

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Tabela `produtos` criada com as colunas:
   - `id` (UUID, Primary Key)
   - `created_at` (Timestamp)
   - `nome` (Text)
   - `preco` (Numeric)
   - `estoque` (Integer)

## 🔧 Configuração

### 1. Obter Credenciais do Supabase

1. Acesse seu projeto no Supabase
2. Vá para **Project Settings** → **API**
3. Copie:
   - **URL do Projeto** (ex: `https://xxxxx.supabase.co`)
   - **Anon Key** (a chave pública)

### 2. Adicionar Variáveis de Ambiente

No painel de gerenciamento do Manus:

1. Vá para **Settings** → **Secrets**
2. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`: Cole a URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: Cole a Anon Key

### 3. Habilitar Realtime (Opcional)

Para sincronização em tempo real:

1. No Supabase, vá para **Database** → **Replication**
2. Habilite replication para a tabela `produtos`

## 📖 Como Usar

### Página de Produtos Supabase

Acesse a rota `/produtos-supabase` para ver a página integrada com Supabase.

**Funcionalidades:**
- ✅ Listar todos os produtos
- ✅ Buscar por nome
- ✅ Adicionar novo produto
- ✅ Atualizar estoque
- ✅ Deletar produto
- ✅ Sincronização em tempo real

### Hook `useSupabaseProdutos`

Use o hook em seus componentes:

```tsx
import { useSupabaseProdutos } from '@/hooks/useSupabaseProdutos';

function MeuComponente() {
  const {
    produtos,
    loading,
    error,
    adicionando,
    adicionarProduto,
    atualizarProduto,
    deletarProduto,
    buscarComFiltro,
    carregarProdutos,
    limparErro,
  } = useSupabaseProdutos();

  // Seu código aqui
}
```

### API Direta

Use a API do Supabase diretamente:

```tsx
import { produtosAPI } from '@/lib/supabase';

// Buscar todos
const produtos = await produtosAPI.buscarTodos();

// Adicionar
const novo = await produtosAPI.adicionar({
  nome: 'Produto',
  preco: 99.99,
  estoque: 10,
});

// Atualizar
const atualizado = await produtosAPI.atualizar(id, {
  estoque: 5,
});

// Deletar
await produtosAPI.deletar(id);

// Buscar com filtro
const filtrados = await produtosAPI.buscarComFiltro({
  nome: 'Tela',
  precoMax: 500,
});
```

## 🔐 Segurança

- **Anon Key**: Usada apenas para leitura/escrita pública
- **Service Role Key**: Nunca compartilhe ou use no frontend
- **RLS (Row Level Security)**: Configure no Supabase para controlar acesso

## 🐛 Troubleshooting

### Erro: "Supabase não está configurado"

**Solução:** Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel de Secrets.

### Erro: "Tabela não encontrada"

**Solução:** Verifique se a tabela `produtos` existe no Supabase e se o RLS está desabilitado ou configurado corretamente.

### Mudanças não aparecem em tempo real

**Solução:** Habilite Replication na tabela no Supabase.

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)
