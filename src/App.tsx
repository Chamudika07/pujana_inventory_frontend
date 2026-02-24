import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/global.css';

import { useAuth } from './hooks';
import Navbar from '@components/Layout/Navbar';
import Sidebar from '@components/Layout/Sidebar';
import ProtectedRoute from '@components/ProtectedRoute';

// Pages
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';
import Dashboard from '@pages/Dashboard';
import Items from '@pages/Inventory/Items';
import ItemDetail from '@pages/Inventory/ItemDetail';
import Categories from '@pages/Inventory/Categories';
import Bills from '@pages/Bill/Bills';
import BillCreate from '@pages/Bill/BillCreate';
import Alerts from '@pages/Alerts/Alerts';
import Settings from '@pages/Settings';
import NotFound from '@pages/NotFound';
import NotificationSettings from './pages/Settings/NotificationSettings';

const App: React.FC = () => {
    const { isAuthenticated, isCheckingAuth } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    if (isCheckingAuth) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {isAuthenticated && <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}

            <div className="d-flex" style={{ minHeight: '100vh', paddingTop: isAuthenticated ? '60px' : '0' }}>
                {isAuthenticated && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

                <main style={{ flex: 1, width: '100%', marginLeft: 'auto', backgroundColor: '#f5f7fa', overflow: 'auto' }}>
                    <Routes>
                        {/* Public Routes - redirect to dashboard if authenticated */}
                        <Route
                            path="/login"
                            element={<Login />}
                        />
                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/items"
                            element={
                                <ProtectedRoute>
                                    <Items />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/items/:id"
                            element={
                                <ProtectedRoute>
                                    <ItemDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <ProtectedRoute>
                                    <Categories />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bills"
                            element={
                                <ProtectedRoute>
                                    <Bills />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bills/create/:type"
                            element={
                                <ProtectedRoute>
                                    <BillCreate />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/alerts"
                            element={
                                <ProtectedRoute>
                                    <Alerts />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationSettings />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback */}
                        <Route path="/not-found" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/not-found" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
