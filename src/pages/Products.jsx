import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import ApperIcon from '@/components/ApperIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FIELDS = [
  'Name',
  'mrp_c',
  'purchase_rate_c',
  'purchase_unit_c',
  'image_c',
  'favourite_c',
  'sort_position_c',
  'CreatedOn',
];

export const route = { path: '/products', layout: 'owner', access: 'public' };
export const nav = { label: 'Products', icon: 'Package' };

export default function Products() {
  const [search, setSearch] = useState('');
  const { data, loading, run } = useFetch(
    () => {
      let query = sdk.table('products_c').select(FIELDS).orderBy('sort_position_c').limit(100, 0);
      if (search.trim()) {
        query = query.where(sdk.contains('Name', search.trim()));
      }
      return query.fetch().then((r) => {
        if (!r.success) throw new Error(r.message);
        return r.data;
      });
    },
    [search]
  );

  const products = data ?? [];

  async function toggleFavourite(product) {
    const res = await sdk.table('products_c').update({
      Id: product.Id,
      favourite_c: !product.favourite_c,
    });
    if (!res.data?.length) {
      toast.error(res.messages?.[0] || 'Could not update favourite.');
      return;
    }
    toast.success(product.favourite_c ? 'Removed from favourites' : 'Added to favourites');
    run();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Pricing, purchase units and favourites.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link to="/products/new">Add product</Link>
        </Button>
      </div>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
      />
      <div className="grid gap-3 md:grid-cols-2" aria-busy={loading}>
        {products.map((product) => (
          <div key={product.Id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                {product.image_c ? (
                  <img src={product.image_c} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ApperIcon name="PackageOpen" size={28} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link to={'/products/' + product.Id} className="font-bold hover:underline">
                    {product.Name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(product)}
                    aria-label={product.favourite_c ? 'Remove favourite' : 'Add favourite'}
                    className="rounded-full p-2 hover:bg-accent"
                  >
                    <ApperIcon
                      name="Heart"
                      size={18}
                      className={product.favourite_c ? 'fill-current text-highlight' : ''}
                    />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>MRP ₹{product.mrp_c}</span>
                  <span>·</span>
                  <span>Buy ₹{product.purchase_rate_c}</span>
                  <span>·</span>
                  <span>{product.purchase_unit_c}</span>
                </div>
                <div className="mt-3 flex gap-3">
                  <Link to={'/products/' + product.Id + '/edit'} className="text-sm font-semibold text-primary">
                    Edit
                  </Link>
                  <Link to={'/order?product=' + product.Id} className="text-sm font-semibold text-highlight">
                    Add to order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
