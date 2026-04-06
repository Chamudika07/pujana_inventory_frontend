import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import PaymentModal from '../../components/Bill/PaymentModal';
import { paymentService } from '../../services/paymentService';
import { supplierService } from '../../services/supplierService';
import type { SupplierListItem } from '../../types/supplier';
import { formatCurrency } from '../../utils/finance';

const SupplierPayables: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierListItem | null>(null);

  const payableSuppliers = useMemo(
    () => suppliers.filter((supplier) => Number(supplier.summary.payable_balance) > 0),
    [suppliers]
  );

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuppliers(await supplierService.getAll(true));
    } catch (loadError) {
      setError('Failed to load supplier payables');
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, []);

  const handlePaymentSubmit = async (payload: { amount: number; payment_method: any; reference_number?: string; notes?: string; paid_at?: string; bill_id?: number }) => {
    if (!selectedSupplier) {
      return;
    }

    try {
      setSaving(true);
      setPaymentError(null);
      await paymentService.addSupplierPayment({
        supplier_id: selectedSupplier.id,
        ...payload,
      });
      toast.success('Supplier payment recorded.');
      setSelectedSupplier(null);
      await loadSuppliers();
    } catch (submitError: any) {
      setPaymentError(submitError.response?.data?.detail || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Supplier Payables</h1>
        <p className="text-muted mb-0">Track money owed to suppliers and settle balances without leaving the page.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading supplier payables...</p>
            </div>
          ) : payableSuppliers.length === 0 ? (
            <div className="text-center py-5 text-muted">No supplier payables outstanding right now.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Supplier</th>
                    <th>Contact</th>
                    <th>Outstanding</th>
                    <th>Purchase Bills</th>
                    <th>Total Purchased</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payableSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="fw-semibold">{supplier.supplier_name}</td>
                      <td>{supplier.phone_number}</td>
                      <td>{formatCurrency(supplier.summary.payable_balance)}</td>
                      <td>{supplier.summary.number_of_purchase_bills}</td>
                      <td>{formatCurrency(supplier.summary.total_purchased_amount)}</td>
                      <td className="text-center">
                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => setSelectedSupplier(supplier)}>
                          Record Payment
                        </Button>
                        <Button variant="outline-primary" size="sm" onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                          Open Ledger
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <PaymentModal
        show={Boolean(selectedSupplier)}
        title={selectedSupplier ? `Record Payment - ${selectedSupplier.supplier_name}` : 'Record Payment'}
        outstandingAmount={Number(selectedSupplier?.summary.payable_balance || 0)}
        loading={saving}
        error={paymentError}
        onClose={() => {
          setSelectedSupplier(null);
          setPaymentError(null);
        }}
        onSubmit={handlePaymentSubmit}
      />
    </Container>
  );
};

export default SupplierPayables;
