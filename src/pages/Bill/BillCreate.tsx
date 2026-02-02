import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';

const BillCreate: React.FC = () => {
    return (
        <Container className="py-4">
            <div className="mb-4">
                <h1 className="h2 fw-bold">Create Bill</h1>
                <p className="text-muted">Create a new buy or sell bill</p>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-5 text-center">
                    <h3 className="text-muted mb-3">Create Bill Module</h3>
                    <p className="text-muted">This section is under development</p>
                    <Button variant="primary" disabled>
                        Coming Soon
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default BillCreate;
