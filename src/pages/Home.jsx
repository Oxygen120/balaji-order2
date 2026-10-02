import { Link } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
export const route = { path: '/', layout: 'owner', access: 'public' };
export const nav = { label: 'Home', icon: 'House' };
export default function Home() {
  const { data: products } = useFetch(() => sdk.table('products_c').select(['Name','mrp_c','purchase_rate_c','purchase_unit_c','image_c','favourite_c','sort_position_c','CreatedOn']).orderBy('sort_position_c').fetch().then(r => { if (!r.success) throw new Error(r.message); return r.data; }), []);
  const rows = products ?? [];
  return <div className="space-y-6"><section className="rounded-[1.25rem] bg-primary p-6 text-primary-foreground"><p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">Offline order desk</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Namkeen orders, without the clutter.</h1><p className="mt-3 max-w-xl text-sm opacity-90">Keep products handy, build a shop order fast, and copy or share the clean customer message.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/order" className="rounded-xl bg-highlight px-4 py-3 text-sm font-bold text-highlight-foreground">New order</Link><Link to="/products" className="rounded-xl border border-current/30 px-4 py-3 text-sm font-bold">Manage products</Link></div></section><section className="grid gap-3 sm:grid-cols-2"><Metric label="Products" value={rows.length}/><Metric label="Favourites" value={rows.filter(p => p.favourite_c).length}/></section></div>;
}
function Metric({label,value}) { return <div className="rounded-xl border border-border bg-card p-4"><div className="mb-2 text-sm text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></div>; }
