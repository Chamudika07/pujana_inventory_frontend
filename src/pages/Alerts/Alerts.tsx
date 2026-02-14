import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Alert, Spinner, Row, Col, Form, Badge } from 'react-bootstrap';
import { alertService } from '../../services/alertService';
import type { Alert as AlertType } from '../../services/alertService';

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertType[]>([]);
    const [filteredAlerts, setFilteredAlerts] = useState<AlertType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('active');

    useEffect(() => {
        loadAlerts();
    }, []);

    useEffect(() => {
        filterAlerts();
    }, [alerts, filterStatus]);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await alertService.getAll();
            setAlerts(data);
        } catch (err) {
            setError('Failed to load alerts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterAlerts = () => {
        let filtered = alerts;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(alert => alert.status === filterStatus);
        }

        // Sort by created_at descending
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setFilteredAlerts(filtered);
    };

    const handleResolveAlert = async (alertId: string) => {
        try {
            setError(null);
            await alertService.resolveAlert(alertId);
            setSuccess('Alert marked as resolved');
            loadAlerts();
        } catch (err) {
            setError('Failed to resolve alert');
            console.error(err);
        }
    };

    const handleDeleteAlert = async (alertId: string) => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
            try {
                setError(null);
                await alertService.deleteAlert(alertId);
                setSuccess('Alert deleted successfully');
                loadAlerts();
            } catch (err) {
                setError('Failed to delete alert');
                console.error(err);
            }
        }
    };

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h1 className="h2 fw-bold">Low Stock Alerts</h1>
                <p className="text-muted">View and manage low stock alerts for your items</p>
            </div>

            {/* Alerts */}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            {/* Filter Section */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">Filter by Status</Form.Label>
                        <Form.Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'resolved')}
                            className="border-1"
                        >
                            <option value="all">All Alerts</option>
                            <option value="active">Active Alerts</option>
                            <option value="resolved">Resolved Alerts</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6} className="text-end d-flex align-items-end">
                    <Button variant="outline-primary" onClick={loadAlerts} className="fw-semibold">
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                    </Button>
                </Col>
            </Row>

            {/* Alerts Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="text-muted">Loading alerts...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted mb-0">
                                {filterStatus === 'active'
                                    ? 'No active alerts. Great job keeping stock levels up!'
                                    : 'No alerts found.'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light border-top">
                                    <tr>
                                        <th className="fw-semibold">Item Name</th>
                                        <th className="fw-semibold">Current Stock</th>
                                        <th className="fw-semibold">Minimum Stock</th>
                                        <th className="fw-semibold">Status</th>
                                        <th className="fw-semibold">Created Date</th>
                                        <th className="fw-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAlerts.map(alert => (
                                        <tr key={alert.id}>
                                            <td className="fw-semibold">{alert.item_name}</td>
                                            <td>
                                                <span className="badge bg-danger">{alert.current_stock}</span>
                                            </td>
                                            <td>{alert.minimum_stock}</td>
                                            <td>
                                                <Badge bg={alert.status === 'active' ? 'warning' : 'success'}>
                                                    {alert.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(alert.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="text-center">
                                                {alert.status === 'active' && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => handleResolveAlert(alert.id)}
                                                        className="me-2"
                                                        title="Mark as Resolved"
                                                    >
                                                        <i className="bi bi-check-circle"></i>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteAlert(alert.id)}
                                                    title="Delete Alert"
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
                {!loading && alerts.length > 0 && (
                    <Card.Footer className="bg-light text-muted text-sm">
                        Showing {filteredAlerts.length} of {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                    </Card.Footer>
                )}
            </Card>
        </Container>
    );
};

export default Alerts;
