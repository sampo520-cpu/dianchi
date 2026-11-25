import { check } from './data.js';
import { codeStatus } from './code-status.js';

export function batteryDashboard(db, { from = '', to = '', category = '全部', template = '全部', modelId = '全部' } = {}) {
  const inRange = value => (!from || value >= from) && (!to || value <= to);
  const models = db.models.filter(m => !m.demoArchived && (modelId === '全部' || m.id === modelId) && (category === '全部' || m.type === category) && (template === '全部' || (m.template || 'eu') === template));
  const modelIds = new Set(models.map(m => m.id));
  const batches = db.productionBatches.filter(b => modelIds.has(b.modelId) && inRange(b.date));
  const instances = db.instances.filter(i => modelIds.has(i.modelId) && inRange(i.date));
  const requests = db.requests.filter(r => !['已拒绝', '已撤销'].includes(r.status));
  const missing = instances.filter(i => check(db, i).length > 0);
  return {
    productCount: models.length,
    batchCount: batches.length,
    codeCount: db.codeRecords.filter(c => modelIds.has(c.modelId) && inRange(c.productionDate || '')).length,
    accessibleCount: instances.filter(i => codeStatus(db, i) === '可访问').length,
    voidCount: instances.filter(i => codeStatus(db, i) === '已作废').length,
    missingCount: missing.length,
    pendingRequests: db.requests.filter(r => r.status === '待处理').length,
    batches,
    instances,
    missing,
    requests,
  };
}
