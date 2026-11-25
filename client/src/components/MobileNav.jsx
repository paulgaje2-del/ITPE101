import {Grid2X2,Heart,House,ShoppingBag,User} from 'lucide-react';

function MobileNav({page,onNavigate,onOpenBag,count}){
 const items=[
  {label:'Home',icon:House,page:'home'},
  {label:'Shop',icon:Grid2X2,page:'shop'},
  {label:'Saved',icon:Heart,page:'saved'},
  {label:'Bag',icon:ShoppingBag,action:onOpenBag},
  {label:'Account',icon:User,page:'account'}
 ];
 const navigate=target=>{
  onNavigate(target);
  if(target==='home')window.scrollTo({top:0,behavior:'smooth'});
  if(target==='shop')setTimeout(()=>document.getElementById('shop')?.scrollIntoView({behavior:'smooth'}),0);
 };
 return <nav className="mobile-bottom-nav" aria-label="Main navigation">
  {items.map(({label,icon:Icon,page:target,action})=><button
   className={target===page?'active':''}
   key={label}
   onClick={action||(()=>navigate(target))}
   aria-current={target===page?'page':undefined}
  >
   <span className="mobile-nav-icon"><Icon size={20}/>{label==='Bag'&&count>0&&<b>{count}</b>}</span>
   <small>{label}</small>
  </button>)}
 </nav>;
}

export default MobileNav;
