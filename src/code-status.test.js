import test from 'node:test';
import assert from 'node:assert/strict';
import { codeStatus } from './code-status.js';
test('display status follows accessible snapshots and preserves terminal void state', () => {
  const i = { id: 'I' }, db = { codeRecords: [], versions: [] };
  assert.equal(codeStatus(db, i), '资料待补充');
  db.codeRecords.push({ instanceId: 'I', status: '已分配' });
  assert.equal(codeStatus(db, i), '资料待补充');
  db.versions.push({ instance: { id: 'I' } });
  assert.equal(codeStatus(db, i), '可访问');
  db.codeRecords[0].status = '作废';
  assert.equal(codeStatus(db, i), '已作废');
});
