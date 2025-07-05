class NLPService {
  constructor() {
    // Dicionário de classificação expandido e aprimorado
    this.classificationRules = {
      'Vazamentos': {
        keywords: ['vazamento', 'vazando', 'vaza', 'passagem', 'passou', 'passa', 'pingando', 'escorrendo', 'molhado', 'gota', 'gotas', 'esguichando', 'gotejando', 'derramando', 'saindo', 'perdendo', 'molhou'],
        subgroups: {
          'Vazamento de Fluido': {
            keywords: ['oleo', 'óleo', 'agua', 'água', 'combustivel', 'combustível', 'diesel', 'compressao', 'compressão', 'liquido', 'fluido', 'ar', 'aditivo', 'refrigerante', 'lubrificante', 'gasolina'],
            subsubgroups: {
              'Óleo': {
                keywords: ['oleo', 'óleo', 'lubrificante', 'motor', 'carter', 'retentor', 'junta', 'selo', 'respiro', 'tampa de valvula', 'tampa de válvulas', 'bujão', 'dreno', 'filtro oleo', 'bomba oleo']
              },
              'Água': {
                keywords: ['agua', 'água', 'radiador', 'arrefecimento', 'mangueira', 'bomba d agua', 'bomba de água', 'selo mecanico', 'selo mecânico', 'reservatorio', 'reservatório', 'vaso de expansão', 'intercooler', 'refrigeracao']
              },
              'Combustível': {
                keywords: ['combustivel', 'combustível', 'diesel', 'gasolina', 'bico', 'bomba injetora', 'linha de combustivel', 'tanque', 'filtro combustivel', 'injetor', 'common rail']
              },
              'Compressão': {
                keywords: ['compressao', 'compressão', 'ar', 'valvula', 'válvula', 'anel', 'aneis', 'pistao', 'pistão', 'junta de cabeçote', 'cilindro', 'camisa', 'sede valvula']
              }
            }
          }
        }
      },
      'Problemas de Funcionamento/Desempenho': {
        keywords: ['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha', 'travado', 'disparou', 'consumo', 'fraco', 'sem força', 'nao liga', 'não liga', 'engasgando', 'morrendo', 'corte', 'cortando', 'oscilando', 'irregular', 'lento', 'pesado', 'nao desenvolve', 'não desenvolve', 'nao pega', 'não pega', 'dificuldade ligar', 'nao da partida', 'falhando', 'rateando', 'aceleracao', 'aceleração', 'lenta', 'alta', 'baixa', 'fundiu', 'agarrou', 'travou', 'emperrou', 'parou', 'morreu'],
        subgroups: {
          'Superaquecimento': {
            keywords: ['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'temperatura', 'fervendo', 'super aqueceu', 'superaquecendo', 'superaquecimento', 'muito quente', 'alta temperatura'],
            subsubgroups: {
              'Geral': {
                keywords: ['aqueceu', 'aquecendo', 'esquentou', 'temperatura', 'muito quente']
              },
              'Com Perda de Água': {
                keywords: ['agua', 'água', 'radiador', 'vazamento agua', 'vazamento água', 'fervendo agua', 'perdeu agua']
              },
              'Com Travamento': {
                keywords: ['travado', 'travou', 'fundiu', 'motor travado', 'agarrou', 'emperrou', 'gripou']
              }
            }
          },
          'Perda de Potência/Falha': {
            keywords: ['perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha', 'falhava', 'fraco', 'sem força', 'nao desenvolve', 'não desenvolve', 'engasgando', 'morrendo', 'corte', 'cortando', 'falhando', 'rateando', 'oscilando', 'irregular', 'lento', 'pesado', 'sem rendimento', 'baixo rendimento'],
            subsubgroups: {
              'Geral': {
                keywords: ['perdeu', 'perda', 'potencia', 'potência', 'falha', 'falhava', 'fraco', 'sem força', 'sem rendimento']
              },
              'Com Fumaça': {
                keywords: ['fumaca', 'fumaça', 'fumegando', 'fumando', 'fumo', 'fumacenta']
              },
              'Dificuldade de Partida': {
                keywords: ['nao liga', 'não liga', 'nao pega', 'não pega', 'dificuldade ligar', 'nao da partida', 'partida dificil', 'custa pegar']
              }
            }
          },
          'Problemas de Combustão': {
            keywords: ['combustao', 'combustão', 'queima', 'mistura', 'injecao', 'injeção', 'alimentacao', 'alimentação', 'ar', 'filtro ar', 'turbo', 'intercooler'],
            subsubgroups: {
              'Sistema de Alimentação': {
                keywords: ['alimentacao', 'alimentação', 'combustivel', 'combustível', 'bomba injetora', 'bico injetor', 'filtro combustivel']
              },
              'Sistema de Ar': {
                keywords: ['ar', 'filtro ar', 'turbo', 'turbina', 'intercooler', 'admissao', 'admissão', 'coletor admissao']
              }
            }
          }
        }
      },
      'Ruídos e Vibrações': {
        keywords: ['ruido', 'ruído', 'barulho', 'batendo', 'batida', 'vibracao', 'vibração', 'vibrando', 'tremendo', 'chacoalhando', 'rangendo', 'chiando', 'assobiando', 'zunindo', 'estralando', 'batucada', 'pancada', 'som', 'estrondo', 'ronco', 'gemendo', 'guinchando'],
        subgroups: {
          'Ruído do Motor': {
            keywords: ['ruido motor', 'ruído motor', 'barulho motor', 'batendo motor', 'ronco motor', 'som motor', 'motor fazendo ruido', 'motor fazendo ruído'],
            subsubgroups: {
              'Ruído Interno': {
                keywords: ['biela', 'pistao', 'pistão', 'valvula', 'válvula', 'comando', 'tuchos', 'balancim', 'eixo comando']
              },
              'Ruído Externo': {
                keywords: ['correia', 'polia', 'alternador', 'bomba agua', 'bomba direção', 'compressor ar']
              }
            }
          },
          'Vibração Excessiva': {
            keywords: ['vibracao', 'vibração', 'vibrando', 'tremendo', 'chacoalhando', 'balancando', 'trepidacao', 'trepidação'],
            subsubgroups: {
              'Vibração do Motor': {
                keywords: ['motor vibrando', 'motor tremendo', 'vibracao motor', 'vibração motor']
              },
              'Vibração da Transmissão': {
                keywords: ['cambio', 'câmbio', 'transmissao', 'transmissão', 'embreagem', 'volante motor']
              }
            }
          }
        }
      },
      'Problemas Elétricos': {
        keywords: ['eletrico', 'elétrico', 'eletrica', 'elétrica', 'bateria', 'alternador', 'motor de partida', 'chicote', 'fio', 'cabo', 'sensor', 'modulo', 'módulo', 'ecu', 'injecao eletronica', 'injeção eletrônica', 'luz', 'lampada', 'lâmpada', 'painel', 'rele', 'relé', 'fusivel', 'fusível'],
        subgroups: {
          'Sistema de Carga': {
            keywords: ['bateria', 'alternador', 'carga', 'carregando', 'descarregando', 'voltagem', 'tensao', 'tensão'],
            subsubgroups: {
              'Bateria': {
                keywords: ['bateria', 'descarregada', 'viciada', 'sulfatada', 'sem carga']
              },
              'Alternador': {
                keywords: ['alternador', 'nao carrega', 'não carrega', 'sem carga', 'baixa voltagem']
              }
            }
          },
          'Sistema de Partida': {
            keywords: ['motor de partida', 'partida', 'arranque', 'bendix', 'solenoide'],
            subsubgroups: {
              'Motor de Partida': {
                keywords: ['motor de partida', 'motor partida', 'arranque', 'nao gira', 'não gira']
              }
            }
          },
          'Injeção Eletrônica': {
            keywords: ['injecao eletronica', 'injeção eletrônica', 'ecu', 'modulo', 'módulo', 'sensor', 'chicote', 'scanner'],
            subsubgroups: {
              'Sensores': {
                keywords: ['sensor', 'sonda lambda', 'sensor temperatura', 'sensor pressao', 'sensor rotacao']
              },
              'Módulo/ECU': {
                keywords: ['ecu', 'modulo', 'módulo', 'central', 'chicote', 'fio', 'cabo']
              }
            }
          }
        }
      },
      'Problemas de Refrigeração': {
        keywords: ['refrigeracao', 'refrigeração', 'arrefecimento', 'radiador', 'ventoinha', 'bomba agua', 'bomba de água', 'termostato', 'mangueira', 'reservatorio', 'reservatório', 'intercooler', 'temperatura'],
        subgroups: {
          'Sistema de Arrefecimento': {
            keywords: ['radiador', 'bomba agua', 'bomba de água', 'termostato', 'mangueira', 'reservatorio', 'reservatório', 'vaso expansao'],
            subsubgroups: {
              'Radiador': {
                keywords: ['radiador', 'entupido', 'obstruido', 'obstruído', 'furado', 'vazando']
              },
              'Bomba d\'Água': {
                keywords: ['bomba agua', 'bomba de água', 'bomba d agua', 'selo mecanico', 'selo mecânico', 'rolamento bomba']
              },
              'Termostato': {
                keywords: ['termostato', 'valvula termostatica', 'válvula termostática', 'nao abre', 'não abre', 'travado']
              }
            }
          },
          'Ventilação': {
            keywords: ['ventoinha', 'eletroventilador', 'helice', 'hélice', 'correia ventoinha'],
            subsubgroups: {
              'Ventoinha': {
                keywords: ['ventoinha', 'eletroventilador', 'nao liga', 'não liga', 'quebrada']
              }
            }
          }
        }
      },
      'Problemas de Lubrificação': {
        keywords: ['lubrificacao', 'lubrificação', 'oleo', 'óleo', 'bomba oleo', 'bomba de óleo', 'filtro oleo', 'filtro de óleo', 'pressao oleo', 'pressão óleo', 'carter', 'respiro'],
        subgroups: {
          'Sistema de Óleo': {
            keywords: ['oleo', 'óleo', 'bomba oleo', 'bomba de óleo', 'filtro oleo', 'filtro de óleo', 'pressao oleo', 'pressão óleo'],
            subsubgroups: {
              'Bomba de Óleo': {
                keywords: ['bomba oleo', 'bomba de óleo', 'pressao baixa', 'pressão baixa', 'sem pressao', 'sem pressão']
              },
              'Filtro de Óleo': {
                keywords: ['filtro oleo', 'filtro de óleo', 'entupido', 'sujo', 'obstruido', 'obstruído']
              }
            }
          }
        }
      },
      'Problemas de Transmissão': {
        keywords: ['cambio', 'câmbio', 'transmissao', 'transmissão', 'embreagem', 'volante', 'platô', 'disco', 'rolamento', 'sincronizador', 'marcha', 'engrenagem'],
        subgroups: {
          'Embreagem': {
            keywords: ['embreagem', 'platô', 'disco embreagem', 'disco de embreagem', 'rolamento embreagem', 'patinando', 'escorregando'],
            subsubgroups: {
              'Disco de Embreagem': {
                keywords: ['disco embreagem', 'disco de embreagem', 'patinando', 'escorregando', 'gasto', 'queimado']
              },
              'Platô': {
                keywords: ['platô', 'plato', 'molas platô', 'molas plato', 'dedos platô']
              }
            }
          },
          'Caixa de Câmbio': {
            keywords: ['cambio', 'câmbio', 'caixa cambio', 'caixa de câmbio', 'marcha', 'engrenagem', 'sincronizador'],
            subsubgroups: {
              'Sincronizadores': {
                keywords: ['sincronizador', 'sincrono', 'síncrono', 'marcha dura', 'nao entra marcha', 'não entra marcha']
              },
              'Engrenagens': {
                keywords: ['engrenagem', 'dente quebrado', 'dente gasto', 'marcha saltando']
              }
            }
          }
        }
      },
      'Desgaste/Manutenção': {
        keywords: ['desgaste', 'gasto', 'usado', 'vencido', 'fim de vida', 'manutencao', 'manutenção', 'preventiva', 'corretiva', 'troca', 'substituicao', 'substituição', 'revisao', 'revisão', 'ajuste', 'regulagem'],
        subgroups: {
          'Desgaste Natural': {
            keywords: ['desgaste', 'gasto', 'usado', 'fim de vida', 'vencido', 'normal', 'natural'],
            subsubgroups: {
              'Peças de Desgaste': {
                keywords: ['pastilha', 'lona', 'disco freio', 'tambor', 'correia', 'filtro', 'vela', 'cabo vela']
              }
            }
          },
          'Manutenção Preventiva': {
            keywords: ['manutencao', 'manutenção', 'preventiva', 'revisao', 'revisão', 'troca oleo', 'troca de óleo', 'filtros'],
            subsubgroups: {
              'Troca de Fluidos': {
                keywords: ['troca oleo', 'troca de óleo', 'oleo vencido', 'óleo vencido', 'fluido freio', 'agua radiador']
              },
              'Troca de Filtros': {
                keywords: ['filtro ar', 'filtro combustivel', 'filtro oleo', 'filtro cabine']
              }
            }
          }
        }
      }
    };
  }

  // Função para pré-processar o texto
  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim();
  }

  // Função para verificar se uma palavra-chave está presente no texto
  containsKeyword(text, keyword) {
    const processedText = this.preprocessText(text);
    const processedKeyword = this.preprocessText(keyword);
    
    // Verifica se a palavra-chave está presente como palavra completa ou parte de palavra
    return processedText.includes(processedKeyword);
  }

  // Função principal de classificação
  classifyDefect(defectText) {
    if (!defectText || typeof defectText !== 'string') {
      return {
        grupo: 'Não Classificado',
        subgrupo: 'Não Classificado',
        subsubgrupo: 'Não Classificado',
        confianca: 0
      };
    }

    const processedText = this.preprocessText(defectText);
    
    // Buscar por grupos
    for (const [groupName, groupData] of Object.entries(this.classificationRules)) {
      // Verificar se alguma palavra-chave do grupo está presente
      const groupMatch = groupData.keywords.some(keyword => 
        this.containsKeyword(processedText, keyword)
      );
      
      if (groupMatch) {
        // Buscar por subgrupos
        for (const [subgroupName, subgroupData] of Object.entries(groupData.subgroups || {})) {
          const subgroupMatch = subgroupData.keywords.some(keyword => 
            this.containsKeyword(processedText, keyword)
          );
          
          if (subgroupMatch) {
            // Buscar por subsubgrupos
            for (const [subsubgroupName, subsubgroupData] of Object.entries(subgroupData.subsubgroups || {})) {
              const subsubgroupMatch = subsubgroupData.keywords.some(keyword => 
                this.containsKeyword(processedText, keyword)
              );
              
              if (subsubgroupMatch) {
                return {
                  grupo: groupName,
                  subgrupo: subgroupName,
                  subsubgrupo: subsubgroupName,
                  confianca: 0.9
                };
              }
            }
            
            // Se encontrou subgrupo mas não subsubgrupo
            return {
              grupo: groupName,
              subgrupo: subgroupName,
              subsubgrupo: 'Geral',
              confianca: 0.7
            };
          }
        }
        
        // Se encontrou grupo mas não subgrupo
        return {
          grupo: groupName,
          subgrupo: 'Geral',
          subsubgrupo: 'Geral',
          confianca: 0.5
        };
      }
    }
    
    // Se não encontrou nenhuma classificação
    return {
      grupo: 'Não Classificado',
      subgrupo: 'Não Classificado',
      subsubgrupo: 'Não Classificado',
      confianca: 0
    };
  }

  // Função para classificar múltiplos defeitos
  classifyMultipleDefects(defects) {
    return defects.map(defect => ({
      original: defect,
      classificacao: this.classifyDefect(defect)
    }));
  }
}

module.exports = NLPService;

