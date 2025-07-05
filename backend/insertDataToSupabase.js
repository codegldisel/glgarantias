const { Client } = require('pg');
const ExcelService = require('./src/services/excelService');
const NLPService = require('./src/services/nlpService');
const path = require('path');

// Instanciar o NLPService
const nlpService = new NLPService();

// Configuração do cliente PostgreSQL
const client = new Client({
  connectionString: 'postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function insertDataToSupabase() {
  try {
    console.log('🔌 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado ao Supabase com sucesso!');

    // Caminho para a planilha oficial
    const excelPath = '/home/ubuntu/glgarantias/upload/GLú-Garantias(Oficial).xlsx';
    
    console.log('📊 Lendo planilha Excel...');
    const rawData = ExcelService.readExcelFile(excelPath);
    console.log(`📋 ${rawData.length} registros lidos da planilha`);

    console.log('🔄 Mapeando dados para formato do banco...');
    const mappedData = ExcelService.mapExcelDataToDatabase(rawData);
    console.log(`✅ ${mappedData.length} registros mapeados e filtrados (apenas G, GO, GU)`);

    console.log('🤖 Iniciando classificação de defeitos...');
    const processedData = [];
    let classificados = 0;
    let naoClassificados = 0;

    for (let i = 0; i < mappedData.length; i++) {
      const record = mappedData[i];
      
      // Classificar o defeito usando NLP
      const classification = nlpService.classifyDefect(record.defeito_texto_bruto);
      
      // Adicionar classificação ao registro
      const processedRecord = {
        ...record,
        defeito_grupo: classification.grupo,
        defeito_subgrupo: classification.subgrupo,
        defeito_subsubgrupo: classification.subsubgrupo,
        confianca: classification.confianca
      };
      
      processedData.push(processedRecord);
      
      if (classification.grupo !== 'Não Classificado') {
        classificados++;
      } else {
        naoClassificados++;
      }
      
      // Log de progresso a cada 1000 registros
      if ((i + 1) % 1000 === 0) {
        console.log(`   Processados: ${i + 1}/${mappedData.length} registros`);
      }
    }

    console.log(`🎯 Classificação concluída:`);
    console.log(`   ✅ Classificados: ${classificados}`);
    console.log(`   ❌ Não Classificados: ${naoClassificados}`);
    console.log(`   📊 Taxa de Sucesso: ${((classificados / mappedData.length) * 100).toFixed(1)}%`);

    console.log('💾 Inserindo dados no Supabase...');
    
    // Limpar tabela antes de inserir novos dados (opcional)
    console.log('🗑️ Limpando dados existentes...');
    await client.query('DELETE FROM ordens_servico');
    
    // Preparar query de inserção
    const insertQuery = `
      INSERT INTO ordens_servico (
        numero_ordem, status, mecanico_responsavel, modelo_motor, fabricante_motor,
        dia_servico, mes_servico, ano_servico, total_pecas, total_servico, total_geral,
        defeito_texto_bruto, defeito_grupo, defeito_subgrupo, defeito_subsubgrupo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    // Inserir dados em lotes para melhor performance
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      for (const record of batch) {
        const values = [
          record.numero_ordem,
          record.status,
          record.mecanico_responsavel,
          record.modelo_motor,
          record.fabricante_motor,
          record.dia_servico,
          record.mes_servico,
          record.ano_servico,
          record.total_pecas,
          record.total_servico,
          record.total_geral,
          record.defeito_texto_bruto,
          record.defeito_grupo,
          record.defeito_subgrupo,
          record.defeito_subsubgrupo
        ];
        
        await client.query(insertQuery, values);
        insertedCount++;
      }
      
      console.log(`   Inseridos: ${Math.min(i + batchSize, processedData.length)}/${processedData.length} registros`);
    }

    console.log(`✅ Inserção concluída! ${insertedCount} registros inseridos no Supabase`);

    // Registrar o upload na tabela uploads
    const uploadQuery = `
      INSERT INTO uploads (nome_arquivo, tamanho_arquivo, status_processamento, registros_processados, data_upload)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    
    await client.query(uploadQuery, [
      'GLú-Garantias(Oficial).xlsx',
      0, // tamanho não disponível neste contexto
      'concluido',
      insertedCount
    ]);

    console.log('📝 Upload registrado na tabela uploads');

    // Verificar dados inseridos
    const countResult = await client.query('SELECT COUNT(*) FROM ordens_servico');
    console.log(`🔍 Verificação: ${countResult.rows[0].count} registros na tabela ordens_servico`);

    // Estatísticas de classificação
    const statsResult = await client.query(`
      SELECT 
        defeito_grupo,
        COUNT(*) as quantidade
      FROM ordens_servico 
      GROUP BY defeito_grupo 
      ORDER BY quantidade DESC
    `);
    
    console.log('\n📊 Estatísticas de Classificação:');
    statsResult.rows.forEach(row => {
      console.log(`   ${row.defeito_grupo}: ${row.quantidade} registros`);
    });

  } catch (error) {
    console.error('❌ Erro durante o processamento:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão com Supabase encerrada');
  }
}

// Executar o script
if (require.main === module) {
  insertDataToSupabase();
}

module.exports = { insertDataToSupabase };

