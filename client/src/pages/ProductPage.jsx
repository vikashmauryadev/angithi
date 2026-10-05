import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../config/siteConfig.js';
export default function ProductPage() {
  const { id } = useParams(); const { add } = useCart();
  const [p, setP] = useState(null); const [err, setErr] = useState(''); const [qty, setQty] = useState(1); const [sel, setSel] = useState([]);
  useEffect(() => { api(`/products/${id}`).then(d => { setP(d); document.title = `${d.name} – Angithi`; }).catch(e => setErr(e.message)); }, [id]);
  if (err) return <main className="wrap empty"><p className="err">{err}</p><Link className="btn" to="/menu">Back to menu</Link></main>;
  if (!p) return <main className="wrap sec"><div className="card skel" /></main>;
  const extra = p.addons.filter(a => sel.includes(a.name)).reduce((s, a) => s + a.price, 0);
  return (<main className="wrap sec detail">
    <div className="pic big">{p.image ? <img src={p.image} alt={p.name} /> : <span aria-hidden>{p.name[0]}</span>}</div>
    <div><p className="muted">{p.category} · {p.cuisine}</p><h1><i className={`dot ${p.veg ? 'v' : 'n'}`} />{p.name}</h1><p>{p.description}</p>
      {p.addons.length > 0 && <fieldset><legend>Add-ons</legend>{p.addons.map(a => <label key={a.name}><input type="checkbox" checked={sel.includes(a.name)} onChange={() => setSel(s => s.includes(a.name) ? s.filter(x => x !== a.name) : [...s, a.name])} /> {a.name} (+{money(a.price)})</label>)}</fieldset>}
      <div className="row"><div className="qty"><button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">−</button><span>{qty}</span><button onClick={() => setQty(q => Math.min(20, q + 1))} aria-label="Increase">+</button></div>
        <button className="btn" disabled={!p.available} onClick={() => add({ id: p._id, name: p.name, price: p.price + extra, qty, addons: sel })}>{p.available ? `Add to cart · ${money((p.price + extra) * qty)}` : 'Sold out today'}</button></div>
    </div></main>);
}
