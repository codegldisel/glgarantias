import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, description, hasError }) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${hasError ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={`h-4 w-4 ${hasError ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
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
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </span>
            <span>vs mês anterior</span>
          </div>
        )}
        {description && (
          <p className={`text-xs mt-1 ${hasError ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
            {hasError ? 'Dados indisponíveis' : description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricCard

