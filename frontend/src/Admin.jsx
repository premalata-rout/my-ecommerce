import { useState, useEffect } from 'react';

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', price: '', image: '', category: '' });

  useEffect(() => {
    fetch('https://node-backend-1ki0.onrender.com/products')
      .then(r => r.json()).then(setProducts);
  }, []);

  const addProduct = async () => {
    await fetch('https://node-backend-1ki0.onrender.com/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    alert('Product Added!'); window.location.reload();
  };

  const deleteProduct = async (id) => {
    await fetch(`https://node-backend-1ki0.onrender.com/products/${id}`, { method: 'DELETE' });
    alert('Deleted!'); window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Admin Panel - E-Commerce Store</h2>
      <input placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <input placeholder="Price" type="number" onChange={e => setForm({...form, price: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <input placeholder="Image URL" onChange={e => setForm({...form, image: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <input placeholder="Category" onChange={e => setForm({...form, category: e.target.value})} style={{width:'100%', margin:'5px 0', padding:'8px'}}/>
      <button onClick={addProduct} style={{width:'100%', padding:'10px', background:'black', color:'white'}}>ADD PRODUCT</button>

      <h3 style={{marginTop:'30px'}}>All Products ({products.length})</h3>
      {products.map(p => (
        <div key={p.id} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #ccc', padding:'10px 0'}}>
          <span>{p.title} - ${p.price}</span>
          <button onClick={() => deleteProduct(p.id)} style={{background:'red', color:'white'}}>Delete</button>
        </div>
      ))}
    </div>
  )
}
export default Admin;