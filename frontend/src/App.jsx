import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import "./App.css";

const API = "https://node-backend-5hzc.onrender.com";

// --- My Orders ---
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.email || localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/api/order/${userId}`)
     .then((res) => res.json())
     .then((data) => setOrders(Array.isArray(data)? data : []));
  }, [userId]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await fetch(`${API}/api/order/${orderId}`, { method: "DELETE" });
    } catch (e) {
      console.log(e);
    }
    setOrders(orders.filter((o) => o._id!== orderId));
    alert("Order Cancelled!");
  };

  if (!userId) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Please Login to see orders!</h2>;
  if (orders.length === 0) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>No Orders Found!</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Orders ({orders.length})</h1>
      {orders.map((order) => (
        <div key={order._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <p><b>Date:</b> {order.date? new Date(order.date).toLocaleString() : "N/A"}</p>
            <p><b>Address:</b> {order.address}</p>
            <p><b>Total:</b> Rs. {order.total} - {order.paymentMethod || "COD"}</p>
            <p><b>Items:</b> {order.products?.map((p) => p.name).join(", ")}</p>
          </div>
          <button onClick={() => handleCancel(order._id)} style={{ background: "red", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px" }}>Cancel</button>
        </div>
      ))}
    </div>
  );
}

// --- Login ---
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userEmail", data.user.email);
      alert("Login Success");
      navigate("/");
      window.location.reload();
    } else {
      alert(data.error);
    }
  };
  return (
    <div style={{ maxWidth: "350px", margin: "50px auto", textAlign: "center", border: "1px solid #ccc", padding: "20px" }}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br />
      <button onClick={login} style={{ padding: "10px", background: "black", color: "white", width: "95%" }}>Login</button>
      <p><Link to="/register">New? Register</Link></p>
    </div>
  );
}

// --- Register ---
function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const register = async () => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Registered!");
      navigate("/login");
    } else {
      alert(data.error);
    }
  };
  return (
    <div style={{ maxWidth: "350px", margin: "50px auto", textAlign: "center", border: "1px solid #ccc", padding: "20px" }}>
      <h2>Register</h2>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br />
      <input placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value })} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value })} style={{ padding: "10px", width: "90%", margin: "5px" }} /><br />
      <button onClick={register} style={{ padding: "10px", background: "green", color: "white", width: "95%" }}>Register</button>
      <p><Link to="/login">Already have? Login</Link></p>
    </div>
  );
}

// --- Product Detail ---
function ProductDetail({ addToCart, addToWishlist }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch(`${API}/products/${id}`)
     .then((res) => res.json())
     .then((data) => {
        const finalProduct = Array.isArray(data)? data[0] : data;
        setProduct(finalProduct);
      });
  }, [id]);
  if (!product) return <h2 style={{ textAlign: "center", padding: "50px" }}>Loading...</h2>;
  return (
    <div style={{ padding: "20px" }}>
      <Link to="/"><button>Back to Store</button></Link>
      <div style={{ display: "flex", gap: "30px", marginTop: "20px", flexWrap: "wrap" }}>
        <img src={product.image} alt={product.name} style={{ width: "400px", maxWidth: "100%", borderRadius: "8px" }} />
        <div>
          <h1>{product.name}</h1>
          <h2 style={{ color: "green" }}>Rs. {product.price}</h2>
          <p>{product.category}</p>
          <p>{product.desc || product.description}</p>
          <button onClick={() => addToCart(product)} style={{ padding: "10px 20px", background: "#ff9900", color: "white", border: "none", marginRight: "10px" }}>Add to Cart</button>
          <button onClick={() => addToWishlist(product)} style={{ padding: "10px 20px", background: "white", color: "#ff4081", border: "2px solid #ff4081" }}>Wishlist</button>
        </div>
      </div>
    </div>
  );
}

// --- Admin ---
function Admin() {
  const [form, setForm] = useState({ name: "", price: "", image: "", category: "Laptop", desc: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const fetchProducts = () => { fetch(`${API}/products`).then((r) => r.json()).then((d) => setProducts(d)); };
  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin]);
  if (!isAdmin) {
    return (
      <div style={{ padding: "50px", maxWidth: "400px", margin: "100px auto", border: "2px solid black", borderRadius: "10px", textAlign: "center" }}>
        <h2>Admin Login</h2>
        <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} style={{ padding: "10px", width: "90%" }} /><br /><br />
        <button onClick={() => pass === "kajal@2004"? setIsAdmin(true) : alert("Wrong Password!")} style={{ padding: "10px 20px", background: "black", color: "white" }}>Login</button><br /><br />
        <Link to="/"><button>Back</button></Link>
      </div>
    );
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingId? `${API}/products/${editingId}` : `${API}/products`;
    const method = editingId? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({...form, price: Number(form.price) }) }).then(() => {
      alert(editingId? "Updated!" : "Added!"); setEditingId(null); setForm({ name: "", price: "", image: "", category: "Laptop", desc: "" }); fetchProducts();
    });
  };
  const handleEdit = (p) => { setForm({ name: p.name, price: p.price, image: p.image, category: p.category, desc: p.desc || "" }); setEditingId(p._id || p.id); };
  const handleDelete = (id) => { if (window.confirm("Delete?")) { fetch(`${API}/products/${id}`, { method: "DELETE" }).then(() => { alert("Deleted!"); fetchProducts(); }); } };
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <Link to="/"><button>Back to Store</button></Link>
      <h1>{editingId? "Edit" : "Add"} Product</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} required style={{ padding: "10px" }} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value })} required style={{ padding: "10px" }} />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({...form, image: e.target.value })} required style={{ padding: "10px" }} />
        <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value })} style={{ padding: "10px" }}><option>Laptop</option><option>Mobile</option><option>Accessories</option><option>Gaming</option></select>
        <textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({...form, desc: e.target.value })} style={{ padding: "10px" }}></textarea>
        <button type="submit" style={{ padding: "12px", background: "black", color: "white" }}>{editingId? "Update" : "Add"}</button>
      </form>
      <h2>All Products ({products.length})</h2>
      {products.map((p) => (<div key={p._id || p.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0", display: "flex", justifyContent: "space-between" }}><span><img src={p.image} width="40" /> {p.name} - Rs.{p.price}</span><span><button onClick={() => handleEdit(p)} style={{ background: "blue", color: "white" }}>Edit</button><button onClick={() => handleDelete(p._id || p.id)} style={{ background: "red", color: "white", marginLeft: "5px" }}>Del</button></span></div>))}
    </div>
  );
}

// --- Main App ---
function MainApp() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); } catch { return []; }
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/products`).then((res) => res.json()).then((data) => setProducts(Array.isArray(data)? data : []));
  }, []);

  const getId = (p) => p._id || p.id;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    alert("Logged Out!");
    navigate("/login");
    window.location.reload();
  };

  const addToCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please Login First!");
      navigate("/login");
      return;
    }
    const pid = getId(product);
    const exist = cart.find((x) => getId(x) === pid);
    if (exist) {
      setCart(cart.map((x) => getId(x) === pid? {...x, quantity: x.quantity + 1 } : x));
      alert(product.name + " quantity increased!");
    } else {
      setCart([...cart, {...product, quantity: 1 }]);
      alert(product.name + " Added to Cart!");
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => getId(item)!== id));
  const increaseQty = (id) => setCart(cart.map((item) => getId(item) === id? {...item, quantity: item.quantity + 1 } : item));
  const decreaseQty = (id) => setCart(cart.map((item) => getId(item) === id && item.quantity > 1? {...item, quantity: item.quantity - 1 } : item));

  const addToWishlist = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please Login First to use Wishlist!");
      navigate("/login");
      return;
    }
    if (wishlist.find((w) => getId(w) === getId(product))) {
      alert("Already in Wishlist");
      return;
    }
    const newList = [...wishlist, product];
    setWishlist(newList);
    localStorage.setItem("wishlist", JSON.stringify(newList));
    alert(product.name + " Added to Wishlist!");
  };

  const removeFromWishlist = (id) => {
    const newList = wishlist.filter((w) => getId(w)!== id);
    setWishlist(newList);
    localStorage.setItem("wishlist", JSON.stringify(newList));
  };

  const placeOrder = async () => {
    if (name === "" || phone === "" || address === "") { alert("Fill all details"); return; }
    if (phone.length!== 10) { alert("Phone must be 10 digits"); return; }
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.email || localStorage.getItem("userEmail");
    if (paymentMethod === "Online") {
      if (!window.confirm("Pay Rs." + totalPrice + " via Test Payment?")) return;
    }
    try {
      await fetch(`${API}/api/order/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, products: cart, total: totalPrice, address: name + ", " + phone + ", " + address, paymentMethod: paymentMethod })
      });
      setOrderPlaced(true);
      setCart([]);
      setName(""); setPhone(""); setAddress("");
      setTimeout(() => { setShowCheckout(false); setOrderPlaced(false); }, 3000);
    } catch (err) {
      alert("Order Failed");
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const categories = ["All", "Laptop", "Mobile", "Accessories", "Gaming"];
  const filteredProducts = products.filter((p) => {
    const matchSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sortOrder === "low-high") return a.price - b.price;
    if (sortOrder === "high-low") return b.price - a.price;
    return 0;
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>E-Commerce Store</h1>
      <Link to="/"><button>Store</button></Link>
      <Link to="/cart"><button>Cart: {cart.reduce((a, b) => a + b.quantity, 0)}</button></Link>
      <Link to="/wishlist"><button style={{ background: "#ff4081", color: "white", marginLeft: "10px" }}>Wishlist: {wishlist.length}</button></Link>
      <Link to="/myorders"><button style={{ background: "purple", color: "white", marginLeft: "10px" }}>My Orders</button></Link>
      <Link to="/admin"><button style={{ marginLeft: "10px", background: "black", color: "white" }}>Admin</button></Link>
      {isLoggedIn? <button onClick={handleLogout} style={{ background: "red", color: "white", marginLeft: "10px" }}>Logout</button> : <><Link to="/login"><button>Login</button></Link><Link to="/register"><button>Register</button></Link></>}
      <hr />
      {orderPlaced && <h2 style={{ color: "green" }}>Order Placed Successfully! - {paymentMethod}</h2>}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/wishlist" element={
          <div style={{ padding: "20px" }}>
            <h1>Wishlist ({wishlist.length})</h1>
            {wishlist.length === 0? <p>Empty</p> : <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>{wishlist.map((p) => (<div key={getId(p)} style={{ border: "1px solid #ccc", padding: "15px", width: "200px", textAlign: "center" }}><img src={p.image} width="150" height="100" style={{ objectFit: "cover" }} /><h4>{p.name}</h4><p>Rs.{p.price}</p><button onClick={() => addToCart(p)} style={{ background: "#ff9900", color: "white" }}>Cart</button><button onClick={() => removeFromWishlist(getId(p))} style={{ background: "red", color: "white", marginLeft: "5px" }}>Remove</button></div>))}</div>}
          </div>
        } />
        <Route path="/" element={
          <div>
            <h2 style={{ textAlign: "center" }}>Product List</h2>
            <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "50%", padding: "10px", margin: "10px auto", display: "block" }} />
            <div style={{ textAlign: "center" }}>{categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} style={{ margin: "5px", padding: "8px 15px", background: selectedCategory === cat? "#007bff" : "#6c757d", color: "white", border: "none", borderRadius: "15px" }}>{cat}</button>))}</div>
            <div style={{ textAlign: "center", margin: "10px" }}><button onClick={() => setSortOrder("default")}>Default</button><button onClick={() => setSortOrder("low-high")} style={{ marginLeft: "5px" }}>Low to High</button><button onClick={() => setSortOrder("high-low")} style={{ marginLeft: "5px" }}>High to Low</button></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
              {filteredProducts.map((product) => (
                <div key={getId(product)} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px", width: "230px", textAlign: "center" }}>
                  <Link to={`/product/${getId(product)}`}><img src={product.image} alt={product.name} style={{ width: "100%", height: "150px", objectFit: "cover" }} /></Link>
                  <h3>{product.name}</h3><p>{product.category}</p><p style={{ color: "green", fontWeight: "bold" }}>Rs.{product.price}</p>
                  <button onClick={() => addToCart(product)} style={{ padding: "7px 10px", background: "#ff9900", color: "white", border: "none", borderRadius: "5px" }}>Add to Cart</button>
                  <button onClick={() => addToWishlist(product)} style={{ padding: "7px 10px", background: "white", color: "#ff4081", border: "1px solid #ff4081", borderRadius: "5px", marginLeft: "5px" }}>Wishlist</button>
                </div>
              ))}
            </div>
          </div>
        } />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} addToWishlist={addToWishlist} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/cart" element={
          <div>
            <h2>Your Cart</h2>
            {cart.length === 0? <p>Empty</p> : <div>{cart.map((item) => (<div key={getId(item)} style={{ borderBottom: "1px solid #ccc", padding: "10px", display: "flex", justifyContent: "space-between" }}><span>{item.name} - Rs.{item.price} x {item.quantity}</span><span><button onClick={() => decreaseQty(getId(item))}>-</button> {item.quantity} <button onClick={() => increaseQty(getId(item))}>+</button><button onClick={() => removeFromCart(getId(item))} style={{ background: "red", color: "white", marginLeft: "5px" }}>Remove</button></span></div>))}<h3>Total: Rs.{totalPrice}</h3><button onClick={() => setShowCheckout(true)}>Checkout</button>{showCheckout && <div style={{ border: "2px solid green", padding: "20px", marginTop: "20px" }}><h3>Details & Payment</h3><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ display: "block", margin: "5px", padding: "8px", width: "90%" }} /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" style={{ display: "block", margin: "5px", padding: "8px", width: "90%" }} /><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" style={{ display: "block", margin: "5px", padding: "8px", width: "90%" }} /><div style={{ margin: "10px 0" }}><label><input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} /> COD</label><label style={{ marginLeft: "10px" }}><input type="radio" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} /> Online</label></div><button onClick={placeOrder} style={{ background: "green", color: "white", padding: "10px 20px" }}>{paymentMethod === "COD"? "Place Order" : "Pay Rs." + totalPrice}</button></div>}</div>}
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;
