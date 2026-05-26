import { useEffect, useState } from 'react';
import { supabase, produtosAPI } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Testando conexão...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('🔍 Verificando variáveis de ambiente...');
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('URL:', url);
      console.log('Key exists:', !!key);

      if (!url || !key) {
        setStatus('❌ Variáveis de ambiente não configuradas!');
        setDetails(`URL: ${url ? '✓' : '✗'}\nKey: ${key ? '✓' : '✗'}`);
        return;
      }

      setStatus('✓ Variáveis de ambiente OK');
      setDetails(`URL: ${url}\nKey: ${key.substring(0, 50)}...`);

      // Testar conexão
      setStatus('🔗 Testando conexão com Supabase...');
      const { data, error } = await supabase.from('produtos').select('count', { count: 'exact' });

      if (error) {
        setStatus(`❌ Erro ao conectar: ${error.message}`);
        setDetails(JSON.stringify(error, null, 2));
        return;
      }

      setStatus('✅ Conexão com Supabase OK!');
      setDetails(`Tabela "produtos" acessada com sucesso!\nTotal de produtos: ${data?.length || 0}`);

      // Tentar buscar produtos
      setStatus('📥 Buscando produtos...');
      const produtos = await produtosAPI.buscarTodos();
      setStatus('✅ Tudo funcionando!');
      setDetails(`Produtos encontrados: ${produtos.length}\n\n${JSON.stringify(produtos, null, 2)}`);
    } catch (error) {
      setStatus(`❌ Erro: ${error}`);
      setDetails(JSON.stringify(error, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-8">
      <div className="max-w-2xl mx-auto bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
        <h1 className="text-3xl font-bold text-white mb-6">🧪 Teste de Conexão Supabase</h1>

        <div className="space-y-4">
          <div className="bg-[#0F172A] rounded p-4 border border-[#334155]">
            <p className="text-[#FFC107] font-semibold text-lg">{status}</p>
          </div>

          <div className="bg-[#0F172A] rounded p-4 border border-[#334155]">
            <pre className="text-[#94A3B8] text-sm overflow-auto max-h-96 whitespace-pre-wrap break-words">
              {details}
            </pre>
          </div>

          <button
            onClick={testConnection}
            className="w-full bg-[#FFC107] text-[#0F172A] font-semibold py-3 rounded-lg hover:bg-[#FFD54F] transition-colors"
          >
            🔄 Testar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
