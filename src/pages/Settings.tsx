import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
    const navigate = useNavigate();

    const settingsOptions = [
        {
            id: 1,
            title: 'Notification Settings',
            description: 'Configure email and WhatsApp alerts for low stock items',
            icon: 'bi-bell-fill',
            color: 'primary',
            path: '/settings/notifications'
        },
        {
            id: 2,
            title: 'Account Settings',
            description: 'Manage your account information',
            icon: 'bi-person-fill',
            color: 'info',
            path: '#',
            disabled: true
        },
        {
            id: 3,
            title: 'Security Settings',
            description: 'Change password and security preferences',
            icon: 'bi-lock-fill',
            color: 'warning',
            path: '#',
            disabled: true
        },
        {
            id: 4,
            title: 'App Settings',
            description: 'General application preferences',
            icon: 'bi-gear-fill',
            color: 'secondary',
            path: '#',
            disabled: true
        }
    ];

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h1 className="h2 fw-bold">Settings</h1>
                <p className="text-muted">Manage your account and application settings</p>
            </div>

            <Row className="g-3">
                {settingsOptions.map(option => (
                    <Col lg={6} key={option.id}>
                        <Card className="border-0 shadow-sm h-100 hover-card" style={{ cursor: option.disabled ? 'not-allowed' : 'pointer' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                    <div>
                                        <h5 className="fw-bold mb-2">{option.title}</h5>
                                        <p className="text-muted small mb-0">{option.description}</p>
                                    </div>
                                    <div className={`text-${option.color}`} style={{ fontSize: '24px' }}>
                                        <i className={`bi ${option.icon}`}></i>
                                    </div>
                                </div>

                                <Button
                                    variant={option.disabled ? 'outline-secondary' : `outline-${option.color}`}
                                    className="fw-semibold"
                                    onClick={() => navigate(option.path)}
                                    disabled={option.disabled}
                                >
                                    {option.disabled ? 'Coming Soon' : 'Configure'}
                                    <i className={`bi bi-chevron-right ms-2`}></i>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Help Section */}
            <Row className="g-3 mt-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-info-circle me-2 text-info"></i>
                                Need Help?
                            </h5>
                            <p className="text-muted mb-2">
                                <strong>Notification Settings:</strong> Configure how you receive low stock alerts. You can set up email notifications, WhatsApp alerts, and customize the alert threshold for your items.
                            </p>
                            <p className="text-muted mb-0">
                                Use the test email feature to verify your email configuration is working correctly before relying on it for important alerts.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .hover-card {
                    transition: all 0.3s ease;
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
            `}</style>
        </Container>
    );
};

export default Settings;
