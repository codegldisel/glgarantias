
require("dotenv").config({ path: './.env' });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrderDates() {
  try {
    console.log("Buscando todas as ordens de serviço...");
    const { data: orders, error } = await supabase
      .from("ordens_servico")
      .select("id, data_ordem");

    if (error) {
      throw new Error(`Erro ao buscar ordens de serviço: ${error.message}`);
    }

    console.log(`Encontradas ${orders.length} ordens de serviço para verificar.`);

    const updates = [];
    for (const order of orders) {
      if (order.data_ordem) {
        const date = new Date(order.data_ordem);
        updates.push({
          id: order.id,
          dia_servico: date.getDate(),
          mes_servico: date.getMonth() + 1,
          ano_servico: date.getFullYear(),
        });
      }
    }

    if (updates.length > 0) {
      console.log(`Atualizando ${updates.length} ordens de serviço...`);
      const { error: updateError } = await supabase
        .from("ordens_servico")
        .upsert(updates);

      if (updateError) {
        throw new Error(`Erro ao atualizar ordens de serviço: ${updateError.message}`);
      }
      console.log("Ordens de serviço atualizadas com sucesso!");
    } else {
      console.log("Nenhuma ordem de serviço precisou de atualização.");
    }
  } catch (error) {
    console.error("Erro durante o processo de correção:", error.message);
  }
}

fixOrderDates();
