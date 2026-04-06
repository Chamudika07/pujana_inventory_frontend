import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import SupplierFormModal from '../../components/Supplier/SupplierFormModal';
import { supplierService } from '../../services/supplierService';
import type { SupplierDetail, SupplierFormData, SupplierListItem } from '../../types/supplier';

const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    void loadSuppliers();
  }, [showInactive]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) {
      return suppliers;
    }

    const normalized = searchTerm.toLowerCase();
    return suppliers.filter((supplier) =>
      supplier.supplier_name.toLowerCase().includes(normalized) ||
      (supplier.company_name || '').toLowerCase().includes(normalized) ||
      supplier.phone_number.toLowerCase().includes(normalized) ||
      (supplier.email || '').toLowerCase().includes(normalized)
    );
  }, [suppliers, searchTerm]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuppliers(await supplierService.getAll(showInactive));
    } catch (err) {
      setError('Failed to load suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = async (supplierId: number) => {
    try {
      setSaving(true);
      setModalError(null);
      const supplier = await supplierService.getById(supplierId);
      setEditingSupplier(supplier);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load supplier details');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (payload: SupplierFormData) => {
    try {
      setSaving(true);
      setModalError(null);
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, payload);
      } else {
        await supplierService.create(payload);
      }
      setShowModal(false);
      setEditingSupplier(null);
      await loadSuppliers();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to save supplier';
      setModalError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: SupplierListItem) => {
    if (!window.confirm(`Deactivate supplier "${supplier.supplier_name}"?`)) {
      return;
    }

    try {
      await supplierService.delete(supplier.id);
      await loadSuppliers();
    } catch (err) {
      setError('Failed to deactivate supplier');
      console.error(err);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Suppliers</h1>
        <p className="text-muted">Manage suppliers and connect them to purchase bills.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="mb-4 g-3">
        <Col md={5}>
          <Form.Control
            placeholder="Search by supplier, company, phone or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Check
            type="switch"
            id="show-inactive-suppliers"
            label="Show inactive suppliers"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
        </Col>
        <Col md={4} className="text-md-end">
          <Button onClick={openCreateModal} className="fw-semibold">
            <i className="bi bi-truck me-2"></i>
            Add Supplier
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading suppliers...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No suppliers found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light border-top">
                  <tr>
                    <th>Supplier</th>
                    <th>Contact</th>
                    <th>Purchase Bills</th>
                    <th>Total Purchased</th>
                    <th>Payable Balance</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <div className="fw-semibold">{supplier.supplier_name}</div>
                        <small className="text-muted">{supplier.company_name || 'No company'}</small>
                      </td>
                      <td>
                        <div>{supplier.phone_number}</div>
                        <small className="text-muted">{supplier.contact_person || supplier.email || 'No secondary contact'}</small>
                      </td>
                      <td>{supplier.summary.number_of_purchase_bills}</td>
                      <td>Rs. {Number(supplier.summary.total_purchased_amount).toFixed(2)}</td>
                      <td>Rs. {Number(supplier.summary.payable_balance).toFixed(2)}</td>
                      <td>
                        <Badge bg={supplier.is_active ? 'success' : 'secondary'}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/suppliers/${supplier.id}`)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => void openEditModal(supplier.id)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                        {supplier.is_active && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => void handleDelete(supplier)}
                          >
                            <i className="bi bi-truck-flatbed"></i>
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

      <SupplierFormModal
        show={showModal}
        supplier={editingSupplier}
        loading={saving}
        error={modalError}
        onClose={() => {
          setShowModal(false);
          setEditingSupplier(null);
          setModalError(null);
        }}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};

export default Suppliers;
