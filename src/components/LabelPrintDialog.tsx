'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Product } from '@/types/ProductTypes'

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

  const handlePrint = () => {
    if (!printRef.current) return

    const printContent = printRef.current.innerHTML
    const win = window.open('', '', 'height=700,width=900')
    if (!win) return

    win.document.write(`
      <html>
      <head>
        <title>Print Labels</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .label {
              width: 1050px;
              height: 450px;
              border: 1px solid #000;
              margin: 10px;
              padding: 10px;
              font-size: 14px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .logo {
              font-weight: bold;
              font-size: 16px;
              color: #003cc5;
            }
            img {
              width: 100%;
              height: 50px;
              object-fit: contain;
            }
          }
        </style>
      </head>
      <body onload="window.print(); window.close()">
        ${printContent}
      </body>
      </html>
    `)

    win.document.close()
  }

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
