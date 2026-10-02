import { Link,useNavigate,useParams } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
const FIELDS=['Name','mrp_c','purchase_rate_c','purchase_unit_c','image_c','favourite_c','sort_position_c','CreatedOn'];
export const route={path:'/products/:id',layout:'owner',access:'public'};
export default function ProductId(){
 const {id}=useParams();const navigate=useNavigate();const {data,loading,run}=useFetch(()=>sdk.table('products_c').select(FIELDS).get(id).then(r=>r.data),[id]);
 if(loading&&!data)return <div className="text-sm text-muted-foreground">Loading product…</div>;
 if(!data)return <div className="space-y-3"><h1 className="text-2xl font-bold">Product not found</h1><Link to="/products" className="text-primary">Back to Products</Link></div>;
 async function toggleFavourite(){const res=await sdk.table('products_c').update({Id:data.Id,favourite_c:!data.favourite_c});if(!res.data?.length)return toast.error(res.messages?.[0]||'Could not update product.');toast.success('Product updated.');run();}
 async function remove(){const res=await sdk.table('products_c').remove(id);if(!res.data?.length)return toast.error(res.messages?.[0]||'Could not delete product.');toast.success('Product deleted.');navigate('/products');}
 return <div className="space-y-5"><Link to="/products" className="text-sm font-semibold text-primary">← Back to Products</Link><div className="rounded-xl border border-border bg-card p-5"><div className="grid gap-5 md:grid-cols-[160px_1fr]"><div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-muted">{data.image_c?<img src={data.image_c} alt="" className="h-full w-full object-cover"/>:<span className="text-4xl">🥜</span>}</div><div><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">{data.Name}</h1><Button variant="outline" onClick={toggleFavourite}>{data.favourite_c?'★ Favourite':'☆ Favourite'}</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Stat label="MRP" value={'₹'+data.mrp_c}/><Stat label="Purchase" value={'₹'+data.purchase_rate_c}/><Stat label="Purchase unit" value={data.purchase_unit_c}/></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild><Link to={'/products/'+id+'/edit'}>Edit</Link></Button><Button variant="destructive" onClick={remove}>Delete</Button></div></div></div></div></div>;
}
function Stat({label,value}){return <div className="rounded-xl bg-muted p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-bold">{value}</div></div>}
