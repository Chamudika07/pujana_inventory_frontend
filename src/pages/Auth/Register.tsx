import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuthStore } from '@stores/authStore';
import { validateEmail, validatePassword } from '@utils/helpers';
import './Auth.css';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        } else if (!validatePassword(formData.password)) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
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
            await register(formData.email, formData.password, formData.phone);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            toast.error(error || 'Registration failed');
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
                                <h1 className="h3 fw-bold">Create Account</h1>
                                <p className="text-muted">Join Pujana Electrical</p>
                            </div>

                            {error && (
                                <Alert variant="danger">
                                    {typeof error === 'string' ? error : 'An error occurred during registration'}
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
                                    <Form.Label>Phone Number (Optional)</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        disabled={isLoading}
                                    />
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

                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        isInvalid={!!validationErrors.confirmPassword}
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.confirmPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    className="w-100 py-2 fw-bold"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </Form>

                            <hr className="my-4" />

                            <p className="text-center text-muted mb-0">
                                Already have an account?{' '}
                                <Link to="/login" className="fw-bold">
                                    Login here
                                </Link>
                            </p>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default Register;
