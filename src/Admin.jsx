import { useState, useEffect } from 'react';

const API = 'https://node-backend-5hzc.onrender.com';

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', image: '', category: 'Laptop', desc: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [pass, setPass] = useState("");
  
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "kajal@2004";

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(d => setProducts(Array.isArray(d)? d : []));
  }, []);
  
  const getId = (p) => p._id || p.id;

  const addProduct = async () => {
    if(!form.name || !form.price) return alert("Name and Price are required!");
    await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...form, price: Number(form.price), title: form.name})
    });
    alert('Product Added!');
    const updated = await fetch(`${API}/products`).then(r=>r.json());
    setProducts(updated);
    setForm({ name: '', price: '', image: '', category: 'Laptop', desc: '' });
  };

  const deleteProduct = async (id) => {
    if(!window.confirm("Are you sure you want to delete?")) return;
    await fetch(`${API}/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => getId(p) !== id));
  };

  if (!isAdmin) {
    return (
      <div style={{padding:'50px', maxWidth:'400px', margin:'100px auto', border:'2px solid black', borderRadius:'10px', textAlign:'center'}}>
        <h2>🔒 Admin Login</h2>
        <input 
          type="password" 
          placeholder="Enter Password" 
          value={pass}
          onChange={e=>setPass(e.target.value)}
          style={{padding:'10px', width:'90%', margin:'10px'}}
        />
        <br/>
        <button 
          onClick={()=> pass===ADMIN_PASS ? setIsAdmin(true) : alert("Wrong Password!")} 
          style={{padding:'10px 20px', background:'black', color:'white', cursor:'pointer'}}
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Admin Panel - {products.length} Products</h2>
      <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <input placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <textarea placeholder="Description" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <button onClick={addProduct} style={{width:'100%', padding:'10px', background:'black', color:'white', cursor:'pointer'}}>ADD PRODUCT</button>

      <h3 style={{marginTop:'30px'}}>All Products</h3>
      {products.map(p => (
        <div key={getId(p)} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #ccc', padding:'10px 0'}}>
          <span>{p.name || p.title} - ₹{p.price}</span>
          <button onClick={() => deleteProduct(getId(p))} style={{background:'red', color:'white', cursor:'pointer'}}>Delete</button>
        </div>
      ))}
    </div>
  )
}
export default Admin;