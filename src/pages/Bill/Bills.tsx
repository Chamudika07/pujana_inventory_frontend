import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    Button,
    Table,
    Form,
    Modal,
    Alert,
    Spinner,
    Row,
    Col,
    Badge
} from 'react-bootstrap';
import { billService } from '../../services/billService';
import type { Bill } from '../../types/bill';

const Bills: React.FC = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState<Bill[]>([]);
    const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('');

    // Modal states
    const [showBillModal, setShowBillModal] = useState(false);
    // Load bills and items on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Filter bills based on search term and type
    useEffect(() => {
        let filtered = bills;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(bill =>
                bill.bill_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterType !== '') {
            filtered = filtered.filter(bill => bill.bill_type === filterType);
        }

        // Sort by created_at descending
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setFilteredBills(filtered);
    }, [searchTerm, filterType, bills]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const billsData = await billService.getAll();
            setBills(billsData);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleCreateBill = (billType: 'buy' | 'sell') => {
        navigate(`/bills/create/${billType}`);
    };

    const handleViewBill = async (billId: string) => {
        try {
            setError(null);
            await billService.printBill(billId);
        } catch (err) {
            setError('Failed to download bill PDF');
            console.error(err);
        }
    };


    return (
        <Container fluid className="py-4">
            {/* Header Section */}
            <div className="mb-4">
                <h1 className="h2 fw-bold">Bills Management</h1>
                <p className="text-muted">Manage buy and sell bills</p>
            </div>

            {/* Alerts */}
            {error && <Alert key="error-alert" variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert key="success-alert" variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            {/* Action Buttons */}
            <Row className="mb-4">
                <Col md={8}>
                    <div className="d-flex gap-2">
                        <Button
                            variant="success"
                            size="lg"
                            onClick={() => setShowBillModal(true)}
                            className="fw-semibold"
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Create New Bill
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Search and Filters Section */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Search by bill ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-1"
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border-1"
                        >
                            <option value="">All Types</option>
                            <option value="buy">Buy Bills</option>
                            <option value="sell">Sell Bills</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {/* Bills Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="text-muted">Loading bills...</p>
                        </div>
                    ) : filteredBills.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted mb-0">
                                {searchTerm || filterType ? 'No bills found matching your filters.' : 'No bills yet. Create your first bill!'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light border-top">
                                    <tr>
                                        <th className="fw-semibold">Bill ID</th>
                                        <th className="fw-semibold">Type</th>
                                        <th className="fw-semibold">Created Date</th>
                                        <th className="fw-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBills.map(bill => (
                                        <tr key={bill.bill_id}>
                                            <td className="fw-semibold">{bill.bill_id}</td>
                                            <td>
                                                <Badge bg={bill.bill_type === 'buy' ? 'info' : 'success'}>
                                                    {bill.bill_type.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(bill.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleViewBill(bill.bill_id)}
                                                    className="me-2"
                                                    title="Download PDF"
                                                >
                                                    <i className="bi bi-download"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleViewBill(bill.bill_id)}
                                                    title="Print / Download PDF"
                                                >
                                                    <i className="bi bi-printer"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
                {!loading && bills.length > 0 && (
                    <Card.Footer className="bg-light text-muted text-sm">
                        Showing {filteredBills.length} of {bills.length} bill{bills.length !== 1 ? 's' : ''}
                    </Card.Footer>
                )}
            </Card>

            {/* Start Bill Modal */}
            <Modal show={showBillModal} onHide={() => setShowBillModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Create New Bill</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-4">Select the type of bill you want to create:</p>
                    <div className="d-grid gap-3">
                        <Button
                            variant="info"
                            size="lg"
                            onClick={() => handleCreateBill('buy')}
                            className="fw-semibold"
                        >
                            <i className="bi bi-cart-plus me-2"></i>
                            Buy Bill
                        </Button>
                        <Button
                            variant="success"
                            size="lg"
                            onClick={() => handleCreateBill('sell')}
                            className="fw-semibold"
                        >
                            <i className="bi bi-bag-check me-2"></i>
                            Sell Bill
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

        </Container>
    );
};

export default Bills;
