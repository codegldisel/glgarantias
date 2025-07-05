const { Client } = require('pg');
const ExcelService = require('./src/services/excelService');

async function debugDataIssues() {
  // Conectar ao Supabase
  const client = new Client({
    connectionString: 'postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase');

    // 1. Ler planilha e verificar dados originais
    console.log('\n📊 Lendo planilha Excel...');
    const excelPath = '/home/ubuntu/glgarantias/upload/GLú-Garantias(Oficial).xlsx';
    const excelData = ExcelService.readExcelFile(excelPath);
    
    console.log(`Total de linhas na planilha: ${excelData.data.length}`);
    
    // 2. Verificar alguns registros de data originais
    console.log('\n🔍 Verificando dados de data originais:');
    const sampleRows = excelData.data.slice(0, 10);
    sampleRows.forEach((row, index) => {
      const dataOSv = row["Data_OSv"];
      const convertedDate = ExcelService.excelSerialDateToJSDate(dataOSv);
      console.log(`Linha ${index + 1}: Data_OSv = ${dataOSv} -> Convertida = ${convertedDate}`);
    });

    // 3. Mapear dados e verificar filtros
    console.log('\n🔄 Mapeando dados...');
    const mappedData = ExcelService.mapExcelDataToDatabase(excelData);
    console.log(`Registros após mapeamento e filtro G/GO/GU: ${mappedData.length}`);

    // 4. Verificar distribuição de anos nos dados mapeados
    console.log('\n📅 Distribuição de anos nos dados mapeados:');
    const anoDistribution = {};
    mappedData.forEach(record => {
      const ano = record.ano_servico;
      anoDistribution[ano] = (anoDistribution[ano] || 0) + 1;
    });
    
    Object.entries(anoDistribution)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .slice(0, 10)
      .forEach(([ano, count]) => {
        console.log(`  ${ano}: ${count} registros`);
      });

    // 5. Verificar dados no banco atual
    console.log('\n🗄️ Verificando dados no banco:');
    const countResult = await client.query('SELECT COUNT(*) FROM ordens_servico');
    console.log(`Total de registros no banco: ${countResult.rows[0].count}`);

    const nullDatesResult = await client.query('SELECT COUNT(*) FROM ordens_servico WHERE data_ordem IS NULL');
    console.log(`Registros com data_ordem NULL: ${nullDatesResult.rows[0].count}`);

    // 6. Verificar distribuição de anos no banco
    const yearDistResult = await client.query(`
      SELECT ano_servico, COUNT(*) as count 
      FROM ordens_servico 
      GROUP BY ano_servico 
      ORDER BY ano_servico DESC 
      LIMIT 10
    `);
    console.log('\n📊 Distribuição de anos no banco:');
    yearDistResult.rows.forEach(row => {
      console.log(`  ${row.ano_servico}: ${row.count} registros`);
    });

    // 7. Verificar dados para julho de 2025 (que o frontend está tentando buscar)
    const july2025Result = await client.query(`
      SELECT COUNT(*) FROM ordens_servico 
      WHERE mes_servico = 7 AND ano_servico = 2025
    `);
    console.log(`\n📅 Registros para julho/2025: ${july2025Result.rows[0].count}`);

    // 8. Verificar qual mês/ano tem mais dados
    const monthYearResult = await client.query(`
      SELECT mes_servico, ano_servico, COUNT(*) as count 
      FROM ordens_servico 
      GROUP BY mes_servico, ano_servico 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n📊 Top 10 mês/ano com mais registros:');
    monthYearResult.rows.forEach(row => {
      console.log(`  ${row.mes_servico}/${row.ano_servico}: ${row.count} registros`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

debugDataIssues();

