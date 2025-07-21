'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'

/**
 * Lazy-loaded components with loading states
 * These components are code-split and loaded only when needed
 */

// Loading fallback component
const ComponentSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-32 w-full" />
  </div>
)

// Table skeleton for data tables
const TableSkeleton = () => (
  <div className="space-y-2 p-4">
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
)

// Chart skeleton for dashboard components
const ChartSkeleton = () => (
  <div className="p-4">
    <Skeleton className="h-6 w-32 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
)

// Lazy-loaded Sales components
export const LazyQuoteTable = dynamic(
  () => import('./Sales/QuoteTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const LazyOrderTable = dynamic(
  () => import('./Sales/OrderTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const LazyCreateQuoteDialog = dynamic(
  () => import('./Sales/CreateQuoteDialog'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyConvertToOrderDialog = dynamic(
  () => import('./Sales/ConvertToOrderDialog'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

// Lazy-loaded Inventory components
export const LazyInventoryTable = dynamic(
  () => import('./InventoryTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const LazyAdjustInventoryModal = dynamic(
  () => import('./AdjustInventoryModal'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyImportCSVModal = dynamic(
  () => import('./ImportCSVModal'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyProductModal = dynamic(
  () => import('./ProductModal'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyBarcodeScanner = dynamic(
  () => import('./BarcodeScanner'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

// Lazy-loaded CRM components
export const LazyCustomerTable = dynamic(
  () => import('./CustomerTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const LazyCreateCustomerDialog = dynamic(
  () => import('./CreateCustomerDialog'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

export const LazyTaskTable = dynamic(
  () => import('./TaskTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const LazyTaskDialog = dynamic(
  () => import('./TaskDialog'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

// Lazy-loaded Dashboard components
export const LazyRevenueByProductChart = dynamic(
  () => import('./dashboard/RevenueByProductChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const LazyProfitMarginChart = dynamic(
  () => import('./dashboard/ProfitMarginChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const LazyStockOverTimeChart = dynamic(
  () => import('./dashboard/StockOverTimeChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const LazyInventoryAdjustmentTable = dynamic(
  () => import('./dashboard/InventoryAdjustmentTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

// Lazy-loaded Vendor components
export const LazyVendorTable = dynamic(
  () => import('./dashboard/VendorTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const LazyVendorCreateModal = dynamic(
  () => import('./VendorCreateModal'),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
)

// Heavy third-party components
export const LazyKPIChart = dynamic(
  () => import('./KPIChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

// Export all as a collection for easy importing
export const LazyComponents = {
  // Sales
  QuoteTable: LazyQuoteTable,
  OrderTable: LazyOrderTable,
  CreateQuoteDialog: LazyCreateQuoteDialog,
  ConvertToOrderDialog: LazyConvertToOrderDialog,
  
  // Inventory
  InventoryTable: LazyInventoryTable,
  AdjustInventoryModal: LazyAdjustInventoryModal,
  ImportCSVModal: LazyImportCSVModal,
  ProductModal: LazyProductModal,
  BarcodeScanner: LazyBarcodeScanner,
  
  // CRM
  CustomerTable: LazyCustomerTable,
  CreateCustomerDialog: LazyCreateCustomerDialog,
  TaskTable: LazyTaskTable,
  TaskDialog: LazyTaskDialog,
  
  // Dashboard
  RevenueByProductChart: LazyRevenueByProductChart,
  ProfitMarginChart: LazyProfitMarginChart,
  StockOverTimeChart: LazyStockOverTimeChart,
  InventoryAdjustmentTable: LazyInventoryAdjustmentTable,
  
  // Vendors
  VendorTable: LazyVendorTable,
  VendorCreateModal: LazyVendorCreateModal,
  
  // Charts
  KPIChart: LazyKPIChart,
}

export default LazyComponents