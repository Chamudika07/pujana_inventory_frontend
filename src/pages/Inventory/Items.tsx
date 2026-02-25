import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Form, Modal, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { itemService } from '../../services/itemService';
import { categoryService } from '../../services/categoryService';
import type { Item, ItemCreate } from '../../types/item';
import type { Category } from '../../types/category';

const Items: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<number | string>('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ItemCreate>({
        name: '',
        quantity: 0,
        buying_price: 0,
        selling_price: 0,
        description: '',
        category_id: 0
    });
    const [buyingPriceFocused, setBuyingPriceFocused] = useState(false);
    const [sellingPriceFocused, setSellingPriceFocused] = useState(false);
    const [quantityFocused, setQuantityFocused] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

    // QR Code modal state
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedItemQR, setSelectedItemQR] = useState<Item | null>(null);

    // Load items and categories on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Filter items based on search term and category
    useEffect(() => {
        let filtered = items;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.model_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (filterCategory !== '') {
            filtered = filtered.filter(item => item.category.id === Number(filterCategory));
        }

        setFilteredItems(filtered);
    }, [searchTerm, filterCategory, items]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [itemsData, categoriesData] = await Promise.all([
                itemService.getAll(),
                categoryService.getAll()
            ]);
            setItems(itemsData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: Item) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                name: item.name,
                quantity: item.quantity,
                buying_price: item.buying_price,
                selling_price: item.selling_price,
                description: item.description || '',
                category_id: item.category.id
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                quantity: 0,
                buying_price: 0,
                selling_price: 0,
                description: '',
                category_id: 0
            });
        }
        setShowModal(true);
        setFieldErrors({});
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            name: '',
            quantity: 0,
            buying_price: 0,
            selling_price: 0,
            description: '',
            category_id: 0
        });
        setFieldErrors({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'quantity' || name === 'buying_price' || name === 'selling_price' || name === 'category_id') {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'category_id' ? Number(value) : Number(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, boolean> = {};

        if (!formData.name.trim()) {
            setError('Item name is required');
            errors.name = true;
        }
        if (formData.category_id === 0) {
            setError('Please select a category');
            errors.category_id = true;
        }
        if (formData.buying_price < 0) {
            setError('Buying price cannot be negative');
            errors.buying_price = true;
        }
        if (formData.selling_price < 0) {
            setError('Selling price cannot be negative');
            errors.selling_price = true;
        }
        if (formData.quantity < 0) {
            setError('Quantity cannot be negative');
            errors.quantity = true;
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setError(null);
            let createdItem: Item;
            if (editingId) {
                await itemService.update(editingId, formData);
                setSuccess('Item updated successfully');
            } else {
                createdItem = await itemService.create(formData);
                setSuccess('Item created successfully');
                // Show QR code for newly created item
                setSelectedItemQR(createdItem);
                setShowQRModal(true);
            }
            handleCloseModal();
            loadData();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to save item';
            setError(errorMessage);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                setError(null);
                await itemService.delete(id);
                setSuccess('Item deleted successfully');
                loadData();
            } catch (err) {
                setError('Failed to delete item');
                console.error(err);
            }
        }
    };

    const handleViewQRCode = (item: Item) => {
        setSelectedItemQR(item);
        setShowQRModal(true);
    };

    const handleDownloadQRCode = async () => {
        if (!selectedItemQR) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/items/${selectedItemQR.id}/qr-code`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to download QR code');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedItemQR.model_number}_qr.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download QR code');
            console.error(err);
        }
    };

    const calculateProfit = (buyPrice: number, sellPrice: number): number => {
        return sellPrice - buyPrice;
    };

    const calculateProfitMargin = (buyPrice: number, sellPrice: number): number => {
        if (buyPrice === 0) return 0;
        return ((sellPrice - buyPrice) / buyPrice) * 100;
    };

    const getStockStatus = (quantity: number): string => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity < 10) return 'Low Stock';
        return 'In Stock';
    };

    const getStockStatusVariant = (quantity: number): string => {
        if (quantity === 0) return 'danger';
        if (quantity < 10) return 'warning';
        return 'success';
    };

    return (
        <Container fluid className="py-4">
            {/* Header Section */}
            <div className="mb-4">
                <h1 className="h2 fw-bold">Items Management</h1>
                <p className="text-muted">Manage your inventory items</p>
            </div>

            {/* Alerts */}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            {/* Search and Filters Section */}
            <Row className="mb-4">
                <Col md={5}>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Search by name, model number or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-1"
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="border-1"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4} className="text-end">
                    <Button
                        variant="primary"
                        onClick={() => handleOpenModal()}
                        className="fw-semibold"
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Item
                    </Button>
                </Col>
            </Row>

            {/* Items Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="text-muted">Loading items...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted mb-0">
                                {searchTerm || filterCategory ? 'No items found matching your filters.' : 'No items yet. Create your first item!'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light border-top">
                                    <tr>
                                        <th className="fw-semibold">ID</th>
                                        <th className="fw-semibold">Name</th>
                                        <th className="fw-semibold">Model #</th>
                                        <th className="fw-semibold">Category</th>
                                        <th className="fw-semibold text-center">Qty</th>
                                        <th className="fw-semibold text-end">Buy Price</th>
                                        <th className="fw-semibold text-end">Sell Price</th>
                                        <th className="fw-semibold text-end">Profit</th>
                                        <th className="fw-semibold text-center">Status</th>
                                        <th className="fw-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(item => {
                                        const profit = calculateProfit(item.buying_price, item.selling_price);
                                        const margin = calculateProfitMargin(item.buying_price, item.selling_price);

                                        return (
                                            <tr key={item.id}>
                                                <td className="text-muted small">{item.id}</td>
                                                <td className="fw-semibold">{item.name}</td>
                                                <td className="text-muted">{item.model_number}</td>
                                                <td>
                                                    <Badge bg="light" text="dark">
                                                        {item.category.name}
                                                    </Badge>
                                                </td>
                                                <td className="text-center fw-semibold">{item.quantity}</td>
                                                <td className="text-end">
                                                    ₨ {Number(item.buying_price).toFixed(2)}
                                                </td>
                                                <td className="text-end">
                                                    ₨ {Number(item.selling_price).toFixed(2)}
                                                </td>
                                                <td className="text-end">
                                                    <span className={profit >= 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                                                        ₨ {profit.toFixed(2)} ({margin.toFixed(1)}%)
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg={getStockStatusVariant(item.quantity)}>
                                                        {getStockStatus(item.quantity)}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleViewQRCode(item)}
                                                        className="me-2"
                                                        title="View QR Code"
                                                    >
                                                        <i className="bi bi-qr-code"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleOpenModal(item)}
                                                        className="me-2"
                                                        title="Edit"
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        title="Delete"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
                {!loading && items.length > 0 && (
                    <Card.Footer className="bg-light text-muted text-sm">
                        Showing {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
                    </Card.Footer>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        {editingId ? 'Edit Item' : 'Add New Item'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Item Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        placeholder="Enter item name"
                                        isInvalid={fieldErrors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Item name is required
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Category <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleFormChange}
                                        isInvalid={fieldErrors.category_id}
                                    >
                                        <option value="0">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Please select a category
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Quantity <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        value={quantityFocused && formData.quantity === 0 ? '' : formData.quantity}
                                        onChange={handleFormChange}
                                        onFocus={() => setQuantityFocused(true)}
                                        onBlur={() => {
                                            setQuantityFocused(false);
                                            if (formData.quantity === 0 || formData.quantity === '') {
                                                setFormData(prev => ({ ...prev, quantity: 0 }));
                                            }
                                        }}
                                        min="0"
                                        placeholder="0"
                                        isInvalid={fieldErrors.quantity}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Quantity cannot be negative
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Buying Price (₨) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text">₨</span>
                                        <Form.Control
                                            type="number"
                                            name="buying_price"
                                            value={buyingPriceFocused && formData.buying_price === 0 ? '' : formData.buying_price}
                                            onChange={handleFormChange}
                                            onFocus={() => setBuyingPriceFocused(true)}
                                            onBlur={() => {
                                                setBuyingPriceFocused(false);
                                                if (formData.buying_price === 0 || formData.buying_price === '') {
                                                    setFormData(prev => ({ ...prev, buying_price: 0 }));
                                                }
                                            }}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            isInvalid={fieldErrors.buying_price}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Price cannot be negative
                                        </Form.Control.Feedback>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Selling Price (₨) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <div className="input-group has-validation">
                                        <span className="input-group-text">₨</span>
                                        <Form.Control
                                            type="number"
                                            name="selling_price"
                                            value={sellingPriceFocused && formData.selling_price === 0 ? '' : formData.selling_price}
                                            onChange={handleFormChange}
                                            onFocus={() => setSellingPriceFocused(true)}
                                            onBlur={() => {
                                                setSellingPriceFocused(false);
                                                if (formData.selling_price === 0 || formData.selling_price === '') {
                                                    setFormData(prev => ({ ...prev, selling_price: 0 }));
                                                }
                                            }}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            isInvalid={fieldErrors.selling_price}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Price cannot be negative
                                        </Form.Control.Feedback>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        {formData.buying_price > 0 && formData.selling_price > 0 && (
                            <Row className="mb-3 p-3 bg-light rounded">
                                <Col md={6}>
                                    <small className="text-muted">Profit per unit:</small>
                                    <p className={`fw-semibold ${calculateProfit(formData.buying_price, formData.selling_price) >= 0 ? 'text-success' : 'text-danger'}`}>
                                        ₨ {calculateProfit(formData.buying_price, formData.selling_price).toFixed(2)}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <small className="text-muted">Profit margin:</small>
                                    <p className={`fw-semibold ${calculateProfitMargin(formData.buying_price, formData.selling_price) >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {calculateProfitMargin(formData.buying_price, formData.selling_price).toFixed(2)}%
                                    </p>
                                </Col>
                            </Row>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Enter item description (optional)"
                                rows={3}
                            />
                        </Form.Group>

                        {/* Auto-generated Model Number Info */}
                        {editingId && (
                            <div className="alert alert-info" role="alert">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>Model Number:</strong> {/* ...existing code will show from item... */}
                                <p className="mb-0 mt-2 text-muted small">
                                    Model numbers are automatically generated in the format: MDL-YYYY-NNNNN
                                </p>
                            </div>
                        )}
                        {!editingId && (
                            <div className="alert alert-info" role="alert">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>Model Number:</strong> Auto-generated after item creation
                                <p className="mb-0 mt-2 text-muted small">
                                    A unique model number (MDL-YYYY-NNNNN format) and QR code will be automatically created when you save this item.
                                </p>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} className="fw-semibold">
                        {editingId ? 'Update Item' : 'Create Item'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* QR Code Modal */}
            <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        <i className="bi bi-qr-code me-2"></i>
                        QR Code - {selectedItemQR?.model_number}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedItemQR ? (
                        <>
                            <div className="mb-4">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/items/${selectedItemQR.id}/qr-code`}
                                    alt={`QR Code for ${selectedItemQR.model_number}`}
                                    style={{ maxWidth: '300px', height: 'auto' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="bg-light p-3 rounded mb-3">
                                <p className="mb-1"><strong>Item:</strong> {selectedItemQR.name}</p>
                                <p className="mb-1"><strong>Model Number:</strong> {selectedItemQR.model_number}</p>
                                <p className="mb-0"><strong>Category:</strong> {selectedItemQR.category.name}</p>
                            </div>
                            <small className="text-muted">
                                Scan this QR code to view item details or use it for inventory tracking.
                            </small>
                        </>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowQRModal(false)}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleDownloadQRCode}
                        className="fw-semibold"
                    >
                        <i className="bi bi-download me-2"></i>
                        Download QR Code
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Items;
