export interface Quote {
  id: number
  customer_id: number
  customer_name: string
  customer_email: string
  rep_id: number
  rep_name: string
  title: string
  currency: string
  subtotal: number
  total: number
  status: 'draft' | 'sent' | 'converted'
  valid_until: string
  delivery_date: string | null
  customer_note: string | null
  internal_note: string | null
  created_at: string
  converted_at?: string | null
}
