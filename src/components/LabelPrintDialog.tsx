'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Product } from '@/types/ProductTypes'
import toast from 'react-hot-toast'

interface LabelPrintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  defaultQty: number
  onConfirm: () => void
}

export default function LabelPrintDialog({
  open,
  onOpenChange,
  product,
  defaultQty,
  onConfirm
}: LabelPrintDialogProps) {
  const [qty, setQty] = useState<number | ''>(defaultQty || 1)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setQty(defaultQty)
  }, [open, defaultQty])

  const handlePrint = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/print/print-label-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: product.sku,
          quantity: qty || 1,
          barcode_url: `http://localhost:4000/api/inventory/${product.id}/barcode.png`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Print failed');
      }

      toast.success(`Print job created: ${data.file}`);
    } catch (err) {
      console.error('❌ Print failed:', err);
      toast.error('Failed to print labels');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) {
        onConfirm()
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Print Labels</DialogTitle>
        </DialogHeader>

        <Label>How many labels?</Label>
        <Input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            setQty(isNaN(val) ? '' : val)
          }}
        />

        <Button className="mt-4" onClick={handlePrint}>
          Print {qty || 0} Label{qty === 1 ? '' : 's'}
        </Button>

        {/* Hidden label content for printing */}
        <div className="hidden print:block" ref={printRef}>
          {Array.from({ length: qty || 0 }).map((_, i) => (
            <div className="label" key={i}>
              <div className="logo">MatMX</div>
              <div>SKU: {product.sku}</div>
              <div>Packing #: ______</div>
              <img
                src={`http://localhost:4000/api/inventory/${product.id}/barcode.png`}
                alt="Barcode"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
