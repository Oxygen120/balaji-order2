import { useMemo } from 'react';
const pageMods=import.meta.glob('/src/pages/**/*.jsx',{eager:true});
const discoveredNavItems=Object.entries(pageMods).filter(([,mod])=>mod.nav).map(([,mod])=>{const to=mod.nav.to??mod.route?.path;return {...mod.nav,to,path:to,href:to};}).sort((a,b)=>(a.order??99)-(b.order??99));
export function useOwnerLayoutData(){return {navItems:useMemo(()=>discoveredNavItems,[]),navGroups:[],footerPages:[],initials:'BN',displayName:'Local',counts:{},refreshCounts:()=>{}};}
