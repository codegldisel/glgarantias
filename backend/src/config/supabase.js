require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("SUPABASE_URL lido:", supabaseUrl);
console.log("SUPABASE_ANON_KEY lido:", supabaseKey ? "[KEY ENCONTRADA]" : "[KEY NÃO ENCONTRADA]");

if (!supabaseUrl || !supabaseKey) {
  console.warn("Credenciais do Supabase não configuradas. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;


