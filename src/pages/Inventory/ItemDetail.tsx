import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';

const ItemDetail: React.FC = () => {
    return (
        <Container className="py-4">
            <div className="mb-4">
                <h1 className="h2 fw-bold">Item Detail</h1>
                <p className="text-muted">View item details</p>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-5 text-center">
                    <h3 className="text-muted mb-3">Item Detail Module</h3>
                    <p className="text-muted">This section is under development</p>
                    <Button variant="primary" disabled>
                        Coming Soon
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ItemDetail;
