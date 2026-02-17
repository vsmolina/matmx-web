'use client'
import { getApiBaseUrl } from '@/lib/api'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (open) setQty(defaultQty)
  }, [open, defaultQty])

  const handlePrint = async () => {
    try {
      // First, create the print job on the server
      const res = await fetch(`${getApiBaseUrl()}/api/print/print-label-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sku: product.sku,
          quantity: qty || 1,
          product_id: product.id,
          barcode_url: `${getApiBaseUrl()}/api/inventory/${product.id}/barcode.png`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Print failed');
      }

      toast.success(`Print job created: ${data.quantity} labels`);

      // Generate HTML content for Brother QL printer (62mm labels)
      const labelHtml = generateBrotherQLLabels(product, qty || 1);

      // Open print dialog with formatted labels
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(labelHtml);
        printWindow.document.close();

        // Small delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          // Close window after print dialog
          setTimeout(() => printWindow.close(), 1000);
        }, 500);
      } else {
        toast.error('Pop-up blocked. Please allow pop-ups for label printing.');
      }

      // Close dialog after successful print
      onOpenChange(false);
    } catch (err) {
      console.error('❌ Print failed:', err);
      toast.error('Failed to print labels');
    }
  };

  // Generate Brother QL-820NWB compatible HTML
  const generateBrotherQLLabels = (product: Product, quantity: number) => {
    const logoUrl = window.location.origin + '/matmx_logo.png';
    const labels = Array.from({ length: quantity }).map((_, i) => `
      <div class="label">
        <div class="label-content">
          <div class="top-section">
            <div class="left-column">
              <div class="product-name">${product.name || 'Product Name'}</div>
              <div class="sku-line">SKU: ${product.sku}</div>
            </div>
            <div class="right-column">
              <img src="${logoUrl}" alt="MatMX" class="logo" />
            </div>
          </div>

          <div class="barcode-section">
            <img src="${getApiBaseUrl()}/api/inventory/${product.id}/barcode.png" alt="Barcode" class="barcode-img" />
            <div class="label-number">${i + 1} of ${quantity}</div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Labels - ${product.sku}</title>
        <style>
          @page {
            /* Brother QL-820NWB DK-1208 label */
            size: 90mm 38mm; /* DK-1208 large address label size */
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }

          .label {
            width: 90mm;
            height: 38mm;
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .label:last-child {
            page-break-after: auto;
          }

          .label-content {
            width: 86mm;
            height: 34mm;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
          }

          /* Top section with two columns */
          .top-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            height: 18mm;
            margin-bottom: 2mm;
          }

          /* Left column with product info */
          .left-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            text-align: left;
            padding-right: 3mm;
          }

          .product-name {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 3mm;
            line-height: 1.1;
            color: #000;
            max-height: 10mm;
            overflow: hidden;
          }

          .sku-line {
            font-size: 12pt;
            font-weight: bold;
            color: #333;
          }

          /* Right column with logo */
          .right-column {
            width: 25mm;
            height: 18mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logo {
            max-height: 100%;
            max-width: 100%;
            height: auto;
            width: auto;
          }

          /* Bottom barcode section */
          .barcode-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .barcode-img {
            max-width: 70mm;
            max-height: 12mm;
            height: auto;
            margin-bottom: 1mm;
          }

          .label-number {
            font-size: 8pt;
            color: #666;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${labels}
      </body>
      </html>
    `;
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

        <div className="text-xs text-gray-500 mt-2">
          <p>Printer: Brother QL-820NWB</p>
          <p>Label Size: 90mm x 38mm (DK-1208 Large Address)</p>
          <p>Layout: Product Name & SKU (left) | Logo (right) | Barcode (bottom center)</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
