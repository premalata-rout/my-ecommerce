import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  if(!product) return <h2>Loading...</h2>;

  return (
    <div style={{padding: '20px'}}>
      <Link to="/">← Back to Shop</Link>
      <div style={{display: 'flex', gap: '30px', marginTop: '20px'}}>
        <img src={product.image} alt={product.name} style={{width: '400px', borderRadius: '10px'}}/>
        <div>
          <h1>{product.name}</h1>
          <p style={{fontSize: '24px', color: 'green'}}>₹{product.price}</p>
          <p>{product.desc || 'No description available'}</p>
          <button 
            onClick={() => addToCart(product)}
            style={{padding: '12px 20px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail;