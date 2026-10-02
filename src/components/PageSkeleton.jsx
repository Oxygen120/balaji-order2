import { Skeleton } from '@/components/ui/skeleton';
export function StatsSkeleton({count=4}){return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:count},(_,i)=><div key={i} className="rounded-lg border border-border p-5"><Skeleton className="h-3 w-24"/><Skeleton className="mt-4 h-8 w-32"/></div>)}</div>}
export function ListSkeleton({rows=6}){return <div className="rounded-lg border border-border"><div className="p-4"><Skeleton className="h-9 w-full"/></div>{Array.from({length:rows},(_,i)=><div key={i} className="border-t border-border p-4"><Skeleton className="h-4 w-1/2"/></div>)}</div>}
export default function PageSkeleton(){return <div role="status" className="space-y-6"><Skeleton className="h-8 w-56"/><StatsSkeleton/><ListSkeleton rows={5}/></div>}
