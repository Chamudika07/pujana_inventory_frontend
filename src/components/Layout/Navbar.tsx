import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { useAuthStore } from '@stores/authStore';
import './Navbar.css';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
            <div className="container-fluid">
                <button
                    className="btn btn-link text-white d-lg-none"
                    onClick={onMenuClick}
                    style={{ marginRight: '1rem' }}
                >
                    <FiMenu size={24} />
                </button>

                <Link className="navbar-brand fw-bold" to="/">
                    <span style={{ fontSize: '1.5rem' }}>⚡</span> Pujana
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item dropdown">
                            <button
                                className="nav-link btn btn-link text-white dropdown-toggle d-flex align-items-center"
                                id="profileDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                aria-label="User menu"
                            >
                                <FiUser size={16} className="me-2" />
                                <span className="d-none d-lg-inline">
                                    {user ? user.email : 'Account'}
                                </span>
                                <span className="d-lg-none">
                                    {user ? user.email.split('@')[0] : 'Account'}
                                </span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                <li>
                                    <Link className="dropdown-item" to="/settings">
                                        <FiSettings size={16} className="me-2" />
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <FiLogOut size={16} className="me-2" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
