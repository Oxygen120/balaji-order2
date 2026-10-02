import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PRODUCT_FIELDS = [
  'Name',
  'mrp_c',
  'purchase_rate_c',
  'purchase_unit_c',
  'image_c',
  'favourite_c',
  'sort_position_c',
];

const UNITS = ['Patti', 'Cartoon', 'Unit'];
const LAST_RESULT_ID = 'last_result';

export const route = { path: '/order', layout: 'owner', access: 'public' };
export const nav = { label: 'Order', icon: 'ShoppingCart' };

export default function Order() {
  const [customer, setCustomer] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const holdTimer = useRef(null);
  const didHold = useRef(false);
  const navigate = useNavigate();

  function startImageHold(product) {
    if (!product.image_c) return;
    didHold.current = false;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      didHold.current = true;
      setExpandedImage(product);
    }, 450);
  }

  function endImageHold(product) {
    clearTimeout(holdTimer.current);
    if (!product.image_c || didHold.current) return;
    setExpandedImage((current) => current?.Id === product.Id ? null : product);
  }

  function cancelImageHold() {
    clearTimeout(holdTimer.current);
    if (expandedImage) setExpandedImage(null);
  }

  const { data } = useFetch(
    () => sdk.table('products_c')
      .select(PRODUCT_FIELDS)
      .orderBy('sort_position_c')
      .limit(200, 0)
      .fetch()
      .then((r) => {
        if (!r.success) throw new Error(r.message);
        return r.data;
      }),
    []
  );

  const products = data ?? [];
  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return products.filter((product) => !text || product.Name.toLowerCase().includes(text));
  }, [products, search]);

  const estimatedBill = useMemo(
    () => items.reduce(
      (sum, item) => sum + Number(item.qty) * (
        item.unit === item.purchase_unit_c ? Number(item.purchase_rate_c || 0) : 0
      ),
      0
    ),
    [items]
  );

  function addProduct(product) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.Id);
      if (existing) {
        return current.map((item) => item.productId === product.Id
          ? { ...item, qty: Number(item.qty) + 1 }
          : item
        );
      }
      return [
        ...current,
        {
          productId: product.Id,
          Name: product.Name,
          qty: 1,
          unit: product.purchase_unit_c,
          purchase_rate_c: product.purchase_rate_c,
          purchase_unit_c: product.purchase_unit_c,
          mrp_c: product.mrp_c,
        },
      ];
    });
  }

  function getItem(id) {
    return items.find((item) => item.productId === id);
  }

  function updateItem(id, delta) {
    setItems((current) => current
      .map((item) => item.productId === id
        ? { ...item, qty: Math.max(0, Number(item.qty) + delta) }
        : item
      )
      .filter((item) => item.qty > 0)
    );
  }

  function changeUnit(id, unit) {
    setItems((current) => current.map((item) => item.productId === id ? { ...item, unit } : item));
  }

  async function startVoiceSearch() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast.info('Voice search is not available in this browser preview.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'hi-IN';
    recognition.onresult = (event) => setSearch(event.results?.[0]?.[0]?.transcript || '');
    recognition.onerror = () => toast.error('Voice search could not start.');
    recognition.start();
  }

  async function generate() {
    if (!items.length) {
      toast.error('Add at least one product.');
      return;
    }

    const totals = items.reduce(
      (result, item) => {
        result.totalItems += Number(item.qty);
        result[item.unit.toLowerCase()] += Number(item.qty);
        return result;
      },
      { totalItems: 0, patti: 0, cartoon: 0, unit: 0 }
    );

    const date = new Date().toISOString().slice(0, 10);
    const safeItems = items.map((item) => ({
      productId: item.productId,
      Name: item.Name,
      qty: item.qty,
      unit: item.unit,
      mrp: item.mrp_c,
    }));

    const res = await sdk.table('orders_c').create({
      Name: customer.trim(),
      customer_shop_c: customer.trim(),
      order_date_c: date,
      total_items_c: totals.totalItems,
      total_patti_c: totals.patti,
      total_cartoon_c: totals.cartoon,
      total_unit_c: totals.unit,
      estimated_purchase_bill_c: estimatedBill,
      items_c: JSON.stringify(safeItems),
    });

    if (!res.data?.length) {
      toast.error(res.messages?.[0] || 'Could not create order.');
      return;
    }

    const resultPayload = {
      Id: LAST_RESULT_ID,
      date,
      customer: customer.trim(),
      items: safeItems,
      totalItems: totals.totalItems,
      totalPatti: totals.patti,
      totalCartoon: totals.cartoon,
      totalUnit: totals.unit,
    };

    const savedResult = await sdk.table('app_state').update(resultPayload);
    if (!savedResult.data?.length) {
      toast.error(savedResult.messages?.[0] || 'Order saved, but the result could not be stored.');
      return;
    }

    toast.success('Order generated.');
    navigate('/result');
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">New order</h1>
        <p className="text-sm text-muted-foreground">
          Shop name is optional. Add products, set quantities, and generate the order.
        </p>
      </div>

      <Input
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
        placeholder="Customer / shop name"
      />

      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
        />
        <Button type="button" variant="outline" onClick={startVoiceSearch}>Voice</Button>
      </div>

      <div className="space-y-3">
        {filtered.map((product) => {
          const item = getItem(product.Id);
          const quantity = item?.qty || 0;
          const unit = item?.unit || product.purchase_unit_c;
          const selected = quantity > 0;

          return (
            <div
              key={product.Id}
              className={selected
                ? 'rounded-xl border-2 border-primary bg-primary/5 p-3'
                : 'rounded-xl border border-border bg-card p-3'}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted touch-none focus:outline-none"
                  onPointerDown={() => startImageHold(product)}
                  onPointerUp={() => endImageHold(product)}
                  onPointerCancel={cancelImageHold}
                  onPointerLeave={cancelImageHold}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label={'Preview image for ' + product.Name}
                >
                  {product.image_c ? (
                    <img src={product.image_c} alt={product.Name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-lg">🥜</div>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{product.Name}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    MRP ₹{product.mrp_c} · {product.purchase_unit_c}
                  </div>
                  {selected && (
                    <select
                      value={unit}
                      onChange={(e) => changeUnit(product.Id, e.target.value)}
                      className="mt-2 h-9 w-full rounded-md border border-input bg-background px-2 text-xs sm:max-w-32"
                    >
                      {UNITS.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => updateItem(product.Id, -1)}
                    disabled={!selected}
                    aria-label={'Decrease ' + product.Name}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => addProduct(product)}
                    aria-label={'Increase ' + product.Name}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {expandedImage?.image_c && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
          onClick={() => setExpandedImage(null)}
          onPointerUp={() => setExpandedImage(null)}
        >
          <div className="max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl bg-background shadow-2xl">
            <img
              src={expandedImage.image_c}
              alt={expandedImage.Name}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><span className="text-muted-foreground">Items</span><strong className="block">{items.reduce((n, i) => n + Number(i.qty), 0)}</strong></div>
          <div><span className="text-muted-foreground">Patti</span><strong className="block">{items.filter((i) => i.unit === 'Patti').reduce((n, i) => n + Number(i.qty), 0)}</strong></div>
          <div><span className="text-muted-foreground">Cartoon</span><strong className="block">{items.filter((i) => i.unit === 'Cartoon').reduce((n, i) => n + Number(i.qty), 0)}</strong></div>
          <div><span className="text-muted-foreground">Unit</span><strong className="block">{items.filter((i) => i.unit === 'Unit').reduce((n, i) => n + Number(i.qty), 0)}</strong></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Estimated purchase bill</span>
          <strong>₹{estimatedBill.toLocaleString('en-IN')}</strong>
        </div>
        <Button onClick={generate} className="mt-4 w-full bg-primary text-primary-foreground">
          Generate order
        </Button>
      </div>
    </div>
  );
}
