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
        model_number: '',
        category_id: 0
    });

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
                model_number: item.model_number,
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
                model_number: '',
                category_id: 0
            });
        }
        setShowModal(true);
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
            model_number: '',
            category_id: 0
        });
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
        if (!formData.name.trim()) {
            setError('Item name is required');
            return false;
        }
        if (!formData.model_number.trim()) {
            setError('Model number is required');
            return false;
        }
        if (formData.category_id === 0) {
            setError('Please select a category');
            return false;
        }
        if (formData.buying_price < 0 || formData.selling_price < 0) {
            setError('Prices cannot be negative');
            return false;
        }
        if (formData.quantity < 0) {
            setError('Quantity cannot be negative');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setError(null);
            if (editingId) {
                await itemService.update(editingId, formData);
                setSuccess('Item updated successfully');
            } else {
                await itemService.create(formData);
                setSuccess('Item created successfully');
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
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Model Number <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="model_number"
                                        value={formData.model_number}
                                        onChange={handleFormChange}
                                        placeholder="Enter model number"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Category <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleFormChange}
                                    >
                                        <option value="0">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Quantity <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleFormChange}
                                        min="0"
                                        placeholder="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Buying Price (₨) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="buying_price"
                                        value={formData.buying_price}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Selling Price (₨) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="selling_price"
                                        value={formData.selling_price}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
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
        </Container>
    );
};

export default Items;
