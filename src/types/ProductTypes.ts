export interface Product {
  id: number
  name: string
  sku: string
  vendor_id: number
  vendor: string
  stock: number
  reorder_threshold: number
  unit_price: number
  category: string
  notes?: string
  barcode: string
  supplier_barcodes: string[] // for scanning and matching supplier barcodes
  image_path?: string // optional image reference
}
