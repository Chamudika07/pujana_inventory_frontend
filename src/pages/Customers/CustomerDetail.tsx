import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import CustomerFormModal from '../../components/Customer/CustomerFormModal';
import { customerService } from '../../services/customerService';
import type { CustomerDetail as CustomerDetailType, CustomerFormData } from '../../types/customer';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      void loadCustomer(Number(id));
    }
  }, [id]);

  const loadCustomer = async (customerId: number) => {
    try {
      setLoading(true);
      setError(null);
      setCustomer(await customerService.getById(customerId));
    } catch (err) {
      setError('Failed to load customer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload: CustomerFormData) => {
    if (!customer) {
      return;
    }

    try {
      setSaving(true);
      setModalError(null);
      const updatedCustomer = await customerService.update(customer.id, payload);
      setCustomer(updatedCustomer);
      setShowModal(false);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update customer';
      setModalError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!customer || !window.confirm(`Deactivate ${customer.full_name}?`)) {
      return;
    }

    try {
      await customerService.delete(customer.id);
      await loadCustomer(customer.id);
    } catch (err) {
      setError('Failed to deactivate customer');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!customer) {
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
          <p className="text-muted mb-0">Customer details and purchase summary</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-pencil-square me-2"></i>
            Edit
          </Button>
          {customer.is_active && (
            <Button variant="outline-danger" onClick={() => void handleDeactivate()}>
              <i className="bi bi-person-dash me-2"></i>
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="g-4">
                <Col md={6}>
                  <small className="text-muted d-block">Phone Number</small>
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
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Purchase Summary</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Linked Sell Bills</small>
                <div className="fs-4 fw-bold">{customer.summary.number_of_bills}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Total Purchases</small>
                <div className="fs-4 fw-bold">Rs. {Number(customer.summary.total_purchases).toFixed(2)}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Due Balance</small>
                <div className="fs-4 fw-bold">Rs. {Number(customer.summary.due_balance).toFixed(2)}</div>
              </div>
              <div>
                <small className="text-muted d-block">Loyalty Points</small>
                <div className="fs-4 fw-bold">{customer.loyalty_points}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </Container>
  );
};

export default CustomerDetail;
