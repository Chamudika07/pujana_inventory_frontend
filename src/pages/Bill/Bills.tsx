import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';

import { billService } from '../../services/billService';
import type { Bill } from '../../types/bill';
import { formatCurrency, formatDateTime, paymentStatusLabel, paymentStatusVariant } from '../../utils/finance';

const Bills: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [showBillModal, setShowBillModal] = useState(false);

  useEffect(() => {
    void loadBills();
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        !searchTerm.trim() ||
        bill.bill_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customer?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.supplier?.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filterType || bill.bill_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [bills, filterType, searchTerm]);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      setBills(await billService.getAll());
    } catch (loadError) {
      setError('Failed to load bills');
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Bills Management</h1>
        <p className="text-muted mb-0">Track sell and buy bills with payment status, collected amounts, and remaining balances.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="mb-4 g-3">
        <Col md={6}>
          <Form.Control
            placeholder="Search by bill code, customer, or supplier"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            <option value="">All Bill Types</option>
            <option value="sell">Sell Bills</option>
            <option value="buy">Buy Bills</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-md-end">
          <Button variant="success" onClick={() => setShowBillModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Create Bill
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p className="text-muted mb-0">Loading bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-5 text-muted">No bills found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bill</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due / Payable</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="fw-semibold">{bill.bill_code}</td>
                      <td>
                        <Badge bg={bill.bill_type === 'sell' ? 'success' : 'info'}>
                          {bill.bill_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        {bill.bill_type === 'sell'
                          ? bill.customer?.full_name || 'Walk-in'
                          : bill.supplier?.supplier_name || 'Direct stock'}
                      </td>
                      <td>{formatCurrency(bill.total_amount)}</td>
                      <td>{formatCurrency(bill.paid_amount)}</td>
                      <td>{formatCurrency(bill.due_amount)}</td>
                      <td>
                        <Badge bg={paymentStatusVariant(bill.payment_status)}>
                          {paymentStatusLabel(bill.payment_status)}
                        </Badge>
                      </td>
                      <td>{formatDateTime(bill.finalized_at || bill.created_at)}</td>
                      <td className="text-center">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => void billService.printBill(bill.bill_code)}>
                          <i className="bi bi-download"></i>
                        </Button>
                        {bill.bill_type === 'sell' && bill.customer_id && (
                          <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/customers/${bill.customer_id}`)}>
                            <i className="bi bi-journal-text"></i>
                          </Button>
                        )}
                        {bill.bill_type === 'buy' && bill.supplier_id && (
                          <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/suppliers/${bill.supplier_id}`)}>
                            <i className="bi bi-journal-text"></i>
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

      <Modal show={showBillModal} onHide={() => setShowBillModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Create New Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3">
            <Button variant="success" size="lg" onClick={() => navigate('/bills/create/sell')}>
              Sell Bill
            </Button>
            <Button variant="info" size="lg" onClick={() => navigate('/bills/create/buy')}>
              Buy Bill
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Bills;
