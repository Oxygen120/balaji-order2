import { useCallback,useEffect,useState } from 'react';
export function useProfile(){const [profile,setProfile]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);const reload=useCallback(async()=>{setLoading(true);try{setProfile(null);setError(null);}catch(e){setError(e)}finally{setLoading(false)}},[]);useEffect(()=>{reload()},[reload]);return {profile,loading,error,reload};}
export default useProfile;
