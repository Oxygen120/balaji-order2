const DB_NAME = 'balaji-namkeen';
const DB_VERSION = 1;
const TABLES = ['products_c', 'orders_c', 'app_state'];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const table of TABLES) {
        if (!db.objectStoreNames.contains(table)) {
          db.createObjectStore(table, { keyPath: 'Id' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local database.'));
  });
}

function createId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeValue(value) {
  if (value === undefined) return null;
  return value;
}

function matchesWhere(row, where) {
  if (!where) return true;
  if (typeof where === 'function') return Boolean(where(row));
  if (typeof where !== 'object') return true;
  return Object.entries(where).every(([key, expected]) => {
    if (expected && typeof expected === 'object') {
      if ('contains' in expected) return String(row[key] ?? '').toLowerCase().includes(String(expected.contains).toLowerCase());
      if ('eq' in expected) return String(row[key]) === String(expected.eq);
    }
    return String(row[key]) === String(expected);
  });
}

function makeQuery(table) {
  const state = { fields: null, sortField: null, sortDirection: 'asc', limit: null, offset: 0, where: null, page: null };
  const query = {
    select(fields) { state.fields = fields; return query; },
    orderBy(field, direction = 'asc') { state.sortField = field; state.sortDirection = direction.toLowerCase() === 'desc' ? 'desc' : 'asc'; return query; },
    limit(count, offset = 0) { state.limit = count; state.offset = offset; return query; },
    page(pageNumber, pageSize = 20) { state.page = { pageNumber, pageSize }; return query; },
    where(condition) { state.where = condition; return query; },
    async aggregate() { return { success: true, aggregators: [] }; },
    async fetch() {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(table, 'readonly');
        const request = tx.objectStore(table).getAll();
        request.onsuccess = () => {
          let rows = request.result.filter((row) => matchesWhere(row, state.where));
          if (state.sortField) {
            rows.sort((a, b) => {
              const av = a[state.sortField];
              const bv = b[state.sortField];
              if (av === bv) return 0;
              const result = av == null ? -1 : bv == null ? 1 : av > bv ? 1 : -1;
              return state.sortDirection === 'desc' ? -result : result;
            });
          }
          if (state.page) {
            const start = Math.max(0, (state.page.pageNumber - 1) * state.page.pageSize);
            rows = rows.slice(start, start + state.page.pageSize);
          } else if (state.limit != null) {
            rows = rows.slice(state.offset, state.offset + state.limit);
          }
          if (Array.isArray(state.fields)) {
            rows = rows.map((row) => ({ ...row, Id: row.Id }));
          }
          resolve({ success: true, data: rows, messages: [] });
        };
        request.onerror = () => reject(request.error || new Error('Local database read failed.'));
      });
    },
    async get(id) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const request = db.transaction(table, 'readonly').objectStore(table).get(id);
        request.onsuccess = () => resolve({ success: true, data: request.result ?? null, messages: [] });
        request.onerror = () => reject(request.error || new Error('Local database read failed.'));
      });
    },
    async create(payload) {
      const db = await openDatabase();
      const row = { ...payload, Id: payload.Id || createId(), CreatedOn: payload.CreatedOn || new Date().toISOString(), UpdatedOn: new Date().toISOString() };
      return new Promise((resolve, reject) => {
        const request = db.transaction(table, 'readwrite').objectStore(table).add(row);
        request.onsuccess = () => resolve({ success: true, data: [row], messages: [] });
        request.onerror = () => reject(request.error || new Error('Could not save local record.'));
      });
    },
    async update(payload) {
      const db = await openDatabase();
      const existing = await query.get(payload.Id);
      const row = { ...(existing.data || {}), ...payload, UpdatedOn: new Date().toISOString() };
      return new Promise((resolve, reject) => {
        const request = db.transaction(table, 'readwrite').objectStore(table).put(row);
        request.onsuccess = () => resolve({ success: true, data: [row], messages: [] });
        request.onerror = () => reject(request.error || new Error('Could not update local record.'));
      });
    },
    async remove(id) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const request = db.transaction(table, 'readwrite').objectStore(table).delete(id);
        request.onsuccess = () => resolve({ success: true, data: [{ Id: id }], messages: [] });
        request.onerror = () => reject(request.error || new Error('Could not delete local record.'));
      });
    },
  };
  return query;
}

function localStorageApi() {
  return {
    validate(file, config = {}) {
      const maxBytes = Number(config.maxValue || 0) * 1024;
      if (maxBytes && file.size > maxBytes) return { valid: false, error: 'File is too large.' };
      return { valid: true };
    },
    async upload(file) {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
        reader.readAsDataURL(file);
      });
      return { Id: createId(), Name: file.name, Type: file.type, Size: file.size, dataUrl, url: dataUrl };
    },
    async preview(file) { return { url: file.dataUrl || file.url || '' }; },
    async download(file) { return { url: file.dataUrl || file.url || '', name: file.Name || file.name || 'download' }; },
  };
}

export const sdk = {
  table: makeQuery,
  contains(field, value) { return { [field]: { contains: value } }; },
  storage: localStorageApi(),
  functions: { async invoke() { throw new Error('Server functions are disabled in the standalone offline app.'); } },
  admin: { async fetch() { return { success: true, data: [] }; } },
};

export const demoAccounts = [];
export const isStandalone = true;
