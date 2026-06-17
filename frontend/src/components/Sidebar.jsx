import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShoppingCart size={24} />
        <span>InventoryApp</span>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Package size={20} />
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/customers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            Customers
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ShoppingCart size={20} />
            Orders
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
