import test from 'node:test';
import assert from 'node:assert/strict';
import { validGrant, addAccessSamples } from './access.js';
test('only matching approved unexpired requests grant access', () => {
  const r = { passportId: 'P1', status: '已批准', expires: '2026-11-22' };
  assert.equal(validGrant(r, 'P1', '2026-11-22'), true);
  for (const patch of [{ status: '待处理' }, { status: '已撤销' }, { status: '已拒绝' }, { expires: '2026-11-21' }, { expires: '' }, { passportId: 'P2' }]) assert.equal(validGrant({ ...r, ...patch }, 'P1', '2026-11-22'), false);
});
test('access scenarios are additive and idempotent', () => {
  const db = { instances: [{ modelId: 'FULL-SAMPLE-ESS', passportId: 'DEMO' }], requests: [{ id: 'USER' }] };
  addAccessSamples(db);
  assert.equal(db.requests.length, 4);
  addAccessSamples(db);
  assert.equal(db.requests.length, 4);
  assert.equal(db.requests[0].id, 'USER');
});
