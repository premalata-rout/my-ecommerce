import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    console.log("URL id param:", id);
    fetch(`https://node-backend-5hzc.onrender.com/products`)
    .then(res => res.json())
    .then(allProducts => {
        console.log("All products:", allProducts);
        const found = allProducts.find(p => String(p.id) === String(id));
        console.log("Found product:", found);
        setProduct(found);
      });
  }, [id]);

  if(!product) return <h2 style={{padding:'20px'}}>Loading {id} <br/>ID={id} <br/> <Link to="/">Back</Link></h2>;

  return (
    <div style={{padding: '20px'}}>
      <Link to="/">← Back to Store</Link>
      <div style={{display: 'flex', gap: '30px', marginTop: '20px', flexWrap:'wrap'}}>
        <img src={product.image} alt={product.name} style={{width: '400px', borderRadius: '10px', border:'1px solid #ddd'}}/>
        <div>
          <h1>{product.name}</h1>
          <p style={{fontSize: '24px', color: 'green', fontWeight:'bold'}}>₹{product.price}</p>
          <p><b>Category:</b> {product.category}</p>
          <p>{product.description || product.desc}</p>
          <button onClick={() => addToCart(product)} style={{padding: '12px 20px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '5px', cursor:'pointer'}}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
export default ProductDetail;
