import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeed,latest} from './data.js';
import {addFullSamples} from './full-samples.js';
import {curateDemoShowcase,demoShowcase,demoWorkspaceDb} from './demo-showcase.js';
import {symbolCategory} from './battery-symbols.js';

test('showcase keeps six distinct samples with richer conformity references',()=>{
  const db=addFullSamples(createSeed()),workspace=demoWorkspaceDb(db);
  assert.deepEqual(new Set(workspace.models.map(m=>m.id)),new Set(demoShowcase.map(m=>m.id)));
  for(const model of workspace.models) {
    const marks=model.markings.filter(mark=>symbolCategory(mark)==='conformity');
    assert.ok(marks.length>=5,`${model.id}: ${marks.length}`);
    assert.ok(marks.every(mark=>['demo','reference','unverified'].includes(mark.status)));
  }
  const ids=new Set(workspace.models.map(m=>m.id));
  assert.ok(workspace.productionBatches.every(b=>ids.has(b.modelId)));
  assert.ok(workspace.instances.every(i=>ids.has(i.modelId)));
});

test('curation preserves historical scan records, user products and repeated startup',()=>{
  const db=addFullSamples(createSeed());
  const old=db.instances.find(i=>i.modelId==='DEMO-LR03-ALKALINE');
  assert.ok(old&&latest(db,old.id));
  const oldUrl=db.codeRecords.find(c=>c.instanceId===old.id).resolverUrl;
  db.models.push({...structuredClone(db.models.find(m=>m.id==='FULL-SAMPLE-ESS')),id:'CUSTOM-PRODUCT',name:'Customer product'});
  delete db.demoShowcaseVersion;
  curateDemoShowcase(db);
  assert.ok(demoWorkspaceDb(db).models.some(m=>m.id==='CUSTOM-PRODUCT'));
  assert.equal(db.codeRecords.find(c=>c.instanceId===old.id).resolverUrl,oldUrl);
  const count={models:db.models.length,instances:db.instances.length,versions:db.versions.length};
  addFullSamples(db);
  assert.deepEqual({models:db.models.length,instances:db.instances.length,versions:db.versions.length},count);
});
