import { ensureWorkflow, createProduction, syncSimplePassports } from './workflow.js';
import { enrichSampleContent } from './sample-content.js';
import { add6F22Sample } from './sample-6f22.js';
import { migrateBranding } from './branding.js';
import { enrichBatterySymbols } from './battery-symbols.js';
import { enrichComplianceMarks } from './compliance-marks.js';
import { curateDemoShowcase } from './demo-showcase.js';

// Add once without replacing existing products or subsequent user edits.
export function addFullSamples(db) {
  if (db.fullSamplesVersion >= 1) return curateDemoShowcase(enrichComplianceMarks(enrichBatterySymbols(migrateBranding(add6F22Sample(enrichSampleContent(addLr03Sample(addGeneralSamples(completeSampleParameters(db)))))))));
  ensureWorkflow(db);
  const previous = structuredClone(db);
  const specs = [
    ['ESS', '工业储能', '储能全量示例 241', 'ESS Complete Sample 241', 'LFP', 241.2, 314, 768, 1860, 6000, 62],
    ['EV', '电动汽车', '动力全量示例 82', 'EV Complete Sample 82', 'NMC', 82.4, 206, 400, 520, 2000, 78],
    ['LMT', '轻型交通工具', '轻型交通全量示例 3', 'LMT Complete Sample 3', 'LFP', 3.072, 60, 51.2, 24, 1800, 55],
  ];
  for (const [key, type, name, nameEn, chem, energy, capacity, voltage, weight, cycles, carbon] of specs) {
    const modelId = `FULL-SAMPLE-${key}`;
    if (db.models.some(m => m.id === modelId)) continue;
    const factory = `${key} 全量示例工厂`;
    const company = { ...structuredClone(db.company), name: '中企示例电池有限公司（虚构）', nameEn: 'Zhongqi Sample Battery Ltd. (Fictional)', factory, factoryEn: `${key} demonstration plant`, address: '江苏省苏州市示例路 88 号（虚构）', addressEn: '88 Sample Road, Suzhou, China (fictional)', contact: 'passport@example.com', operator: 'Zhongqi EU Demo GmbH (Fictional)', operatorEn: 'Zhongqi EU Demo GmbH (Fictional)', operatorAddress: '88 Example Street, Berlin, Germany (fictional)' };
    const model = {
      id: modelId, name, nameEn, type, chem, energy, capacity, voltage, weight, company,
      life: `${cycles} cycles to 80% capacity at 25 C`, power: `${energy} kW continuous`, efficiency: '92% round-trip at 25 C', resistance: '18 mOhm at 50% SOC, 25 C',
      materials: '正极材料、石墨、铝、铜及电解液（虚构示例）', materialsEn: `${chem} cathode, graphite, aluminium, copper and electrolyte (fictional)`,
      hazardous: 'Electrolyte contains flammable organic solvents. Fictional safety declaration.', parts: 'Cell modules, BMS, fuse and service connector; contact passport@example.com',
      composition: `${chem} cathode 35%; graphite 18%; metals 30%; other 17% (fictional)`, compositionEn: `${chem} cathode 35%; graphite 18%; metals 30%; other 17% (fictional)`,
      disassembly: '仅授权人员操作：隔离电源、确认无电、拆卸外壳并分类回收。', disassemblyEn: 'Authorized personnel: isolate power, verify zero voltage, remove housing and segregate materials.',
      carbonApplicable: true, recycledApplicable: true, diligenceApplicable: true, disassemblyApplicable: true,
      carbon: `${carbon} kg CO2e/kWh (fictional)`, recycled: 'Lithium 6%, nickel 12%, cobalt 16% where present (fictional)', diligence: '2026 supply-chain risk assessment and corrective-action report (fictional)', updated: '2026-11-22',
      codeRule: { prefix: `DEMO-${key}`, batchFormat: 'YYYYMM', sequenceWidth: 6, nextSequence: 1 },
    };
    for (const field of ['carbon', 'recycled', 'diligence']) model[field + 'En'] = model[field];
    db.models.push(model);
    for (const [kind, title, access] of [['guide', 'Product guide', '公开'], ['carbon', 'Carbon declaration', '公开'], ['recycled', 'Recycled content declaration', '公开'], ['diligence', 'Due diligence summary', '公开'], ['disassembly', 'Disassembly instructions', '受限']]) {
      const content = `${title}\n${nameEn}\nManufacturer: ${company.nameEn}\nFactory: ${factory}\nValidity: 2026-01-01 through 2026-12-31\n${model[kind] || 'Rated energy: ' + energy + ' kWh; voltage: ' + voltage + ' V'}\nFictional demonstration data. Not a certification or verified compliance statement.`;
      const documentId = `${modelId}-${kind}`;
      db.documents.push({ id: documentId, target: modelId, name: `${key} ${title} (demo).txt`, nameEn: `${key} ${title} (demo).txt`, version: '1.0', access, mime: 'text/plain', content, dataUrl: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content), updated: '2026-11-22' });
      if (['carbon', 'recycled', 'diligence'].includes(kind)) db.applicableMaterials.push({ id: `${modelId}-EVIDENCE-${kind}`, modelId, kind, name: `${key} ${title}（虚构示例）`, factory, from: '2026-01-01', to: '2026-12-31', value: model[kind], documentId, access });
    }
    ensureWorkflow(db);
    for (let b = 1; b <= 2; b++) {
      const date = b === 1 ? '2026-09-15' : '2026-11-18';
      const batch = createProduction(db, { modelId, materialId: db.materialVersions.find(v => v.modelId === modelId).id, name: `DEMO-${key}-2026-${b === 1 ? '09' : '11'}`, factory, date, mode: 'generate', count: 3 });
      db.instances.filter(i => i.productionBatchId === batch.id).forEach((instance, n) => {
        Object.assign(instance, { soh: b === 1 ? 97 - n : 100, cycles: b === 1 ? 120 + n * 12 : n + 1, remainingCapacity: Number((capacity * (b === 1 ? (97 - n) / 100 : 1)).toFixed(2)), measuredAt: '2026-11-21T08:00:00Z' });
        db.events.push({ id: `${instance.id}-PRODUCED`, instanceId: instance.id, type: '生产', date, note: '虚构示例：出厂检测合格，完成建档', noteEn: 'Fictional sample: factory inspection and commissioning completed' });
        if (b === 1) db.events.push({ id: `${instance.id}-SERVICE`, instanceId: instance.id, type: '维修', date: '2026-11-10', note: '虚构示例：连接器检查及固件维护', noteEn: 'Fictional sample: connector inspection and firmware service' });
        db.measurements.push({ id: `${instance.id}-MEASURE`, instanceId: instance.id, serial: instance.serial, soh: instance.soh, cycles: instance.cycles, measuredAt: instance.measuredAt, source: '虚构 BMS 示例记录', createdAt: '2026-11-21T08:00:00Z' });
      });
    }
  }
  syncSimplePassports(db, previous);
  db.fullSamplesVersion = 1;
  return curateDemoShowcase(enrichComplianceMarks(enrichBatterySymbols(migrateBranding(add6F22Sample(enrichSampleContent(addLr03Sample(addGeneralSamples(completeSampleParameters(db)))))))));
}

function addGeneralSamples(db) {
  if (db.generalSamplesVersion === 1) {
    const model = db.models.find(m => m.id === 'GENERAL-SAMPLE-SLI');
    const old = 'LFP cathode, graphite, aluminium, copper and electrolyte (fictional)';
    if (model && model.materialsEn === old) {
      const previous = structuredClone(db);
      model.materials = model.materialsEn = 'Lead, lead dioxide, sulfuric acid electrolyte (fictional sample)';
      syncSimplePassports(db, previous);
    }
    return db;
  }
  const previous = structuredClone(db);
  for (const [key, type, name, energy, capacity, voltage, weight, template] of [
    ['PORTABLE', '便携式电池', '便携式电池一码示例', 0.072, 5, 14.4, 0.45, 'generic'],
    ['SLI', '启动照明点火（SLI）', 'SLI 客户定制示例', 0.72, 60, 12, 16, 'customer'],
    ['SMALL', '其他工业电池', '小容量工业电池一码示例', 1.024, 20, 51.2, 11, 'generic'],
  ]) {
    const modelId = `GENERAL-SAMPLE-${key}`;
    if (db.models.some(m => m.id === modelId)) continue;
    const source = db.models.find(m => m.id === 'FULL-SAMPLE-LMT') || db.models[0];
    const model = { ...structuredClone(source), id: modelId, name, nameEn: `${key} battery sample (fictional)`, type, template, energy, capacity, voltage, weight, chem: key === 'SLI' ? 'Lead-acid' : 'LFP', carbonApplicable: false, recycledApplicable: false, diligenceApplicable: false, customFields: template === 'customer' ? [{ id: 'customer-part', label: 'Customer part number', level: 'product', required: true }, { id: 'order', label: 'Order reference', level: 'batch', required: true }, { id: 'warranty', label: 'Warranty until', level: 'instance', required: true }] : [], customValues: { 'customer-part': 'CLIENT-SLI-060' }, codeRule: { prefix: `DEMO-${key}`, batchFormat: 'YYYYMM', sequenceWidth: 6, nextSequence: 1 } };
    db.models.push(model);
    const content = `${model.nameEn}\nFictional product guide. Capacity: ${capacity} Ah. Voltage: ${voltage} V. Not a compliance certificate.`;
    model.materials = model.materialsEn = key === 'SLI' ? 'Lead, lead dioxide, sulfuric acid electrolyte (fictional sample)' : 'LFP cathode, graphite, aluminium and copper (fictional sample)';
    db.documents.push({ id: `${modelId}-GUIDE`, target: modelId, name: `${key}-guide-demo.txt`, nameEn: `${key}-guide-demo.txt`, access: '公开', version: '1.0', mime: 'text/plain', content, dataUrl: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content), updated: '2026-11-22' });
    ensureWorkflow(db);
    createProduction(db, { modelId, materialId: db.materialVersions.find(v => v.modelId === modelId).id, name: `DEMO-${key}-202611`, factory: model.company.factory, date: '2026-11-20', mode: 'generate', count: 3, customValues: { order: 'ORDER-DEMO-202611', warranty: '2028-11-20' } });
  }
  syncSimplePassports(db, previous);
  db.generalSamplesVersion = 1;
  return db;
}

function addLr03Sample(db) {
  const modelId = 'DEMO-LR03-ALKALINE';
  const existing = db.models.find(m => m.id === modelId);
  if (existing) {
    if (!db.lr03MarkImagesVersion) {
      const previous = structuredClone(db);
      for (const mark of existing.markings || []) {
        if (/^\/demo-mark-(waste|no-recharge|children)\.svg$/.test(mark.imageUrl))
          mark.imageUrl = mark.imageUrl.replace('.svg', '.png');
      }
      syncSimplePassports(db, previous);
      db.lr03MarkImagesVersion = 1;
    }
    return db;
  }
  const base = db.models.find(m => m.id === 'GENERAL-SAMPLE-PORTABLE') || db.models[0];
  const model = {
    ...structuredClone(base),
    id: modelId, name: 'LR03 碱性电池示范款', nameEn: 'LR03 Alkaline Zn-MnO2 cell',
    type: '便携式电池', template: 'generic', chem: 'Zn-MnO2',
    energy: 0.0015, capacity: 1, voltage: 1.5, weight: 0.0104,
    life: 'Five-year shelf life under normal storage conditions (fictional sample)',
    power: 'Primary cell. Discharge performance depends on load and cutoff voltage.',
    efficiency: 'Not applicable to this non-rechargeable primary battery.',
    resistance: 'Varies with state of discharge; see the illustrative test summary.',
    materials: 'Zinc anode, manganese dioxide cathode, potassium hydroxide electrolyte, steel can and graphite (fictional sample).',
    materialsEn: 'Zinc anode, manganese dioxide cathode, potassium hydroxide electrolyte, steel can and graphite (fictional sample).',
    hazardous: 'Alkaline electrolyte. Mercury/cadmium statements require verification against product test reports; demo only.',
    parts: 'Steel can, zinc anode, manganese dioxide cathode, separator and seal (fictional sample).',
    composition: 'Illustrative composition only: zinc 18%, manganese dioxide 32%, electrolyte and other components 50%.',
    compositionEn: 'Illustrative composition only: zinc 18%, manganese dioxide 32%, electrolyte and other components 50%.',
    disassembly: 'Do not dismantle. Return used cells to a designated battery collection point.',
    disassemblyEn: 'Do not dismantle. Return used cells to a designated battery collection point.',
    carbonApplicable: false, recycledApplicable: false, diligenceApplicable: false, disassemblyApplicable: false,
    productOverviewEn: '<p><strong>LR03 alkaline primary cell</strong> for low-to-medium drain household devices. Single-use, nominal voltage 1.5 V.</p><ul><li>Five-year storage life under normal conditions (fictional)</li><li>Do not recharge or short-circuit</li><li>Remove depleted cells from equipment</li></ul>',
    safetyEn: '<h3>WARNING</h3><ul><li>Keep batteries out of reach of children.</li><li>Do not recharge, disassemble, heat or dispose of in fire.</li><li>Insert with correct polarity. Do not mix new and used cells.</li><li>For leakage, avoid contact and follow the device maker’s instructions.</li></ul>',
    extinguishingEn: '<p>For surrounding fires, follow the site fire plan and applicable safety data sheet. This example is not fire-response certification.</p>',
    wasteEn: '<p>Do not place spent cells in unsorted household waste. Use a designated collection point and follow local instructions.</p>',
    characteristics: [
      { id: 'LR03-CAP', name: 'Capacity', value: '1050', unit: 'mAh', condition: 'Illustrative profile: 75 ohm, 4 h/day, cutoff 0.9 V', note: 'Fictional demo value; replace with a verified test report.' },
      { id: 'LR03-MASS', name: 'Approximate mass', value: '10.4 +/- 0.2', unit: 'g', condition: 'Single cell', note: 'Fictional demo value.' },
      { id: 'LR03-RADIO', name: 'Application duration (radio)', value: '19', unit: 'h', condition: 'Illustrative test profile', note: 'Fictional demo value.' },
    ],
    markings: [
      { id: 'WEEE', nameEn: 'Separate collection', descriptionEn: 'Do not dispose with unsorted household waste.', imageUrl: '/demo-mark-waste.png' },
      { id: 'NO-RECHARGE', nameEn: 'Do not recharge', descriptionEn: 'Primary cell: never attempt to recharge.', imageUrl: '/demo-mark-no-recharge.png' },
      { id: 'CHILD-SAFETY', nameEn: 'Keep out of reach of children', descriptionEn: 'Keep small batteries away from children.', imageUrl: '/demo-mark-children.png' },
    ],
    codeRule: { prefix: 'DEMO-LR03', batchFormat: 'YYYYMM', sequenceWidth: 6, nextSequence: 1 },
  };
  db.models.push(model);
  ensureWorkflow(db);
  const previous = structuredClone(db);
  const content = 'LR03 Model Test Summary (fictional demo)\nCapacity: 1050 mAh; approximate mass: 10.4 +/- 0.2 g.\nIllustrative conditions only. Not a laboratory report or conformity certificate.';
  db.documents.push({ id: `${modelId}-TEST`, target: modelId, name: 'LR03-Model-Test-Summary-DEMO.txt', nameEn: 'LR03 Model Test Summary (DEMO).txt', version: '1.0', access: '公开', mime: 'text/plain', content, dataUrl: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content), updated: '2026-11-23' });
  const batch = createProduction(db, { modelId, materialId: db.materialVersions.find(v => v.modelId === modelId).id, name: 'DEMO-LR03-202611', factory: model.company.factory, date: '2026-11-20', mode: 'generate', count: 3 });
  db.instances.filter(i => i.productionBatchId === batch.id).forEach(instance => {
    instance.soh = '';
    instance.cycles = 0;
    db.events.push({ id: `${instance.id}-PRODUCED`, instanceId: instance.id, type: '生产', date: batch.date, note: '一次电池出厂抽检完成（虚构演示）', noteEn: 'Primary-cell outgoing sampling inspection completed (fictional demo)' });
  });
  syncSimplePassports(db, previous);
  db.lr03MarkImagesVersion = 1;
  return db;
}

function completeSampleParameters(db) {
  if (db.sampleParametersVersion === 1) return db;
  ensureWorkflow(db);
  const previous = structuredClone(db);
  const sampleIds = ['MOD-ESS-240', 'MOD-EV-082', 'MOD-LMT-014', 'FULL-SAMPLE-ESS', 'FULL-SAMPLE-EV', 'FULL-SAMPLE-LMT'];
  for (const model of db.models.filter(m => sampleIds.includes(m.id))) {
    const defaults = {
      life: '1800 cycles to 80% capacity at 25 C (fictional sample)',
      power: `${model.energy} kW continuous at 25 C, 50% SOC (fictional sample)`,
      efficiency: '92% round-trip at 25 C, 0.5 C (fictional sample)',
      resistance: '18 mOhm at 25 C, 50% SOC (fictional sample)',
      hazardous: 'Flammable organic electrolyte; refer to the fictional product safety statement.',
      parts: 'BMS, cell modules, fuse and connectors; passport@example.com (fictional sample)',
      materials: `${model.chem} cathode, graphite, aluminium and copper (fictional sample)`,
      materialsEn: `${model.chem} cathode, graphite, aluminium and copper (fictional sample)`,
      composition: `${model.chem} cathode 35%, graphite 18%, metals 30%, other 17% (fictional sample)`,
      compositionEn: `${model.chem} cathode 35%, graphite 18%, metals 30%, other 17% (fictional sample)`,
      disassembly: 'Authorized personnel: isolate power and verify zero voltage before disassembly (fictional sample).',
      disassemblyEn: 'Authorized personnel: isolate power and verify zero voltage before disassembly (fictional sample).',
      carbon: '62 kg CO2e/kWh; illustrative value only, not a verified declaration.',
      recycled: 'Lithium 6%; other metals depend on chemistry (fictional sample).',
      diligence: '2026 supplier risk assessment and corrective-action summary (fictional sample).',
    };
    for (const [key, value] of Object.entries(defaults)) {
      if (model[key] === '' || model[key] == null) model[key] = value;
    }
    for (const key of ['carbon', 'recycled', 'diligence'])
      if (!model[key + 'En'] && /^[\x00-\x7F]*$/.test(model[key])) model[key + 'En'] = model[key];
  }
  syncSimplePassports(db, previous);
  db.sampleParametersVersion = 1;
  return db;
}
