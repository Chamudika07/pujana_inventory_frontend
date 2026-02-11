import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiBox,
    FiTag,
    FiShoppingCart,
    FiBell,
} from 'react-icons/fi';
import './Sidebar.css';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const location = useLocation();

    const isActive = (path: string): boolean => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: FiHome },
        { path: '/items', label: 'Items', icon: FiBox },
        { path: '/categories', label: 'Categories', icon: FiTag },
        { path: '/bills', label: 'Bills', icon: FiShoppingCart },
        { path: '/alerts', label: 'Alerts', icon: FiBell },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div
                    className="sidebar-overlay d-lg-none"
                    onClick={onClose}
                />
            )}

            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <button className="btn-close d-lg-none ms-auto" onClick={onClose} aria-label="Close sidebar" />

                <nav className="nav flex-column">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <item.icon size={20} className="me-2" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer mt-auto p-3 border-top">
                    <small className="text-muted d-block text-center">
                        Pujana Electrical
                    </small>
                    <small className="text-muted d-block text-center">
                        v1.0.0
                    </small>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
