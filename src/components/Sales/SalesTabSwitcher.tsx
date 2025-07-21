'use client'

import { Button } from '@/components/ui/button'
import { FileText, ShoppingCart } from 'lucide-react'

interface SalesTabSwitcherProps {
  activeTab: 'quotes' | 'orders'
  onTabChange: (tab: 'quotes' | 'orders') => void
}

export default function SalesTabSwitcher({ activeTab, onTabChange }: SalesTabSwitcherProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={activeTab === 'quotes' ? 'default' : 'outline'}
        onClick={() => onTabChange('quotes')}
        className={`flex items-center gap-2 transition-all ${
          activeTab === 'quotes' 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm' 
            : 'border-gray-300 hover:border-green-400 hover:text-green-600'
        }`}
      >
        <FileText className="h-4 w-4" />
        Quotes
      </Button>
      <Button
        variant={activeTab === 'orders' ? 'default' : 'outline'}
        onClick={() => onTabChange('orders')}
        className={`flex items-center gap-2 transition-all ${
          activeTab === 'orders' 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm' 
            : 'border-gray-300 hover:border-blue-400 hover:text-blue-600'
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        Orders
      </Button>
    </div>
  )
}
