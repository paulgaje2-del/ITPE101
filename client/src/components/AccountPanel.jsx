import {ArrowRight,Check,LogOut,Sparkles,User,PackageCheck,Heart} from 'lucide-react';

function initials(name=''){
 return name.trim().split(/\s+/).slice(0,2).map(part=>part[0]?.toUpperCase()||'').join('')||'S';
}

function AccountPanel({user,onSignIn,onSignOut,onOrders,onSaved,onFinder,onAdmin,savedCount}){
 const signedIn=Boolean(user);
 const name=user?.name||'Guest';
 return <section className="account-page">
  <div className="account-page-heading">
   <p className="eyebrow">YOUR SOLEVA SPACE</p>
   <h1>Account</h1>
   <p>Hi, {name.split(/\s+/)[0]}.</p>
  </div>
  <div className="account-profile-card">
   <div className="account-avatar">{signedIn?initials(name):<User size={27}/>}</div>
   <h2>{name}</h2>
   <p className="account-email">{user?.email||'Sign in to see your account details'}</p>
   {signedIn&&<span className="account-role"><Check size={14}/>{user.role==='admin'?'Administrator':'Customer'}</span>}
   {signedIn
    ?<button className="account-signout" onClick={onSignOut}><LogOut size={17}/> Sign out</button>
    :<button className="account-signout" onClick={onSignIn}><User size={17}/> Sign in or create account</button>}
  </div>
  <div className="account-links">
   {user?.role==='admin'&&<button className="account-link" onClick={onAdmin}>
    <span className="account-link-icon"><PackageCheck size={19}/></span>
    <span>Manage products</span><ArrowRight size={18}/>
   </button>}
   <button className="account-link" onClick={onOrders}>
    <span className="account-link-icon"><PackageCheck size={19}/></span>
    <span>Orders</span><ArrowRight size={18}/>
   </button>
   <button className="account-link" onClick={onSaved}>
    <span className="account-link-icon"><Heart size={19}/></span>
    <span>Saved pieces</span><strong>{savedCount}</strong><ArrowRight size={18}/>
   </button>
  </div>
  <button className="account-finder-link" onClick={onFinder}>
   <span><Sparkles size={18}/></span>
   <span><strong>Find your next pair</strong><small>Get shoe suggestions with the SOLEVA Smart Finder</small></span>
   <ArrowRight size={18}/>
  </button>
 </section>;
}

export default AccountPanel;
