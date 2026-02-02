import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FiBox, FiBell, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useItemStore } from '@stores/itemStore';
import { alertService } from '@services/alertService';
import type { AlertStats } from '../types/alert';
import { formatPrice } from '@utils/helpers';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { items, fetchItems, isLoading } = useItemStore();
    const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchItems();
        loadAlertStats();
    }, []);

    const loadAlertStats = async () => {
        try {
            const stats = await alertService.getStats();
            setAlertStats(stats);
        } catch (error) {
            console.error('Error loading alert stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const lowStockItems = items.filter((item) => item.quantity < 5 && item.quantity > 0);
    const outOfStockItems = items.filter((item) => item.quantity === 0);
    const totalInventoryValue = items.reduce(
        (sum, item) => sum + item.buying_price * item.quantity,
        0
    );

    const stats = [
        {
            title: 'Total Items',
            value: items.length,
            icon: FiBox,
            color: 'primary',
            link: '/items',
        },
        {
            title: 'Low Stock',
            value: lowStockItems.length,
            icon: FiBell,
            color: 'warning',
            link: '/items',
        },
        {
            title: 'Out of Stock',
            value: outOfStockItems.length,
            icon: FiShoppingCart,
            color: 'danger',
            link: '/items',
        },
        {
            title: 'Alerts',
            value: alertStats?.active_alerts || 0,
            icon: FiBell,
            color: 'info',
            link: '/alerts',
        },
    ];

    return (
        <Container fluid className="dashboard py-4">
            <div className="mb-4">
                <h1 className="h2 fw-bold">Dashboard</h1>
                <p className="text-muted">Welcome to Pujana Electrical Inventory System</p>
            </div>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                {stats.map((stat, index) => (
                    <Col key={index} xs={12} sm={6} lg={3}>
                        <Link to={stat.link} style={{ textDecoration: 'none' }}>
                            <Card className={`stat-card border-0 h-100 card-${stat.color}`}>
                                <Card.Body className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted mb-1">{stat.title}</p>
                                        <h3 className="fw-bold mb-0">{stat.value}</h3>
                                    </div>
                                    <div className={`stat-icon bg-${stat.color}-light text-${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>

            <Row className="g-3">
                {/* Inventory Value */}
                <Col xs={12} lg={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-light border-0 py-3">
                            <h5 className="mb-0 fw-bold">Inventory Value</h5>
                        </Card.Header>
                        <Card.Body className="text-center py-4">
                            <p className="text-muted mb-2">Total Value</p>
                            <h2 className="fw-bold text-primary">{formatPrice(totalInventoryValue)}</h2>
                            <small className="text-muted">{items.length} items in stock</small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Quick Actions */}
                <Col xs={12} lg={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-light border-0 py-3">
                            <h5 className="mb-0 fw-bold">Quick Actions</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Link to="/bills/create/buy">
                                    <Button variant="outline-primary" className="w-100">
                                        New Buy Bill
                                    </Button>
                                </Link>
                                <Link to="/bills/create/sell">
                                    <Button variant="outline-success" className="w-100">
                                        New Sell Bill
                                    </Button>
                                </Link>
                                <Link to="/items">
                                    <Button variant="outline-info" className="w-100">
                                        Manage Items
                                    </Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
                <Row className="g-3 mt-3">
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light border-0 py-3">
                                <h5 className="mb-0 fw-bold">
                                    <FiBell size={18} className="me-2" />
                                    Items Low in Stock
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <tbody>
                                            {lowStockItems.slice(0, 5).map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <strong>{item.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{item.model_number}</small>
                                                    </td>
                                                    <td className="text-end">
                                                        <span className="badge bg-warning text-dark">
                                                            {item.quantity} units
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {lowStockItems.length > 5 && (
                                    <div className="p-3 border-top">
                                        <Link to="/items" className="text-decoration-none">
                                            View all low stock items →
                                        </Link>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Dashboard;
