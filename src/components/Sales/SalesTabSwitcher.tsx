'use client'

import { Button } from '@/components/ui/button'

interface SalesTabSwitcherProps {
  activeTab: 'quotes' | 'orders'
  onTabChange: (tab: 'quotes' | 'orders') => void
}

export default function SalesTabSwitcher({ activeTab, onTabChange }: SalesTabSwitcherProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={activeTab === 'quotes' ? 'default' : 'outline'}
        onClick={() => onTabChange('quotes')}
      >
        Quotes
      </Button>
      <Button
        variant={activeTab === 'orders' ? 'default' : 'outline'}
        onClick={() => onTabChange('orders')}
      >
        Orders
      </Button>
    </div>
  )
}
