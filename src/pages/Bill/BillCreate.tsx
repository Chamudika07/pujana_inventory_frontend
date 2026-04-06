import React, { useCallback, useEffect, useState } from 'react';
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
import { customerService } from '../../services/customerService';
import { itemService } from '../../services/itemService';
import { supplierService } from '../../services/supplierService';
import QrScannerModal from '../../components/Bill/QrScannerModal';
import type { BillCreateItem, BillResponse } from '../../types/bill';
import type { CustomerListItem } from '../../types/customer';
import type { SupplierListItem } from '../../types/supplier';
import type { Item } from '../../types/item';
import { useDebounce } from '../../hooks';

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
    const [billStarted, setBillStarted] = useState(false);

    // Items state
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [modelNumber, setModelNumber] = useState('');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<CustomerListItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
    const [supplierQuery, setSupplierQuery] = useState('');
    const [supplierResults, setSupplierResults] = useState<SupplierListItem[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierListItem | null>(null);
    const debouncedCustomerQuery = useDebounce(customerQuery, 300);
    const debouncedSupplierQuery = useDebounce(supplierQuery, 300);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showQrScanner, setShowQrScanner] = useState(false);

    // Update bill type when route parameter changes
    useEffect(() => {
        if (type && type !== billType) {
            setBillType(type);
        }
    }, [type]);

    useEffect(() => {
        const loadCustomers = async () => {
            if (billType !== 'sell' || debouncedCustomerQuery.trim().length < 2) {
                setCustomerResults([]);
                return;
            }

            try {
                const results = await customerService.search(debouncedCustomerQuery.trim());
                setCustomerResults(results.slice(0, 6));
            } catch (err) {
                console.error(err);
            }
        };

        void loadCustomers();
    }, [billType, debouncedCustomerQuery]);

    useEffect(() => {
        const loadSuppliers = async () => {
            if (billType !== 'buy' || debouncedSupplierQuery.trim().length < 2) {
                setSupplierResults([]);
                return;
            }

            try {
                const results = await supplierService.search(debouncedSupplierQuery.trim());
                setSupplierResults(results.slice(0, 6));
            } catch (err) {
                console.error(err);
            }
        };

        void loadSuppliers();
    }, [billType, debouncedSupplierQuery]);

    const loadItemByModelNumber = useCallback(async (nextModelNumber: string, sourceLabel: 'manual' | 'scan') => {
        const trimmedModelNumber = nextModelNumber.trim();
        if (!trimmedModelNumber) {
            setError('Please enter a model number');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const item = await itemService.getByModelNumber(trimmedModelNumber);
            setSelectedItem(item);
            setModelNumber(item.model_number);
            setSuccess(
                sourceLabel === 'scan'
                    ? `Scanned item ${item.model_number} loaded`
                    : `Item ${item.model_number} loaded`
            );
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to find item';
            setSelectedItem(null);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLookupItem = async () => {
        await loadItemByModelNumber(modelNumber, 'manual');
    };

    const handleQrDetected = useCallback(async (rawValue: string) => {
        setError(null);
        const resolved = await itemService.resolveQrCode(rawValue);
        setModelNumber(resolved.resolved_model_number);
        setSelectedItem(resolved.item);
        setSuccess(`Scanned item ${resolved.item.model_number} loaded`);
    }, []);

    const handleOpenQrScanner = () => {
        setError(null);
        setSuccess(null);
        setShowQrScanner(true);
    };

    const handleStartBill = async () => {
        try {
            setError(null);
            setSuccess(null);
            setBillStarted(true);
            setSelectedItem(null);
            setModelNumber('');
            setCustomerResults([]);
            setSupplierResults([]);
            setSuccess(`${billType.toUpperCase()} bill draft started`);
        } catch (err) {
            setError('Failed to start bill');
            console.error(err);
        }
    };

    const handleAddItem = () => {
        if (!selectedItem) {
            setError('Please look up an item by model number');
            return;
        }

        if (quantity <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        // Check stock availability for sell bills
        if (billType === 'sell' && selectedItem.quantity < quantity) {
            setError(`Insufficient stock. Available: ${selectedItem.quantity}, Requested: ${quantity}`);
            return;
        }

        const price = billType === 'buy' ? selectedItem.buying_price : selectedItem.selling_price;
        const total = price * quantity;

        const newBillItem: BillItem = {
            item: selectedItem,
            quantity,
            price,
            total
        };

        setBillItems(prev => [...prev, newBillItem]);
        setSelectedItem(null);
        setModelNumber('');
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

            const payload: BillCreateItem[] = billItems.map((billItem) => ({
                model_number: billItem.item.model_number,
                quantity: billItem.quantity,
            }));

            const response: BillResponse = await billService.createBill(
                billType,
                payload,
                billType === 'sell' ? selectedCustomer?.id : undefined,
                billType === 'buy' ? selectedSupplier?.id : undefined
            );
            setSuccess(`Bill saved successfully with ID ${response.bill_id}`);
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
        setBillStarted(false);
        setBillItems([]);
        setSelectedItem(null);
        setModelNumber('');
        setQuantity(1);
        setSelectedCustomer(null);
        setCustomerQuery('');
        setCustomerResults([]);
        setSelectedSupplier(null);
        setSupplierQuery('');
        setSupplierResults([]);
        setShowQrScanner(false);
    };

    const calculateTotal = () => {
        return billItems.reduce((sum, item) => sum + item.total, 0);
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

                                    {billType === 'sell' && (
                                        <div className="mb-4">
                                            <Form.Label className="fw-semibold">Customer</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search customer by name or phone"
                                                value={customerQuery}
                                                onChange={(e) => {
                                                    setCustomerQuery(e.target.value);
                                                    if (selectedCustomer) {
                                                        setSelectedCustomer(null);
                                                    }
                                                }}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                Optional for walk-in sales. Link a customer to keep purchase history.
                                            </small>
                                            {customerResults.length > 0 && !selectedCustomer && (
                                                <ListGroup className="mt-2 shadow-sm">
                                                    {customerResults.map((customer) => (
                                                        <ListGroup.Item
                                                            key={customer.id}
                                                            action
                                                            onClick={() => {
                                                                setSelectedCustomer(customer);
                                                                setCustomerQuery(customer.full_name);
                                                                setCustomerResults([]);
                                                            }}
                                                        >
                                                            <div className="fw-semibold">{customer.full_name}</div>
                                                            <small className="text-muted">
                                                                {customer.phone_number} | {customer.customer_type.toUpperCase()}
                                                            </small>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            )}
                                            {selectedCustomer && (
                                                <div className="alert alert-light border mt-3 mb-0">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <div className="fw-semibold">{selectedCustomer.full_name}</div>
                                                            <small className="text-muted d-block">{selectedCustomer.phone_number}</small>
                                                            <small className="text-muted d-block">
                                                                Due Balance: Rs. {Number(selectedCustomer.due_balance).toFixed(2)}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedCustomer(null);
                                                                setCustomerQuery('');
                                                            }}
                                                        >
                                                            Clear
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {billType === 'buy' && (
                                        <div className="mb-4">
                                            <Form.Label className="fw-semibold">Supplier</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search supplier by name, company or phone"
                                                value={supplierQuery}
                                                onChange={(e) => {
                                                    setSupplierQuery(e.target.value);
                                                    if (selectedSupplier) {
                                                        setSelectedSupplier(null);
                                                    }
                                                }}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                Optional for direct purchases. Link a supplier to keep purchase history.
                                            </small>
                                            {supplierResults.length > 0 && !selectedSupplier && (
                                                <ListGroup className="mt-2 shadow-sm">
                                                    {supplierResults.map((supplier) => (
                                                        <ListGroup.Item
                                                            key={supplier.id}
                                                            action
                                                            onClick={() => {
                                                                setSelectedSupplier(supplier);
                                                                setSupplierQuery(supplier.supplier_name);
                                                                setSupplierResults([]);
                                                            }}
                                                        >
                                                            <div className="fw-semibold">{supplier.supplier_name}</div>
                                                            <small className="text-muted">
                                                                {supplier.company_name || supplier.phone_number}
                                                            </small>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            )}
                                            {selectedSupplier && (
                                                <div className="alert alert-light border mt-3 mb-0">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <div className="fw-semibold">{selectedSupplier.supplier_name}</div>
                                                            <small className="text-muted d-block">
                                                                {selectedSupplier.company_name || selectedSupplier.phone_number}
                                                            </small>
                                                            <small className="text-muted d-block">
                                                                Payable Balance: Rs. {Number(selectedSupplier.payable_balance).toFixed(2)}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedSupplier(null);
                                                                setSupplierQuery('');
                                                            }}
                                                        >
                                                            Clear
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

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
                                    <h4 className="fw-bold text-primary mb-4">Generated on save</h4>
                                    {billType === 'sell' && selectedCustomer && (
                                        <div className="alert alert-light border text-start mb-4">
                                            <small className="text-muted d-block">Selected Customer</small>
                                            <div className="fw-semibold">{selectedCustomer.full_name}</div>
                                            <small className="text-muted">{selectedCustomer.phone_number}</small>
                                        </div>
                                    )}
                                    {billType === 'buy' && selectedSupplier && (
                                        <div className="alert alert-light border text-start mb-4">
                                            <small className="text-muted d-block">Selected Supplier</small>
                                            <div className="fw-semibold">{selectedSupplier.supplier_name}</div>
                                            <small className="text-muted">
                                                {selectedSupplier.company_name || selectedSupplier.phone_number}
                                            </small>
                                        </div>
                                    )}
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
                                                        Model Number <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={modelNumber}
                                                        onChange={(e) => setModelNumber(e.target.value)}
                                                        disabled={loading}
                                                        placeholder="Enter model number"
                                                    />
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
                                                    <div className="d-grid gap-2">
                                                        <Button
                                                            variant="outline-primary"
                                                            onClick={handleLookupItem}
                                                            disabled={loading || !modelNumber.trim()}
                                                            className="fw-semibold"
                                                        >
                                                            <i className="bi bi-search me-2"></i>
                                                            Find Item
                                                        </Button>
                                                        <Button
                                                            variant="outline-dark"
                                                            onClick={handleOpenQrScanner}
                                                            disabled={loading}
                                                            className="fw-semibold"
                                                        >
                                                            <i className="bi bi-qr-code-scan me-2"></i>
                                                            Scan QR
                                                        </Button>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Selected Item Details */}
                                        {selectedItem && (
                                            <div className="alert alert-light border mb-4">
                                                <Row className="g-2">
                                                    <Col xs={12}>
                                                        <h6 className="fw-semibold mb-2">Selected Item Details</h6>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">Name:</small>
                                                        <p className="fw-semibold mb-0">{selectedItem.name}</p>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">Category:</small>
                                                        <p className="fw-semibold mb-0">{selectedItem.category.name}</p>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">Stock:</small>
                                                        <p className="fw-semibold mb-0">{selectedItem.quantity}</p>
                                                    </Col>
                                                    <Col md={3}>
                                                        <small className="text-muted">
                                                            {billType === 'buy' ? 'Buying Price' : 'Selling Price'}:
                                                        </small>
                                                        <p className="fw-semibold mb-0">
                                                            ₨ {Number(billType === 'buy' ? selectedItem.buying_price : selectedItem.selling_price).toFixed(2)}
                                                        </p>
                                                    </Col>
                                                </Row>
                                                <div className="mt-3">
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleAddItem}
                                                        disabled={loading || quantity <= 0}
                                                        className="fw-semibold"
                                                    >
                                                        <i className="bi bi-plus-circle me-2"></i>
                                                        Add Item
                                                    </Button>
                                                </div>
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

            <QrScannerModal
                show={showQrScanner}
                onHide={() => setShowQrScanner(false)}
                onDetected={handleQrDetected}
            />
        </Container>
    );
};

export default BillCreate;
