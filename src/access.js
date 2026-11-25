export const accessToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function validGrant(request, passportId, day = accessToday()) {
  return !!request && request.passportId === passportId && request.status === '已批准' && /^\d{4}-\d{2}-\d{2}$/.test(request.expires || '') && request.expires >= day;
}
export function addAccessSamples(db) {
  if (db.accessSamplesVersion) return;
  const instance = db.instances.find(i => i.modelId === 'FULL-SAMPLE-ESS');
  if (!instance) return;
  for (const [suffix, status, expires] of [['APPROVED', '已批准', '2099-12-31'], ['PENDING', '待处理', ''], ['EXPIRED', '已批准', '2025-01-01']]) {
    const id = `DEMO-ACCESS-${suffix}`;
    if (!db.requests.some(r => r.id === id)) db.requests.push({ id, entity: `示例维修机构（${suffix}）`, email: 'repair@example.com', purpose: '维修诊断', passportId: instance.passportId, status, expires, created: new Date().toISOString() });
  }
  db.accessSamplesVersion = 1;
}
