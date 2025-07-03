const supabase = require('../config/supabase');

/**
 * Script para adicionar o campo data_fechamento à tabela ordens_servico
 */
async function adicionarDataFechamento() {
  try {
    console.log('🔧 Adicionando campo data_fechamento à tabela ordens_servico...');
    
    // SQL para adicionar o campo
    const sql = `
      ALTER TABLE ordens_servico 
      ADD COLUMN IF NOT EXISTS data_fechamento DATE;
      
      CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_fechamento 
      ON ordens_servico(data_fechamento);
    `;
    
    // Executar via Supabase
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...');
      
      // Verificar se o campo já existe
      const { data: columns, error: checkError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'ordens_servico')
        .eq('column_name', 'data_fechamento');
      
      if (checkError) {
        console.error('❌ Erro ao verificar colunas:', checkError);
        return;
      }
      
      if (columns && columns.length > 0) {
        console.log('✅ Campo data_fechamento já existe!');
      } else {
        console.log('⚠️  Campo data_fechamento não encontrado. Execute manualmente no Supabase:');
        console.log(`
          ALTER TABLE ordens_servico 
          ADD COLUMN data_fechamento DATE;
          
          CREATE INDEX idx_ordens_servico_data_fechamento 
          ON ordens_servico(data_fechamento);
        `);
      }
    } else {
      console.log('✅ Campo data_fechamento adicionado com sucesso!');
    }
    
    // Verificar se o campo foi adicionado
    console.log('🔍 Verificando se o campo foi adicionado...');
    
    // Tentar inserir um registro de teste com data_fechamento
    const { data: testData, error: testError } = await supabase
      .from('ordens_servico')
      .insert({
        numero_ordem: 'TESTE_DATA_FECHAMENTO',
        data_ordem: '2024-01-01',
        data_fechamento: '2024-01-02', // Teste do novo campo
        status: 'Garantia',
        defeito_texto_bruto: 'Teste de campo data_fechamento',
        mecanico_responsavel: 'TESTE',
        modelo_motor: 'TESTE',
        fabricante_motor: 'TESTE'
      })
      .select();
    
    if (testError) {
      console.error('❌ Erro ao testar campo data_fechamento:', testError);
      console.log('⚠️  O campo data_fechamento pode não ter sido adicionado corretamente.');
    } else {
      console.log('✅ Campo data_fechamento funcionando corretamente!');
      
      // Limpar o registro de teste
      await supabase
        .from('ordens_servico')
        .delete()
        .eq('numero_ordem', 'TESTE_DATA_FECHAMENTO');
      
      console.log('🧹 Registro de teste removido.');
    }
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  adicionarDataFechamento()
    .then(() => {
      console.log('Script concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { adicionarDataFechamento }; 