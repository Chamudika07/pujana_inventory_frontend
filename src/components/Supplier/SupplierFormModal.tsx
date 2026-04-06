import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import type { SupplierDetail, SupplierFormData } from '../../types/supplier';

interface SupplierFormModalProps {
  show: boolean;
  supplier?: SupplierDetail | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: SupplierFormData) => Promise<void>;
}

const defaultFormData: SupplierFormData = {
  supplier_name: '',
  company_name: '',
  contact_person: '',
  phone_number: '',
  email: '',
  address: '',
  notes: '',
  is_active: true,
};

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  show,
  supplier,
  loading = false,
  error,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<SupplierFormData>(defaultFormData);

  useEffect(() => {
    if (!show) {
      return;
    }

    if (supplier) {
      setFormData({
        supplier_name: supplier.supplier_name,
        company_name: supplier.company_name || '',
        contact_person: supplier.contact_person || '',
        phone_number: supplier.phone_number,
        email: supplier.email || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        is_active: supplier.is_active,
      });
      return;
    }

    setFormData(defaultFormData);
  }, [show, supplier]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
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
      company_name: formData.company_name?.trim() || '',
      contact_person: formData.contact_person?.trim() || '',
      email: formData.email?.trim() || '',
      address: formData.address?.trim() || '',
      notes: formData.notes?.trim() || '',
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{supplier ? 'Edit Supplier' : 'Add Supplier'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Supplier Name</Form.Label>
                <Form.Control
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Company Name</Form.Label>
                <Form.Control
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Contact Person</Form.Label>
                <Form.Control
                  name="contact_person"
                  value={formData.contact_person || ''}
                  onChange={handleChange}
                  placeholder="Primary contact"
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
                  placeholder="supplier@example.com"
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
                  placeholder="Supplier address"
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
                id="supplier-active"
                name="is_active"
                label="Supplier is active"
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
            ) : supplier ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SupplierFormModal;
