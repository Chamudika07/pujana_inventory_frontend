import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { toast } from 'react-toastify';

import QrScannerModal from '../../components/Bill/QrScannerModal';
import { useDebounce } from '../../hooks';
import { billService } from '../../services/billService';
import { customerService } from '../../services/customerService';
import { itemService } from '../../services/itemService';
import { supplierService } from '../../services/supplierService';
import type { BillCreateItem, BillType, PaymentMethod, PaymentStatus } from '../../types/bill';
import type { CustomerListItem } from '../../types/customer';
import type { Item } from '../../types/item';
import type { SupplierListItem } from '../../types/supplier';
import { formatCurrency, paymentStatusLabel, paymentStatusVariant } from '../../utils/finance';

interface DraftBillItem {
  item: Item;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

const paymentMethods: PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'cheque', 'other'];

const BillCreate: React.FC = () => {
  const { type } = useParams<{ type: BillType }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [billType, setBillType] = useState<BillType>(type || 'sell');
  const [items, setItems] = useState<DraftBillItem[]>([]);
  const [modelNumber, setModelNumber] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);

  const [supplierQuery, setSupplierQuery] = useState('');
  const [supplierResults, setSupplierResults] = useState<SupplierListItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierListItem | null>(null);

  const [discountAmount, setDiscountAmount] = useState('0.00');
  const [taxAmount, setTaxAmount] = useState('0.00');
  const [initialPaidAmount, setInitialPaidAmount] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);

  const debouncedCustomerQuery = useDebounce(customerQuery, 300);
  const debouncedSupplierQuery = useDebounce(supplierQuery, 300);

  useEffect(() => {
    if (type && type !== billType) {
      setBillType(type);
    }
  }, [billType, type]);

  useEffect(() => {
    const loadCustomers = async () => {
      if (billType !== 'sell' || debouncedCustomerQuery.trim().length < 2) {
        setCustomerResults([]);
        return;
      }

      try {
        setCustomerResults((await customerService.search(debouncedCustomerQuery.trim())).slice(0, 6));
      } catch (loadError) {
        console.error(loadError);
      }
    };

    void loadCustomers();
  }, [billType, debouncedCustomerQuery]);

  useEffect(() => {
    const loadSuppliers = async () => {
      if (billType !== 'buy' || debouncedSupplierQuery.trim().length < 2) {
        setSupplierResults([]);
        return;
      }

      try {
        setSupplierResults((await supplierService.search(debouncedSupplierQuery.trim())).slice(0, 6));
      } catch (loadError) {
        console.error(loadError);
      }
    };

    void loadSuppliers();
  }, [billType, debouncedSupplierQuery]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotal, 0),
    [items]
  );
  const discount = Number(discountAmount) || 0;
  const tax = Number(taxAmount) || 0;
  const total = Math.max(subtotal - discount + tax, 0);
  const paidNow = Number(initialPaidAmount) || 0;
  const dueAmount = Math.max(total - paidNow, 0);

  const paymentStatusPreview: PaymentStatus = useMemo(() => {
    if (paidNow <= 0) {
      return 'unpaid';
    }
    if (paidNow >= total) {
      return 'paid';
    }
    return 'partially_paid';
  }, [paidNow, total]);

  const resetForm = () => {
    setItems([]);
    setModelNumber('');
    setSelectedItem(null);
    setQuantity(1);
    setSelectedCustomer(null);
    setCustomerQuery('');
    setCustomerResults([]);
    setSelectedSupplier(null);
    setSupplierQuery('');
    setSupplierResults([]);
    setDiscountAmount('0.00');
    setTaxAmount('0.00');
    setInitialPaidAmount('0.00');
    setPaymentMethod('cash');
    setNotes('');
    setShowQrScanner(false);
  };

  const loadItemByModelNumber = useCallback(async (nextModelNumber: string, sourceLabel: 'manual' | 'scan') => {
    const trimmedModelNumber = nextModelNumber.trim();
    if (!trimmedModelNumber) {
      setError('Please enter a model number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const item = await itemService.getByModelNumber(trimmedModelNumber);
      setSelectedItem(item);
      setModelNumber(item.model_number);
      toast.success(
        sourceLabel === 'scan'
          ? `Scanned item ${item.model_number} loaded`
          : `Item ${item.model_number} loaded`
      );
    } catch (lookupError: any) {
      setSelectedItem(null);
      setError(lookupError.response?.data?.detail || 'Failed to find item');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQrDetected = useCallback(async (rawValue: string) => {
    setError(null);
    const resolved = await itemService.resolveQrCode(rawValue);
    setModelNumber(resolved.resolved_model_number);
    setSelectedItem(resolved.item);
    toast.success(`Scanned item ${resolved.item.model_number} loaded`);
  }, []);

  const handleAddItem = () => {
    if (!selectedItem) {
      setError('Please load an item before adding it to the bill.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (billType === 'sell' && selectedItem.quantity < quantity) {
      setError(`Insufficient stock. Available: ${selectedItem.quantity}`);
      return;
    }

    const unitPrice = billType === 'buy' ? selectedItem.buying_price : selectedItem.selling_price;
    setItems((previousItems) => [
      ...previousItems,
      {
        item: selectedItem,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      },
    ]);
    setSelectedItem(null);
    setModelNumber('');
    setQuantity(1);
    setError(null);
  };

  const handleSaveBill = async () => {
    if (items.length === 0) {
      setError('Please add at least one line item.');
      return;
    }

    if (discount > subtotal) {
      setError('Discount cannot exceed subtotal.');
      return;
    }

    if (paidNow > total) {
      setError('Initial payment cannot exceed total amount.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: BillCreateItem[] = items.map((entry) => ({
        model_number: entry.item.model_number,
        quantity: entry.quantity,
      }));

      const response = await billService.createBill({
        bill_type: billType,
        items: payload,
        customer_id: billType === 'sell' ? selectedCustomer?.id : undefined,
        supplier_id: billType === 'buy' ? selectedSupplier?.id : undefined,
        discount_amount: discount,
        tax_amount: tax,
        initial_paid_amount: paidNow,
        payment_method: paymentMethod,
        payment_mode_summary: paymentMethod,
        notes: notes.trim() || undefined,
      });

      toast.success(`Bill ${response.bill_id} created successfully.`);
      resetForm();
      navigate('/bills');
    } catch (saveError: any) {
      setError(saveError.response?.data?.detail || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (index: number) => {
    setItems((previousItems) => previousItems.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Create {billType === 'sell' ? 'Sell' : 'Buy'} Bill</h1>
        <p className="text-muted mb-0">Capture stock movement, immediate payment, and the remaining due or payable in one workflow.</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0 fw-semibold">Bill Setup</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Bill Type</Form.Label>
                <div className="d-grid gap-2">
                  <Button variant={billType === 'sell' ? 'success' : 'outline-success'} onClick={() => setBillType('sell')}>
                    Sell Bill
                  </Button>
                  <Button variant={billType === 'buy' ? 'info' : 'outline-info'} onClick={() => setBillType('buy')}>
                    Buy Bill
                  </Button>
                </div>
              </Form.Group>

              {billType === 'sell' ? (
                <div className="mb-3">
                  <Form.Label className="fw-semibold">Customer</Form.Label>
                  <Form.Control
                    placeholder="Search customer by name or phone"
                    value={customerQuery}
                    onChange={(event) => {
                      setCustomerQuery(event.target.value);
                      if (selectedCustomer) {
                        setSelectedCustomer(null);
                      }
                    }}
                  />
                  <small className="text-muted d-block mt-2">Optional for walk-in sales. Link a customer to track receivables.</small>
                  {customerResults.length > 0 && !selectedCustomer && (
                    <ListGroup className="mt-2">
                      {customerResults.map((customer) => (
                        <ListGroup.Item
                          key={customer.id}
                          action
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerQuery(customer.full_name);
                            setCustomerResults([]);
                          }}
                        >
                          <div className="fw-semibold">{customer.full_name}</div>
                          <small className="text-muted">{customer.phone_number}</small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {selectedCustomer && (
                    <Alert variant="light" className="border mt-3 mb-0">
                      <div className="fw-semibold">{selectedCustomer.full_name}</div>
                      <div className="text-muted small">{selectedCustomer.phone_number}</div>
                      <div className="small">Current due: {formatCurrency(selectedCustomer.summary.due_balance)}</div>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="mb-3">
                  <Form.Label className="fw-semibold">Supplier</Form.Label>
                  <Form.Control
                    placeholder="Search supplier by name or phone"
                    value={supplierQuery}
                    onChange={(event) => {
                      setSupplierQuery(event.target.value);
                      if (selectedSupplier) {
                        setSelectedSupplier(null);
                      }
                    }}
                  />
                  <small className="text-muted d-block mt-2">Optional for direct stock entries. Link a supplier to track payables.</small>
                  {supplierResults.length > 0 && !selectedSupplier && (
                    <ListGroup className="mt-2">
                      {supplierResults.map((supplier) => (
                        <ListGroup.Item
                          key={supplier.id}
                          action
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setSupplierQuery(supplier.supplier_name);
                            setSupplierResults([]);
                          }}
                        >
                          <div className="fw-semibold">{supplier.supplier_name}</div>
                          <small className="text-muted">{supplier.phone_number}</small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {selectedSupplier && (
                    <Alert variant="light" className="border mt-3 mb-0">
                      <div className="fw-semibold">{selectedSupplier.supplier_name}</div>
                      <div className="text-muted small">{selectedSupplier.phone_number}</div>
                      <div className="small">Current payable: {formatCurrency(selectedSupplier.summary.payable_balance)}</div>
                    </Alert>
                  )}
                </div>
              )}

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Discount</Form.Label>
                    <Form.Control type="number" min="0" step="0.01" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Tax</Form.Label>
                    <Form.Control type="number" min="0" step="0.01" value={taxAmount} onChange={(event) => setTaxAmount(event.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">{billType === 'sell' ? 'Paid Now' : 'Paid Now'}</Form.Label>
                    <Form.Control type="number" min="0" step="0.01" value={initialPaidAmount} onChange={(event) => setInitialPaidAmount(event.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Payment Method</Form.Label>
                    <Form.Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Optional remarks for this bill"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0 fw-semibold">Payment Preview</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Discount</span>
                <strong>{formatCurrency(discount)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax</span>
                <strong>{formatCurrency(tax)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-semibold">Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Paid Now</span>
                <strong>{formatCurrency(paidNow)}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">{billType === 'sell' ? 'Due Balance' : 'Payable Balance'}</span>
                <strong>{formatCurrency(dueAmount)}</strong>
              </div>
              <div className="mt-3">
                <Badge bg={paymentStatusVariant(paymentStatusPreview)}>
                  {paymentStatusLabel(paymentStatusPreview)}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Add Items</h5>
              <Button variant="outline-secondary" size="sm" onClick={() => setShowQrScanner(true)}>
                <i className="bi bi-upc-scan me-2"></i>
                Scan QR
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Model Number</Form.Label>
                    <Form.Control value={modelNumber} onChange={(event) => setModelNumber(event.target.value)} placeholder="Search by model number" />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Quantity</Form.Label>
                    <Form.Control type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button className="w-100" variant="outline-primary" onClick={() => void loadItemByModelNumber(modelNumber, 'manual')} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Lookup'}
                  </Button>
                </Col>
                <Col md={3}>
                  <Button className="w-100" variant="primary" onClick={handleAddItem} disabled={!selectedItem}>
                    Add to Bill
                  </Button>
                </Col>
              </Row>

              {selectedItem && (
                <Alert variant="light" className="border mt-3 mb-0">
                  <div className="fw-semibold">{selectedItem.name}</div>
                  <div className="small text-muted">Model: {selectedItem.model_number}</div>
                  <div className="small text-muted">Stock: {selectedItem.quantity}</div>
                </Alert>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Bill Items</h5>
              <Button variant="success" onClick={() => void handleSaveBill()} disabled={saving || items.length === 0}>
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : 'Finalize Bill'}
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {items.length === 0 ? (
                <div className="text-center py-5 text-muted">Add line items to build the bill.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Model</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Line Total</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((entry, index) => (
                        <tr key={`${entry.item.id}-${index}`}>
                          <td>{entry.item.name}</td>
                          <td>{entry.item.model_number}</td>
                          <td>{entry.quantity}</td>
                          <td>{formatCurrency(entry.unitPrice)}</td>
                          <td>{formatCurrency(entry.lineTotal)}</td>
                          <td className="text-center">
                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
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
          </Card>
        </Col>
      </Row>

      <QrScannerModal
        show={showQrScanner}
        onHide={() => setShowQrScanner(false)}
        onDetected={handleQrDetected}
      />
    </Container>
  );
};

export default BillCreate;
