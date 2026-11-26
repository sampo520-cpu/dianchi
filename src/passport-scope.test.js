import test from 'node:test';
import assert from 'node:assert/strict';
import {queryPassportScope} from './passport-scope.js';
const base={category:'工业储能',energy:3,date:'2027-02-18'};
test('passport scope respects industrial threshold and start date',()=>{
  assert.equal(queryPassportScope(base).status,'required');
  assert.equal(queryPassportScope({...base,energy:2}).status,'outside');
  assert.equal(queryPassportScope({...base,energy:''}).status,'review');
  assert.equal(queryPassportScope({...base,date:'2027-02-17'}).status,'later');
  assert.equal(queryPassportScope({...base,category:'轻型交通工具',energy:0.3}).status,'required');
  assert.equal(queryPassportScope({...base,category:'便携式电池'}).status,'outside');
  assert.equal(queryPassportScope({...base,finished:'unknown'}).status,'review');
  assert.equal(queryPassportScope({...base,exception:'review'}).status,'review');
  assert.equal(queryPassportScope({...base,market:'no'}).status,'outside');
});
