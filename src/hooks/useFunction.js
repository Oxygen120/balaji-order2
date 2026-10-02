import { useCallback,useState } from 'react';
import { sdk } from '@/services/sdk';
export function useFunction(){const [loading,setLoading]=useState(false);const [error,setError]=useState(null);const run=useCallback(async(name,args={})=>{setLoading(true);setError(null);try{const result=await sdk.function(name,args);if(!result.success)throw new Error(result.message||'Function failed');return result.data;}catch(e){setError(e);throw e}finally{setLoading(false)}},[]);return {run,loading,error};}
