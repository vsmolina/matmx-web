export interface Order {
  id: number
  quote_id: number | null
  customer_id: number
  customer_name: string
  rep_id: number
  subtotal: number
  total: number
  currency: string
  status: 'draft' | 'received' | 'packed' | 'fulfilled'
  shipping_method: string | null
  shipping_cost: number | null
  fulfillment_date: string | null
  created_at: string
}
