import {id,log,snapshot} from './data.js';

export function sharedCode(db,type,targetId){return (db.sharedCodes||[]).find(c=>c.type===type&&c.targetId===targetId);}
export function enableSharedCode(db,type,targetId){
  if(!['product','batch'].includes(type))throw Error('码类型无效');
  const target=(type==='product'?db.models:db.productionBatches).find(x=>x.id===targetId);
  if(!target)throw Error('资料不存在');
  db.sharedCodes||=[];
  let code=sharedCode(db,type,targetId);
  if(!code){code={id:id('SHARED'),type,targetId,modelId:type==='product'?target.id:target.modelId,status:'已启用',createdAt:new Date().toISOString()};db.sharedCodes.push(code);}
  else code.status='已启用';
  log(db,'启用'+(type==='product'?'产品码':'批次码'),target.name);
  return code;
}
export function sharedCodePath(code){return '/information/'+code.type+'/'+encodeURIComponent(code.id);}
export function sharedVersion(db,code){
  const batch=code.type==='batch'?db.productionBatches.find(b=>b.id===code.targetId):null;
  const model=db.models.find(m=>m.id===code.modelId);
  if(!model||(code.type==='batch'&&!batch))return null;
  const instance={id:code.id,modelId:model.id,serial:'',date:batch?.date||'',customValues:{}};
  const version=snapshot({...db,resolvedProductionBatch:batch},instance,1);
  version.passportId=code.id;
  version.rules=version.rules.filter(r=>!r.code.startsWith('instance.')||(code.type==='batch'&&r.code==='instance.date'));
  version.model.customFields=(version.model.customFields||[]).filter(f=>f.level==='product'||(code.type==='batch'&&f.level==='batch'));
  version.events=[];
  if(version.model.templateConfig)version.model.templateConfig.fields=version.model.templateConfig.fields.filter(f=>f.maintenance==='product'||(code.type==='batch'&&f.maintenance==='batch'));
  version.documents=db.documents.filter(d=>d.target===model.id||(batch&&d.target===batch.id));
  version.publishedAt='';
  return version;
}
export function createBatchOnly(db,input){
  const model=db.models.find(m=>m.id===input.modelId);
  if(!model)throw Error('请选择产品');
  const name=input.name.trim();
  if(!name||db.productionBatches.some(b=>b.name===name))throw Error('批次号为空或重复');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Number.isFinite(Date.parse(input.date)))throw Error('请填写生产日期');
  const quantity=Number(input.count);
  if(!Number.isSafeInteger(quantity)||quantity<1)throw Error('生产数量必须为正整数');
  const batch={id:id('PROD'),modelId:model.id,name,date:input.date,factory:input.factory||'',count:quantity,customValues:structuredClone(input.customValues||{}),createdAt:new Date().toISOString()};
  db.productionBatches.push(batch);
  enableSharedCode(db,'batch',batch.id);
  log(db,'创建生产批次',name+' · 仅批次码');
  return batch;
}
