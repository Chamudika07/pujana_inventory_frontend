import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import PaymentModal from '../../components/Bill/PaymentModal';
import { billService } from '../../services/billService';
import type { Bill } from '../../types/bill';
import { formatCurrency, formatDateTime, paymentStatusLabel, paymentStatusVariant } from '../../utils/finance';

const PayableBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      setBills(await billService.getPayableBills());
    } catch (loadError) {
      setError('Failed to load payable bills');
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBills();
  }, []);

  const handlePaymentSubmit = async (payload: any) => {
    if (!selectedBill) {
      return;
    }

    try {
      setSaving(true);
      setPaymentError(null);
      await billService.addBillPayment(selectedBill.id, payload);
      toast.success('Supplier bill payment recorded.');
      setSelectedBill(null);
      await loadBills();
    } catch (submitError: any) {
      setPaymentError(submitError.response?.data?.detail || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Payable Bills</h1>
        <p className="text-muted mb-0">Review every unpaid or partially paid buy bill and settle supplier payables bill by bill.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading payable bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-5 text-muted">No payable buy bills right now.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bill</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Payable</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="fw-semibold">{bill.bill_code}</td>
                      <td>{bill.supplier?.supplier_name || 'Direct stock'}</td>
                      <td>{formatDateTime(bill.finalized_at || bill.created_at)}</td>
                      <td>{formatCurrency(bill.total_amount)}</td>
                      <td>{formatCurrency(bill.paid_amount)}</td>
                      <td>{formatCurrency(bill.due_amount)}</td>
                      <td>
                        <Badge bg={paymentStatusVariant(bill.payment_status)}>
                          {paymentStatusLabel(bill.payment_status)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button size="sm" variant="outline-success" onClick={() => setSelectedBill(bill)}>
                          Add Payment
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
        show={Boolean(selectedBill)}
        title={selectedBill ? `Add Payment - ${selectedBill.bill_code}` : 'Add Payment'}
        outstandingAmount={Number(selectedBill?.due_amount || 0)}
        loading={saving}
        error={paymentError}
        initialBillId={selectedBill?.id}
        onClose={() => {
          setSelectedBill(null);
          setPaymentError(null);
        }}
        onSubmit={handlePaymentSubmit}
      />
    </Container>
  );
};

export default PayableBills;
