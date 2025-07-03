const supabase = require('../config/supabase');

/**
 * Script para corrigir dados existentes no banco em lotes
 * Preenche mes_servico e ano_servico a partir de data_ordem quando estão nulos
 */
async function fixExistingData() {
  try {
    console.log('Iniciando correção de dados existentes (em lotes)...');
    let totalCorrigidos = 0;
    let totalErros = 0;
    let totalProcessados = 0;
    let lote = 0;
    const pageSize = 1000;
    while (true) {
      lote++;
      // Buscar registros com mes_servico ou ano_servico nulos (lote)
      const { data: registrosComProblema, error: fetchError } = await supabase
        .from('ordens_servico')
        .select('id, numero_ordem, data_ordem, mes_servico, ano_servico')
        .or('mes_servico.is.null,ano_servico.is.null')
        .limit(pageSize);
      if (fetchError) {
        console.error('Erro ao buscar registros:', fetchError);
        break;
      }
      if (!registrosComProblema || registrosComProblema.length === 0) {
        console.log('Nenhum registro precisa ser corrigido neste lote!');
        break;
      }
      console.log(`Lote ${lote}: ${registrosComProblema.length} registros com problemas de data`);
      for (const registro of registrosComProblema) {
        try {
          if (!registro.data_ordem) {
            console.warn(`Registro ${registro.id} (OS: ${registro.numero_ordem}): Sem data_ordem, não é possível corrigir`);
            totalErros++;
            continue;
          }
          const dt = new Date(registro.data_ordem);
          if (isNaN(dt.getTime())) {
            console.warn(`Registro ${registro.id} (OS: ${registro.numero_ordem}): Data inválida: ${registro.data_ordem}`);
            totalErros++;
            continue;
          }
          const novoMes = dt.getUTCMonth() + 1;
          const novoAno = dt.getUTCFullYear();
          const dadosAtualizacao = {};
          let precisaAtualizar = false;
          if (!registro.mes_servico) {
            dadosAtualizacao.mes_servico = novoMes;
            precisaAtualizar = true;
          }
          if (!registro.ano_servico) {
            dadosAtualizacao.ano_servico = novoAno;
            precisaAtualizar = true;
          }
          if (precisaAtualizar) {
            const { error: updateError } = await supabase
              .from('ordens_servico')
              .update(dadosAtualizacao)
              .eq('id', registro.id);
            if (updateError) {
              console.error(`Erro ao atualizar registro ${registro.id}:`, updateError);
              totalErros++;
            } else {
              console.log(`Registro ${registro.id} (OS: ${registro.numero_ordem}) corrigido: mes=${novoMes}, ano=${novoAno}`);
              totalCorrigidos++;
            }
          }
        } catch (error) {
          console.error(`Erro ao processar registro ${registro.id}:`, error);
          totalErros++;
        }
        totalProcessados++;
      }
      // Se vier menos que o pageSize, acabou
      if (registrosComProblema.length < pageSize) break;
    }
    console.log('\n=== RESUMO DA CORREÇÃO ===');
    console.log(`Total de registros processados: ${totalProcessados}`);
    console.log(`Registros corrigidos: ${totalCorrigidos}`);
    console.log(`Erros: ${totalErros}`);
    console.log('===========================\n');
  } catch (error) {
    console.error('Erro geral no script:', error);
  }
}

// Executar o script se for chamado diretamente
if (require.main === module) {
  fixExistingData()
    .then(() => {
      console.log('Script concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { fixExistingData }; 