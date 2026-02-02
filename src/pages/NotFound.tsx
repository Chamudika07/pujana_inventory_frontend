import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound: React.FC = () => {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 60px)' }}>
            <Card className="text-center border-0" style={{ width: '100%', maxWidth: '500px' }}>
                <Card.Body className="p-5">
                    <h1 className="display-1 fw-bold text-primary">404</h1>
                    <h2 className="h3 mb-3">Page Not Found</h2>
                    <p className="text-muted mb-4">The page you are looking for doesn't exist or has been moved.</p>
                    <Link to="/" className="btn btn-primary">
                        <FiArrowLeft className="me-2" />
                        Go to Dashboard
                    </Link>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NotFound;
