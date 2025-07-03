const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }  // SSL é obrigatório no Supabase
});

async function testConnection() {
  try {
    await client.connect();
    console.log("Conexão com Supabase estabelecida com sucesso!");

    // Exemplo: Consultar tabelas existentes
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log("Tabelas no esquema 'public':");
    res.rows.forEach(row => console.log(`- ${row.table_name}`));

  } catch (err) {
    console.error("Erro ao conectar ou consultar Supabase:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();

