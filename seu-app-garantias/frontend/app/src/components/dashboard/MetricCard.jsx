import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, description, hasError }) => {
  const { t } = useTranslation()
  return (
    <Card className={`hover:shadow-md transition-shadow ${hasError ? 'opacity-60' : ''}`} tabIndex={0} role="region" aria-label={t(title)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t(title)}
        </CardTitle>
        {Icon && (
          <Icon className={`h-4 w-4 ${hasError ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${hasError ? 'text-muted-foreground' : 'text-foreground'}`}>
          {hasError ? '---' : value}
        </div>
        {trend && !hasError && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <span className={`${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {trend === 'up' ? '\u2197' : trend === 'down' ? '\u2198' : '\u2192'} {trendValue}
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

export default MetricCard

