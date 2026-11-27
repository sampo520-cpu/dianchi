import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeed} from './data.js';
import {ensureWorkflow} from './workflow.js';
import {libraryTemplates,templateSnapshot,saveLibraryTemplate,templateValue} from './template-library.js';
test('template revisions do not mutate existing product snapshots or values',()=>{
 const db=ensureWorkflow(createSeed()),model=db.models[0],before=structuredClone(model.templateConfig);
 const template=libraryTemplates(db).find(t=>t.id==='euBattery');
 const next=saveLibraryTemplate(db,{...template,name:'Changed',fieldIds:['model.name']});
 assert.equal(next.version,2);assert.deepEqual(model.templateConfig,before);
 assert.deepEqual(templateSnapshot(db,next).fields.map(f=>f.id),['model.name']);
 assert.equal(templateValue({model:{capacity:0}}, {id:'annex6.capacity'}),0);
 assert.throws(()=>saveLibraryTemplate(db,{...template,fieldIds:['invalid']}));
});
