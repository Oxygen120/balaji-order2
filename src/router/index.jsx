import { createBrowserRouter } from 'react-router-dom';
import { Suspense,lazy } from 'react';
import OwnerLayout from '@/layouts/OwnerLayout';
const pageMods=import.meta.glob('/src/pages/**/*.jsx',{eager:true}); const loaders=import.meta.glob('/src/pages/**/*.jsx'); const NotFound=lazy(()=>import('@/pages/NotFound'));
const discovered=Object.entries(pageMods).filter(([,m])=>m.route).map(([p,m])=>({...m.route,_component:lazy(loaders[p])}));
function wrap(C){return <Suspense fallback={<div className="p-8">Loading…</div>}><C/></Suspense>}
const routes=discovered.map(r=>{const c={element:wrap(r._component),handle:{access:r.access??'public'}};if(r.path==='/')c.index=true;else c.path=r.path.replace(/^\//,'');return c;});
export const router=createBrowserRouter([{path:'/',element:<OwnerLayout/>,children:[...routes,{path:'*',element:wrap(NotFound)}]}]);
