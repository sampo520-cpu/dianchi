import { ensureWorkflow, createProduction, syncSimplePassports } from './workflow.js';

export function add6F22Sample(db) {
  const modelId = 'DEMO-6F22';
  const existing = db.models.find(m => m.id === modelId);
  if (existing) {
    if (!db.sample6F22DetailsVersion && existing.substanceStatementEn?.includes('Numerical substance limits should come from')) {
      const previous = structuredClone(db);
      existing.substanceStatementEn += referenceThresholds;
      syncSimplePassports(db,previous);
    }
    db.sample6F22DetailsVersion = 1;
    return db;
  }
  const base = db.models.find(m => m.id === 'DEMO-LR03-ALKALINE');
  if (!base) return db;
  const previous = structuredClone(db);
  const source = 'https://www.newleader.top/batteryinfo.html?type=6f22';
  const legal = 'https://eur-lex.europa.eu/eli/reg/2023/1542/oj';
  const model = {
    ...structuredClone(base), id: modelId,
    name: '6F22 9V 锌锰电池 · 参考案例', nameEn: '6F22 9V zinc-manganese battery',
    chem: 'Zn-MnO2', voltage: 9, capacity: 0.32, energy: 0.00288, weight: 0.037,
    passportTheme: 'ocean', company: { ...structuredClone(base.company), address: '88 Sample Road, Suzhou, China (fictional)', factory: '中企 6F22 演示工厂', factoryEn: 'Zhongqi 6F22 demo plant' },
    life: '2 years in normal storage; reference supplier declaration, not independently verified.',
    materials: 'Zinc, manganese dioxide and graphite; reference example.', materialsEn: 'Zinc, manganese dioxide and graphite; reference example.',
    composition: 'Composition percentages have not been provided by the reference page.', compositionEn: 'Composition percentages have not been provided by the reference page.',
    hazardous: 'Substance restrictions require model-specific evidence. See the substance statement and legislation notes below.',
    power: 'Single-use 9 V battery; application performance depends on load and cutoff voltage.',
    resistance: 'Not reported by the reference page; obtain a model-specific test report.',
    parts: 'Steel enclosure and internal primary cells. Service contact: passport@example.com (demo).',
    productOverviewEn: '<p><strong>6F22, 9 V, non-rechargeable zinc-manganese battery.</strong> Portable format with a metal enclosure; country of origin: China. The reference offers NL, unbranded and OEM options.</p><p>The supplier gives a two-year storage life. Production marking follows the order specification and may use PD: YY-MM. The batch and date above identify this demonstration unit.</p><p>Public reference ratings appear below. The 2.88 Wh energy figure is calculated from 9 V × 0.32 Ah, not a measured usable-energy claim. This record demonstrates Zhongqi’s layout; it is not a product supplied or certified by Zhongqi.</p>',
    characteristics: [
      { id:'6F22-CASE',name:'Enclosure',value:'Metal',unit:'',condition:'Reference model configuration.',note:'Supplier reference information.' },
      { id:'6F22-MASS',name:'Approximate mass',value:'37',unit:'g',condition:'Single battery; packaging excluded.',note:'Indicative mass, not a production tolerance.' },
      { id:'6F22-CAP',name:'Capacity',value:'320',unit:'mAh',condition:'620 Ω load; 2 hours per day; discharge endpoint 5.4 V.',note:'Reference supplier rating. Independent verification has not been performed.' },
      { id:'6F22-RADIO',name:'Radio application duration',value:'28.0',unit:'hours',condition:'620 Ω load; 2 hours per day; discharge endpoint 5.4 V.',note:'Load and endpoint are essential to interpreting the duration.' },
    ],
    safetyEn: '<h3>Non-rechargeable battery</h3><ul><li>Never recharge, force discharge, heat, burn, crush or open the battery.</li><li>Fit the terminals correctly. Do not mix depleted and fresh batteries or incompatible types.</li><li>Protect the terminals from coins, keys and other conductive objects. Do not solder to the battery.</li><li>Keep batteries and loose components away from children. Suspected swallowing requires immediate medical assistance.</li></ul>',
    cautionEn: '<ul><li>Remove exhausted batteries and remove batteries before extended equipment storage.</li><li>Keep away from water, excessive humidity and heat.</li><li>Stop use if leakage, deformation, unusual odor or overheating occurs.</li><li>Avoid exposure to leaked electrolyte and obtain medical advice after exposure. Follow the product safety data sheet.</li></ul>',
    extinguishingEn: '<p>The reference lists water, dry powder and carbon dioxide as response media. Treat this as supplier information requiring confirmation against the current product safety data sheet and the surrounding fire conditions. Keep people away and let trained responders select the procedure.</p>',
    substanceStatementEn: '<p>The reference supplier declares conformity with battery substance limits, REACH Annex XVII and the EU POPs Regulation, and reports no Candidate List SVHC above 0.1% by mass.</p><p>These are third-party statements, not Zhongqi test results. Applicability, the latest Candidate List and the actual reports must be checked before making a declaration. Numerical substance limits should come from the current legislation rather than an unmaintained product-page template.</p>' + referenceThresholds,
    criticalMaterialsEn: '<p>The reference identifies <strong>manganese and graphite</strong>. It provides no material percentages or mine/refinery traceability. This list describes the reference example and does not establish a verified critical-material declaration.</p>',
    wasteEn: '<h3>Prevent avoidable waste</h3><p>Use the intended battery type, follow the equipment instructions and remove batteries during prolonged storage. A primary battery must not be charged or repurposed as a rechargeable battery.</p><h3>Collect separately</h3><p>Keep spent batteries out of mixed municipal waste. Use retailer take-back, local collection points or an appropriate municipal collection service. Confirm locally available arrangements.</p><h3>Handle and transport safely</h3><p>Prevent terminal contact with metal. Keep damaged or leaking batteries apart from intact batteries and obtain collection-operator instructions. Do not burn or dismantle them.</p><h3>Understand the symbols</h3><p>The crossed-out bin calls for separate collection; the no-charging symbol identifies a primary battery. The child-safety symbol highlights the need to prevent access by children.</p><h3>Material recovery and environmental impact</h3><p>Collection supports treatment and recovery of zinc, manganese and steel. Leakage and uncontrolled disposal can harm people and contaminate soil or water. Appropriate treatment is preferable to disposal in household waste.</p>',
    conformityEn: '<p>The reference page mentions Articles 6 and 13 of Regulation (EU) 2023/1542 and a supplier-responsibility note referring to Article 39. We retain these as references for review, not as confirmation that this demonstration product meets those provisions.</p><p>The applicable economic-operator role, technical documentation, declaration of conformity and supporting evidence must be established for the actual product and supply chain. A QR page or a copied certificate does not perform that assessment.</p>',
    referenceInfoEn: `<p>Technical reference: <a href="${source}">New Leader 6F22 product information</a>, consulted 24 November 2026. Descriptive text has been rewritten for this demonstration.</p><p>Original manufacturer: Zhaoqing New Leader Battery Industry Co., Ltd.; New Leader Industry Building, Tenth Area Chuang Ye Road, Ding Hu New Town, Zhaoqing, Guangdong, China; postal code 526070. Public site: www.newleader.com.hk; public email: sz@newleader.cn.</p><p>The reference names Delco Sistemi s.r.l. as European representative, at Via Dolomiti 21, 35018 San Martino di Lupari (Padova), Italy; contact Peter Jian; p.jian@delco.it; +39 327309 8496. These details describe the reference supplier and do not appoint a representative for Zhongqi.</p>`,
    regulatoryNotes: [
      { id:'EU-SUBSTANCE',title:'Substances and marking',reference:'Regulation (EU) 2023/1542 · Articles 6, 13 and Annex I',text:'Check the current substance restrictions, marking rules and applicability dates against model-specific evidence. A reference-page declaration is not a test report.',url:legal,reviewedAt:'2026-11-24' },
      { id:'EU-WASTE',title:'Information for users and separate collection',reference:'Regulation (EU) 2023/1542 · Articles 74 and 64',text:'Article 74 addresses information about preventing and managing waste batteries. Article 64 concerns separate collection by end-users. The waste guidance above is a plain-language example.',url:legal,reviewedAt:'2026-11-24' },
      { id:'REACH',title:'Substance evidence',reference:'REACH (EC) 1907/2006 · Annex XVII; POPs (EU) 2019/1021',text:'The reference cites these instruments. Product assessment and an up-to-date substance review are required before making the corresponding claims.',url:'https://eur-lex.europa.eu/eli/reg/2006/1907/oj',reviewedAt:'2026-11-24' },
      { id:'SCOPE',title:'Product information and statutory passport scope',reference:'Regulation (EU) 2023/1542 · Article 77',text:'A portable primary 6F22 cell is not one of the EV, LMT or industrial batteries above 2 kWh covered by the Article 77 passport trigger. This is a voluntary battery information demonstration.',url:legal,reviewedAt:'2026-11-24' },
    ],
    referenceLinks: [
      { id:'SGS',label:'Supplier SGS report · 2026',url:'https://www.newleader.top/eu_files/6f22/6F22%20SGS%202026.pdf' },
      { id:'DOC',label:'Supplier CE self-declaration',url:'https://www.newleader.top/eu_files/6f22/6F22%20Self%20Declaration%20for%20CE.pdf' },
    ],
    disclaimerEn: '<p>This page combines an explicitly identified third-party reference with fictional Zhongqi batch data. It does not validate the supplier statements, extend their reports to other manufacturers or establish legal compliance. Replace reference data with current, authorized product evidence before commercial publication.</p>',
    markings: [
      {id:'CE-REFERENCE',nameEn:'CE marking · reference only',descriptionEn:'Illustration of a symbol shown by the original supplier. It does not certify this demonstration.',imageUrl:'/demo-mark-ce.png'},
      {id:'COLLECTION',nameEn:'Separate collection',descriptionEn:'Use an appropriate battery collection route.',imageUrl:'/demo-mark-waste.png'},
      {id:'NO-RECHARGE',nameEn:'Single-use battery',descriptionEn:'Never connect this primary battery to a charger.',imageUrl:'/demo-mark-no-recharge.png'},
      {id:'CHILDREN',nameEn:'Child safety',descriptionEn:'Prevent access by children and seek immediate help after suspected swallowing.',imageUrl:'/demo-mark-children.png'},
    ],
    codeRule: {prefix:'DEMO-6F22',batchFormat:'YYYYMM',sequenceWidth:6,nextSequence:1},
  };
  db.models.push(model);
  ensureWorkflow(db);
  createProduction(db,{modelId,materialId:db.materialVersions.find(v=>v.modelId===modelId).id,name:'DEMO-6F22-202611',factory:model.company.factory,date:'2026-11-24',mode:'generate',count:3});
  for (const i of db.instances.filter(i=>i.modelId===modelId)) { i.soh='';i.cycles=0; }
  syncSimplePassports(db,previous);
  db.sample6F22DetailsVersion = 1;
  return db;
}

const referenceThresholds = '<h3>Threshold values shown by the reference supplier</h3><ul><li>Mercury: 0.0005% by mass.</li><li>Cadmium: 0.002% by mass for portable batteries.</li><li>Lead: 0.01% by mass for portable batteries. The reference also notes a zinc-air button-cell exception until 18 August 2028.</li></ul><p>These figures are reference thresholds, not measured contents in this battery. Check the current Annex I and any applicable exceptions before relying on them.</p>';
