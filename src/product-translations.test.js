import test from 'node:test';
import assert from 'node:assert/strict';
import {translationFields,localizeModel} from './product-translations.js';
import {passportLanguages,passportResources} from './passport-locales.js';
import {compliancePresets} from './compliance-marks.js';
import {createInstance} from 'i18next';
test('nine interface languages have aligned fixed-label resources',async()=>{
  assert.equal(Object.keys(passportLanguages).length,9);
  const keys=Object.keys(passportResources.en.translation);
  for(const language of Object.keys(passportLanguages))assert.deepEqual(Object.keys(passportResources[language].translation),keys);
  const i18n=createInstance();await i18n.init({resources:passportResources,lng:'zh',fallbackLng:'en',keySeparator:false});
  assert.equal(i18n.t('Safety and use'),'安全与使用');
  await i18n.changeLanguage('es');assert.equal(i18n.t('Warning'),'Advertencia');
  for(const language of Object.keys(passportLanguages)) {
    await i18n.changeLanguage(language);
    assert.ok(i18n.t('Related documents'));
    assert.ok(!i18n.exists('Third-party reference documents'));
    if(language!=='zh')assert.doesNotMatch(i18n.t('在役'),/[\u3400-\u9fff]/);
  }
  await i18n.changeLanguage('en');assert.equal(i18n.t('在役'),'In service');
  await i18n.changeLanguage('zh');assert.equal(i18n.t('Related documents'),'相关文件');
});
test('localized product content uses stable IDs and preserves numbers and original records',()=>{
  const model={nameEn:'Battery',capacity:32,safetyEn:'<p>Warning</p>',company:{addressEn:'Address'},markings:[{id:'CE-1',nameEn:'CE',scopeNote:'Scope'}],characteristics:[{id:'TEST-1',name:'Capacity',value:'32',unit:'Ah',condition:'25 C'}],localizedContent:{zh:{nameEn:'电池',safetyEn:'<p>警告</p>','markings.CE-1.scopeNote':'适用说明','characteristics.TEST-1.condition':'25 摄氏度'}}};
  const fields=translationFields(model);assert.ok(fields.some(f=>f.path==='safetyEn'&&f.rich));
  const localized=localizeModel(model,'zh');assert.equal(localized.nameEn,'电池');assert.equal(localized.capacity,32);assert.equal(localized.characteristics[0].value,'32');assert.equal(localized.characteristics[0].condition,'25 摄氏度');assert.equal(localized.markings[0].scopeNote,'适用说明');assert.equal(model.safetyEn,'<p>Warning</p>');assert.equal(localizeModel(model,'fr'),model);
});
test('regulation records do not invent certification marks and battery exclusions are explicit',()=>{
  for(const key of ['reach','rohs','eu-battery']){const record=compliancePresets.find(p=>p.key===key);assert.equal(record.kind,'regulation');assert.equal(record.imageUrl,undefined);assert.match(record.sourceUrl,/^https:/);}
  assert.equal(compliancePresets.find(p=>p.key==='ukca').applicability,'notApplicable');
  assert.equal(compliancePresets.find(p=>p.key==='rohs').applicability,'notApplicable');
});
