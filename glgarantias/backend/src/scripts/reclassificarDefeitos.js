const supabase = require('../config/supabase');
const NLPService = require('../services/nlpService');

/**
 * Script para reclassificar defeitos existentes que não foram classificados
 * ou que foram classificados como "Não Classificado"
 */
async function reclassificarDefeitos() {
  try {
    console.log('Iniciando reclassificação de defeitos...');
    
    const nlpService = new NLPService();
    let totalProcessados = 0;
    let totalClassificados = 0;
    let totalErros = 0;
    
    // Buscar registros que precisam ser reclassificados
    const { data: registrosParaClassificar, error: fetchError } = await supabase
      .from('ordens_servico')
      .select('id, numero_ordem, defeito_texto_bruto, defeito_grupo')
      .or('defeito_grupo.is.null,defeito_grupo.eq.Não Classificado')
      .not('defeito_texto_bruto', 'is', null)
      .not('defeito_texto_bruto', 'eq', '');
    
    if (fetchError) {
      console.error('Erro ao buscar registros para reclassificar:', fetchError);
      return;
    }
    
    console.log(`Encontrados ${registrosParaClassificar.length} registros para reclassificar`);
    
    if (registrosParaClassificar.length === 0) {
      console.log('Nenhum registro precisa ser reclassificado!');
      return;
    }
    
    // Processar em lotes para não sobrecarregar
    const batchSize = 100;
    for (let i = 0; i < registrosParaClassificar.length; i += batchSize) {
      const batch = registrosParaClassificar.slice(i, i + batchSize);
      console.log(`Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(registrosParaClassificar.length / batchSize)}`);
      
      for (const registro of batch) {
        try {
          totalProcessados++;
          
          // Classificar o defeito
          const classification = nlpService.classifyDefect(registro.defeito_texto_bruto);
          
          // Atualizar no banco
          const { error: updateError } = await supabase
            .from('ordens_servico')
            .update({
              defeito_grupo: classification.grupo,
              defeito_subgrupo: classification.subgrupo,
              defeito_subsubgrupo: classification.subsubgrupo,
              classificacao_confianca: classification.confianca,
              updated_at: new Date().toISOString()
            })
            .eq('id', registro.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar registro ${registro.id}:`, updateError);
            totalErros++;
          } else {
            totalClassificados++;
            if (totalClassificados % 50 === 0) {
              console.log(`Progresso: ${totalClassificados} registros classificados...`);
            }
          }
          
        } catch (error) {
          console.error(`Erro ao processar registro ${registro.id}:`, error.message);
          totalErros++;
        }
      }
      
      // Pequena pausa entre lotes para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n=== RESUMO DA RECLASSIFICAÇÃO ===');
    console.log(`Total de registros processados: ${totalProcessados}`);
    console.log(`Registros classificados com sucesso: ${totalClassificados}`);
    console.log(`Erros: ${totalErros}`);
    console.log('===================================\n');
    
  } catch (error) {
    console.error('Erro geral no script de reclassificação:', error);
  }
}

// Executar o script se for chamado diretamente
if (require.main === module) {
  reclassificarDefeitos()
    .then(() => {
      console.log('Script de reclassificação concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { reclassificarDefeitos }; 