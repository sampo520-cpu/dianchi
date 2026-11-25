import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from './data.js';
import { fieldDataTypes, inferFieldDataType } from './field-types.js';

test('field data types map date, numeric, long text and default text inputs', () => {
  assert.equal(inferFieldDataType('instance.date'), '日期');
  assert.equal(inferFieldDataType('model.capacity', 'Ah'), '数值');
  assert.equal(inferFieldDataType('model.materials'), '长文本');
  assert.equal(inferFieldDataType('model.name'), '文本');
  assert.deepEqual(fieldDataTypes, ['文本', '数值', '日期', '长文本', '布尔值']);
  const db = createSeed();
  assert.ok(db.rules.every(rule => fieldDataTypes.includes(rule.dataType)));
});
