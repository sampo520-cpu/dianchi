import { syncSimplePassports } from './workflow.js';

export const compliancePresets = [
  {key:'ccc',zh:'CCC 强制性产品认证',nameEn:'CCC certification',imageUrl:'/mark-ccc.png',kind:'certification',market:'China',applicability:'review',scopeNote:'Certain lithium-ion cells and batteries are in the CCC catalogue. Check product use, catalogue scope and applicable implementation rules.',sourceUrl:'https://www.cnca.gov.cn/zwxx/bmgz/art/2015/art_e211a67d9e4d4a8ea25a5c2390a417f0.html'},
  {key:'ul',zh:'UL 元器件认可',nameEn:'UL component recognition',imageUrl:'/mark-ul-component.png',kind:'certification',market:'United States / Canada',applicability:'review',scopeNote:'This artwork is the Recognized Component Mark. It is not the UL Listed mark. Use only the mark and scope supported by the relevant file.',sourceUrl:'https://www.ul.com/thecodeauthority/knowledge/ul-component-recognition-classification'},
  {key:'pse',zh:'PSE 电气安全标识',nameEn:'PSE electrical safety marking',imageUrl:'/mark-pse.gif',kind:'declaration',market:'Japan',applicability:'review',scopeNote:'Certain lithium-ion batteries fall under Japan’s electrical safety legislation. Verify scope, exclusions and the correct circular or diamond mark. This preset shows the circular mark.',sourceUrl:'https://www.meti.go.jp/english/policy/economy/consumer/pse/index.html'},
  {key:'ukca',zh:'UKCA 产品标识（电池本身不要求）',nameEn:'UKCA product marking',imageUrl:'/mark-ukca.png',kind:'declaration',market:'Great Britain',applicability:'notApplicable',scopeNote:'UK guidance states that batteries do not require this product marking in Great Britain. A host device may have separate requirements; this is a reference option, not a battery approval.',sourceUrl:'https://www.gov.uk/guidance/batteries'},
  {key:'rohs',zh:'RoHS 适用性资料（非电池认证）',nameEn:'RoHS applicability documentation',kind:'regulation',market:'European Union',applicability:'notApplicable',scopeNote:'Batteries themselves are outside the RoHS Directive scope. Assess any host electrical equipment separately. No universal official RoHS certification logo is asserted here.',sourceUrl:'https://environment.ec.europa.eu/system/files/2021-01/FAQ%20key%20guidance%20document%20-%20RoHS.pdf'},
  {key:'reach',zh:'REACH 化学品法规资料',nameEn:'REACH substance documentation',kind:'regulation',market:'European Union',applicability:'review',scopeNote:'Record applicable substance restrictions and article communication duties with supporting evidence. REACH is a regulation, not a product certification mark.',sourceUrl:'https://echa.europa.eu/candidate-list-obligations'},
  {key:'eu-battery',zh:'(EU) 2023/1542 电池法规',nameEn:'EU Battery Regulation 2023/1542',kind:'regulation',market:'European Union',applicability:'review',scopeNote:'Assess applicable requirements, dates and evidence for this battery category. The regulation number is not a certification logo; maintain CE information separately where applicable.',sourceUrl:'https://eur-lex.europa.eu/eli/reg/2023/1542/oj'},
];
export function enrichComplianceMarks(db) {
  if(db.complianceMarksVersion>=2)return db;
  const previous=structuredClone(db);
  for(const m of db.models) {
    for(const mark of m.markings||[]) {
      const preset=compliancePresets.find(p=>p.key===mark.key);
      if(!preset)continue;
      for(const key of ['scopeNote','sourceUrl','applicability'])mark[key] ||= preset[key];
      if(!mark.imageUrl&&preset.imageUrl)mark.imageUrl=preset.imageUrl;
      if(mark.key==='rohs')mark.kind='regulation';
    }
    if(m.id==='FULL-SAMPLE-ESS') for(const preset of compliancePresets) {
      if(m.markings.some(mark=>mark.key===preset.key))continue;
      m.markings.push({...preset,id:`${m.id}-REFERENCE-${preset.key}`,category:'conformity',icon:preset.kind==='regulation'?'file':'shield',status:'demo',descriptionEn:'Reference entry for the demonstration. It does not assert certification or applicability to this sample battery.'});
    }
  }
  const six=db.models.find(m=>m.id==='DEMO-6F22');
  if(six) {
    six.localizedContent ||= {};
    six.localizedContent.zh ||= {};
    for(const [key,value] of Object.entries({
      nameEn:'6F22 9V 锌锰电池',
      productOverviewEn:'<p><strong>6F22，9 V，不可充电锌锰电池。</strong>便携式金属外壳，原产国为中国；参考供应商提供 NL、无品牌和 OEM 选项。</p><p>参考资料标示正常储存条件下保质期为两年，生产标记可能采用 PD: YY-MM。本页面顶部的生产日期、批次和编号属于中企虚构演示数据。</p><p>2.88 Wh 由 9 V × 0.32 Ah 计算，并非可用能量实测声明；参考参数与原厂资料不能视为中企的产品或认证。</p>',
      safetyEn:'<h3>一次电池，禁止充电</h3><ul><li>禁止充电、强制放电、加热、焚烧、挤压或拆开电池。</li><li>按正确极性安装，不混用新旧或不兼容类型的电池。</li><li>端子远离钥匙、硬币和导电工具，禁止直接焊接。</li><li>电池及零部件远离儿童，怀疑误吞时应立即寻求医疗帮助。</li></ul>',
      cautionEn:'<ul><li>及时取出耗尽的电池，长期存放设备前取出电池。</li><li>避免浸水、过度潮湿和高温。</li><li>出现泄漏、变形、异味或过热时停止使用。</li><li>避免接触泄漏的电解液；接触后及时寻求医疗建议，并遵循产品安全数据表。</li></ul>',
    })) if(!six.localizedContent.zh[key])six.localizedContent.zh[key]=value;
  }
  syncSimplePassports(db,previous);db.complianceMarksVersion=2;return db;
}
