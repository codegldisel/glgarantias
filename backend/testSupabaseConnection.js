const { Client } = require("pg");

const connectionString = "postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Necessário para Supabase
  });

  try {
    await client.connect();
    console.log("Conexão com Supabase estabelecida com sucesso!");

    // Opcional: Consultar uma tabela para verificar se o acesso está funcionando
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log("Tabelas no schema public:", res.rows.map(row => row.tablename));

  } catch (err) {
    console.error("Erro ao conectar ou consultar Supabase:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();


