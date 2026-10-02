import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const route = { path: '/products', layout: 'owner', access: 'public' };
export const nav = { label: 'Products', icon: 'Package' };

export default function Products() {
  const [search, setSearch] = useState('');
  const { data, loading } = useFetch(() => {
    let query = sdk.table('products_c').select(['Name','mrp_c','purchase_rate_c','purchase_unit_c','image_c','favourite_c','sort_position_c','CreatedOn']).orderBy('sort_position_c').limit(100, 0);
    if (search.trim()) query = query.where(sdk.contains('Name', search.trim()));
    return query.fetch().then((result) => {
      if (!result.success) throw new Error(result.message || 'Could not load products.');
      return result.data;
    });
  }, [search]);

  const products = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Pricing, purchase units and favourites.</p>
        </div>
        <Button asChild><Link to="/products/new">Add product</Link></Button>
      </div>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" />
      <div className="grid gap-3 md:grid-cols-2" aria-busy={loading}>
        {products.map((product) => (
          <div key={product.Id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.image_c ? <img src={product.image_c} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={'/products/' + product.Id} className="font-bold hover:underline">{product.Name}</Link>
                <div className="mt-2 text-sm text-muted-foreground">MRP ₹{product.mrp_c} · Buy ₹{product.purchase_rate_c} · {product.purchase_unit_c}</div>
                <div className="mt-3 flex gap-3">
                  <Link to={'/products/' + product.Id + '/edit'} className="text-sm font-semibold text-primary">Edit</Link>
                  <Link to={'/order?product=' + product.Id} className="text-sm font-semibold text-highlight">Add to order</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
