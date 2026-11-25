import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from './data.js';
import { addFullSamples } from './full-samples.js';
import { enrichBatterySymbols, makeCatalogSymbol, symbolCategory, symbolStatus } from './battery-symbols.js';

test('legacy symbols split into safety, collection and conformity without losing uploads',()=>{
  assert.equal(symbolCategory({id:'CE-REFERENCE'}),'conformity');
  assert.equal(symbolCategory({id:'WEEE'}),'recycling');
  assert.equal(symbolCategory({id:'FULL-SAMPLE-EYES',nameEn:'Eye protection'}),'safety');
  assert.equal(symbolCategory({category:'safety',id:'CE-REFERENCE'}),'safety');
  const db=addFullSamples(createSeed());
  const six=db.models.find(m=>m.id==='DEMO-6F22');
  assert.equal(six.markings.find(m=>m.id==='CE-REFERENCE').category,'conformity');
  assert.ok(six.markings.filter(m=>symbolCategory(m)==='safety').length>=7);
  assert.ok(!db.models.find(m=>m.id==='FULL-SAMPLE-ESS').markings.some(m=>m.key==='no-charge'));
  const old=six.markings[0]; old.imageUrl='/customer-original.png';
  const count=six.markings.length, versions=db.versions.length;
  enrichBatterySymbols(db);
  assert.equal(old.imageUrl,'/customer-original.png');
  assert.equal(six.markings.length,count);
  assert.equal(db.versions.length,versions);
});

test('adding a certification preset keeps official artwork separate from approval status',()=>{
  const ul=makeCatalogSymbol('ul','UL-DEMO');
  assert.equal(ul.status,'demo');
  assert.equal(ul.imageUrl,'/mark-ul-component.png');
  assert.equal(symbolStatus({...ul,status:'documented'}),'unverified');
  assert.equal(symbolStatus({...ul,status:'documented',evidenceUrl:'javascript:alert(1)'}),'unverified');
  assert.equal(symbolStatus({...ul,status:'documented',evidenceUrl:'https://example.com/report'}),'documented');
  assert.equal(makeCatalogSymbol('un383','TEST').kind,'test');
});
