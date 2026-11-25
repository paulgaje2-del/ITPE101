import {useCallback,useEffect,useState} from 'react';
import {Archive,Check,Edit3,Plus,RefreshCw,Save,Search,Trash2,X} from 'lucide-react';
import {API} from '../api.js';
import {formatMoney} from '../data/format.js';

const EMPTY_PRODUCT={
 name:'',
 category:'Lifestyle',
 description:'',
 price:'',
 stock:'',
 sizes:'7, 8, 9, 10, 11',
 colors:'Black, White',
 image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900',
 featured:false
};
const CATEGORIES=['Lifestyle','Running','Basketball','Outdoor','Training'];
const ORDER_NEXT_STATUS={
 pending_payment:['cancelled','expired'],
 paid:['processing'],
 processing:['shipped'],
 shipped:['delivered']
};

function AdminPanel({token,onCatalogChanged}){
 const[data,setData]=useState(null);
 const[orders,setOrders]=useState([]);
 const[products,setProducts]=useState([]);
 const[msg,setMsg]=useState('');
 const[error,setError]=useState(false);
 const[form,setForm]=useState(EMPTY_PRODUCT);
 const[editing,setEditing]=useState('');
 const[search,setSearch]=useState('');
 const[loading,setLoading]=useState(true);
 const[saving,setSaving]=useState(false);
 const headers={Authorization:'Bearer '.concat(token),'Content-Type':'application/json'};

 const load=useCallback(async()=>{
  setLoading(true);
  try{
   const query=search.trim()?`?q=${encodeURIComponent(search.trim())}`:'';
   const responses=await Promise.all([
    fetch(`${API}/admin/dashboard`,{headers}),
    fetch(`${API}/admin/orders`,{headers}),
    fetch(`${API}/admin/products${query}`,{headers})
   ]);
   const results=await Promise.all(responses.map(response=>response.json()));
   const failed=responses.findIndex(response=>!response.ok);
   if(failed!==-1)throw new Error(results[failed].error?.message||'Unable to load admin data.');
   setData(results[0].data);
   setOrders(results[1].data);
   setProducts(results[2].data);
  }catch(loadError){
   setError(true);
   setMsg(loadError.message||'Unable to load admin data. Check the API connection.');
  }finally{
   setLoading(false);
  }
 },[token,search]);

 useEffect(()=>{load();},[load]);

 const updateField=(key,value)=>setForm(current=>({...current,[key]:value}));

 const startEdit=product=>{
  setEditing(product._id);
  setForm({
   name:product.name,
   category:product.category,
   description:product.description,
   price:String(product.price),
   stock:String(product.stock),
   sizes:(product.sizes||[]).join(', '),
   colors:(product.colors||[]).join(', '),
   image:product.image,
   featured:Boolean(product.featured)
  });
  setMsg('');
  document.getElementById('product-form')?.scrollIntoView({behavior:'smooth',block:'center'});
 };

 const resetForm=()=>{
  setEditing('');
  setForm(EMPTY_PRODUCT);
 };

 const saveProduct=async event=>{
  event.preventDefault();
  setSaving(true);
  setMsg('');
  setError(false);
  const payload={
   name:form.name.trim(),
   category:form.category,
   description:form.description.trim()||`${form.name.trim()} — footwear designed for everyday movement.`,
   price:Number(form.price),
   stock:Number(form.stock),
   sizes:form.sizes.split(',').map(value=>Number(value.trim())).filter(value=>Number.isInteger(value)&&value>0),
   colors:form.colors.split(',').map(value=>value.trim()).filter(Boolean),
   image:form.image.trim(),
   featured:form.featured,
   active:true
  };
  try{
   const response=await fetch(
    editing?`${API}/admin/products/${editing}`:`${API}/admin/products`,
    {method:editing?'PATCH':'POST',headers,body:JSON.stringify(payload)}
   );
   const result=await response.json();
   if(!response.ok)throw new Error(result.error?.message||'Could not save product.');
   setMsg(editing?'Product updated and published.':'Product added to the catalog.');
   resetForm();
   await load();
   await onCatalogChanged?.();
  }catch(saveError){
   setError(true);
   setMsg(saveError.message||'Could not save product.');
  }finally{
   setSaving(false);
  }
 };

 const archiveProduct=async product=>{
  const action=product.active?'archive':'restore';
  if(product.active&&!window.confirm(`Archive "${product.name}"? It will no longer appear in the storefront.`))return;
  setMsg('');
  setError(false);
  try{
   const response=await fetch(`${API}/admin/products/${product._id}`,{
    method:product.active?'DELETE':'PATCH',
    headers,
    ...(!product.active?{body:JSON.stringify({active:true})}:{})
   });
   const result=await response.json();
   if(!response.ok)throw new Error(result.error?.message||'Could not '.concat(action,' product.'));
   setMsg(product.active?'Product archived.':'Product restored to the storefront.');
   await load();
   await onCatalogChanged?.();
  }catch(actionError){
   setError(true);
   setMsg(actionError.message||'Could not '.concat(action,' product.'));
  }
 };

 const advanceOrder=async(order,status)=>{
  setMsg('');
  setError(false);
  try{
   const response=await fetch(`${API}/admin/orders/${order._id}/status`,{
    method:'PATCH',
    headers,
    body:JSON.stringify({status})
   });
   const result=await response.json();
   if(!response.ok)throw new Error(result.error?.message||'Could not update order status.');
   setMsg('Order status updated to '.concat(status.replace('_',' '),'.'));
   await load();
  }catch(statusError){
   setError(true);
   setMsg(statusError.message||'Could not update order status.');
  }
 };

 return <section className="admin-page">
  <div className="section-heading">
   <div><p className="eyebrow">SOLEVA / STORE OPERATIONS</p><h2>Admin <em>overview.</em></h2></div>
   <p className="section-note">Manage shoes, inventory, and store activity.</p>
  </div>
  {msg&&<p className={`admin-message ${error?'is-error':''}`} role="status">{msg}</p>}
  <div className="admin-stats">
   {[
    ['Paid orders',data?.paidOrders??'—'],
    ['Gross sales',data?formatMoney(data.grossSales):'—'],
    ['Pending orders',data?.pendingOrders??'—'],
    ['Low-stock items',data?.lowStock?.length??'—']
   ].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}
  </div>

  <div className="admin-columns">
   <div className="admin-box" id="product-form">
    <p className="eyebrow">CATALOG MANAGEMENT</p>
    <h3>{editing?'Update shoe':'Add a shoe'}</h3>
    <form onSubmit={saveProduct}>
     <label className="admin-label">Shoe name<input placeholder="Shoe name" value={form.name} onChange={event=>updateField('name',event.target.value)} maxLength="140" required/></label>
     <label className="admin-label">Category<select value={form.category} onChange={event=>updateField('category',event.target.value)}>{CATEGORIES.map(category=><option key={category}>{category}</option>)}</select></label>
     <label className="admin-label">Description<textarea placeholder="Product description" value={form.description} onChange={event=>updateField('description',event.target.value)} maxLength="3000" rows="3"/></label>
     <div className="admin-fields">
      <label className="admin-label">Price (₱)<input type="number" min="0" step="0.01" placeholder="Price (₱)" value={form.price} onChange={event=>updateField('price',event.target.value)} required/></label>
      <label className="admin-label">Stock<input type="number" min="0" step="1" placeholder="Stock" value={form.stock} onChange={event=>updateField('stock',event.target.value)} required/></label>
     </div>
     <div className="admin-fields">
      <label className="admin-label">Sizes (comma-separated)<input placeholder="7, 8, 9, 10, 11" value={form.sizes} onChange={event=>updateField('sizes',event.target.value)} required/></label>
      <label className="admin-label">Colors (comma-separated)<input placeholder="Black, White" value={form.colors} onChange={event=>updateField('colors',event.target.value)}/></label>
     </div>
     <label className="admin-label">Image URL<input type="url" placeholder="https://..." value={form.image} onChange={event=>updateField('image',event.target.value)} required/></label>
     <label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={event=>updateField('featured',event.target.checked)}/> Feature this shoe on the storefront</label>
     <div className="admin-form-actions">
      <button className="add-button" disabled={saving}>{saving?'Saving...':editing?'Save changes':'Add product'} {editing?<Save size={16}/>:<Plus size={16}/>}</button>
      {editing&&<button type="button" className="admin-cancel" onClick={resetForm}><X size={15}/> Cancel</button>}
     </div>
    </form>
   </div>
   <div className="admin-box">
    <p className="eyebrow">INVENTORY ALERTS</p>
    <h3>Running low</h3>
    {(data?.lowStock||[]).length?data.lowStock.map(product=><div className="low-row" key={product._id}><span>{product.name}</span><b>{product.stock} left</b></div>):<p className="muted">No low-stock products reported.</p>}
   </div>
  </div>

  <div className="admin-box catalog-box">
   <div className="admin-section-heading">
    <div><p className="eyebrow">PRODUCTS</p><h3>Manage catalog</h3></div>
    <button className="admin-refresh" onClick={load} disabled={loading} aria-label="Refresh catalog"><RefreshCw size={16}/></button>
   </div>
   <label className="admin-search"><Search size={16}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search products..."/></label>
   {loading?<p className="muted">Loading products...</p>:products.length?products.map(product=><article className={`admin-product ${product.active?'':'is-archived'}`} key={product._id}>
    <img src={product.image} alt="" loading="lazy"/>
    <div className="admin-product-details">
     <strong>{product.name}</strong>
     <span>{product.category} · {formatMoney(product.price)} · {product.stock} in stock</span>
     {!product.active&&<small>Archived</small>}
    </div>
    <div className="admin-product-actions">
     <button onClick={()=>startEdit(product)} aria-label={`Edit ${product.name}`}><Edit3 size={16}/><span>Edit</span></button>
     <button className={product.active?'admin-archive':'admin-restore'} onClick={()=>archiveProduct(product)} aria-label={`${product.active?'Archive':'Restore'} ${product.name}`}>
      {product.active?<><Archive size={16}/><span>Archive</span></>:<><Check size={16}/><span>Restore</span></>}
     </button>
    </div>
   </article>):<p className="muted">No products match your search.</p>}
  </div>

  <div className="admin-box orders-box">
   <p className="eyebrow">LATEST ACTIVITY</p><h3>Recent orders</h3>
   {orders.slice(0,8).map(order=><div className="order-row" key={order._id}>
    <span>#{order._id.slice(-7).toUpperCase()}</span>
    <span>{order.user?.name||'Customer'}</span>
    <b>{formatMoney(order.total)}</b>
    <em>{order.status.replace('_',' ')}</em>
    {(ORDER_NEXT_STATUS[order.status]||[]).map(status=><button className="order-status-action" key={status} onClick={()=>advanceOrder(order,status)}>{status.replace('_',' ')}</button>)}
   </div>)}
   {!orders.length&&<p className="muted">No orders yet.</p>}
  </div>
 </section>;
}

export default AdminPanel;
