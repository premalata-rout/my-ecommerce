import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
// import "./App.css";

const API = "https://node-backend-5hzc.onrender.com";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.email || localStorage.getItem("userEmail");
  const fetchOrders = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/order/${encodeURIComponent(userId)}`);
      const data = await res.json();
      setOrders(Array.isArray(data)? data : []);
    } catch { setOrders([]); }
    setLoading(false);
  };
  useEffect(() => { fetchOrders(); }, [userId]);
  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? ❌")) return;
    try {
      const res = await fetch(`${API}/api/order/cancel/${orderId}`, { method: "PUT" });
      const result = await res.json();
      if (!res.ok) { alert(result.error || "Cancel failed"); return; }
      alert("Order Cancelled! ❌");
      await fetchOrders();
    } catch (e) { alert("Failed! " + e.message); }
  };
  if (!userId) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Please Login to see orders! 🔒</h2>;
  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading Orders...</h2>;
  if (orders.length === 0) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>No Orders Found! 📦<br /><span style={{ fontSize: "12px", color: "#888" }}>{userId}</span></h2>;
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>My Orders 📦 ({orders.length})</h1>
      {orders.map((order) => {
        const isCancelled = order.status === "Cancelled";
        return (
          <div key={order._id} style={{ border: "1px solid #ddd", margin: "15px 0", padding: "15px", borderRadius: "12px", background: isCancelled? "#fff0f0" : "white", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "10px", flexWrap: "wrap" }}>
              <div><p style={{ margin: "3px 0" }}><b>ID:</b> #{order._id?.slice(-6).toUpperCase()}</p><p style={{ margin: "3px 0", fontSize: "14px" }}><b>Date:</b> {order.date? new Date(order.date).toLocaleString() : "N/A"}</p></div>
              <div style={{ textAlign: "right" }}><span style={{ background: order.paymentMethod === 'Online'? '#d4edda' : '#fff3cd', padding: "5px 12px", borderRadius: "20px", fontWeight: "bold" }}>₹{order.total} - {order.paymentMethod || 'COD'}</span><p style={{ margin: "6px 0", color: isCancelled? "red" : "green", fontWeight: "bold" }}>{isCancelled? "● Cancelled ❌" : "● Placed ✅"}</p></div>
            </div>
            <div style={{ display: "flex", gap: "15px", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}><p><b>Ship to:</b> {order.address}</p>{order.products?.map((p, i) => (<div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", margin: "8px 0", background: "#f8f9fa", padding: "8px", borderRadius: "8px" }}><img src={p.image} alt={p.name} width="65" height="65" style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }} /><div><b>{p.name || p.title}</b><br /><span style={{ color: "green" }}>₹{p.price} x {p.quantity || 1}</span></div></div>))}</div>
              {!isCancelled? (<button onClick={() => handleCancel(order._id)} style={{ background: "#ff3b30", color: "white", padding: "10px 18px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Cancel ❌</button>) : (<span style={{ background: "#ffcccc", color: "red", padding: "10px 18px", borderRadius: "8px", fontWeight: "bold" }}>Cancelled ❌</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const navigate = useNavigate();
  const login = async () => {
    const res = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (res.ok) { localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); localStorage.setItem("userEmail", data.user.email); alert("Login Success"); navigate("/"); window.location.reload(); } else { alert(data.error); }
  };
  return (<div style={{ maxWidth: "350px", margin: "50px auto", textAlign: "center", border: "1px solid #ccc", padding: "20px" }}><h2>Login</h2><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br /><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br /><button onClick={login} style={{ padding: "10px", background: "black", color: "white", width: "95%" }}>Login</button><p><Link to="/register">New? Register</Link></p></div>);
}
function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" }); const navigate = useNavigate();
  const register = async () => {
    const res = await fetch(`${API}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { alert("Registered!"); navigate("/login"); } else { alert(data.error); }
  };
  return (<div style={{ maxWidth: "350px", margin: "50px auto", textAlign: "center", border: "1px solid #ccc", padding: "20px" }}><h2>Register</h2><input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value })} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br /><input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value })} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br /><input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value })} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br /><button onClick={register} style={{ padding: "10px", background: "green", color: "white", width: "95%" }}>Register</button><p><Link to="/login">Already have? Login</Link></p></div>);
}
function ProductDetail({ addToCart, addToWishlist }) {
  const { id } = useParams(); const [product, setProduct] = useState(null);
  useEffect(() => { fetch(`${API}/products/${id}`).then((res) => res.json()).then((data) => { const finalProduct = Array.isArray(data)? data[0] : data; setProduct(finalProduct); }); }, [id]);
  if (!product) return <h2 style={{ textAlign: "center", padding: "50px" }}>Loading...</h2>;
  return (<div style={{ padding: "20px" }}><Link to="/"><button>← Back</button></Link><div style={{ display: "flex", gap: "30px", marginTop: "20px", flexWrap: "wrap" }}><img src={product.image} alt={product.name} style={{ width: "400px", maxWidth: "100%", borderRadius: "8px" }} /><div><h1>{product.name}</h1><h2 style={{ color: "green" }}>₹{product.price}</h2><p><b>Category:</b> {product.category}</p><p>{product.desc || product.description}</p><button onClick={() => addToCart(product)} style={{ padding: "10px 20px", background: "#ff9900", color: "white", border: "none", cursor: "pointer", marginRight: "10px" }}>Add to Cart</button><button onClick={() => addToWishlist(product)} style={{ padding: "8px 12px", background: "white", color: "#ff4081", border: "2px solid #ff4081", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>❤️ Wishlist</button></div></div></div>);
}
function Admin() {
  const [form, setForm] = useState({ name: "", price: "", image: "", category: "Laptop", desc: "" }); const [isAdmin, setIsAdmin] = useState(false); const [pass, setPass] = useState(""); const [products, setProducts] = useState([]); const [editingId, setEditingId] = useState(null);
  const fetchProducts = () => { fetch(`${API}/products`).then((r) => r.json()).then((d) => setProducts(d)); };
  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin]);
  if (!isAdmin) { return (<div style={{ padding: "50px", maxWidth: "400px", margin: "100px auto", border: "2px solid black", borderRadius: "10px", textAlign: "center" }}><h2>🔒 Admin Login</h2><input type="password" placeholder="Enter Password" value={pass} onChange={(e) => setPass(e.target.value)} style={{ padding: "10px", width: "90%", margin: "10px" }} /><br /><button onClick={() => pass === "kajal@2004"? setIsAdmin(true) : alert("Wrong Password!")} style={{ padding: "10px 20px", background: "black", color: "white" }}>Login</button><br /><br /><Link to="/"><button>← Back to Store</button></Link></div>); }
  const handleSubmit = (e) => { e.preventDefault(); const url = editingId? `${API}/products/${editingId}` : `${API}/products`; const method = editingId? "PUT" : "POST"; fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({...form, price: Number(form.price) }) }).then(() => { alert(editingId? "Updated!" : "Added!"); setEditingId(null); setForm({ name: "", price: "", image: "", category: "Laptop", desc: "" }); fetchProducts(); }); };
  const handleEdit = (p) => { setForm({ name: p.name, price: p.price, image: p.image, category: p.category, desc: p.desc || "" }); setEditingId(p._id || p.id); window.scrollTo(0, 0); };
  const handleDelete = (id) => { if (window.confirm("Are you sure?")) { fetch(`${API}/products/${id}`, { method: "DELETE" }).then(() => { alert("Deleted!"); fetchProducts(); }); } };
  return (<div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}><Link to="/"><button>← Back to Store</button></Link><h1>{editingId? "Edit Product" : "Add New Product"}</h1><form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}><input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} required style={{ padding: "10px" }} /><input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value })} required style={{ padding: "10px" }} /><input placeholder="Image URL" value={form.image} onChange={(e) => setForm({...form, image: e.target.value })} required style={{ padding: "10px" }} /><select value={form.category} onChange={(e) => setForm({...form, category: e.target.value })} style={{ padding: "10px" }}><option>Laptop</option><option>Mobile</option><option>Accessories</option><option>Gaming</option></select><textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({...form, desc: e.target.value })} style={{ padding: "10px" }}></textarea><button type="submit" style={{ padding: "12px", background: editingId? "green" : "black", color: "white" }}>{editingId? "Update Product" : "Add Product"}</button></form><hr style={{ margin: "30px 0" }} /><h2>All Products ({products.length})</h2>{products.map((p) => (<div key={p._id || p.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: "10px", alignItems: "center" }}><img src={p.image} width="50" height="50" style={{ objectFit: "cover" }} /><div><b>{p.name}</b><br />₹{p.price}</div></div><div><button onClick={() => handleEdit(p)} style={{ marginRight: "5px", background: "blue", color: "white", padding: "5px 10px" }}>Edit</button><button onClick={() => handleDelete(p._id || p.id)} style={{ background: "red", color: "white", padding: "5px 10px" }}>Delete</button></div></div>))}</div>);
}

function MainApp() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); } catch { return []; } });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [hoveredId, setHoveredId] = useState(null); // FIX FOR HOVER
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  useEffect(() => { fetch(`${API}/products`).then((res) => res.json()).then((data) => setProducts(Array.isArray(data)? data : [])); }, []);
  const getId = (p) => p._id || p.id;
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); localStorage.removeItem("userEmail"); alert("Logged Out!"); navigate("/login"); window.location.reload(); };
  const addToCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please Login First! 🔒"); navigate("/login"); return; }
    const pid = getId(product);
    const exist = cart.find((x) => getId(x) === pid);
    if (exist) { setCart(cart.map((x) => getId(x) === pid? {...x, quantity: x.quantity + 1 } : x)); alert(product.name + " quantity increased! 🛒"); }
    else { setCart([...cart, {...product, quantity: 1 }]); alert(product.name + " Added to Cart! 🛒"); }
  };
  const removeFromCart = (id) => setCart(cart.filter((item) => getId(item)!== id));
  const increaseQty = (id) => setCart(cart.map((item) => getId(item) === id? {...item, quantity: item.quantity + 1 } : item));
  const decreaseQty = (id) => setCart(cart.map((item) => getId(item) === id && item.quantity > 1? {...item, quantity: item.quantity - 1 } : item));
  const addToWishlist = (product) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please Login First! 🔒❤️"); navigate("/login"); return; }
    if (wishlist.find(w => getId(w) === getId(product))) { alert("Already in Wishlist ❤️"); return; }
    const newList = [...wishlist, product];
    setWishlist(newList);
    localStorage.setItem("wishlist", JSON.stringify(newList));
    alert(product.name + " Added to Wishlist ❤️");
  };
  const removeFromWishlist = (id) => { const newList = wishlist.filter(w => getId(w)!== id); setWishlist(newList); localStorage.setItem("wishlist", JSON.stringify(newList)); };
  const handleCheckout = () => setShowCheckout(true);
  const placeOrder = async () => {
    if (name === "" || phone === "" || address === "") { alert("Please fill all details!"); return; }
    if (phone.length!== 10 || isNaN(phone)) { alert("Phone must be 10 digits!"); return; }
    const user = JSON.parse(localStorage.getItem("user") || "null"); const userId = user?.email || localStorage.getItem("userEmail");
    if (paymentMethod === 'Online') { if (!window.confirm(`Pay ₹${totalPrice} via UPI? (Test)`)) return; }
    try {
      await fetch(`${API}/api/order/place`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userId, products: cart, total: totalPrice, address: `${name}, ${phone}, ${address}`, paymentMethod: paymentMethod }) });
      setOrderPlaced(true); setCart([]); setName(""); setPhone(""); setAddress("");
      setTimeout(() => { setShowCheckout(false); setOrderPlaced(false); }, 3000);
    } catch (err) { alert("Order Failed: " + err.message); }
  };
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const categories = ["All", "Laptop", "Mobile", "Accessories", "Gaming"];
  const filteredProducts = products.filter((p) => { const name = (p.name || "").toLowerCase(); const matchSearch = name.includes(searchTerm.toLowerCase()); const matchCategory = selectedCategory === "All" || p.category === selectedCategory; return matchSearch && matchCategory; }).sort((a, b) => { if (sortOrder === "low-high") return a.price - b.price; if (sortOrder === "high-low") return b.price - a.price; return 0; });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🛒 E-Commerce Store</h1>
      <Link to="/"><button>Store</button></Link>
      <Link to="/cart"><button>View Cart: {cart.reduce((a, b) => a + b.quantity, 0)}</button></Link>
      <Link to="/wishlist"><button style={{ background: "#ff4081", color: "white", marginLeft: "10px" }}>Wishlist: {wishlist.length}</button></Link>
      <Link to="/myorders"><button style={{ background: "purple", color: "white", marginLeft: "10px" }}>My Orders</button></Link>
      <Link to="/admin"><button style={{ marginLeft: "10px", background: "black", color: "white" }}>Admin</button></Link>
      {isLoggedIn? (<button onClick={handleLogout} style={{ background: "red", color: "white", marginLeft: "10px" }}>Logout</button>) : (<><Link to="/login"><button>Login</button></Link><Link to="/register"><button>Register</button></Link></>)}
      <hr />
      {orderPlaced && <h2 style={{ color: "green" }}>✅ Order Placed Successfully! Payment: {paymentMethod}</h2>}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/wishlist" element={<div style={{ padding: "20px" }}><h1>My Wishlist ❤️ ({wishlist.length})</h1>{wishlist.length === 0? <p style={{ textAlign: "center" }}>Wishlist Empty!</p> : <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>{wishlist.map(p => (<div key={getId(p)} style={{ border: "1px solid #ccc", padding: "15px", width: "220px", textAlign: "center", borderRadius: "10px", backgroundColor: "white" }}><img src={p.image} width="180" height="150" style={{ objectFit: "cover", borderRadius: "8px" }} /><h4>{p.name}</h4><p style={{ color: "green", fontWeight: "bold" }}>₹{p.price}</p><button onClick={() => addToCart(p)} style={{ background: "#ff9900", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Add to Cart</button><button onClick={() => removeFromWishlist(getId(p))} style={{ background: "red", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px", marginLeft: "5px" }}>Remove</button></div>))}</div>}</div>} />
        <Route path="/" element={<div><h2 style={{ textAlign: "center" }}>Product List</h2><input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "50%", padding: "10px", margin: "10px auto", display: "block" }} /><div style={{ textAlign: "center", margin: "20px 0" }}>{categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} style={{ margin: "5px", padding: "10px 20px", backgroundColor: selectedCategory === cat? "#007bff" : "#6c757d", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>{cat}</button>))}</div><div style={{ textAlign: "center", margin: "10px 0" }}><button onClick={() => setSortOrder("default")} style={{ margin: "5px" }}>Default</button><button onClick={() => setSortOrder("low-high")} style={{ margin: "5px" }}>Low to High</button><button onClick={() => setSortOrder("high-low")} style={{ margin: "5px" }}>High to Low</button></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
            {filteredProducts.map((product) => {
              const id = getId(product);
              const isHover = hoveredId === id;
              return (
                <div
                  key={id}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    border: isHover? "2px solid #007bff" : "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "15px",
                    width: "250px",
                    textAlign: "center",
                    boxShadow: isHover? "0 15px 30px rgba(0,0,0,0.25)" : "0 4px 8px rgba(0,0,0,0.1)",
                    backgroundColor: isHover? "#f0f8ff" : "white",
                    transform: isHover? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}>
                  <Link to={`/product/${id}`}><img src={product.image} alt={product.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", transform: isHover? "scale(1.08)" : "scale(1)", transition: "all 0.3s ease" }} /></Link>
                  <h3>{product.name}</h3>
                  <p style={{ color: "gray", fontSize: "14px" }}>{product.category}</p>
                  <p style={{ fontSize: "20px", fontWeight: "bold", color: "green" }}>₹{product.price}</p>
                  <button onClick={() => addToCart(product)} style={{ padding: "8px 12px", backgroundColor: "#ff9900", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add to Cart</button>
                  <button onClick={() => addToWishlist(product)} style={{ padding: "8px 12px", backgroundColor: "white", color: "#ff4081", border: "2px solid #ff4081", borderRadius: "5px", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}>❤️ Wishlist</button>
                </div>
              );
            })}
          </div>
        </div>} />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} addToWishlist={addToWishlist} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/cart" element={<div><h2>Your Cart</h2>{cart.length === 0? <p>Cart is empty</p> : (<div>{cart.map((item) => (<div key={getId(item)} style={{ borderBottom: "1px solid #ccc", padding: "10px", display: "flex", justifyContent: "space-between" }}><span>{item.name} - ₹{item.price} x {item.quantity}</span><div><button onClick={() => decreaseQty(getId(item))}>-</button><span style={{ margin: "0 5px" }}>{item.quantity}</span><button onClick={() => increaseQty(getId(item))}>+</button><button onClick={() => removeFromCart(getId(item))} style={{ backgroundColor: "red", color: "white", marginLeft: "5px" }}>Remove</button></div></div>))}<h3>Total: ₹{totalPrice}</h3><button onClick={handleCheckout}>Checkout</button>{showCheckout && (<div style={{ border: "2px solid green", padding: "20px", margin: "20px", borderRadius: "10px" }}>{orderPlaced? <h2 style={{ color: "green" }}>✅ Order Placed Successfully!</h2> : (<><h3>Enter Details & Payment 💳</h3><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" style={{ display: "block", margin: "10px", padding: "8px", width: "90%" }} /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" maxLength={10} style={{ display: "block", margin: "10px", padding: "8px", width: "90%" }} /><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" style={{ display: "block", margin: "10px", padding: "8px", width: "90%" }} /><div style={{ margin: "15px 0", padding: "10px", background: "#f5f5f5", borderRadius: "8px" }}><h4>Payment Method:</h4><label style={{ display: "block", margin: "5px" }}><input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} /> 💵 Cash on Delivery</label><label style={{ display: "block", margin: "5px" }}><input type="radio" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} /> 📱 UPI / Razorpay (Test)</label></div><button onClick={placeOrder} style={{ backgroundColor: "green", color: "white", padding: "12px 25px", border: "none", borderRadius: "5px", fontWeight: "bold" }}>{paymentMethod === 'COD'? `Place Order (COD)` : `Pay ₹${totalPrice} & Order`}</button></>)}</div>)}</div>)}</div>} />
      </Routes>
    </div>
  );
}
function App() { return (<BrowserRouter><MainApp /></BrowserRouter>); }
export default App;
