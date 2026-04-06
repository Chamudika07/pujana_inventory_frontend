import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import CustomerFormModal from '../../components/Customer/CustomerFormModal';
import { customerService } from '../../services/customerService';
import type { CustomerDetail, CustomerFormData, CustomerListItem, CustomerType } from '../../types/customer';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    void loadCustomers();
  }, [showInactive]);

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchTerm.trim()) {
      const normalized = searchTerm.toLowerCase();
      filtered = filtered.filter((customer) =>
        customer.full_name.toLowerCase().includes(normalized) ||
        customer.phone_number.toLowerCase().includes(normalized) ||
        (customer.email || '').toLowerCase().includes(normalized)
      );
    }

    if (filterType) {
      filtered = filtered.filter((customer) => customer.customer_type === filterType);
    }

    return filtered;
  }, [customers, filterType, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      setCustomers(await customerService.getAll(showInactive));
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = async (customerId: number) => {
    try {
      setSaving(true);
      setModalError(null);
      const customer = await customerService.getById(customerId);
      setEditingCustomer(customer);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load customer details');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (payload: CustomerFormData) => {
    try {
      setSaving(true);
      setModalError(null);
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, payload);
      } else {
        await customerService.create(payload);
      }
      setShowModal(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to save customer';
      setModalError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer: CustomerListItem) => {
    if (!window.confirm(`Deactivate customer "${customer.full_name}"?`)) {
      return;
    }

    try {
      await customerService.delete(customer.id);
      await loadCustomers();
    } catch (err) {
      setError('Failed to deactivate customer');
      console.error(err);
    }
  };

  const customerTypes: CustomerType[] = ['retail', 'wholesale', 'regular', 'vip'];

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Customers</h1>
        <p className="text-muted">Manage shop customers and link them to sell bills.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Form.Control
            placeholder="Search by name, phone or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Customer Types</option>
            {customerTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Check
            type="switch"
            id="show-inactive-customers"
            label="Show inactive customers"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
        </Col>
        <Col md={2} className="text-md-end">
          <Button onClick={openCreateModal} className="fw-semibold">
            <i className="bi bi-person-plus me-2"></i>
            Add Customer
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No customers found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light border-top">
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Bills</th>
                    <th>Total Purchases</th>
                    <th>Due Balance</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="fw-semibold">{customer.full_name}</div>
                        <small className="text-muted">{customer.email || 'No email'}</small>
                      </td>
                      <td>{customer.phone_number}</td>
                      <td>
                        <Badge bg="light" text="dark">
                          {customer.customer_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{customer.summary.number_of_bills}</td>
                      <td>Rs. {Number(customer.summary.total_purchases).toFixed(2)}</td>
                      <td>Rs. {Number(customer.summary.due_balance).toFixed(2)}</td>
                      <td>
                        <Badge bg={customer.is_active ? 'success' : 'secondary'}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => void openEditModal(customer.id)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                        {customer.is_active && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => void handleDelete(customer)}
                          >
                            <i className="bi bi-person-dash"></i>
                          </Button>
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
        customer={editingCustomer}
        loading={saving}
        error={modalError}
        onClose={() => {
          setShowModal(false);
          setEditingCustomer(null);
          setModalError(null);
        }}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};

export default Customers;
