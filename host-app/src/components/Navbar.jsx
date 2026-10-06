import React from "react";
import { NavLink } from "react-router-dom";
import { useCartCount } from "../hooks/useCartCount";

const Navbar = () => {
  const cartCount = useCartCount();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          Microfrontend Demo
        </NavLink>

        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/cart"
            id="nav-link-cart"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Cart {cartCount > 0 ? `(${cartCount})` : "(0)"}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
