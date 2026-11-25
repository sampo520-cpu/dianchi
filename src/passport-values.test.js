import test from 'node:test';
import assert from 'node:assert/strict';
import { passportFieldValue } from './passport-values.js';
import { createSeed, check } from './data.js';
import { addFullSamples } from './full-samples.js';
import { ensureWorkflow } from './workflow.js';
import { applicable } from './data.js';
import { templates } from './templates.js';

test('general templates require base fields but exclude EU evidence', () => {
  const db = addFullSamples(createSeed());
  const model = db.models.find(m => m.id === 'GENERAL-SAMPLE-PORTABLE');
  const instance = db.instances.find(i => i.modelId === model.id);
  assert.equal(templates[model.template], '通用电池一码');
  model.carbonApplicable = true;
  model.carbon = '';
  assert.equal(applicable(db.rules.find(r => r.code === 'model.carbon'), model), false);
  assert.deepEqual(check(db, instance), []);
  model.voltage = '';
  assert.ok(check(db, instance).includes('额定电压'));
  const customer = db.models.find(m => m.template === 'customer');
  const item = db.instances.find(i => i.modelId === customer.id);
  item.customValues.warranty = '';
  assert.ok(check(db, item).includes('Warranty until'));
});

test('passport labels never replace source field values with language-specific content', () => {
  const version = { model: { name: '示例', nameEn: 'Sample', capacity: 0 } };
  assert.equal(passportFieldValue(version, {}, 'en', 'model.name'), '示例');
  assert.equal(passportFieldValue(version, {}, 'en', 'model.capacity'), 0);
  assert.equal(passportFieldValue(version, {}, 'de', 'model.name'), '示例');
  assert.equal(passportFieldValue(version, { translations: { en: { values: { 'model.name': 'Edited' } } } }, 'en', 'model.name'), '示例');
});

test('every standard passport field has editable labels for each supported language', () => {
  const db = ensureWorkflow(createSeed());
  const locales = ['en','de','fr','es','it','pt','nl','pl','zh'];
  for (const rule of db.rules) {
    for (const locale of locales)
      assert.ok(rule.labels[locale]?.trim(), `${rule.code} is missing ${locale}`);
  }
  assert.equal(db.rules.find(rule => rule.code === 'model.energy').labels.de, 'Nennenergie');
  assert.equal(db.rules.find(rule => rule.code === 'model.energy').labels.zh, '额定能量');
});

test('full samples are additive, complete and only inserted once', () => {
  const db = ensureWorkflow(createSeed());
  db.models[0].power = 'User maintained power';
  const original = structuredClone(db.models[0]);
  addFullSamples(db);
  const migratedDemoFields = new Set(['name','company','materials','composition','disassembly','carbon','recycled','diligence']);
  for (const [key, value] of Object.entries(original))
    if (value !== '' && value != null && !migratedDemoFields.has(key)) assert.deepEqual(db.models[0][key], value);
  for (const model of db.models) {
    for (const key of ['power', 'efficiency', 'resistance', 'hazardous', 'parts']) assert.ok(model[key]);
  }
  assert.equal(db.models.filter(m => m.id.startsWith('GENERAL-SAMPLE')).length, 3);
  assert.equal(db.instances.filter(i => i.modelId.startsWith('GENERAL-SAMPLE') && i.status === '已发布').length, 9);
  const samples = db.instances.filter(i => i.modelId.startsWith('FULL-SAMPLE'));
  assert.equal(samples.length, 18);
  for (const instance of samples) {
    assert.deepEqual(check(db, instance), []);
    assert.equal(instance.status, '已发布');
  }
  const count = db.instances.length;
  addFullSamples(db);
  assert.equal(db.instances.length, count);
});

test('all featured demo batteries expose nine languages and default to English', () => {
  const db=addFullSamples(createSeed());
  const showcase=db.models.filter(model=>!model.demoArchived);
  assert.ok(showcase.length>=6);
  for(const model of showcase) {
    assert.deepEqual(model.enabledLanguages,['en','de','fr','es','it','pt','nl','pl','zh']);
    assert.equal(model.defaultLanguage,'en');
  }
  const before=structuredClone(showcase.map(model=>[model.id,model.enabledLanguages,model.defaultLanguage]));
  addFullSamples(db);
  assert.deepEqual(db.models.filter(model=>!model.demoArchived).map(model=>[model.id,model.enabledLanguages,model.defaultLanguage]),before);
});

test('demo passport values are English while customer products remain untouched', () => {
  const db=addFullSamples(createSeed());
  const samples=db.models.filter(model=>!model.demoArchived);
  for(const model of samples) {
    assert.equal(model.name,model.nameEn);
    assert.equal(model.company.name,model.company.nameEn);
    assert.equal(model.company.factory,model.company.factoryEn);
    assert.equal(model.company.address,model.company.addressEn);
    for(const key of ['materials','composition','disassembly','carbon','recycled','diligence'])
      if(model[key+'En'])assert.equal(model[key],model[key+'En']);
  }
  const userModel={id:'CUSTOM-USER',name:'客户中文产品',company:{name:'客户中文企业'}};
  db.models.push(userModel);
  addFullSamples(db);
  assert.equal(userModel.name,'客户中文产品');
  assert.equal(userModel.company.name,'客户中文企业');
});
