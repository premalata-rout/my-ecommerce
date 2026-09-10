import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`https://node-backend-5hzc.onrender.com/products/${id}`)
     .then(res => {
        if(!res.ok) throw new Error("Product not found");
        return res.json();
      })
     .then(data => {
        console.log("API DATA:", data);
        setProduct(data);
      })
     .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [id]);

  if(error) return <h2>{error} - Back jau <Link to="/">Store</Link></h2>
  if(!product) return <h2>Loading product {id}...</h2>;

  return (
    <div style={{padding: '20px'}}>
      <Link to="/">← Back to Store</Link>
      <div style={{display: 'flex', gap: '30px', marginTop: '20px'}}>
        <img src={product.image} alt={product.name} style={{width: '400px', borderRadius: '10px', border:'1px solid #ddd'}}/>
        <div>
          <h1>{product.name}</h1>
          <p style={{fontSize: '24px', color: 'green'}}>₹{product.price}</p>
          <p><b>Category:</b> {product.category}</p>
          <p>{product.description || product.desc || 'No description'}</p>
          <button onClick={() => addToCart(product)} style={{padding: '12px 20px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '5px'}}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
export default ProductDetail;
