const { Client } = require("pg");

const connectionString = "postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

async function getSchema() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conexão com Supabase estabelecida.");

    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'ordens_servico';
    `);
    console.log("Esquema da tabela ordens_servico:");
    res.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error("Erro ao obter o esquema do Supabase:", error);
  } finally {
    await client.end();
  }
}

getSchema();


