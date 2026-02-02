import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuthStore } from '@stores/authStore';
import { validateEmail, validatePassword } from '@utils/helpers';
import './Auth.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, isAuthenticated } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 0);
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear validation error for this field
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validate = (): boolean => {
        const errors: typeof validationErrors = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await login(formData.email, formData.password);
            toast.success('Login successful!');
            // Add a small delay to ensure state is updated
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 100);
        } catch (err: any) {
            toast.error(error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <Container className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="auth-card-wrapper">
                    <Card className="auth-card">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="mb-2">
                                    <span style={{ fontSize: '2rem' }}>⚡</span>
                                </h2>
                                <h1 className="h3 fw-bold">Pujana Electrical</h1>
                                <p className="text-muted">Inventory Management System</p>
                            </div>

                            {error && (
                                <Alert variant="danger">
                                    {typeof error === 'string' ? error : 'An error occurred during login'}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={!!validationErrors.email}
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        isInvalid={!!validationErrors.password}
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    className="w-100 py-2 fw-bold"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </Button>
                            </Form>

                            <hr className="my-4" />

                            <p className="text-center text-muted mb-0">
                                Don't have an account?{' '}
                                <Link to="/register" className="fw-bold">
                                    Register here
                                </Link>
                            </p>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default Login;
