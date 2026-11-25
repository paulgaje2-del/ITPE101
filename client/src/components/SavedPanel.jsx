import {ArrowLeft,ArrowRight,Heart,Trash2} from 'lucide-react';
import {formatMoney} from '../data/format.js';

function SavedPanel({products,onRemove,onQuickView,onShop}){
 return <section className="saved-page">
  <button className="saved-back" onClick={onShop}><ArrowLeft size={17}/> Continue shopping</button>
  <div className="saved-heading">
   <p className="eyebrow">YOUR SOLEVA SPACE</p>
   <h1>Saved <em>pieces.</em></h1>
   <p>Pairs you’ve got your eye on.</p>
  </div>
  {!products.length
   ?<div className="saved-empty"><Heart size={25}/><h2>No saved pieces yet.</h2><p>Save a pair from its quick view and find it here later.</p><button onClick={onShop}>Explore the collection <ArrowRight size={16}/></button></div>
   :<div className="saved-grid">{products.map(product=>{
    const id=String(product._id||product.id);
    return <article className="saved-card" key={id}>
     <button className="saved-card-image" onClick={()=>onQuickView(product)}><img src={product.image} alt={product.name}/></button>
     <div className="saved-card-info"><div><p>{product.category}</p><h2>{product.name}</h2></div><strong>{formatMoney(product.price)}</strong></div>
     <div className="saved-card-actions">
      <button onClick={()=>onQuickView(product)}>View details <ArrowRight size={15}/></button>
      <button className="saved-remove" onClick={()=>onRemove(id)} aria-label={`Remove ${product.name} from saved pieces`}><Trash2 size={16}/></button>
     </div>
    </article>;
   })}</div>}
 </section>;
}

export default SavedPanel;
