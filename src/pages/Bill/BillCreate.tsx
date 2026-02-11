import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    Button,
    Form,
    Row,
    Col,
    Alert,
    Spinner,
    Badge,
    ListGroup,
    Modal
} from 'react-bootstrap';
import { billService } from '../../services/billService';
import { itemService } from '../../services/itemService';
import type { BillResponse, BillItemAction } from '../../types/bill';
import type { Item } from '../../types/item';

interface BillItem {
    item: Item;
    quantity: number;
    price: number;
    total: number;
}

const BillCreate: React.FC = () => {
    const { type } = useParams<{ type: 'buy' | 'sell' }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [billType, setBillType] = useState<'buy' | 'sell'>(type || 'sell');
    const [billId, setBillId] = useState<string>('');
    const [billStarted, setBillStarted] = useState(false);

    // Items state
    const [items, setItems] = useState<Item[]>([]);
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Load items on component mount
    useEffect(() => {
        loadItems();
    }, []);

    // Update bill type when route parameter changes
    useEffect(() => {
        if (type && type !== billType) {
            setBillType(type);
        }
    }, [type]);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const itemsData = await itemService.getAll();
            setItems(itemsData);
        } catch (err) {
            setError('Failed to load items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartBill = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response: BillResponse = await billService.startBill(billType);
            setBillId(response.bill_id);
            setBillStarted(true);
            setSuccess(`${billType.toUpperCase()} bill started successfully`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to start bill';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!selectedItem) {
            setError('Please select an item');
            return;
        }

        if (quantity <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        const item = items.find(i => i.model_number === selectedItem);
        if (!item) {
            setError('Selected item not found');
            return;
        }

        // Check stock availability for sell bills
        if (billType === 'sell' && item.quantity < quantity) {
            setError(`Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`);
            return;
        }

        const price = billType === 'buy' ? item.buying_price : item.selling_price;
        const total = price * quantity;

        const newBillItem: BillItem = {
            item,
            quantity,
            price,
            total
        };

        setBillItems(prev => [...prev, newBillItem]);
        setSelectedItem('');
        setQuantity(1);
        setError(null);
        setSuccess('Item added to bill successfully');
    };

    const handleSaveBill = async () => {
        if (billItems.length === 0) {
            setError('Please add at least one item to the bill');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Add each item to the bill via API
            for (const billItem of billItems) {
                const itemData: BillItemAction = {
                    bill_id: billId,
                    model_number: billItem.item.model_number,
                    quantity: billItem.quantity
                };

                await billService.addItemToBill(itemData);
            }

            setSuccess('Bill saved successfully!');
            // Reset form
            resetForm();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to save bill';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setBillType(type || 'sell');
        setBillId('');
        setBillStarted(false);
        setBillItems([]);
        setSelectedItem('');
        setQuantity(1);
    };

    const calculateTotal = () => {
        return billItems.reduce((sum, item) => sum + item.total, 0);
    };

    const getSelectedItemDetails = (modelNumber: string) => {
        return items.find(item => item.model_number === modelNumber);
    };

    return (
        <Container fluid className="py-4">
            {/* Header Section */}
            <div className="mb-4">
                <h1 className="h2 fw-bold">Create New Bill</h1>
                <p className="text-muted">Create buy or sell bills and manage items</p>
            </div>

            {/* Alerts */}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Row className="g-4">
                {/* Bill Configuration Card */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0 fw-semibold">Bill Configuration</h5>
                        </Card.Header>
                        <Card.Body>
                            {!billStarted ? (
                                <Form>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Bill Type</Form.Label>
                                        <div className="d-grid gap-2">
                                            <Button
                                                variant={billType === 'buy' ? 'info' : 'outline-info'}
                                                onClick={() => setBillType('buy')}
                                                className="fw-semibold"
                                            >
                                                <i className="bi bi-cart-plus me-2"></i>
                                                Buy Bill
                                            </Button>
                                            <Button
                                                variant={billType === 'sell' ? 'success' : 'outline-success'}
                                                onClick={() => setBillType('sell')}
                                                className="fw-semibold"
                                            >
                                                <i className="bi bi-bag-check me-2"></i>
                                                Sell Bill
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleStartBill}
                                            disabled={loading}
                                            className="fw-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Starting Bill...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-plus-circle me-2"></i>
                                                    Start {billType.toUpperCase()} Bill
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="mb-3">
                                        <Badge bg={billType === 'buy' ? 'info' : 'success'} className="px-4 py-2">
                                            <i className={`bi bi-${billType === 'buy' ? 'cart-plus' : 'bag-check'} me-2`}></i>
                                            {billType.toUpperCase()} Bill
                                        </Badge>
                                    </div>
                                    <p className="text-muted mb-2">Bill ID:</p>
                                    <h4 className="fw-bold text-primary mb-4">{billId}</h4>
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowConfirmModal(true)}
                                            className="fw-semibold"
                                        >
                                            <i className="bi bi-x-circle me-2"></i>
                                            Cancel Bill
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Items Management Card */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0 fw-semibold">Items Management</h5>
                        </Card.Header>
                        <Card.Body>
                            {!billStarted ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-box-seam text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-3 mb-0">Start a bill to begin adding items</p>
                                </div>
                            ) : (
                                <>
                                    {/* Add Item Form */}
                                    <Form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
                                        <Row className="g-3 mb-4">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Select Item <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={selectedItem}
                                                        onChange={(e) => setSelectedItem(e.target.value)}
                                                        disabled={loading}
                                                        title="Select Item"
                                                    >
                                                        <option value="">-- Select an item --</option>
                                                        {items.map(item => (
                                                            <option key={item.id} value={item.model_number}>
                                                                {item.name} (Model: {item.model_number})
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Quantity <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                                        disabled={loading}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">Actions</Form.Label>
                                                    <div className="d-grid">
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleAddItem}
                                                            disabled={loading || !selectedItem || quantity <= 0}
                                                            className="fw-semibold"
                                                        >
                                                            <i className="bi bi-plus-circle me-2"></i>
                                                            Add Item
                                                        </Button>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Selected Item Details */}
                                        {selectedItem && getSelectedItemDetails(selectedItem) && (
                                            <div className="alert alert-light border mb-4">
                                                <Row className="g-2">
                                                    <Col xs={12}>
                                                        <h6 className="fw-semibold mb-2">Selected Item Details</h6>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">Name:</small>
                                                        <p className="fw-semibold mb-0">{getSelectedItemDetails(selectedItem)?.name}</p>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">Category:</small>
                                                        <p className="fw-semibold mb-0">{getSelectedItemDetails(selectedItem)?.category.name}</p>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">Stock:</small>
                                                        <p className="fw-semibold mb-0">{getSelectedItemDetails(selectedItem)?.quantity}</p>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">
                                                            {billType === 'buy' ? 'Buying Price' : 'Selling Price'}:
                                                        </small>
                                                        <p className="fw-semibold mb-0">
                                                            ₨ {Number(billType === 'buy' ? getSelectedItemDetails(selectedItem)?.buying_price : getSelectedItemDetails(selectedItem)?.selling_price || 0).toFixed(2)}
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}
                                    </Form>

                                    {/* Items List */}
                                    <div className="mb-4">
                                        <h6 className="fw-semibold mb-3">Added Items ({billItems.length})</h6>
                                        {billItems.length === 0 ? (
                                            <div className="text-center py-3 border rounded">
                                                <p className="text-muted mb-0">No items added yet</p>
                                            </div>
                                        ) : (
                                            <ListGroup variant="flush">
                                                {billItems.map((billItem, index) => (
                                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <p className="fw-semibold mb-1">{billItem.item.name}</p>
                                                            <small className="text-muted">
                                                                Model: {billItem.item.model_number} |
                                                                {billType === 'buy' ? ' Buying' : ' Selling'} Price: ₨ {Number(billItem.price || 0).toFixed(2)} |
                                                                Quantity: {billItem.quantity}
                                                            </small>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <span className="fw-semibold">₨ {Number(billItem.total || 0).toFixed(2)}</span>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </div>

                                    {/* Total and Actions */}
                                    {billItems.length > 0 && (
                                        <div className="border-top pt-3">
                                            <Row className="align-items-center">
                                                <Col md={6}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <span className="text-muted">Total Items:</span>
                                                        <span className="fw-semibold">{billItems.length}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3 mt-2">
                                                        <span className="text-muted">Grand Total:</span>
                                                        <span className="fw-bold fs-4 text-primary">₨ {(calculateTotal() ?? 0).toFixed(2)}</span>
                                                    </div>
                                                </Col>
                                                <Col md={6} className="text-end">
                                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => setBillItems([])}
                                                            className="fw-semibold"
                                                        >
                                                            <i className="bi bi-trash me-2"></i>
                                                            Clear Items
                                                        </Button>
                                                        <Button
                                                            variant="success"
                                                            size="lg"
                                                            onClick={handleSaveBill}
                                                            disabled={loading}
                                                            className="fw-semibold"
                                                        >
                                                            {loading ? (
                                                                <>
                                                                    <Spinner
                                                                        as="span"
                                                                        animation="border"
                                                                        size="sm"
                                                                        role="status"
                                                                        aria-hidden="true"
                                                                        className="me-2"
                                                                    />
                                                                    Saving...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-check-circle me-2"></i>
                                                                    Save Bill
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Cancel Bill</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to cancel this bill? All added items will be lost.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Continue Bill
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            resetForm();
                            setShowConfirmModal(false);
                            navigate('/bills');
                        }}
                    >
                        Cancel Bill
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BillCreate;