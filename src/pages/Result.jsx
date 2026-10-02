import { Link } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LAST_RESULT_ID = 'last_result';

export const route = { path: '/result', layout: 'owner', access: 'public' };
export const nav = { label: 'Result', icon: 'FileText' };

function buildMessage(result) {
  if (!result) return 'BALAJI NAMKEEN ORDER\nGenerate a new order to see the result.';
  return [
    'BALAJI NAMKEEN ORDER',
    'Date: ' + (result.date || ''),
    'Customer/Shop: ' + (result.customer || ''),
    '',
    ...(result.items || []).map((item) => item.Name + ' — ' + item.qty + ' ' + item.unit),
    '',
    'Total Items: ' + (result.totalItems || 0),
    'Total Patti: ' + (result.totalPatti || 0),
    'Total Cartoon: ' + (result.totalCartoon || 0),
    'Total Unit: ' + (result.totalUnit || 0),
  ].join('\n');
}

export default function Result() {
  const { data, loading } = useFetch(
    () => sdk.table('app_state').select(['Id']).get(LAST_RESULT_ID).then((result) => result.data),
    []
  );
  const message = buildMessage(data);

  async function copy() {
    await navigator.clipboard.writeText(message);
    toast.success('Order copied.');
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ text: message });
      return;
    }
    await copy();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Order result</h1>
        <p className="text-sm text-muted-foreground">
          Internal purchase rate is never included in the customer message.
        </p>
      </div>
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading result…
        </div>
      ) : (
        <pre className="whitespace-pre-wrap rounded-xl border border-border bg-card p-4 font-sans text-sm leading-6">
          {message}
        </pre>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={copy}>Copy order</Button>
        <Button onClick={share} className="bg-highlight text-highlight-foreground">Share order</Button>
      </div>
      <Link to="/order" className="block text-center text-sm font-semibold text-primary">
        Create another order
      </Link>
    </div>
  );
}
