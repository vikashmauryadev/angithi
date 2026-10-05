import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
const Ctx = createContext();
const key = l => l.id + '|' + (l.addons || []).join(',');
function reduce(s, a) {
  switch (a.type) {
    case 'add': { const ex = s.find(l => key(l) === key(a.line)); return ex ? s.map(l => key(l) === key(ex) ? { ...l, qty: l.qty + a.line.qty } : l) : [...s, a.line]; }
    case 'qty': return s.map(l => key(l) === a.k ? { ...l, qty: l.qty + a.d } : l).filter(l => l.qty > 0);
    case 'clear': return [];
    default: return s;
  }
}
export function CartProvider({ children }) {
  const [lines, dispatch] = useReducer(reduce, [], () => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } });
  const [open, setOpen] = useState(false);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(lines)), [lines]);
  const v = useMemo(() => ({ lines, open, setOpen, key, count: lines.reduce((s, l) => s + l.qty, 0),
    add: line => { dispatch({ type: 'add', line }); setOpen(true); }, change: (k, d) => dispatch({ type: 'qty', k, d }), clear: () => dispatch({ type: 'clear' }) }), [lines, open]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
