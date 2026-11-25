export const rebrandText = text => text.replace(/青屿/g, '中企').replace(/Qingyu/g, 'Zhongqi').replace(/QINGYU/g, 'ZHONGQI').replace(/qingyu/g, 'zhongqi');

// Explicit brand migration includes saved snapshots, but never regenerates identities.
export function migrateBranding(db) {
  if (db.zhongqiBrandVersion === 1) return db;
  const visit = value => {
    if (typeof value === 'string') {
      if (value.startsWith('data:text/plain')) {
        const comma = value.indexOf(',');
        try {
          const header = value.slice(0,comma+1), payload = value.slice(comma+1);
          const base64 = /;base64,/i.test(header);
          const original = base64 ? new TextDecoder().decode(Uint8Array.from(atob(payload), c=>c.charCodeAt(0))) : decodeURIComponent(payload);
          const updated = rebrandText(original);
          if (original === updated) return value;
          const encoded = base64 ? btoa(Array.from(new TextEncoder().encode(updated),b=>String.fromCharCode(b)).join('')) : encodeURIComponent(updated);
          return header + encoded;
        } catch { return value; }
      }
      return rebrandText(value);
    }
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === 'object') for (const key of Object.keys(value)) value[key] = visit(value[key]);
    return value;
  };
  visit(db);
  db.zhongqiBrandVersion = 1;
  return db;
}
