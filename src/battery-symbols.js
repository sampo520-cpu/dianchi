import { syncSimplePassports } from './workflow.js';
import { compliancePresets } from './compliance-marks.js';

export const symbolGroups = [
  { id:'safety', zh:'安全与使用注意', en:'Safety and handling symbols' },
  { id:'recycling', zh:'回收与环保处置', en:'Collection and recycling symbols' },
  { id:'conformity', zh:'认证与符合性标识', en:'Certification and conformity references' },
];
export const symbolCatalog = [
  {key:'warning',category:'safety',zh:'安全警示',nameEn:'Safety warning',icon:'warning',descriptionEn:'Read all safety warnings before handling the battery.'},
  {key:'voltage',category:'safety',zh:'有电危险',nameEn:'Electrical hazard',icon:'zap',descriptionEn:'Avoid contact with live terminals. Electrical work requires qualified personnel.'},
  {key:'eyes',category:'safety',zh:'保护眼睛',nameEn:'Eye protection',icon:'glasses',descriptionEn:'Use suitable eye protection when servicing or handling damaged batteries.'},
  {key:'manual',category:'safety',zh:'阅读说明书',nameEn:'Read the instructions',icon:'book',descriptionEn:'Read the model-specific instructions before installation and use.'},
  {key:'short',category:'safety',zh:'禁止短路',nameEn:'Prevent short circuits',icon:'battery',prohibited:true,descriptionEn:'Protect terminals from metal tools, keys and other conductive objects.'},
  {key:'fire',category:'safety',zh:'禁止明火',nameEn:'Keep away from fire',icon:'flame',prohibited:true,descriptionEn:'Do not expose the battery to flames or dispose of it in fire.'},
  {key:'water',category:'safety',zh:'防止浸水',nameEn:'Do not immerse',icon:'droplet',prohibited:true,descriptionEn:'Do not immerse the battery in water. Follow the declared environmental limits.'},
  {key:'children',category:'safety',zh:'远离儿童',nameEn:'Keep away from children',icon:'baby',descriptionEn:'Keep cells and batteries away from children.'},
  {key:'no-charge',category:'safety',zh:'禁止充电（一次电池）',nameEn:'Do not recharge',icon:'charge',prohibited:true,descriptionEn:'This primary battery is not rechargeable.'},
  {key:'gloves',category:'safety',zh:'防护手套',nameEn:'Protective gloves',icon:'hand',descriptionEn:'Use appropriate protective gloves for service or leakage handling.'},
  {key:'temperature',category:'safety',zh:'避免高温',nameEn:'Avoid excessive heat',icon:'temperature',descriptionEn:'Follow the operating and storage temperature limits in the user guide.'},
  {key:'recycle',category:'recycling',zh:'分类回收',nameEn:'Battery recycling',icon:'recycle',descriptionEn:'Return spent batteries to a designated battery collection route.'},
  {key:'bin',category:'recycling',zh:'禁止混入生活垃圾',nameEn:'Separate collection',icon:'bin',prohibited:true,descriptionEn:'Do not discard batteries with unsorted household waste.'},
  {key:'lead',category:'recycling',zh:'铅酸电池回收',nameEn:'Lead-acid collection',icon:'recycle',descriptionEn:'Return lead-acid batteries through an appropriate collection operator.'},
  {key:'ce',category:'conformity',zh:'CE 符合性标识',nameEn:'CE marking',icon:'declaration',imageUrl:'/demo-mark-ce.png',kind:'declaration',market:'European Union',descriptionEn:'Add the product declaration and applicable legislation. A logo alone is not evidence of conformity.'},
  {key:'ul',category:'conformity',zh:'UL 认证／元器件认可',nameEn:'UL certification / component recognition',icon:'shield',kind:'certification',market:'United States / Canada',descriptionEn:'Identify the exact mark, product scope and file number from the supporting documentation.'},
  {key:'ukca',category:'conformity',zh:'UKCA 符合性标识',nameEn:'UKCA reference',icon:'declaration',kind:'declaration',market:'Great Britain',descriptionEn:'Select only when applicable to the actual product and supported by the required documentation.'},
  {key:'rohs',category:'conformity',zh:'RoHS 适用说明',nameEn:'RoHS applicability record',icon:'file',kind:'declaration',market:'Applicable market',descriptionEn:'Record applicability and the supporting substance documentation for the relevant product scope.'},
  {key:'un383',category:'conformity',zh:'UN 38.3 运输测试',nameEn:'UN 38.3 test summary',icon:'file',kind:'test',market:'Lithium battery transport',descriptionEn:'Link the applicable test summary. This entry is a test-document reference, not a certification logo.'},
];
for(const preset of compliancePresets) {
  const entry=symbolCatalog.find(s=>s.key===preset.key);
  if(entry)Object.assign(entry,preset);
  else symbolCatalog.push({...preset,category:'conformity',icon:preset.kind==='regulation'?'file':'shield',descriptionEn:preset.scopeNote});
}
export const symbolCategory = mark => symbolGroups.some(g=>g.id===mark.category) ? mark.category : /(^|[\s-])(CE|UL|UKCA|ROHS)([\s-]|$)|UN.?38|certif|conform/i.test(`${mark.id} ${mark.nameEn}`) ? 'conformity' : /WEEE|COLLECTION|recycl|Separate collection/i.test(`${mark.id} ${mark.nameEn}`) ? 'recycling' : 'safety';
export const symbolStatus = mark => mark.status === 'documented' && (/^https:\/\//i.test(mark.evidenceUrl||'') || mark.documentId) ? 'documented' : ['demo','reference'].includes(mark.status) ? mark.status : 'unverified';
export function makeCatalogSymbol(key, id) {
  const item = symbolCatalog.find(s=>s.key===key);
  return item ? {...item,id,status:item.category==='conformity'?'demo':undefined,imageUrl:item.imageUrl || ''} : {id,category:'safety',nameEn:'',descriptionEn:'',imageUrl:'',icon:'warning'};
}

export function enrichBatterySymbols(db) {
  if (db.batterySymbolsVersion === 1) return db;
  const previous=structuredClone(db);
  const ids=['MOD-ESS-240','MOD-EV-082','MOD-LMT-014','FULL-SAMPLE-ESS','FULL-SAMPLE-EV','FULL-SAMPLE-LMT','GENERAL-SAMPLE-PORTABLE','GENERAL-SAMPLE-SLI','GENERAL-SAMPLE-SMALL','DEMO-LR03-ALKALINE','DEMO-6F22'];
  for (const model of db.models) {
    for (const mark of model.markings || []) {
      mark.category ||= symbolCategory(mark);
      if (mark.category==='conformity') mark.status ||= /REFERENCE/i.test(mark.id)?'reference':'unverified';
    }
    if (!ids.includes(model.id)) continue;
    model.markings ||= [];
    const primary=/LR03|6F22/.test(model.id), lead=model.chem==='Lead-acid';
    const keys=['warning','manual','short','fire','temperature',...(primary?['no-charge']:['voltage','eyes','gloves']),...(lead?['lead']:[])];
    for (const key of keys) {
      if (key==='no-charge' && model.markings.some(m=>/NO-RECHARGE|Do not recharge|Single-use battery/i.test(`${m.id} ${m.nameEn}`))) continue;
      if (!model.markings.some(m=>m.key===key)) model.markings.push(makeCatalogSymbol(key,`${model.id}-SYMBOL-${key}`));
    }
    if (model.id==='FULL-SAMPLE-ESS') {
      for (const key of ['ce','ul','un383']) if (!model.markings.some(m=>m.key===key)) model.markings.push(makeCatalogSymbol(key,`${model.id}-SYMBOL-${key}`));
    }
  }
  syncSimplePassports(db,previous);
  db.batterySymbolsVersion=1;
  return db;
}
