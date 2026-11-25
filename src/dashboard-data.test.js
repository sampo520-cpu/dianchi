import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from './data.js';
import { addFullSamples } from './full-samples.js';
import { batteryDashboard } from './dashboard-data.js';

test('dashboard metrics reflect local data and filter by date, category and template', () => {
  const db = addFullSamples(createSeed());
  const all = batteryDashboard(db);
  const visibleIds=new Set(db.models.filter(m=>!m.demoArchived).map(m=>m.id));
  assert.equal(all.productCount, visibleIds.size);
  assert.equal(all.batchCount, db.productionBatches.filter(b=>visibleIds.has(b.modelId)).length);
  assert.equal(all.codeCount, db.codeRecords.filter(c=>visibleIds.has(c.modelId)).length);
  const portable = batteryDashboard(db, { category: '便携式电池', template: 'generic' });
  assert.equal(portable.productCount, 1);
  assert.equal(portable.batchCount, 1);
  assert.equal(portable.codeCount, 3);
  const dated = batteryDashboard(db, { from: '2026-11-01', to: '2026-11-30' });
  assert.ok(dated.batches.every(b => b.date >= '2026-11-01' && b.date <= '2026-11-30'));
  const selected = db.models.find(m => !m.demoArchived);
  const scoped = batteryDashboard(db, { modelId: selected.id });
  assert.equal(scoped.productCount, 1);
  assert.ok(scoped.batches.every(b => b.modelId === selected.id));
  assert.equal(scoped.codeCount, db.codeRecords.filter(c => c.modelId === selected.id).length);
  const instance = scoped.instances[0];
  db.codeRecords.filter(c => c.instanceId === instance.id).forEach(c => { c.status = '作废'; });
  assert.equal(batteryDashboard(db, { modelId: selected.id }).voidCount, 1);
});
