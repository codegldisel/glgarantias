// scripts/fix_dates.js
require('dotenv').config({ path: '../.env' });
const supabase = require('../src/config/supabase');

/**
 * Tenta analisar uma string de data em vários formatos para um objeto Date.
 * @param {string} dateString - A string da data.
 * @returns {Date|null}
 */
function parseDateString(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        return null;
    }

    // Tenta formato ISO 8601 (ex: '2023-05-21T00:00:00+00:00')
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Tenta formato DD/MM/YYYY
    const dmy = dateString.split('/');
    if (dmy.length === 3) {
        date = new Date(`${dmy[2]}-${dmy[1]}-${dmy[0]}`);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    
    return null; // Retorna null se nenhum formato for válido
}

async function fixIncorrectDates() {
    console.log('Iniciando script para corrigir datas...');

    try {
        // 1. Buscar registros com ano_servico nulo, indefinido ou incorreto (ex: 1970)
        const { data: records, error } = await supabase
            .from('ordens_servico')
            .select('id, data_ordem, mes_servico, ano_servico')
            .or('ano_servico.is.null,ano_servico.lte.1970');

        if (error) {
            throw new Error(`Erro ao buscar registros: ${error.message}`);
        }

        if (!records || records.length === 0) {
            console.log('Nenhum registro com data incorreta encontrado. Tudo certo!');
            return;
        }

        console.log(`Encontrados ${records.length} registros para corrigir.`);
        const updates = [];

        for (const record of records) {
            if (record.data_ordem) {
                const correctedDate = parseDateString(record.data_ordem);

                if (correctedDate) {
                    const correctedMonth = correctedDate.getUTCMonth() + 1;
                    const correctedYear = correctedDate.getUTCFullYear();

                    // Verificar se a correção é necessária
                    if (record.mes_servico !== correctedMonth || record.ano_servico !== correctedYear) {
                        updates.push({
                            id: record.id,
                            mes_servico: correctedMonth,
                            ano_servico: correctedYear,
                        });
                        console.log(`Correção para ID ${record.id}: ${record.ano_servico}/${record.mes_servico} -> ${correctedYear}/${correctedMonth}`);
                    }
                } else {
                    console.warn(`Não foi possível analisar a data para o registro ID ${record.id}: '${record.data_ordem}'`);
                }
            }
        }

        if (updates.length === 0) {
            console.log('Nenhuma atualização necessária após análise.');
            return;
        }

        console.log(`Preparando para atualizar ${updates.length} registros...`);

        // 2. Atualizar os registros em lote
        const { error: updateError } = await supabase
            .from('ordens_servico')
            .upsert(updates);

        if (updateError) {
            throw new Error(`Erro ao atualizar registros: ${updateError.message}`);
        }

        console.log(`Sucesso! ${updates.length} registros foram corrigidos.`);

    } catch (err) {
        console.error('Ocorreu um erro durante a execução do script:', err);
    }
}

fixIncorrectDates();