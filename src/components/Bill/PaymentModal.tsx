import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';

import type { PaymentCreatePayload, PaymentMethod } from '../../types/bill';
import { formatCurrency } from '../../utils/finance';

interface PaymentModalProps {
  show: boolean;
  title: string;
  outstandingAmount: number;
  loading?: boolean;
  error?: string | null;
  initialBillId?: number;
  onClose: () => void;
  onSubmit: (payload: PaymentCreatePayload) => Promise<void>;
}

const paymentMethods: PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'cheque', 'other'];

const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  title,
  outstandingAmount,
  loading = false,
  error,
  initialBillId,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (!show) {
      return;
    }

    setAmount(outstandingAmount > 0 ? Number(outstandingAmount).toFixed(2) : '');
    setPaymentMethod('cash');
    setReferenceNumber('');
    setNotes('');
    setPaidAt(new Date().toISOString().slice(0, 16));
  }, [outstandingAmount, show]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      bill_id: initialBillId,
      amount: Number(amount),
      payment_method: paymentMethod,
      reference_number: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      paid_at: paidAt ? new Date(paidAt).toISOString() : undefined,
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Alert variant="info" className="py-2">
            Outstanding balance: <strong>{formatCurrency(outstandingAmount)}</strong>
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Amount</Form.Label>
            <Form.Control
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Payment Method</Form.Label>
            <Form.Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Reference Number</Form.Label>
            <Form.Control
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              placeholder="Optional receipt, cheque, or bank reference"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Paid At</Form.Label>
            <Form.Control
              type="datetime-local"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold">Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional payment notes"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : 'Record Payment'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
