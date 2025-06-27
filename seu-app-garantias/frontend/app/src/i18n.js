import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      'Dashboard de Garantias': 'Dashboard de Garantias',
      'Análise de Garantias': 'Análise de Garantias',
      'Análise de ordens de serviço': 'Análise de ordens de serviço',
      'Total de OS': 'Total de OS',
      'Total Peças': 'Total Peças',
      'Total Serviços': 'Total Serviços',
      'Total Geral': 'Total Geral',
      'Mecânicos Ativos': 'Mecânicos Ativos',
      'Tipos de Defeitos': 'Tipos de Defeitos',
      'Dados indisponíveis': 'Dados indisponíveis',
      'Descrição': 'Descrição',
      'Buscar ordens, defeitos...': 'Buscar ordens, defeitos...'
    }
  },
  en: {
    translation: {
      'Dashboard de Garantias': 'Warranty Dashboard',
      'Análise de Garantias': 'Warranty Analysis',
      'Análise de ordens de serviço': 'Service Order Analysis',
      'Total de OS': 'Total OS',
      'Total Peças': 'Total Parts',
      'Total Serviços': 'Total Services',
      'Total Geral': 'Total Amount',
      'Mecânicos Ativos': 'Active Mechanics',
      'Tipos de Defeitos': 'Defect Types',
      'Dados indisponíveis': 'Data unavailable',
      'Descrição': 'Description',
      'Buscar ordens, defeitos...': 'Search orders, defects...'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 