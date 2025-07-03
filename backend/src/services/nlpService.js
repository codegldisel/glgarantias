class NLPService {
  constructor() {
    // Dicionário de classificação baseado no documento
    this.classificationRules = {
      'Vazamentos': {
        keywords: ['vazamento', 'vazando', 'vaza', 'passagem', 'passou', 'passa', 'pingando', 'escorrendo', 'molhado', 'gota', 'gotas', 'esguichando'],
        subgroups: {
          'Vazamento de Fluido': {
            keywords: ['oleo', 'óleo', 'agua', 'água', 'combustivel', 'combustível', 'diesel', 'compressao', 'compressão', 'liquido', 'fluido', 'ar', 'aditivo', 'refrigerante'],
            subsubgroups: {
              'Óleo': {
                keywords: ['oleo', 'óleo', 'lubrificante', 'motor', 'carter', 'retentor', 'junta', 'selo', 'respiro', 'tampa de valvula', 'tampa de válvulas', 'bujão']
              },
              'Água': {
                keywords: ['agua', 'água', 'radiador', 'arrefecimento', 'mangueira', 'bomba d agua', 'bomba de água', 'selo mecanico', 'selo mecânico', 'reservatorio', 'reservatório', 'vaso de expansão']
              },
              'Combustível': {
                keywords: ['combustivel', 'combustível', 'diesel', 'gasolina', 'bico', 'bomba injetora', 'linha de combustivel', 'tanque']
              },
              'Compressão': {
                keywords: ['compressao', 'compressão', 'ar', 'valvula', 'válvula', 'anel', 'aneis', 'pistao', 'pistão', 'junta de cabeçote', 'cilindro']
              }
            }
          }
        }
      },
      'Problemas de Funcionamento/Desempenho': {
        keywords: ['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha', 'travado', 'disparou', 'consumo', 'fraco', 'sem força', 'nao liga', 'não liga', 'engasgando', 'morrendo', 'corte', 'cortando', 'oscilando', 'irregular', 'lento', 'pesado', 'nao desenvolve', 'não desenvolve', 'nao pega', 'não pega', 'dificuldade ligar', 'nao da partida', 'falhando', 'rateando', 'aceleracao', 'aceleração', 'lenta', 'alta', 'baixa'],
        subgroups: {
          'Superaquecimento': {
            keywords: ['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'temperatura', 'fervendo', 'super aqueceu', 'superaquecendo', 'superaquecimento'],
            subsubgroups: {
              'Geral': {
                keywords: ['aqueceu', 'aquecendo', 'esquentou', 'temperatura']
              },
              'Com Perda de Água': {
                keywords: ['agua', 'água', 'radiador', 'vazamento agua', 'vazamento água', 'fervendo agua']
              },
              'Com Travamento': {
                keywords: ['travado', 'travou', 'fundiu', 'motor travado', 'agarrou']
              }
            }
          },
          'Perda de Potência/Falha': {
            keywords: ['perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha', 'falhava', 'fraco', 'sem força', 'nao desenvolve', 'não desenvolve', 'engasgando', 'morrendo', 'corte', 'cortando', 'falhando', 'rateando', 'oscilando', 'irregular', 'lento', 'pesado'],
            subsubgroups: {
              'Geral': {
                keywords: ['perdeu', 'perda', 'potencia', 'potência', 'falha', 'falhava', 'fraco', 'sem força']
              },
              'Com Fumaça': {
                keywords: ['fumaca', 'fumaça', 'sopra', 'soprando', 'fumando']
              },
              'Dificuldade de Partida': {
                keywords: ['nao pega', 'não pega', 'partida', 'dar partida', 'dificuldade ligar', 'nao da partida', 'nao liga', 'não liga']
              }
            }
          },
          'Alto Consumo': {
            keywords: ['consumo', 'consumindo', 'gastando', 'gasta', 'alto consumo'],
            subsubgroups: {
              'Consumo de Óleo': {
                keywords: ['oleo', 'óleo', 'consumo oleo', 'baixando oleo']
              },
              'Consumo de Combustível': {
                keywords: ['combustivel', 'combustível', 'diesel', 'gasolina', 'consumo combustivel', 'gastando muito']
              }
            }
          }
        }
      },
      'Ruídos e Vibrações': {
        keywords: ['ruido', 'ruído', 'barulho', 'batendo', 'vibracao', 'vibração', 'grilando', 'estalando', 'chiado', 'rangido', 'assobio', 'zumbido', 'clique', 'estalido'],
        subgroups: {
          'Ruído Interno': {
            keywords: ['ruido', 'ruído', 'barulho', 'batendo', 'grilando', 'estalando', 'interno', 'dentro do motor'],
            subsubgroups: {
              'Mancal': {
                keywords: ['mancal', 'casquilho', 'rodou casquilho', 'bronzina', 'mancal batendo']
              },
              'Biela': {
                keywords: ['biela', 'parafuso de biela', 'pino de biela', 'biela batendo']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'saia do pistao', 'pistao batendo']
              },
              'Válvula': {
                keywords: ['valvula', 'válvula', 'tucho', 'balancim', 'valvula batendo']
              },
              'Virabrequim': {
                keywords: ['virabrequim', 'eixo', 'virabrequim batendo']
              }
            }
          },
          'Ruído Externo': {
            keywords: ['chiado', 'rangido', 'correia', 'alternador', 'bomba hidraulica', 'externo', 'fora do motor', 'assobio', 'zumbido'],
            subsubgroups: {
              'Correia': {
                keywords: ['correia', 'esticador', 'chiado correia']
              },
              'Alternador': {
                keywords: ['alternador', 'barulho alternador']
              },
              'Bomba Hidráulica': {
                keywords: ['bomba hidraulica', 'direcao hidraulica', 'barulho bomba hidraulica']
              }
            }
          }
        }
      },
      'Quebra/Dano Estrutural': {
        keywords: ['quebrou', 'quebrada', 'quebrado', 'trincou', 'trinca', 'rachado', 'danificado', 'estourou', 'fratura', 'partiu', 'empenou', 'deformou', 'rompeu', 'desgastado', 'riscado', 'arranhado', 'ovalizado', 'fissura', 'fissurado'],
        subgroups: {
          'Quebra/Fratura': {
            keywords: ['quebrou', 'quebrada', 'quebrado', 'trincou', 'trinca', 'estourou', 'partiu', 'fratura', 'rompeu', 'rachou'],
            subsubgroups: {
              'Virabrequim': {
                keywords: ['virabrequim', 'eixo', 'quebrou vira', 'partiu vira']
              },
              'Biela': {
                keywords: ['biela', 'quebrou biela', 'partiu biela']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'quebrou pistao', 'partiu pistao']
              },
              'Comando': {
                keywords: ['comando', 'quebrou comando', 'partiu comando']
              },
              'Válvula': {
                keywords: ['valvula', 'válvula', 'quebrou valvula', 'partiu valvula']
              },
              'Bloco': {
                keywords: ['bloco', 'trincou bloco', 'rachou bloco', 'quebrou bloco']
              },
              'Cabeçote': {
                keywords: ['cabecote', 'cabeçote', 'trincou cabecote', 'rachou cabecote', 'quebrou cabecote']
              },
              'Camisa': {
                keywords: ['camisa', 'quebrou camisa', 'camisa trincada']
              },
              'Junta': {
                keywords: ['junta', 'quebrou junta', 'junta queimada', 'estourou junta']
              }
            }
          },
          'Dano por Empenamento/Deformação': {
            keywords: ['empenou', 'deformou', 'torto', 'curvo', 'ovalizado'],
            subsubgroups: {
              'Cabeçote': {
                keywords: ['cabecote', 'cabeçote', 'empenou cabecote', 'cabeçote empenado']
              },
              'Virabrequim': {
                keywords: ['virabrequim', 'eixo', 'empenou vira', 'virabrequim empenado']
              },
              'Biela': {
                keywords: ['biela', 'empenou biela', 'biela empenada']
              }
            }
          }
        }
      },
      'Problemas de Combustão/Exaustão': {
        keywords: ['fumaca', 'fumaça', 'sopra', 'soprando', 'respiro', 'suspiro', 'escapamento', 'carbonizacao', 'carbonização', 'carbonizado', 'carbono', 'exaustor', 'entupido', 'obstruido', 'obstruído'],
        subgroups: {
          'Fumaça Excessiva': {
            keywords: ['fumaca', 'fumaça', 'sopra', 'soprando', 'fumando'],
            subsubgroups: {
              'No Respiro': {
                keywords: ['respiro', 'suspiro', 'fumaça respiro', 'soprando respiro']
              },
              'No Escapamento': {
                keywords: ['escapamento', 'fumaça escapamento', 'soprando escapamento']
              },
              'Azul': {
                keywords: ['azul', 'oleo', 'óleo', 'fumaça azul']
              },
              'Branca': {
                keywords: ['branca', 'agua', 'água', 'fumaça branca']
              },
              'Preta': {
                keywords: ['preta', 'combustivel', 'combustível', 'fumaça preta']
              }
            }
          },
          'Carbonização': {
            keywords: ['carbonizacao', 'carbonização', 'carbonizado', 'carbono'],
            subsubgroups: {
              'Válvulas': {
                keywords: ['valvula', 'válvula', 'carbonizacao valvula']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'carbonizacao pistao']
              }
            }
          },
          'Obstrução/Entupimento': {
            keywords: ['entupido', 'obstruido', 'obstruído', 'carbonizado', 'sujo'],
            subsubgroups: {
              'Exaustor': {
                keywords: ['exaustor', 'exaustor entupido']
              },
              'Filtro': {
                keywords: ['filtro', 'filtro entupido', 'filtro sujo']
              }
            }
          }
        }
      },
      'Desgaste e Folga': {
        keywords: ['desgaste', 'desgastou', 'gastou', 'folga', 'folgas', 'ovalizado', 'riscado', 'arranhado', 'gripado', 'apertado', 'preso', 'emperrado'],
        subgroups: {
          'Desgaste de Componentes': {
            keywords: ['desgaste', 'desgastou', 'gastou', 'ovalizado', 'riscado', 'arranhado', 'gripado'],
            subsubgroups: {
              'Mancais': {
                keywords: ['mancal', 'mancais', 'casquilho', 'desgaste mancal', 'bronzina']
              },
              'Camisas': {
                keywords: ['camisa', 'camisas', 'desgaste camisa', 'camisa riscada', 'camisa ovalizada']
              },
              'Anéis de Pistão': {
                keywords: ['anel', 'aneis', 'anéis', 'desgaste anel', 'anel gasto']
              },
              'Válvulas': {
                keywords: ['valvula', 'válvula', 'valvulas', 'válvulas', 'desgaste valvula', 'valvula gasta']
              },
              'Virabrequim': {
                keywords: ['virabrequim', 'eixo', 'desgaste virabrequim', 'virabrequim riscado']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'desgaste pistao', 'pistao gasto']
              }
            }
          },
          'Folga Excessiva': {
            keywords: ['folga', 'folgas', 'folga excessiva', 'folgado'],
            subsubgroups: {
              'Mancais': {
                keywords: ['mancal', 'mancais', 'folga mancal']
              },
              'Biela': {
                keywords: ['biela', 'folga biela']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'folga pistao']
              },
              'Virabrequim': {
                keywords: ['virabrequim', 'eixo', 'folga virabrequim']
              },
              'Polia': {
                keywords: ['polia', 'folga polia']
              }
            }
          },
          'Componente Preso/Apertado': {
            keywords: ['preso', 'apertado', 'emperrado', 'travado', 'prendendo'],
            subsubgroups: {
              'Eixo': {
                keywords: ['eixo', 'eixo preso', 'eixo travado', 'prendendo eixo']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'pistao preso']
              }
            }
          }
        }
      },
      'Problemas de Lubrificação': {
        keywords: ['pressao', 'pressão', 'oleo', 'óleo', 'baixa pressao', 'baixa pressão', 'sem pressao', 'sem pressão', 'bomba de oleo', 'bomba de óleo', 'filtro de oleo', 'filtro de óleo', 'nivel de oleo', 'nível de óleo', 'falta de oleo', 'falta de óleo'],
        subgroups: {
          'Baixa Pressão de Óleo': {
            keywords: ['baixa pressao', 'baixa pressão', 'pressao baixa', 'pressão baixa', 'sem pressao', 'sem pressão', 'luz de oleo acesa', 'luz de óleo acesa'],
            subsubgroups: {
              'Bomba de óleo com defeito': {
                keywords: ['bomba', 'bomba de oleo', 'bomba de óleo', 'bomba oleo', 'bomba de oleo com defeito']
              },
              'Filtro de óleo obstruído': {
                keywords: ['filtro', 'filtro de oleo', 'filtro de óleo', 'filtro sujo', 'filtro obstruido']
              },
              'Sensor de pressão com defeito': {
                keywords: ['sensor', 'interruptor', 'cebolinha', 'sensor oleo', 'sensor de pressão']
              },
              'Falta de Óleo': {
                keywords: ['falta de oleo', 'falta de óleo', 'nivel baixo', 'nível baixo']
              },
              'Geral': {
                keywords: ['lubrificacao', 'lubrificação', 'problema oleo', 'problema de lubrificacao']
              }
            }
          }
        }
      },
      'Erros de Montagem/Instalação': {
        keywords: ['montagem', 'instalacao', 'instalação', 'erro', 'errado', 'incorreto', 'danificado na montagem', 'matou', 'mal montado', 'mal instalado', 'trocado', 'desalinhado', 'apertado demais', 'frouxo', 'incompativel', 'incompatível', 'mal encaixado', 'mal ajustado'],
        subgroups: {
          'Componente Incompatível/Errado': {
            keywords: ['errado', 'incorreto', 'incompativel', 'incompatível', 'peca errada', 'peça errada', 'componente errado', 'trocado'],
            subsubgroups: {
              'Filtro': {
                keywords: ['filtro', 'filtro errado']
              },
              'Pistão': {
                keywords: ['pistao', 'pistão', 'pistao errado']
              },
              'Geral': {
                keywords: ['peca', 'peça', 'componente', 'incompativel', 'item errado']
              }
            }
          },
          'Montagem Incorreta': {
            keywords: ['montagem', 'instalacao', 'instalação', 'danificado na montagem', 'matou', 'mal montado', 'mal instalado', 'apertado demais', 'frouxo', 'desalinhado', 'mal encaixado', 'mal ajustado', 'junta torta'],
            subsubgroups: {
              'Geral': {
                keywords: ['montagem', 'instalacao', 'instalação', 'mal montado', 'mal instalado']
              },
              'Junta': {
                keywords: ['junta', 'junta mal montada', 'junta torta']
              },
              'Cabeçote': {
                keywords: ['cabecote', 'cabeçote', 'cabeçote mal montado']
              }
            }
          },
          'Erro de Análise/Diagnóstico': {
            keywords: ['erro de analise', 'erro de análise', 'diagnostico errado', 'diagnóstico errado', 'avaliação precipitada'],
            subsubgroups: {
              'Geral': {
                keywords: ['erro', 'analise', 'análise', 'diagnostico', 'diagnóstico']
              }
            }
          }
        }
      },
      'Outros': {
        keywords: ['geral', 'diversos', 'outros', 'varios', 'vários', 'nao especificado', 'não especificado', 'revisao', 'revisão', 'manutencao', 'manutenção', 'eletrico', 'elétrico', 'hidraulico', 'hidráulico', 'compressor', 'freio', 'direcao', 'direção', 'suspensao', 'suspensão', 'pneu', 'pneus', 'roda', 'rodas', 'chassi', 'carroceria', 'acessorios', 'acessórios', 'limpeza', 'ajuste', 'regulagem', 'alinhamento', 'balanceamento', 'teste', 'testes', 'orcamento', 'orçamento', 'servico', 'serviço', 'patio', 'pátio', 'cortesia', 'defeito', 'problema'],
        subgroups: {
          'Manutenção Geral': {
            keywords: ['manutencao', 'manutenção', 'revisao', 'revisão', 'preventiva', 'ajuste', 'regulagem', 'alinhamento', 'balanceamento', 'limpeza']
          },
          'Problema Elétrico': {
            keywords: ['eletrico', 'elétrico', 'fio', 'sensor', 'modulo', 'módulo', 'bateria', 'alternador', 'motor de partida', 'chicote']
          },
          'Problema Hidráulico': {
            keywords: ['hidraulico', 'hidráulico', 'bomba', 'cilindro', 'mangueira', 'direcao hidraulica', 'freio hidraulico']
          },
          'Problemas de Componentes Externos': {
            keywords: ['compressor', 'freio', 'direcao', 'direção', 'suspensao', 'suspensão', 'pneu', 'pneus', 'roda', 'rodas', 'chassi', 'carroceria', 'acessorios', 'acessórios']
          },
          'Serviços Administrativos/Não Defeito': {
            keywords: ['orcamento', 'orçamento', 'servico', 'serviço', 'patio', 'pátio', 'cortesia', 'teste', 'testes', 'cotacao', 'cotação', 'exclusiva', 'documentacao', 'documentação', 'referencia', 'referência']
          },
          'Defeito Genérico': {
            keywords: ['defeito', 'problema', 'nao funciona', 'não funciona', 'parou de funcionar', 'que nao procede', 'deu problema']
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
      // Use a regex para garantir que a palavra-chave seja encontrada como uma palavra inteira
      // ou parte de uma palavra, dependendo da necessidade. Aqui, buscando como substring.
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


