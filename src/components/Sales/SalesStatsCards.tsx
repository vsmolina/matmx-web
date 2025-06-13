'use client'

interface SalesStatsCardsProps {
  stats: {
    totalQuotes: number
    conversionRate: number
    pendingOrders: number
    fulfilledOrders: number
  }
}

export default function SalesStatsCards({ stats }: SalesStatsCardsProps) {
  const cardClass = "flex flex-col bg-white p-4 rounded-xl shadow w-full sm:w-1/4"

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className={cardClass}>
        <p className="text-sm text-muted-foreground">Total Quotes</p>
        <p className="text-xl font-bold">${stats.totalQuotes.toLocaleString()}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-muted-foreground">Conversion Rate</p>
        <p className="text-xl font-bold">{stats.conversionRate}%</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-muted-foreground">Pending Orders</p>
        <p className="text-xl font-bold">{stats.pendingOrders}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-muted-foreground">Fulfilled Orders</p>
        <p className="text-xl font-bold">{stats.fulfilledOrders}</p>
      </div>
    </div>
  )
}
