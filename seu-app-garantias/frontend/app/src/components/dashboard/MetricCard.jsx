import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

/**
 * Componente MetricCard - Exibe métricas em formato de card
 * @param {string} title - Título da métrica
 * @param {string|number} value - Valor da métrica
 * @param {React.Component} icon - Ícone da métrica
 * @param {string} trend - Tendência ('up', 'down', ou undefined)
 * @param {string} trendValue - Valor da tendência
 * @param {string} description - Descrição da métrica
 * @param {boolean} hasError - Indica se há erro na métrica
 */
const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  description, 
  hasError = false 
}) => {
  const { t } = useTranslation()

  // Função para obter o ícone de tendência
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '\u2197'
      case 'down': return '\u2198'
      default: return '\u2192'
    }
  }

  // Função para obter a cor da tendência
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${hasError ? 'opacity-60' : ''}`} 
      tabIndex={0} 
      role="region" 
      aria-label={t(title)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t(title)}
        </CardTitle>
        {Icon && (
          <Icon 
            className={`h-4 w-4 ${hasError ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} 
            aria-hidden="true" 
          />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${hasError ? 'text-muted-foreground' : 'text-foreground'}`}>
          {hasError ? '---' : value}
        </div>
        {trend && !hasError && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <span className={getTrendColor(trend)}>
              {getTrendIcon(trend)} {trendValue}
            </span>
            <span>vs mês anterior</span>
          </div>
        )}
        {description && (
          <p className={`text-xs mt-1 ${hasError ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
            {hasError ? t('Dados indisponíveis') : t(description)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  description: PropTypes.string,
  hasError: PropTypes.bool
}

MetricCard.defaultProps = {
  hasError: false
}

export default MetricCard

