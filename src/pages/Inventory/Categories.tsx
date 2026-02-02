import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Form, Modal, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { categoryService } from '../../services/categoryService';
import type { Category, CategoryCreate } from '../../types/category';

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CategoryCreate>({
        name: '',
        description: ''
    });

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Filter categories based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCategories(categories);
        } else {
            const filtered = categories.filter(category =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCategories(filtered);
        }
    }, [searchTerm, categories]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingId(category.id);
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            name: '',
            description: ''
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            setError(null);
            if (editingId) {
                await categoryService.update(editingId, formData);
                setSuccess('Category updated successfully');
            } else {
                await categoryService.create(formData);
                setSuccess('Category created successfully');
            }
            handleCloseModal();
            loadCategories();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to save category';
            setError(errorMessage);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                setError(null);
                await categoryService.delete(id);
                setSuccess('Category deleted successfully');
                loadCategories();
            } catch (err) {
                setError('Failed to delete category');
                console.error(err);
            }
        }
    };

    return (
        <Container className="py-4">
            {/* Header Section */}
            <div className="mb-4">
                <h1 className="h2 fw-bold">Categories</h1>
                <p className="text-muted">Manage product categories</p>
            </div>

            {/* Alerts */}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            {/* Search and Add Button Section */}
            <Row className="mb-4">
                <Col md={8}>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Search categories by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-1"
                        />
                    </Form.Group>
                </Col>
                <Col md={4} className="text-end">
                    <Button
                        variant="primary"
                        onClick={() => handleOpenModal()}
                        className="fw-semibold"
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Category
                    </Button>
                </Col>
            </Row>

            {/* Categories Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="text-muted">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted mb-0">
                                {searchTerm ? 'No categories found matching your search.' : 'No categories yet. Create your first category!'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light border-top">
                                    <tr>
                                        <th className="fw-semibold">ID</th>
                                        <th className="fw-semibold">Name</th>
                                        <th className="fw-semibold">Description</th>
                                        <th className="fw-semibold">Created Date</th>
                                        <th className="fw-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map(category => (
                                        <tr key={category.id}>
                                            <td className="text-muted">{category.id}</td>
                                            <td className="fw-semibold">{category.name}</td>
                                            <td className="text-muted">
                                                {category.description || '-'}
                                            </td>
                                            <td className="text-muted">
                                                {category.created_at
                                                    ? new Date(category.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleOpenModal(category)}
                                                    className="me-2"
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
                {!loading && categories.length > 0 && (
                    <Card.Footer className="bg-light text-muted text-sm">
                        Showing {filteredCategories.length} of {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                    </Card.Footer>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                Category Name <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Enter category name"
                                isInvalid={error ? formData.name.trim() === '' : false}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Enter category description (optional)"
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
                        {editingId ? 'Update Category' : 'Create Category'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Categories;
