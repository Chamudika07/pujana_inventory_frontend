import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import PaymentModal from '../../components/Bill/PaymentModal';
import CustomerFormModal from '../../components/Customer/CustomerFormModal';
import { customerService } from '../../services/customerService';
import { paymentService } from '../../services/paymentService';
import type { CustomerDetail as CustomerDetailType, CustomerFormData } from '../../types/customer';
import type { CustomerLedger } from '../../types/bill';
import { formatCurrency, formatDateTime, paymentStatusLabel, paymentStatusVariant } from '../../utils/finance';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetailType | null>(null);
  const [ledger, setLedger] = useState<CustomerLedger | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const customerId = Number(id);

  const loadCustomerData = async () => {
    if (!customerId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [customerDetail, ledgerResponse] = await Promise.all([
        customerService.getById(customerId),
        customerService.getLedger(customerId),
      ]);
      setCustomer(customerDetail);
      setLedger(ledgerResponse);
    } catch (loadError) {
      setError('Failed to load customer ledger');
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomerData();
  }, [customerId]);

  const handleSubmit = async (payload: CustomerFormData) => {
    if (!customer) {
      return;
    }

    try {
      setSaving(true);
      setModalError(null);
      await customerService.update(customer.id, payload);
      setShowModal(false);
      await loadCustomerData();
    } catch (submitError: any) {
      setModalError(submitError.response?.data?.detail || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSubmit = async (payload: any) => {
    if (!customer) {
      return;
    }

    try {
      setPaymentSaving(true);
      setPaymentError(null);
      await paymentService.addCustomerPayment({
        customer_id: customer.id,
        ...payload,
      });
      toast.success('Customer payment recorded.');
      setShowPaymentModal(false);
      await loadCustomerData();
    } catch (submitError: any) {
      setPaymentError(submitError.response?.data?.detail || 'Failed to record payment');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!customer || !window.confirm(`Deactivate ${customer.full_name}?`)) {
      return;
    }

    try {
      await customerService.delete(customer.id);
      await loadCustomerData();
    } catch (deleteError) {
      setError('Failed to deactivate customer');
      console.error(deleteError);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!customer || !ledger) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error || 'Customer not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4 d-flex justify-content-between align-items-start">
        <div>
          <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => navigate('/customers')}>
            <i className="bi bi-chevron-left me-2"></i>
            Back to Customers
          </Button>
          <h1 className="h2 fw-bold mb-1">{customer.full_name}</h1>
          <p className="text-muted mb-0">Customer ledger, receivable history, and payment activity.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setShowPaymentModal(true)}>
            Record Payment
          </Button>
          <Button variant="outline-primary" onClick={() => setShowModal(true)}>
            Edit
          </Button>
          {customer.is_active && (
            <Button variant="outline-danger" onClick={() => void handleDeactivate()}>
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Row className="g-4">
                <Col md={6}>
                  <small className="text-muted d-block">Phone</small>
                  <div className="fw-semibold">{customer.phone_number}</div>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Email</small>
                  <div className="fw-semibold">{customer.email || 'Not provided'}</div>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Customer Type</small>
                  <Badge bg="light" text="dark">{customer.customer_type.toUpperCase()}</Badge>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={customer.is_active ? 'success' : 'secondary'}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Col>
                <Col xs={12}>
                  <small className="text-muted d-block">Address</small>
                  <div className="fw-semibold">{customer.address || 'No address added'}</div>
                </Col>
                <Col xs={12}>
                  <small className="text-muted d-block">Notes</small>
                  <div className="fw-semibold">{customer.notes || 'No notes added'}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Receivable Summary</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Total Billed</small>
                <div className="fs-4 fw-bold">{formatCurrency(ledger.summary.total_billed)}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Total Paid</small>
                <div className="fs-4 fw-bold">{formatCurrency(ledger.summary.total_paid)}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Outstanding</small>
                <div className="fs-4 fw-bold">{formatCurrency(ledger.summary.total_outstanding)}</div>
              </div>
              <div>
                <small className="text-muted d-block">Unpaid / Partial Bills</small>
                <div className="fs-5 fw-bold">
                  {ledger.summary.unpaid_bills_count} unpaid, {ledger.summary.partially_paid_bills_count} partial
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0 fw-bold">Ledger History</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {ledger.entries.length === 0 ? (
            <div className="text-center py-5 text-muted">No ledger activity yet.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Entry</th>
                    <th>Reference</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Running Balance</th>
                    <th>Status / Method</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries.map((entry) => (
                    <tr key={`${entry.entry_type}-${entry.bill_id || 'x'}-${entry.payment_id || 'x'}-${entry.happened_at}`}>
                      <td>{formatDateTime(entry.happened_at)}</td>
                      <td className="fw-semibold">{entry.entry_type === 'bill' ? 'Bill' : 'Payment'}</td>
                      <td>{entry.bill_code || entry.reference_number || '-'}</td>
                      <td>{entry.total_amount != null ? formatCurrency(entry.total_amount) : '-'}</td>
                      <td>{entry.entry_type === 'payment' ? formatCurrency(entry.amount) : entry.paid_amount != null ? formatCurrency(entry.paid_amount) : '-'}</td>
                      <td>{entry.due_amount != null ? formatCurrency(entry.due_amount) : '-'}</td>
                      <td>{formatCurrency(entry.running_balance)}</td>
                      <td>
                        {entry.payment_status ? (
                          <Badge bg={paymentStatusVariant(entry.payment_status)}>
                            {paymentStatusLabel(entry.payment_status)}
                          </Badge>
                        ) : (
                          <Badge bg="info">{entry.payment_method?.replace('_', ' ').toUpperCase() || 'PAYMENT'}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <CustomerFormModal
        show={showModal}
        customer={customer}
        loading={saving}
        error={modalError}
        onClose={() => {
          setShowModal(false);
          setModalError(null);
        }}
        onSubmit={handleSubmit}
      />

      <PaymentModal
        show={showPaymentModal}
        title={`Record Payment - ${customer.full_name}`}
        outstandingAmount={ledger.summary.total_outstanding}
        loading={paymentSaving}
        error={paymentError}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentError(null);
        }}
        onSubmit={handlePaymentSubmit}
      />
    </Container>
  );
};

export default CustomerDetail;
