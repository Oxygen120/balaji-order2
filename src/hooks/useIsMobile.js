import { useState, useEffect } from 'react';
const QUERY = '(max-width: 767px)';
function getMatch() { if (typeof window === 'undefined') return false; return window.matchMedia(QUERY).matches; }
export function useIsMobile() { const [isMobile, setIsMobile] = useState(getMatch); useEffect(() => { const mql = window.matchMedia(QUERY); setIsMobile(mql.matches); const onChange = () => setIsMobile(mql.matches); mql.addEventListener('change', onChange); return () => mql.removeEventListener('change', onChange); }, []); return isMobile; }
