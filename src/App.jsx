import { useState } from "react";
import "./App.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Laptop",
    price: 650,
    category: "Computers",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    description: "High-performance laptop for work and creative flow",
  },
  {
    id: 2,
    name: "Mouse",
    price: 15,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    description: "Ergonomic ultra-smooth wireless optical mouse",
  },
  {
    id: 3,
    name: "Keyboard",
    price: 25,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    description: "Slim mechanical wireless keyboard with tactile switches",
  },
  {
    id: 4,
    name: "Monitor",
    price: 120,
    category: "Displays",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    description: "24-inch Full HD ultra-thin bezel studio display",
  },
];

const SHIPPING_OPTIONS = {
  free: { label: "Free Shipping", days: "7-20 Days", cost: 0 },
  express: { label: "Express Shipping", days: "1-3 Days", cost: 9 },
};

export default function App() {
  const [page, setPage] = useState("products"); // "products" | "cart" | "checkout" | "confirmation"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [orderCount, setOrderCount] = useState(1);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [notification, setNotification] = useState("");

  // Promo code state
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Cart enhancements (matching reference design)
  const [orderNotes, setOrderNotes] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    shippingMethod: "free",
  });
  const [errors, setErrors] = useState({});

  // Show quick toast notification
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // --- Cart Actions ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`Added ${product.name} to cart!`);
  };

  // Add all 4 products in one click
  const addAllToCart = () => {
    setCart((prev) => {
      let updated = [...prev];
      PRODUCTS.forEach((product) => {
        const existing = updated.find((item) => item.id === product.id);
        if (existing) {
          updated = updated.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          );
        } else {
          updated.push({ ...product, qty: 1 });
        }
      });
      return updated;
    });
    showToast("🎉 Added all 4 products to cart!");
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return { ...item, qty: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    showToast("Cart cleared");
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SAVE10" || promoCode.trim().toUpperCase() === "TECH10") {
      setDiscount(10);
      showToast("Coupon applied: $10 discount! 🎉");
    } else if (promoCode.trim()) {
      showToast("Invalid code! Try code: SAVE10");
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const itemsSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotal = itemsSubtotal + (giftWrap ? 5 : 0);
  const shippingCost = SHIPPING_OPTIONS[form.shippingMethod].cost;
  const grandTotal = Math.max(0, subtotal - discount) + (page === "checkout" ? shippingCost : 0);

  // Free shipping progress calculation ($750 target)
  const freeShippingTarget = 750;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingTarget) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingTarget - subtotal);

  // --- Checkout Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Auto-fill sample data button for quick testing
  const fillSampleData = () => {
    setForm({
      firstName: "Sophea",
      lastName: "Chan",
      email: "sophea.chan@example.com",
      phone: "+855 12 888 999",
      address: "#123, St 271, Sangkat Boeung Tumpun",
      city: "Phnom Penh",
      zipCode: "12000",
      shippingMethod: "express",
    });
    setErrors({});
    showToast("Sample customer data filled!");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = `ORD-${String(orderCount).padStart(4, "0")}`;
    const newOrder = {
      orderId,
      customerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: `${form.address.trim()}${form.city ? `, ${form.city.trim()}` : ""}${form.zipCode ? ` ${form.zipCode.trim()}` : ""}`,
      shippingMethod: SHIPPING_OPTIONS[form.shippingMethod].label,
      shippingCost,
      orderDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      items: [...cart],
      subtotal,
      discount,
      totalAmount: Math.max(0, subtotal - discount) + shippingCost,
      status: "Pending",
    };

    setConfirmedOrder(newOrder);
    setOrderCount((prev) => prev + 1);
    setCart([]);
    setDiscount(0);
    setPage("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startNewOrder = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      shippingMethod: "free",
    });
    setErrors({});
    setPage("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="app">
      {/* Toast Notification */}
      {notification && <div className="toast">{notification}</div>}

      {/* Header Navigation */}
      <header className="navbar">
        <div className="navbar-inner">
          <div
            className="brand"
            onClick={() => {
              setPage("products");
              setSelectedCategory("All");
            }}
          >
            Webyansh Store
          </div>

          <nav className="nav-menu">
            <button
              className={`nav-link ${selectedCategory === "All" && page === "products" ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory("All");
                setPage("products");
              }}
            >
              All Products
            </button>
            <button
              className={`nav-link ${selectedCategory === "Computers" && page === "products" ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory("Computers");
                setPage("products");
              }}
            >
              Computers
            </button>
            <button
              className={`nav-link ${selectedCategory === "Accessories" && page === "products" ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory("Accessories");
                setPage("products");
              }}
            >
              Accessories
            </button>
            <button
              className={`nav-link ${selectedCategory === "Displays" && page === "products" ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory("Displays");
                setPage("products");
              }}
            >
              Displays
            </button>
          </nav>

          <div className="nav-actions">
            <button
              className={`cart-badge-btn ${page === "cart" ? "active" : ""}`}
              onClick={() => setPage("cart")}
              title="View Shopping Cart"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Cart</span>
              <span className="badge-count">{totalItems}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* ========================================================= */}
        {/* EXERCISE 1: PRODUCTS LIST */}
        {/* ========================================================= */}
        {page === "products" && (
          <section className="section-fade">
            <div className="page-header">
              <div>
                <h1 className="page-title">
                  {selectedCategory === "All" ? "Featured Products" : selectedCategory}
                </h1>
                <p className="page-subtitle">
                  High-performance tech essentials curated for your workspace.
                </p>
              </div>

              <div className="header-actions">
                <button
                  className="btn-outline"
                  onClick={addAllToCart}
                  title="Add all 4 products to cart"
                >
                  + Add All to Cart
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setPage("cart")}
                >
                  View Cart ({totalItems}) →
                </button>
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card product-card">
                  <div className="product-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="product-details">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-footer">
                      <p className="price">${product.price.toFixed(2)}</p>
                      <button
                        className="btn-primary"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* EXERCISE 1: SHOPPING CART PAGE (MATCHING SPEC EXACTLY) */}
        {/* ========================================================= */}
        {page === "cart" && (
          <section className="cart-page-container section-fade">
            <h1 className="cart-hero-title">SHOPPING CART</h1>

            <div className="cart-layout-grid">
              {/* Left Column: Cart Items Table */}
              <div className="cart-main-card">
                {cart.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p className="text-muted">Looks like you haven't added anything yet.</p>
                    <div className="empty-state-buttons">
                      <button
                        className="btn-primary"
                        onClick={() => setPage("products")}
                      >
                        Browse Products
                      </button>
                      <button
                        className="btn-outline"
                        onClick={addAllToCart}
                      >
                        Add All 4 Products
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="cart-header-row">
                      <span className="th-product">PRODUCT</span>
                      <span className="th-price">PRICE</span>
                      <span className="th-qty">QUANTITY</span>
                      <span className="th-total">TOTAL</span>
                    </div>

                    <div className="cart-rows-container">
                      {cart.map((item) => {
                        const productData = PRODUCTS.find((p) => p.id === item.id) || item;
                        return (
                          <div key={item.id} className="cart-table-item">
                            <div className="td-product-info">
                              <div className="cart-item-thumb-box">
                                <img
                                  src={productData.image}
                                  alt={item.name}
                                  className="cart-item-square-img"
                                />
                              </div>
                              <div className="cart-item-meta">
                                <h3 className="cart-product-title">{item.name.toUpperCase()}</h3>
                                <p className="cart-product-variant">{item.category} / Standard</p>
                                <button
                                  type="button"
                                  className="cart-remove-underline-btn"
                                  onClick={() => removeItem(item.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="td-price">
                              ${item.price.toFixed(2)}
                            </div>

                            <div className="td-qty">
                              <div className="inline-qty-picker">
                                <button
                                  type="button"
                                  className="inline-qty-btn"
                                  onClick={() => updateQty(item.id, -1)}
                                  disabled={item.qty <= 1}
                                  title={item.qty <= 1 ? "Minimum 1 unit (use Remove to delete item)" : "Decrease quantity"}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="inline-qty-value">{item.qty}</span>
                                <button
                                  type="button"
                                  className="inline-qty-btn"
                                  onClick={() => updateQty(item.id, 1)}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="td-total">
                              ${(item.price * item.qty).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Notes Section */}
                    <div className="order-notes-container">
                      <label htmlFor="orderNotes" className="order-notes-title">
                        Order notes (Optional)
                      </label>
                      <input
                        id="orderNotes"
                        type="text"
                        className="order-notes-textfield"
                        placeholder="e.g. Special delivery instructions, notes..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Dark Sidebar Cards */}
              <div className="cart-side-cards">
                {/* 1. Free Shipping Progress Bar Card */}
                <div className="dark-side-box shipping-meter-box">
                  <div className="meter-track">
                    <div
                      className="meter-bar-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div
                      className="meter-truck-badge"
                      style={{ left: `calc(${Math.min(94, Math.max(0, progressPercent))}% - 13px)` }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                    </div>
                  </div>
                  <p className="meter-caption">
                    {amountToFreeShipping > 0
                      ? `Buy $${amountToFreeShipping.toFixed(2)} more to enjoy Free Shipping`
                      : "🎉 You have qualified for Free Shipping!"}
                  </p>
                </div>

                {/* 2. Estimate Shipping & Checkout Card */}
                <div className="dark-side-box checkout-panel-box">
                  <div className="estimate-accordion-bar">
                    <span>ESTIMATE SHIPPING</span>
                    <span className="accordion-plus">+</span>
                  </div>

                  <label className="gift-wrap-checkbox-label">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                    />
                    <span>Do you want a gift wrap? (+$5.00)</span>
                  </label>

                  <div className="dark-subtotal-line">
                    <span className="subtotal-label">Subtotal</span>
                    <span className="subtotal-price">${subtotal.toFixed(2)} USD</span>
                  </div>

                  {discount > 0 && (
                    <div className="dark-discount-line">
                      <span>Discount</span>
                      <span>−${discount.toFixed(2)} USD</span>
                    </div>
                  )}

                  <label className="terms-agreement-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>I agree with the terms and conditions</span>
                  </label>

                  <button
                    type="button"
                    className="btn-checkout-vibrant"
                    disabled={cart.length === 0 || !agreeTerms}
                    onClick={() => setPage("checkout")}
                  >
                    CHECKOUT
                  </button>

                  <p className="taxes-note-text">
                    Taxes and shipping calculated at checkout
                  </p>

                  <div className="cart-secondary-actions">
                    <button
                      type="button"
                      className="btn-continue-shopping-link"
                      onClick={() => setPage("products")}
                    >
                      ← Continue Shopping
                    </button>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        className="btn-clear-cart-link"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* EXERCISE 2: CHECKOUT PAGE */}
        {/* ========================================================= */}
        {page === "checkout" && (
          <section className="two-col section-fade">
            <form className="card" onSubmit={handlePlaceOrder} noValidate>
              <div className="breadcrumb">
                <span onClick={() => setPage("products")}>Shop</span> &gt;{" "}
                <span onClick={() => setPage("cart")}>Cart</span> &gt;{" "}
                <span className="breadcrumb-active">Checkout</span>
              </div>

              <div className="checkout-title-row">
                <h1 className="section-title">Shipping Address</h1>
                <button
                  type="button"
                  className="btn-sample-fill"
                  onClick={fillSampleData}
                  title="Auto fill sample customer information"
                >
                  Auto-Fill Sample Data
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. John"
                    className={errors.firstName ? "input-error" : ""}
                  />
                  {errors.firstName && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Doe"
                    className={errors.lastName ? "input-error" : ""}
                  />
                  {errors.lastName && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={errors.email ? "input-error" : ""}
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+855 12 345 678"
                    className={errors.phone ? "input-error" : ""}
                  />
                  {errors.phone && (
                    <span className="error-text">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="Street address, building, apartment..."
                  className={errors.address ? "input-error" : ""}
                />
                {errors.address && (
                  <span className="error-text">{errors.address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="Phnom Penh"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    placeholder="12000"
                  />
                </div>
              </div>

              <h2 className="subsection-title">Shipping Method</h2>
              <div className="shipping-options">
                {Object.entries(SHIPPING_OPTIONS).map(([key, option]) => (
                  <label
                    key={key}
                    className={`shipping-card ${
                      form.shippingMethod === key ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={key}
                      checked={form.shippingMethod === key}
                      onChange={handleInputChange}
                    />
                    <div className="shipping-info">
                      <strong>{option.label}</strong>
                      <span className="text-muted text-sm">{option.days}</span>
                    </div>
                    <span className="shipping-price">
                      {option.cost === 0 ? "Free" : `$${option.cost}`}
                    </span>
                  </label>
                ))}
              </div>

              <button type="submit" className="btn-primary full-width">
                Place Order
              </button>
            </form>

            {/* Checkout Order Summary Sidebar */}
            <div className="card summary-card">
              <h2 className="section-title">Order Summary</h2>
              <div className="mini-cart">
                {cart.map((item) => (
                  <div key={item.id} className="mini-cart-item">
                    <div className="mini-cart-info">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="mini-cart-img"
                      />
                      <div>
                        <div className="mini-cart-title">{item.name}</div>
                        <div className="text-muted text-sm">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <span className="mini-cart-price">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr />

              <div className="summary-row">
                <span className="text-muted">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span className="text-muted">Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>

              <hr />

              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="btn-secondary full-width"
                style={{ marginTop: "0.5rem" }}
                onClick={() => setPage("cart")}
              >
                ← Back to Cart
              </button>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* EXERCISE 3: ORDER CONFIRMATION PAGE */}
        {/* ========================================================= */}
        {page === "confirmation" && confirmedOrder && (
          <section className="card confirmation-card section-fade">
            <div className="success-badge">✓</div>
            <h1 className="confirmation-title">Order Placed Successfully!</h1>
            <p className="text-muted">
              Thank you for your purchase. We have received your order and will process it shortly.
            </p>

            <div className="order-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Order ID</span>
                <strong className="meta-value">{confirmedOrder.orderId}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Customer Name</span>
                <strong className="meta-value">{confirmedOrder.customerName}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Order Date</span>
                <strong className="meta-value">{confirmedOrder.orderDate}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Order Status</span>
                <span className="status-pill status-pending">{confirmedOrder.status}</span>
              </div>
            </div>

            <div className="shipping-details-box">
              <h4>Shipping Details</h4>
              <p><strong>Contact:</strong> {confirmedOrder.email} | {confirmedOrder.phone}</p>
              <p><strong>Delivery Address:</strong> {confirmedOrder.address}</p>
              <p><strong>Shipping Method:</strong> {confirmedOrder.shippingMethod}</p>
            </div>

            <h3 className="table-heading">Ordered Products</h3>
            <div className="table-responsive">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th style={{ textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="table-product-img"
                          />
                          <strong>{item.name}</strong>
                        </div>
                      </td>
                      <td>{item.qty}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="confirmation-summary">
              <div className="summary-row">
                <span className="text-muted">Items Subtotal</span>
                <span>${confirmedOrder.subtotal.toFixed(2)}</span>
              </div>
              {confirmedOrder.discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>−${confirmedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span className="text-muted">Shipping Cost</span>
                <span>${confirmedOrder.shippingCost.toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>${confirmedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="btn-primary" onClick={startNewOrder}>
                Continue Shopping
              </button>
              <button
                className="btn-secondary"
                style={{ marginLeft: "1rem" }}
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
