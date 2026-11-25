import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from './data.js';
import { addFullSamples } from './full-samples.js';
import { enrichSampleContent } from './sample-content.js';
import { safePassportTheme } from './passport-themes.js';
import { migrateBranding } from './branding.js';

test('6F22 covers reference sections without presenting supplier reports as our certification', () => {
  const db = addFullSamples(createSeed());
  const m = db.models.find(m => m.id === 'DEMO-6F22');
  assert.equal(m.voltage, 9);
  assert.equal(m.capacity, 0.32);
  assert.equal(m.weight, 0.037);
  assert.equal(m.characteristics.length, 4);
  assert.match(m.characteristics[2].condition, /620 Ω/);
  for (const key of ['cautionEn','substanceStatementEn','criticalMaterialsEn','conformityEn','referenceInfoEn','disclaimerEn']) assert.ok(m[key], key);
  assert.equal(m.regulatoryNotes.length, 4);
  assert.equal(m.referenceLinks.length, 2);
  assert.match(m.disclaimerEn, /third-party/);
  const instances = db.instances.filter(i => i.modelId === m.id);
  assert.equal(instances.length, 3);
  assert.ok(instances.every(i => i.status === '已发布'));
  const versions = db.versions.length;
  m.cautionEn = '<p>Edited instructions</p>';
  addFullSamples(db);
  assert.equal(m.cautionEn, '<p>Edited instructions</p>');
  assert.equal(db.versions.length, versions);
});

test('brand migration updates nested records and encoded text downloads without changing QR identities', () => {
  const db = { company:{ name:'青屿示例',nameEn:'Qingyu Demo' }, versions:[{company:{name:'青屿'}}], documents:[{dataUrl:'data:text/plain;charset=utf-8,'+encodeURIComponent('青屿 Qingyu')},{dataUrl:'data:text/plain;base64,'+Buffer.from('青屿 Qingyu').toString('base64')}], passportId:'QY-2026-000001' };
  migrateBranding(db);
  assert.equal(db.company.name,'中企示例');
  assert.equal(db.company.nameEn,'Zhongqi Demo');
  assert.equal(db.versions[0].company.name,'中企');
  assert.match(decodeURIComponent(db.documents[0].dataUrl),/中企 Zhongqi/);
  assert.equal(Buffer.from(db.documents[1].dataUrl.split(',')[1],'base64').toString('utf8'),'中企 Zhongqi');
  assert.equal(db.passportId,'QY-2026-000001');
  assert.equal(migrateBranding(db),db);
});

test('every seeded battery has category-specific content; enrichment preserves edits and identities', () => {
  const db = addFullSamples(createSeed());
  for (const model of db.models) {
    assert.ok(model.productOverviewEn, model.id);
    assert.ok(model.safetyEn && model.extinguishingEn && model.wasteEn, model.id);
    assert.ok(model.characteristics.length >= 3, model.id);
    assert.ok(model.markings.length >= 2, model.id);
  }
  const lead = db.models.find(m => m.id === 'GENERAL-SAMPLE-SLI');
  assert.match(lead.safetyEn, /sulfuric acid/);
  assert.ok(!lead.markings.some(m => m.id === 'NO-RECHARGE'));
  const count = db.versions.length;
  lead.safetyEn = '<p>Customer approved instructions</p>';
  delete db.sampleRichContentVersion;
  enrichSampleContent(db);
  assert.equal(lead.safetyEn, '<p>Customer approved instructions</p>');
  assert.equal(db.versions.length, count);
  assert.equal(safePassportTheme('invalid'), 'forest');
  assert.equal(safePassportTheme('ocean'), 'ocean');
});

test('LR03 sample has rich product information, test rows, markings and published codes', () => {
  const db = addFullSamples(createSeed());
  const model = db.models.find(m => m.id === 'DEMO-LR03-ALKALINE');
  assert.ok(model);
  assert.match(model.productOverviewEn, /LR03 alkaline primary cell/);
  assert.equal(model.characteristics.length, 3);
  assert.ok(model.markings.length >= 8);
  assert.ok(model.safetyEn && model.wasteEn && model.extinguishingEn);
  const cells = db.instances.filter(i => i.modelId === model.id);
  assert.equal(cells.length, 3);
  assert.ok(cells.every(i => i.status === '已发布'));
  assert.ok(cells.every(i => db.versions.some(v => v.instance.id === i.id)));
  const count = db.instances.length;
  addFullSamples(db);
  assert.equal(db.instances.length, count);
});

test('existing LR03 symbol migration preserves user edits and does not duplicate codes', () => {
  const db = addFullSamples(createSeed());
  const model = db.models.find(m => m.id === 'DEMO-LR03-ALKALINE');
  delete db.lr03MarkImagesVersion;
  model.markings[0].imageUrl = '/demo-mark-waste.svg';
  model.markings[1].imageUrl = '/customer-symbol.png';
  const count = db.instances.length;
  addFullSamples(db);
  assert.equal(model.markings[0].imageUrl, '/demo-mark-waste.png');
  assert.equal(model.markings[1].imageUrl, '/customer-symbol.png');
  assert.equal(db.instances.length, count);
  const versions = db.versions.length;
  addFullSamples(db);
  assert.equal(db.versions.length, versions);
});
