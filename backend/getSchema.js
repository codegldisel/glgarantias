const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }  // SSL é obrigatório no Supabase
});

async function getSchema() {
  try {
    await client.connect();
    console.log("Conexão com Supabase estabelecida para obter o esquema.");

    console.log("\n--- Tabelas e Colunas ---");
    const tablesRes = await client.query(
      "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;"
    );
    let currentTable = "";
    tablesRes.rows.forEach(row => {
      if (row.table_name !== currentTable) {
        console.log(`\nTabela: ${row.table_name}`);
        currentTable = row.table_name;
      }
      console.log(`  - Coluna: ${row.column_name} (Tipo: ${row.data_type}, Nulo: ${row.is_nullable}, Default: ${row.column_default})`);
    });

    console.log("\n--- Chaves Primárias ---");
    const pkRes = await client.query(
      "SELECT kcu.table_name, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public' ORDER BY kcu.table_name, kcu.column_name;"
    );
    pkRes.rows.forEach(row => {
      console.log(`Tabela: ${row.table_name}, Chave Primária: ${row.column_name}`);
    });

    console.log("\n--- Chaves Estrangeiras ---");
    const fkRes = await client.query(
      "SELECT kcu.table_name AS foreign_table_name, kcu.column_name AS foreign_column_name, ccu.table_name AS primary_table_name, ccu.column_name AS primary_column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.unique_constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' ORDER BY foreign_table_name, foreign_column_name;"
    );
    fkRes.rows.forEach(row => {
      console.log(`Tabela Estrangeira: ${row.foreign_table_name}.${row.foreign_column_name} -> Tabela Primária: ${row.primary_table_name}.${row.primary_column_name}`);
    });

  } catch (err) {
    console.error("Erro ao obter o esquema do Supabase:", err.message);
  } finally {
    await client.end();
  }
}

getSchema();

