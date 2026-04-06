import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import type { CustomerDetail, CustomerFormData, CustomerType } from '../../types/customer';

interface CustomerFormModalProps {
  show: boolean;
  customer?: CustomerDetail | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CustomerFormData) => Promise<void>;
}

const defaultFormData: CustomerFormData = {
  full_name: '',
  phone_number: '',
  email: '',
  address: '',
  customer_type: 'retail',
  notes: '',
  loyalty_points: 0,
  is_active: true,
};

const customerTypeOptions: CustomerType[] = ['retail', 'wholesale', 'regular', 'vip'];

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  show,
  customer,
  loading = false,
  error,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(defaultFormData);

  useEffect(() => {
    if (!show) {
      return;
    }

    if (customer) {
      setFormData({
        full_name: customer.full_name,
        phone_number: customer.phone_number,
        email: customer.email || '',
        address: customer.address || '',
        customer_type: customer.customer_type,
        notes: customer.notes || '',
        loyalty_points: customer.loyalty_points,
        is_active: customer.is_active,
      });
      return;
    }

    setFormData(defaultFormData);
  }, [customer, show]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
      }));
      return;
    }

    if (name === 'loyalty_points') {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      ...formData,
      email: formData.email?.trim() || '',
      address: formData.address?.trim() || '',
      notes: formData.notes?.trim() || '',
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{customer ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Full Name</Form.Label>
                <Form.Control
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Phone Number</Form.Label>
                <Form.Control
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+94771234567"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Customer Type</Form.Label>
                <Form.Select name="customer_type" value={formData.customer_type} onChange={handleChange}>
                  {customerTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Loyalty Points</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="loyalty_points"
                  value={formData.loyalty_points}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Customer address"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Optional notes"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="customer-active"
                name="is_active"
                label="Customer is active"
                checked={formData.is_active}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="fw-semibold" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : customer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CustomerFormModal;
