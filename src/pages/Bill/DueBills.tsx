import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import PaymentModal from '../../components/Bill/PaymentModal';
import { billService } from '../../services/billService';
import type { Bill } from '../../types/bill';
import { formatCurrency, formatDateTime, paymentStatusLabel, paymentStatusVariant } from '../../utils/finance';

const DueBills: React.FC = () => {
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
      setBills(await billService.getDueBills());
    } catch (loadError) {
      setError('Failed to load due bills');
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
      toast.success('Bill payment recorded.');
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
        <h1 className="h2 fw-bold">Due Bills</h1>
        <p className="text-muted mb-0">Review every unpaid or partially paid sell bill and collect money directly against the invoice.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading due bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-5 text-muted">No due sell bills right now.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bill</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="fw-semibold">{bill.bill_code}</td>
                      <td>{bill.customer?.full_name || 'Walk-in'}</td>
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

export default DueBills;
