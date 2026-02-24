import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const NotificationSettings: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [settings, setSettings] = useState({
        notification_email: '',
        phone_number: '',
        notification_enabled: true,
        alert_threshold: 5
    });

    useEffect(() => {
        loadPreferences();
    }, []);

    const getAuthToken = () => {
        return localStorage.getItem('access_token') || localStorage.getItem('token');
    };

    const loadPreferences = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            const response = await axios.get(
                `${API_BASE_URL}/alerts/preferences/get`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setSettings(response.data);
        } catch (err) {
            setError('Failed to load notification settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            setSettings(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: name === 'alert_threshold' ? parseInt(value) : value
            }));
        }
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            if (!settings.notification_email && settings.notification_enabled) {
                setError('Please enter an email address to enable notifications');
                setSaving(false);
                return;
            }

            const token = getAuthToken();
            await axios.put(
                `${API_BASE_URL}/alerts/preferences/update`,
                settings,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess('✅ Notification settings saved successfully!');
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Failed to save settings';
            setError(`❌ ${errorMsg}`);
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        try {
            setTesting(true);
            setError(null);
            setSuccess(null);

            if (!settings.notification_email) {
                setError('Please enter an email address first');
                setTesting(false);
                return;
            }

            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/alerts/test-email`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(`✅ ${response.data.message} Check your email at ${response.data.recipient}`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Failed to send test email';
            setError(`❌ ${errorMsg}`);
            console.error(err);
        } finally {
            setTesting(false);
        }
    };

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="mb-4 d-flex align-items-center gap-3">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate('/settings')}
                    className="rounded-circle p-2"
                >
                    <i className="bi bi-chevron-left"></i>
                </Button>
                <div>
                    <h1 className="h2 fw-bold mb-0">Notification Settings</h1>
                    <p className="text-muted mb-0">Configure how you receive low stock alerts</p>
                </div>
            </div>

            {/* Alerts */}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Row>
                <Col lg={8}>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="text-muted">Loading settings...</p>
                        </div>
                    ) : (
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4">
                                {/* Notifications Enabled Toggle */}
                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                <i className="bi bi-toggle-on me-2"></i>
                                                Enable All Notifications
                                            </h6>
                                            <small className="text-muted">Turn this off to disable all low stock alerts</small>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id="notification_enabled"
                                            name="notification_enabled"
                                            checked={settings.notification_enabled}
                                            onChange={handleInputChange}
                                            className="ms-3"
                                        />
                                    </div>
                                </Form.Group>

                                <hr />

                                {/* Email Settings */}
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">
                                        <i className="bi bi-envelope me-2 text-primary"></i>
                                        Email Notifications
                                    </h5>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">
                                            Email Address <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="notification_email"
                                            value={settings.notification_email}
                                            onChange={handleInputChange}
                                            placeholder="your-email@example.com"
                                            disabled={!settings.notification_enabled}
                                        />
                                        <small className="text-muted d-block mt-2">
                                            Low stock alerts will be sent to this email address
                                        </small>
                                    </Form.Group>

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleSendTestEmail}
                                        disabled={!settings.notification_email || testing || !settings.notification_enabled}
                                        className="mb-3"
                                    >
                                        {testing ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Sending Test Email...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send me-2"></i>
                                                Send Test Email
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <hr />

                                {/* WhatsApp Settings */}
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">
                                        <i className="bi bi-whatsapp me-2" style={{ color: '#25D366' }}></i>
                                        WhatsApp Notifications (Optional)
                                    </h5>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">
                                            Phone Number
                                        </Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone_number"
                                            value={settings.phone_number}
                                            onChange={handleInputChange}
                                            placeholder="+94771234567"
                                            disabled={!settings.notification_enabled}
                                        />
                                        <small className="text-muted d-block mt-2">
                                            Include country code (e.g., +94 for Sri Lanka). Leave empty to disable WhatsApp alerts.
                                        </small>
                                    </Form.Group>
                                </div>

                                <hr />

                                {/* Alert Threshold */}
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">
                                        <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                                        Alert Threshold
                                    </h5>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">
                                            Minimum Stock Quantity
                                        </Form.Label>
                                        <div className="d-flex gap-2 align-items-center">
                                            <Form.Control
                                                type="number"
                                                name="alert_threshold"
                                                value={settings.alert_threshold}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="100"
                                                disabled={!settings.notification_enabled}
                                                style={{ maxWidth: '150px' }}
                                            />
                                            <span className="text-muted">units</span>
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            You'll receive an alert when item quantity falls below this number
                                        </small>
                                    </Form.Group>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 pt-3 border-top">
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="fw-semibold"
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Save Settings
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={loadPreferences}
                                        disabled={loading}
                                    >
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Reset
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Info Cards */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm bg-light mb-3">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">
                                <i className="bi bi-info-circle me-2 text-info"></i>
                                How It Works
                            </h6>
                            <ul className="small mb-0 list-unstyled">
                                <li className="mb-2">
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    <strong>Email Alerts:</strong> Get low stock notifications via email
                                </li>
                                <li className="mb-2">
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    <strong>WhatsApp Alerts:</strong> Receive instant WhatsApp messages
                                </li>
                                <li className="mb-2">
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    <strong>Custom Threshold:</strong> Set your own alert level
                                </li>
                                <li className="mb-2">
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    <strong>Daily Check:</strong> Automatic checks at 9:00 AM (UTC)
                                </li>
                                <li>
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    <strong>Test Feature:</strong> Verify email setup anytime
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm bg-warning bg-opacity-10">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">
                                <i className="bi bi-lightbulb me-2 text-warning"></i>
                                Quick Tips
                            </h6>
                            <ul className="small mb-0 list-unstyled">
                                <li className="mb-2">
                                    💡 Always test your email first to ensure it works
                                </li>
                                <li className="mb-2">
                                    💡 Check your spam folder if emails dont arrive
                                </li>
                                <li className="mb-2">
                                    💡 Set threshold based on your average usage
                                </li>
                                <li>
                                    💡 Both email and WhatsApp can be used together
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NotificationSettings;
