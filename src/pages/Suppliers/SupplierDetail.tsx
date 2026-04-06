import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import SupplierFormModal from '../../components/Supplier/SupplierFormModal';
import { supplierService } from '../../services/supplierService';
import type { SupplierDetail as SupplierDetailType, SupplierFormData } from '../../types/supplier';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      void loadSupplier(Number(id));
    }
  }, [id]);

  const loadSupplier = async (supplierId: number) => {
    try {
      setLoading(true);
      setError(null);
      setSupplier(await supplierService.getById(supplierId));
    } catch (err) {
      setError('Failed to load supplier');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload: SupplierFormData) => {
    if (!supplier) {
      return;
    }

    try {
      setSaving(true);
      setModalError(null);
      const updatedSupplier = await supplierService.update(supplier.id, payload);
      setSupplier(updatedSupplier);
      setShowModal(false);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update supplier';
      setModalError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!supplier || !window.confirm(`Deactivate ${supplier.supplier_name}?`)) {
      return;
    }

    try {
      await supplierService.delete(supplier.id);
      await loadSupplier(supplier.id);
    } catch (err) {
      setError('Failed to deactivate supplier');
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

  if (!supplier) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error || 'Supplier not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4 d-flex justify-content-between align-items-start">
        <div>
          <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => navigate('/suppliers')}>
            <i className="bi bi-chevron-left me-2"></i>
            Back to Suppliers
          </Button>
          <h1 className="h2 fw-bold mb-1">{supplier.supplier_name}</h1>
          <p className="text-muted mb-0">Supplier profile and purchase summary</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-pencil-square me-2"></i>
            Edit
          </Button>
          {supplier.is_active && (
            <Button variant="outline-danger" onClick={() => void handleDeactivate()}>
              <i className="bi bi-truck-flatbed me-2"></i>
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
                  <small className="text-muted d-block">Company Name</small>
                  <div className="fw-semibold">{supplier.company_name || 'Not provided'}</div>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Contact Person</small>
                  <div className="fw-semibold">{supplier.contact_person || 'Not provided'}</div>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Phone Number</small>
                  <div className="fw-semibold">{supplier.phone_number}</div>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Email</small>
                  <div className="fw-semibold">{supplier.email || 'Not provided'}</div>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={supplier.is_active ? 'success' : 'secondary'}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Col>
                <Col xs={12}>
                  <small className="text-muted d-block">Address</small>
                  <div className="fw-semibold">{supplier.address || 'No address added'}</div>
                </Col>
                <Col xs={12}>
                  <small className="text-muted d-block">Notes</small>
                  <div className="fw-semibold">{supplier.notes || 'No notes added'}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Purchase Summary</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Purchase Bills</small>
                <div className="fs-4 fw-bold">{supplier.summary.number_of_purchase_bills}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Total Purchased</small>
                <div className="fs-4 fw-bold">Rs. {Number(supplier.summary.total_purchased_amount).toFixed(2)}</div>
              </div>
              <div>
                <small className="text-muted d-block">Payable Balance</small>
                <div className="fs-4 fw-bold">Rs. {Number(supplier.summary.payable_balance).toFixed(2)}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <SupplierFormModal
        show={showModal}
        supplier={supplier}
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

export default SupplierDetail;
