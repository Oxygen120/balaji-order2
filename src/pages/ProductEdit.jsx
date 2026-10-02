import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
const FIELDS=['Name','mrp_c','purchase_rate_c','purchase_unit_c','image_c','favourite_c','sort_position_c','CreatedOn'];
export const route={path:'/products/:id/edit',layout:'owner',access:'public'};
export default function ProductEdit(){
 const {id}=useParams(); const navigate=useNavigate(); const {data}=useFetch(()=>sdk.table('products_c').select(FIELDS).get(id).then(r=>r.data),[id]);
 const [name,setName]=useState(''),[mrp,setMrp]=useState(''),[purchase,setPurchase]=useState(''),[unit,setUnit]=useState('Patti'),[image,setImage]=useState(''),[favourite,setFavourite]=useState(false),[saving,setSaving]=useState(false);
 useEffect(()=>{if(!data)return;setName(data.Name||'');setMrp(String(data.mrp_c??''));setPurchase(String(data.purchase_rate_c??''));setUnit(data.purchase_unit_c||'Patti');setImage(data.image_c||'');setFavourite(Boolean(data.favourite_c));},[data]);
 function chooseImage(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setImage(String(reader.result||''));reader.readAsDataURL(file);}
 async function save(){setSaving(true);try{const res=await sdk.table('products_c').update({Id:id,Name:name.trim(),mrp_c:Number(mrp),purchase_rate_c:Number(purchase),purchase_unit_c:unit,image_c:image,favourite_c:favourite});if(!res.data?.length)return toast.error(res.messages?.[0]||'Could not save product.');toast.success('Product updated.');navigate('/products/'+id);}finally{setSaving(false);}}
 if(!data)return <div className="text-sm text-muted-foreground">Loading product…</div>;
 return <div className="mx-auto max-w-2xl space-y-5"><Link to={'/products/'+id} className="text-sm font-semibold text-primary">← Back to Product</Link><div><h1 className="text-3xl font-bold">Edit product</h1><p className="text-sm text-muted-foreground">Update product details and image.</p></div><div className="space-y-4 rounded-xl border border-border bg-card p-4"><div><label className="mb-2 block text-sm font-medium">Product image</label><div className="flex items-center gap-4"><div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">{image?<img src={image} alt={name||'Product'} className="h-full w-full object-cover"/>:<span>📷</span>}</div><div className="flex-1"><Input type="file" accept="image/*" onChange={chooseImage}/><p className="mt-1 text-xs text-muted-foreground">Choose a replacement photo.</p></div></div></div><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Product name"/><Input type="number" value={mrp} onChange={e=>setMrp(e.target.value)} placeholder="MRP / selling rate"/><Input type="number" value={purchase} onChange={e=>setPurchase(e.target.value)} placeholder="Purchase rate"/><select value={unit} onChange={e=>setUnit(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Patti</option><option>Cartoon</option><option>Unit</option></select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={favourite} onChange={e=>setFavourite(e.target.checked)}/>Favourite product</label><Button disabled={saving} onClick={save} className="w-full bg-primary text-primary-foreground">{saving?'Saving…':'Save changes'}</Button></div></div>;
}
