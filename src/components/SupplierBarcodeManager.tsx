'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import SupplierBarcodeModal from './SupplierBarcodeModal';

interface SupplierBarcode {
  id: number;
  barcode: string;
  alias?: string;
  vendor_id?: number;
  vendor_name?: string;
  vendor_name_resolved?: string;
}

interface Props {
  productId: number;
}

export default function SupplierBarcodeManager({ productId }: Props) {
  const [barcodes, setBarcodes] = useState<SupplierBarcode[]>([]);
const [editing, setEditing] = useState<SupplierBarcode | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const fetchBarcodes = async () => {
    const res = await fetch(`http://localhost:4000/api/inventory/${productId}/supplier-barcodes`, {
      credentials: 'include',
    });
    const data = await res.json();
    setBarcodes(data.barcodes);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this barcode?')) return;
    const res = await fetch(`http://localhost:4000/api/inventory/supplier-barcodes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) fetchBarcodes();
  };

  useEffect(() => {
    fetchBarcodes();
  }, [productId]);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Supplier Barcodes</h2>
        <Button onClick={() => { setEditing(undefined); setShowModal(true); }}>
          Add Barcode
        </Button>
      </div>

      {barcodes.length === 0 ? (
        <p className="text-sm text-gray-500">No barcodes added yet.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2">Barcode</th>
              <th className="px-3 py-2">Alias</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {barcodes.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-3 py-2">{b.barcode}</td>
                <td className="px-3 py-2">{b.alias || '-'}</td>
                <td className="px-3 py-2">{b.vendor_name_resolved || b.vendor_name || '-'}</td>
                <td className="px-3 py-2 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(b); setShowModal(true); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <SupplierBarcodeModal
          open={showModal}
          onClose={() => setShowModal(false)}
          productId={productId}
          barcode={editing}
          onSaved={fetchBarcodes}
        />
      )}
    </div>
  );
}
