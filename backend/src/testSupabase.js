require('dotenv').config({ path: '../.env' });
const supabase = require('./config/supabase');

async function testSupabaseConnection() {
  console.log('Testando conexão com Supabase...');
  try {
    // Testar se a tabela 'ordens_servico' existe e está acessível
    const { count, error } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    console.log('Conexão com Supabase bem-sucedida!');
    console.log(`Tabela 'ordens_servico' acessível. Total de registros: ${count}`);

    // Testar se a tabela 'mecanicos' existe
    const { count: mecanicosCount, error: mecanicosError } = await supabase
      .from('mecanicos')
      .select('*', { count: 'exact', head: true });

    if (mecanicosError) {
      throw mecanicosError;
    }
    console.log(`Tabela 'mecanicos' acessível. Total de registros: ${mecanicosCount}`);

    // Testar se a tabela 'classificacao_defeitos' existe e tem dados iniciais
    const { data: classificacaoData, error: classificacaoError } = await supabase
      .from('classificacao_defeitos')
      .select('grupo, subgrupo, subsubgrupo');

    if (classificacaoError) {
      throw classificacaoError;
    }
    console.log(`Tabela 'classificacao_defeitos' acessível. Total de regras: ${classificacaoData.length}`);
    if (classificacaoData.length > 0) {
      console.log('Algumas regras de classificação de defeitos (exemplo):');
      classificacaoData.slice(0, 3).forEach(rule => {
        console.log(`- ${rule.grupo} > ${rule.subgrupo} > ${rule.subsubgrupo}`);
      });
    } else {
      console.warn('A tabela classificacao_defeitos está vazia. Certifique-se de que o script schema.sql foi executado completamente.');
    }

  } catch (error) {
    console.error('Erro ao conectar ou verificar Supabase:', error.message);
    console.error('Detalhes do erro:', error);
  }
}

testSupabaseConnection();

