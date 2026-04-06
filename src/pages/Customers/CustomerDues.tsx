import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import PaymentModal from '../../components/Bill/PaymentModal';
import { customerService } from '../../services/customerService';
import { paymentService } from '../../services/paymentService';
import type { CustomerListItem } from '../../types/customer';
import { formatCurrency } from '../../utils/finance';

const CustomerDues: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);

  const dueCustomers = useMemo(
    () => customers.filter((customer) => Number(customer.summary.due_balance) > 0),
    [customers]
  );

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      setCustomers(await customerService.getAll(true));
    } catch (loadError) {
      setError('Failed to load customer dues');
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const handlePaymentSubmit = async (payload: { amount: number; payment_method: any; reference_number?: string; notes?: string; paid_at?: string; bill_id?: number }) => {
    if (!selectedCustomer) {
      return;
    }

    try {
      setSaving(true);
      setPaymentError(null);
      await paymentService.addCustomerPayment({
        customer_id: selectedCustomer.id,
        ...payload,
      });
      toast.success('Customer payment recorded.');
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (submitError: any) {
      setPaymentError(submitError.response?.data?.detail || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Customer Dues</h1>
        <p className="text-muted mb-0">Monitor receivables and record collections directly from the due list.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading customer dues...</p>
            </div>
          ) : dueCustomers.length === 0 ? (
            <div className="text-center py-5 text-muted">No outstanding customer dues right now.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Outstanding</th>
                    <th>Unpaid Bills</th>
                    <th>Total Purchased</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dueCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="fw-semibold">{customer.full_name}</td>
                      <td>{customer.phone_number}</td>
                      <td>{formatCurrency(customer.summary.due_balance)}</td>
                      <td>{customer.summary.number_of_bills}</td>
                      <td>{formatCurrency(customer.summary.total_purchases)}</td>
                      <td className="text-center">
                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => setSelectedCustomer(customer)}>
                          Record Payment
                        </Button>
                        <Button variant="outline-primary" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
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
        show={Boolean(selectedCustomer)}
        title={selectedCustomer ? `Record Payment - ${selectedCustomer.full_name}` : 'Record Payment'}
        outstandingAmount={Number(selectedCustomer?.summary.due_balance || 0)}
        loading={saving}
        error={paymentError}
        onClose={() => {
          setSelectedCustomer(null);
          setPaymentError(null);
        }}
        onSubmit={handlePaymentSubmit}
      />
    </Container>
  );
};

export default CustomerDues;
