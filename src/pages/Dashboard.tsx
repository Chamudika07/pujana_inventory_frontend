import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Table } from 'react-bootstrap';
import { FiBell, FiBox, FiCreditCard, FiShoppingCart, FiTruck, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { alertService } from '@services/alertService';
import { dashboardService } from '@services/dashboardService';
import { useItemStore } from '@stores/itemStore';
import type { DueDashboardSummary } from '../types/bill';
import type { AlertStats } from '../types/alert';
import { formatCurrency, formatDateTime } from '../utils/finance';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { items, fetchItems } = useItemStore();
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [dueSummary, setDueSummary] = useState<DueDashboardSummary | null>(null);

  useEffect(() => {
    void fetchItems();
    void loadAlertStats();
    void loadDueSummary();
  }, [fetchItems]);

  const loadAlertStats = async () => {
    try {
      setAlertStats(await alertService.getStats());
    } catch (error) {
      console.error('Error loading alert stats:', error);
    }
  };

  const loadDueSummary = async () => {
    try {
      setDueSummary(await dashboardService.getDueSummary());
    } catch (error) {
      console.error('Error loading due summary:', error);
    }
  };

  const lowStockItems = items.filter((item) => item.quantity < 5 && item.quantity > 0);
  const outOfStockItems = items.filter((item) => item.quantity === 0);
  const totalInventoryValue = items.reduce((sum, item) => sum + item.buying_price * item.quantity, 0);

  const stats = [
    { title: 'Total Items', value: items.length, icon: FiBox, color: 'primary', link: '/items' },
    { title: 'Low Stock', value: lowStockItems.length, icon: FiBell, color: 'warning', link: '/alerts' },
    { title: 'Customer Dues', value: formatCurrency(dueSummary?.total_customer_dues || 0), icon: FiUsers, color: 'danger', link: '/customer-dues' },
    { title: 'Supplier Payables', value: formatCurrency(dueSummary?.total_supplier_payables || 0), icon: FiTruck, color: 'info', link: '/supplier-payables' },
  ];

  return (
    <Container fluid className="dashboard py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">Dashboard</h1>
        <p className="text-muted">Overview of inventory, receivables, payables, and recent payment activity.</p>
      </div>

      <Row className="g-3 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <Link to={stat.link} style={{ textDecoration: 'none' }}>
              <Card className={`stat-card border-0 h-100 card-${stat.color}`}>
                <Card.Body className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">{stat.title}</p>
                    <h4 className="fw-bold mb-0">{stat.value}</h4>
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

      <Row className="g-3 mb-4">
        <Col xs={12} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-3">
              <h5 className="mb-0 fw-bold">Inventory Snapshot</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Inventory Value</small>
                <div className="fs-3 fw-bold text-primary">{formatCurrency(totalInventoryValue)}</div>
              </div>
              <div className="mb-2">Out of stock: <strong>{outOfStockItems.length}</strong></div>
              <div>Active alerts: <strong>{alertStats?.active_alerts || 0}</strong></div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-3">
              <h5 className="mb-0 fw-bold">Due Health</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">Unpaid sell bills: <strong>{dueSummary?.unpaid_sell_bills_count || 0}</strong></div>
              <div className="mb-2">Unpaid buy bills: <strong>{dueSummary?.unpaid_buy_bills_count || 0}</strong></div>
              <div>Partially paid bills: <strong>{dueSummary?.partially_paid_bills_count || 0}</strong></div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-3">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to="/bills/create/sell"><Button variant="outline-success" className="w-100">New Sell Bill</Button></Link>
                <Link to="/bills/create/buy"><Button variant="outline-info" className="w-100">New Buy Bill</Button></Link>
                <Link to="/due-bills"><Button variant="outline-danger" className="w-100">Collect Dues</Button></Link>
                <Link to="/payable-bills"><Button variant="outline-primary" className="w-100">Pay Suppliers</Button></Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold">
                <FiCreditCard size={18} className="me-2" />
                Recent Payments
              </h5>
              <Link to="/due-bills" className="text-decoration-none">View bills</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {!dueSummary?.recent_payments?.length ? (
                <div className="text-center py-5 text-muted">No payments recorded yet.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>When</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dueSummary.recent_payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatDateTime(payment.paid_at)}</td>
                          <td>{payment.payment_direction === 'incoming' ? 'Customer' : 'Supplier'}</td>
                          <td>{payment.payment_method.replace('_', ' ').toUpperCase()}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <FiShoppingCart size={18} className="me-2" />
                Top Outstanding Balances
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6 className="fw-semibold">Top Customers</h6>
                {dueSummary?.top_customers_with_dues?.length ? dueSummary.top_customers_with_dues.map((customer) => (
                  <div key={customer.id} className="d-flex justify-content-between py-2 border-bottom">
                    <div>
                      <div className="fw-semibold">{customer.name}</div>
                      <small className="text-muted">{customer.phone_number || 'No phone'} • {customer.bills_count} bills</small>
                    </div>
                    <strong>{formatCurrency(customer.balance)}</strong>
                  </div>
                )) : <div className="text-muted">No customer dues.</div>}
              </div>

              <div>
                <h6 className="fw-semibold">Top Suppliers</h6>
                {dueSummary?.top_suppliers_with_payables?.length ? dueSummary.top_suppliers_with_payables.map((supplier) => (
                  <div key={supplier.id} className="d-flex justify-content-between py-2 border-bottom">
                    <div>
                      <div className="fw-semibold">{supplier.name}</div>
                      <small className="text-muted">{supplier.phone_number || 'No phone'} • {supplier.bills_count} bills</small>
                    </div>
                    <strong>{formatCurrency(supplier.balance)}</strong>
                  </div>
                )) : <div className="text-muted">No supplier payables.</div>}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
