import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeed} from './data.js';
import {ensureWorkflow,createProduction,saveMaterialVersion} from './workflow.js';
import {enableSharedCode,sharedVersion,createBatchOnly} from './shared-codes.js';
test('product code keeps its identity and excludes all instance fields',()=>{
 const db=ensureWorkflow(createSeed()),model=db.models[0];
 const code=enableSharedCode(db,'product',model.id);
 assert.equal(enableSharedCode(db,'product',model.id).id,code.id);
 const version=sharedVersion(db,code);
 assert.equal(version.instance.serial,'');assert.equal(version.instance.date,'');
 assert.ok(version.rules.every(r=>!r.code.startsWith('instance.')));
 assert.deepEqual(version.events,[]);
});
test('append individuals retains batch and QR identity and rejects overflow without partial writes',()=>{
 const db=ensureWorkflow(createSeed()),m=db.models[0];
 const b=createBatchOnly(db,{modelId:m.id,name:'APPEND-TEST',date:'2026-11-27',factory:'Factory A',count:3});
 const code=enableSharedCode(db,'batch',b.id),material=saveMaterialVersion(db,m.id);
 const input={existingBatchId:b.id,modelId:m.id,materialId:material.id,name:b.name,date:b.date,factory:b.factory,mode:'generate',count:2,rows:[]};
 const beforeBatches=db.productionBatches.length;
 assert.equal(createProduction(db,input).id,b.id);
 assert.equal(db.productionBatches.length,beforeBatches);
 assert.equal(db.instances.filter(i=>i.productionBatchId===b.id).length,2);
 assert.equal(sharedVersion(db,code).passportId,code.id);
 const before=JSON.stringify(db);
 assert.throws(()=>createProduction(db,input),/超过生产数量/);
 assert.equal(JSON.stringify(db),before);
 createProduction(db,{...input,count:1});
 assert.equal(db.instances.filter(i=>i.productionBatchId===b.id).length,3);
});
test('batch-only generation creates no instances and does not consume serials',()=>{
 const db=ensureWorkflow(createSeed()),model=db.models[0],before=db.instances.length,sequence=model.codeRule.nextSequence;
 const batch=createBatchOnly(db,{modelId:model.id,name:'TEST-BATCH',date:'2026-11-27',factory:'Factory A',count:20000});
 assert.equal(db.instances.length,before);assert.equal(model.codeRule.nextSequence,sequence);
 const code=db.sharedCodes.find(c=>c.targetId===batch.id),version=sharedVersion(db,code);
 assert.equal(version.productionBatch.name,'TEST-BATCH');assert.equal(version.instance.date,'2026-11-27');
 assert.ok(version.rules.filter(r=>r.code.startsWith('instance.')).every(r=>r.code==='instance.date'));
 assert.throws(()=>createBatchOnly(db,{modelId:model.id,name:'TEST-BATCH',date:'2026-11-27',count:1}));
});
