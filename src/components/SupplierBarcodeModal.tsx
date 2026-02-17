'use client';
import { getApiBaseUrl } from '@/lib/api'

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { apiCall } from '@/lib/api'

interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  barcode?: {
    id: number;
    barcode: string;
    alias?: string;
    vendor_id?: number;
    vendor_name?: string;
  };
  onSaved: () => void;
}

interface Vendor {
  id: number;
  name: string;
}

export default function SupplierBarcodeModal({ open, onClose, productId, barcode, onSaved }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [barcodeText, setBarcodeText] = useState(barcode?.barcode || '');
  const [alias, setAlias] = useState(barcode?.alias || '');
  const [vendorName, setVendorName] = useState(barcode?.vendor_name || '');
  const [vendorId, setVendorId] = useState<number | null>(barcode?.vendor_id || null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!barcode;

  useEffect(() => {
    apiCall('/api/vendors')
      .then(res => res.json())
      .then(data => setVendors(data.vendors || []));
  }, []);

  const matchingVendor = vendors.find(v => v.name.toLowerCase() === vendorName.toLowerCase());
  const showAddVendorPrompt = vendorName && !matchingVendor;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body = {
        barcode: barcodeText,
        alias,
        vendor_id: matchingVendor?.id || null,
        vendor_name: !matchingVendor ? vendorName : null,
      };

      const res = await fetch(
        isEdit
          ? `${getApiBaseUrl()}/api/inventory/supplier-barcodes/${barcode!.id}`
          : `${getApiBaseUrl()}/api/inventory/${productId}/supplier-barcodes`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error('Save failed');
      toast.success(`Barcode ${isEdit ? 'updated' : 'added'}`);
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Barcode' : 'Add Supplier Barcode'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Barcode *</Label>
            <Input value={barcodeText} onChange={(e) => setBarcodeText(e.target.value)} />
          </div>

          <div>
            <Label>Alias</Label>
            <Input value={alias} onChange={(e) => setAlias(e.target.value)} />
          </div>

          <div>
            <Label>Vendor (dropdown or type new)</Label>
            <Input
              list="vendor-options"
              value={vendorName}
              onChange={(e) => {
                setVendorName(e.target.value);
                setVendorId(null);
              }}
            />
            <datalist id="vendor-options">
              {vendors.map((v) => (
                <option key={v.id} value={v.name} />
              ))}
            </datalist>
            {showAddVendorPrompt && (
              <p className="text-sm text-blue-500 mt-1">This vendor doesn’t exist yet. It will be recorded as text unless added manually.</p>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={loading || !barcodeText}>
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
