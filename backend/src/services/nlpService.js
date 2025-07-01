class NLPService {
  constructor() {
    // Dicionário de classificação baseado no documento
    this.classificationRules = {
      'Vazamentos': {
        keywords: ['vazamento', 'vazando', 'vaza', 'passagem', 'passou', 'passa'],
        subgroups: {
          'Vazamento de Fluido': {
            keywords: ['oleo', 'óleo', 'agua', 'água', 'combustivel', 'combustível', 'diesel', 'compressao', 'compressão'],
            subsubgroups: {
              'Óleo': {
                keywords: ['oleo', 'óleo', 'lubrificante']
              },
              'Água': {
                keywords: ['agua', 'água', 'radiador', 'arrefecimento']
              },
              'Combustível': {
                keywords: ['combustivel', 'combustível', 'diesel', 'gasolina']
              },
              'Compressão': {
                keywords: ['compressao', 'compressão', 'ar']
              }
            }
          }
        }
      },
      'Problemas de Funcionamento/Desempenho': {
        keywords: ['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha', 'travado', 'disparou', 'consumo'],
        subgroups: {
          'Superaquecimento': {
            keywords: ['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'temperatura'],
            subsubgroups: {
              'Geral': {
                keywords: ['aqueceu', 'aquecendo', 'esquentou']
              },
              'Com Perda de Água': {
                keywords: ['agua', 'água', 'radiador']
              },
              'Com Travamento': {
                keywords: ['travado', 'travou']
              }
            }
          },
          'Perda de Potência/Falha': {
            keywords: ['perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha', 'falhava'],
            subsubgroups: {
              'Geral': {
                keywords: ['perdeu', 'perda', 'potencia', 'potência']
              },
              'Com Fumaça': {
                keywords: ['fumaca', 'fumaça', 'sopra', 'soprando']
              },
              'Dificuldade de Partida': {
                keywords: ['nao pega', 'não pega', 'partida', 'dar partida']
              }
            }
          },
          'Alto Consumo': {
            keywords: ['consumo', 'consumindo', 'gastando', 'gasta'],
            subsubgroups: {
              'Consumo de Óleo': {
                keywords: ['oleo', 'óleo']
              },
              'Consumo de Combustível': {
                keywords: ['combustivel', 'combustível', 'diesel']
              }
            }
          }
        }
      },
      'Ruídos e Vibrações': {
        keywords: ['ruido', 'ruído', 'barulho', 'batendo', 'vibracao', 'vibração'],
        subgroups: {
          'Ruído Interno': {
            keywords: ['ruido', 'ruído', 'barulho', 'batendo'],
            subsubgroups: {
              'Mancal': {
                keywords: ['mancal', 'casquilho', 'rodou casquilho']
              },
              'Biela': {
                keywords: ['biela', 'parafuso de biela']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão']
              },
              'Válvula': {
                keywords: ['valvula', 'válvula']
              }
            }
          }
        }
      },
      'Quebra/Dano Estrutural': {
        keywords: ['quebrou', 'quebrada', 'quebrado', 'trincou', 'trinca', 'rachado', 'danificado', 'estourou', 'fratura'],
        subgroups: {
          'Quebra/Fratura': {
            keywords: ['quebrou', 'quebrada', 'quebrado', 'trincou', 'trinca', 'estourou'],
            subsubgroups: {
              'Virabrequim': {
                keywords: ['virabrequim', 'eixo']
              },
              'Biela': {
                keywords: ['biela']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão']
              },
              'Comando': {
                keywords: ['comando']
              },
              'Válvula': {
                keywords: ['valvula', 'válvula']
              },
              'Bloco': {
                keywords: ['bloco']
              },
              'Cabeçote': {
                keywords: ['cabecote', 'cabeçote']
              },
              'Camisa': {
                keywords: ['camisa']
              },
              'Junta': {
                keywords: ['junta']
              }
            }
          }
        }
      },
      'Problemas de Combustão/Exaustão': {
        keywords: ['fumaca', 'fumaça', 'sopra', 'soprando', 'respiro', 'suspiro'],
        subgroups: {
          'Fumaça Excessiva': {
            keywords: ['fumaca', 'fumaça'],
            subsubgroups: {
              'No Respiro': {
                keywords: ['respiro', 'suspiro']
              },
              'No Escapamento': {
                keywords: ['escapamento']
              },
              'Azul': {
                keywords: ['azul', 'oleo', 'óleo']
              },
              'Branca': {
                keywords: ['branca', 'agua', 'água']
              },
              'Preta': {
                keywords: ['preta', 'combustivel', 'combustível']
              }
            }
          }
        }
      },
      'Desgaste e Folga': {
        keywords: ['desgaste', 'desgastou', 'gastou', 'folga', 'folgas'],
        subgroups: {
          'Desgaste de Componentes': {
            keywords: ['desgaste', 'desgastou', 'gastou'],
            subsubgroups: {
              'Mancais': {
                keywords: ['mancal', 'mancais', 'casquilho']
              },
              'Camisas': {
                keywords: ['camisa', 'camisas']
              },
              'Anéis de Pistão': {
                keywords: ['anel', 'aneis', 'anéis']
              },
              'Válvulas': {
                keywords: ['valvula', 'válvula', 'valvulas', 'válvulas']
              }
            }
          }
        }
      },
      'Problemas de Lubrificação': {
        keywords: ['pressao', 'pressão', 'oleo', 'óleo', 'baixa pressao', 'baixa pressão'],
        subgroups: {
          'Baixa Pressão de Óleo': {
            keywords: ['baixa pressao', 'baixa pressão', 'pressao baixa', 'pressão baixa'],
            subsubgroups: {
              'Bomba de óleo com defeito': {
                keywords: ['bomba', 'bomba de oleo', 'bomba de óleo']
              },
              'Filtro de óleo obstruído': {
                keywords: ['filtro', 'filtro de oleo', 'filtro de óleo']
              },
              'Sensor de pressão com defeito': {
                keywords: ['sensor', 'interruptor', 'cebolinha']
              }
            }
          }
        }
      },
      'Erros de Montagem/Instalação': {
        keywords: ['montagem', 'instalacao', 'instalação', 'erro', 'errado', 'incorreto', 'danificado na montagem', 'matou'],
        subgroups: {
          'Componente Incompatível/Errado': {
            keywords: ['errado', 'incorreto', 'incompativel', 'incompatível'],
            subsubgroups: {
              'Filtro': {
                keywords: ['filtro']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão']
              },
              'Geral': {
                keywords: ['peca', 'peça', 'componente']
              }
            }
          },
          'Montagem Incorreta': {
            keywords: ['montagem', 'instalacao', 'instalação', 'danificado na montagem', 'matou'],
            subsubgroups: {
              'Geral': {
                keywords: ['montagem', 'instalacao', 'instalação']
              }
            }
          },
          'Erro de Análise/Diagnóstico': {
            keywords: ['erro de analise', 'erro de análise'],
            subsubgroups: {
              'Geral': {
                keywords: ['erro', 'analise', 'análise']
              }
            }
          }
        }
      }
    };
  }

  /**
   * Pré-processa o texto para classificação
   * @param {string} text - Texto a ser processado
   * @returns {string} Texto processado
   */
  preprocessText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();
  }

  /**
   * Verifica se alguma palavra-chave está presente no texto
   * @param {string} text - Texto a ser verificado
   * @param {Array} keywords - Array de palavras-chave
   * @returns {boolean} True se alguma palavra-chave for encontrada
   */
  containsKeywords(text, keywords) {
    return keywords.some(keyword => {
      const normalizedKeyword = this.preprocessText(keyword);
      return text.includes(normalizedKeyword);
    });
  }

  /**
   * Classifica um defeito em Grupo, Subgrupo e Subsubgrupo
   * @param {string} defectDescription - Descrição do defeito
   * @returns {Object} Classificação do defeito
   */
  classifyDefect(defectDescription) {
    if (!defectDescription) {
      return {
        grupo: 'Não Classificado',
        subgrupo: 'Não Classificado',
        subsubgrupo: 'Não Classificado',
        confianca: 0
      };
    }

    const processedText = this.preprocessText(defectDescription);
    
    // Buscar por grupos
    for (const [groupName, groupData] of Object.entries(this.classificationRules)) {
      if (this.containsKeywords(processedText, groupData.keywords)) {
        
        // Buscar por subgrupos
        for (const [subgroupName, subgroupData] of Object.entries(groupData.subgroups || {})) {
          if (this.containsKeywords(processedText, subgroupData.keywords)) {
            
            // Buscar por subsubgrupos
            for (const [subsubgroupName, subsubgroupData] of Object.entries(subgroupData.subsubgroups || {})) {
              if (this.containsKeywords(processedText, subsubgroupData.keywords)) {
                return {
                  grupo: groupName,
                  subgrupo: subgroupName,
                  subsubgrupo: subsubgroupName,
                  confianca: 0.9
                };
              }
            }
            
            return {
              grupo: groupName,
              subgrupo: subgroupName,
              subsubgrupo: 'Geral',
              confianca: 0.7
            };
          }
        }
        
        return {
          grupo: groupName,
          subgrupo: 'Geral',
          subsubgrupo: 'Geral',
          confianca: 0.5
        };
      }
    }

    return {
      grupo: 'Não Classificado',
      subgrupo: 'Não Classificado',
      subsubgrupo: 'Não Classificado',
      confianca: 0
    };
  }

  /**
   * Classifica múltiplos defeitos
   * @param {Array} defects - Array de descrições de defeitos
   * @returns {Array} Array de classificações
   */
  classifyMultipleDefects(defects) {
    return defects.map(defect => ({
      original: defect,
      classificacao: this.classifyDefect(defect)
    }));
  }
}

module.exports = NLPService;

