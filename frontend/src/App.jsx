import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import './App.css'

const API = import.meta.env.VITE_API_URL || 'https://node-backend-1ki0.onrender.com';

// Product Detail
function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch(`${API}/products/${id}`)
    .then(res => res.json())
    .then(data => setProduct(data));
  }, [id]);
  if(!product) return <h2 style={{textAlign:'center', padding:'50px'}}>Loading...</h2>;
  return (
    <div style={{padding: '20px'}}>
      <Link to="/"><button>← Back to Store</button></Link>
      <div style={{display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap'}}>
        <img src={product.image} alt={product.name} style={{width: '400px', maxWidth: '100%', borderRadius: '8px'}}/>
        <div>
          <h1>{product.name}</h1>
          <h2 style={{color: 'green'}}>₹{product.price}</h2>
          <p>{product.desc}</p>
          <button onClick={() => addToCart(product)} style={{padding: '10px 20px'}}>Add to Cart</button>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  const [form, setForm] = useState({name:'', price:'', image:'', category:'Laptop', desc:''})
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API}/products`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({...form, price: Number(form.price)})
    }).then(()=>{ alert('Product Added!'); setForm({name:'', price:'', image:'', category:'Laptop', desc:''}) })
  }
  return (
    <div style={{padding:'20px', maxWidth:'500px', margin:'auto'}}>
      <Link to="/"><button>← Back to Store</button></Link>
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required style={{padding:'10px'}}/>
        <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required style={{padding:'10px'}}/>
        <input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} required style={{padding:'10px'}}/>
        <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} style={{padding:'10px'}}>
          <option>Laptop</option><option>Mobile</option><option>Accessories</option><option>Gaming</option>
        </select>
        <textarea placeholder="Description" value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} style={{padding:'10px'}}></textarea>
        <button type="submit" style={{padding:'12px', background:'black', color:'white'}}>Add Product</button>
      </form>
    </div>
  )
}

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState("");

  useEffect(() => {
    fetch(`${API}/products`).then(res => res.json()).then(data => setProducts(data));
  }, []);

  // _id FIX KALA - ethi thila bhul
  const addToCart = (product) => {
    const exist = cart.find(x => x._id === product._id);
    if(exist){
      setCart(cart.map(x => x._id === product._id? {...x, quantity: x.quantity + 1} : x));
    } else {
      setCart([...cart, {...product, quantity: 1}]);
    }
  }
  const removeFromCart = (id) => setCart(cart.filter(item => item._id!== id));
  const increaseQty = (id) => setCart(cart.map(item => item._id === id? {...item, quantity: item.quantity + 1} : item));
  const decreaseQty = (id) => setCart(cart.map(item => item._id === id && item.quantity > 1? {...item, quantity: item.quantity - 1} : item));

  const handleCheckout = () => setShowCheckout(true);
  const placeOrder = () => {
    if(name === "" || phone === "" || address === ""){ alert("Please fill all details!"); return; }
    if(name.length < 3){ alert("Name must be at least 3 characters!"); return; }
    if(phone.length!== 10 || isNaN(phone)){ alert("Phone must be 10 digits!"); return; }
    if(address.length < 10){ alert("Please enter full address!"); return; }
    setOrderPlaced(true); setCart([]); setName(""); setPhone(""); setAddress("");
    setTimeout(() => { setShowCheckout(false); setOrderPlaced(false); }, 3000);
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const categories = ['All', 'Laptop', 'Mobile', 'Accessories', 'Gaming'];
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price;
    if (sortOrder === 'high-low') return b.price - a.price;
    return 0;
  });

  return (
    <BrowserRouter>
      <div style={{padding: '20px', fontFamily: 'Arial'}}>
        <h1>🛒 E-Commerce Store</h1>
        <Link to="/"><button>Store</button></Link>
        <Link to="/cart"><button>View Cart: {cart.reduce((a,b)=>a+b.quantity,0)}</button></Link>
        <Link to="/admin"><button style={{marginLeft:'10px', background:'black', color:'white'}}>Admin</button></Link>
        <hr/>
        {orderPlaced && <h2 style={{color: 'green'}}>✅ Order Placed Successfully!</h2>}
        <Routes>
          <Route path="/" element={
            <div>
              <h2 style={{textAlign: 'center'}}>Product List</h2>
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width: '50%', padding: '10px', margin: '10px auto', display: 'block'}} />
              <div style={{textAlign: 'center', margin: '20px 0'}}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{margin: '5px', padding: '10px 20px', backgroundColor: selectedCategory === cat? '#007bff' : '#6c757d', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'}}>{cat}</button>
                ))}
              </div>
              <div style={{textAlign: 'center', margin: '10px 0'}}>
                <button onClick={() => setSortOrder('default')} style={{margin: '5px'}}>Default</button>
                <button onClick={() => setSortOrder('low-high')} style={{margin: '5px'}}>Low to High</button>
                <button onClick={() => setSortOrder('high-low')} style={{margin: '5px'}}>High to Low</button>
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center'}}>
                {filteredProducts.map(product => (
                  <div key={product._id} style={{border: '1px solid #ddd', borderRadius: '10px', padding: '15px', width: '250px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white'}} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <Link to={`/product/${product._id}`}><img src={product.image} alt={product.name} style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} /></Link>
                    <h3>{product.name}</h3>
                    <p style={{color: 'gray', fontSize: '14px'}}>{product.category}</p>
                    <p style={{fontSize: '20px', fontWeight: 'bold', color: 'green'}}>₹{product.price}</p>
                    <button onClick={() => addToCart(product)} style={{padding: '10px 20px', backgroundColor: '#ff9900', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cart" element={
            <div>
              <h2>Your Cart</h2>
              {cart.length === 0? <p>Cart is empty</p> :
                <div>
                  {cart.map((item) => (
                    <div key={item._id} style={{borderBottom: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between'}}>
                      <span>{item.name} - ₹{item.price} x {item.quantity}</span>
                      <div>
                        <button onClick={() => decreaseQty(item._id)}>-</button>
                        <span style={{margin:'0 5px'}}>{item.quantity}</span>
                        <button onClick={() => increaseQty(item._id)}>+</button>
                        <button onClick={() => removeFromCart(item._id)} style={{backgroundColor: 'red', color: 'white', marginLeft:'5px'}}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <h3>Total: ₹{totalPrice}</h3>
                  <button onClick={handleCheckout}>Checkout</button>
                  {showCheckout && (
                    <div style={{border: '2px solid green', padding: '20px', margin: '20px', borderRadius: '10px'}}>
                      {orderPlaced? <h2 style={{color: 'green'}}>✅ Order Placed Successfully!</h2> : (
                        <>
                          <h3>Enter Details</h3>
                          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" style={{display: 'block', margin: '10px', padding: '8px'}}/>
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" maxLength={10} style={{display: 'block', margin: '10px', padding: '8px'}}/>
                          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" style={{display: 'block', margin: '10px', padding: '8px'}}/>
                          <button onClick={placeOrder} style={{backgroundColor: 'green', color: 'white', padding: '10px 20px'}}>Place Order</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              }
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
export default App