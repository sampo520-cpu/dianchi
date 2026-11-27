import {fieldLabelsFor} from './field-labels.js';

const fieldRows = [
  ['annex6.manufacturer','制造商法定名称','文本','附件 VI A.1'],
  ['annex6.manufacturerAddress','制造商地址','长文本','附件 VI A.1'],
  ['annex6.batteryCategory','电池类别','文本','附件 VI A.2'],
  ['annex6.manufacturingLocation','制造地点','长文本','附件 VI A.3'],
  ['annex6.productionMonth','生产年月','日期','附件 VI A.4'],
  ['annex6.mass','电池重量','数值','附件 VI A.5'],
  ['annex6.capacity','容量','数值','附件 VI A.6'],
  ['annex6.chemistry','化学体系','文本','附件 VI A.7'],
  ['annex6.hazardousSubstances','汞、镉、铅以外的危险物质','长文本','附件 VI A.8'],
  ['annex6.extinguishingMedia','可用灭火介质','长文本','附件 VI A.9'],
  ['annex6.criticalRawMaterials','质量分数超过 0.1% 的关键原材料','长文本','附件 VI A.10'],
  ['annex13.materialComposition','材料组成','长文本','附件 XIII 1(b)'],
  ['annex13.carbonFootprint','碳足迹信息','长文本','附件 XIII 1(c)'],
  ['annex13.responsibleSourcing','负责任采购信息','长文本','附件 XIII 1(d)'],
  ['annex13.recycledContent','再生材料含量','长文本','附件 XIII 1(e)'],
  ['annex13.renewableContent','可再生内容占比','数值','附件 XIII 1(f)'],
  ['annex13.ratedCapacity','额定容量','数值','附件 XIII 1(g)'],
  ['annex13.voltageMinimum','最小电压','数值','附件 XIII 1(h)'],
  ['annex13.voltageNominal','标称电压','数值','附件 XIII 1(h)'],
  ['annex13.voltageMaximum','最大电压','数值','附件 XIII 1(h)'],
  ['annex13.voltageTemperatureRange','电压适用温度范围','长文本','附件 XIII 1(h)'],
  ['annex13.powerCapability','原始功率能力','数值','附件 XIII 1(i)'],
  ['annex13.powerLimits','功率限制及相关温度范围','长文本','附件 XIII 1(i)'],
  ['annex13.expectedCycleLife','预期循环寿命','数值','附件 XIII 1(j)'],
  ['annex13.cycleLifeReferenceTest','循环寿命参考测试','长文本','附件 XIII 1(j)'],
  ['annex13.capacityExhaustionThreshold','容量耗尽阈值（适用时）','数值','附件 XIII 1(k)'],
  ['annex13.storageTemperatureRange','非使用状态温度范围','长文本','附件 XIII 1(l)'],
  ['annex13.storageReferenceTest','储存温度参考测试','长文本','附件 XIII 1(l)'],
  ['annex13.calendarLifeWarranty','日历寿命商业保修期间','文本','附件 XIII 1(m)'],
  ['annex13.efficiencyInitial','初始往返能量效率','数值','附件 XIII 1(n)'],
  ['annex13.efficiencyAtHalfLife','循环寿命 50% 时往返效率','数值','附件 XIII 1(n)'],
  ['annex13.resistanceCell','电芯内部电阻','数值','附件 XIII 1(o)'],
  ['annex13.resistancePack','电池包内部电阻','数值','附件 XIII 1(o)'],
  ['annex13.cycleTestCRate','循环寿命测试充放电倍率','数值','附件 XIII 1(p)'],
  ['annex13.markingRequirements','法定标识信息','长文本','附件 XIII 1(q)'],
  ['annex13.declarationOfConformity','EU 符合性声明','文本','附件 XIII 1(r)'],
  ['annex13.wastePrevention','废电池预防与管理信息','长文本','附件 XIII 1(s)'],
  ['annex13.electrodeElectrolyteComposition','正极、负极和电解液详细组成','长文本','附件 XIII 2(a)'],
  ['annex13.replacementParts','备件编号及来源联系方式','长文本','附件 XIII 2(b)'],
  ['annex13.explodedView','标明电芯位置的爆炸图','文本','附件 XIII 2(c)-1'],
  ['annex13.disassemblySequence','拆解顺序','长文本','附件 XIII 2(c)-2'],
  ['annex13.fasteners','紧固方式及数量','长文本','附件 XIII 2(c)-3'],
  ['annex13.disassemblyTools','拆解所需工具','长文本','附件 XIII 2(c)-4'],
  ['annex13.disassemblyRiskWarnings','拆解风险警告','长文本','附件 XIII 2(c)-5'],
  ['annex13.cellCountLayout','电芯数量和布局','长文本','附件 XIII 2(c)-6'],
  ['annex13.professionalSafetyMeasures','专业操作安全措施','长文本','附件 XIII 2(d)'],
  ['annex13.testReportResults','法规符合性测试报告结果','文本','附件 XIII 3'],
  ['annex13.initialPerformance','投放市场时性能和耐久性参数','长文本','附件 XIII 4(a)'],
  ['annex13.healthStatus','电池健康状态','长文本','附件 XIII 4(b)'],
  ['annex13.legalLifecycleState','法定生命周期状态','文本','附件 XIII 4(c)'],
  ['annex13.usageEvents','循环、事故及运行环境数据','长文本','附件 XIII 4(d)'],
  ['annex7.soce','认证能量状态 SOCE（适用时）','数值','附件 VII'],
  ['annex7.remainingCapacity','剩余容量（适用时）','数值','附件 VII'],
  ['annex7.remainingPower','剩余功率（适用时）','数值','附件 VII'],
  ['annex7.roundTripEfficiency','往返效率（适用时）','数值','附件 VII'],
  ['annex7.selfDischarge','自放电率变化（适用时）','数值','附件 VII'],
  ['annex7.ohmicResistance','欧姆电阻（适用时）','数值','附件 VII'],
  ['annex7.energyThroughput','能量吞吐量','数值','附件 VII'],
  ['annex7.capacityThroughput','容量吞吐量','数值','附件 VII'],
  ['annex7.equivalentCycles','等效完整充放电循环','数值','附件 VII'],
];

const englishLabel = id => id.replace(/^annex\d+\./,'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export const passportFieldCatalog = fieldRows.map(([id,label,dataType,source])=>({
  id,label,dataType,source,unit:'',translatable:['长文本','文本'].includes(dataType),
  section:id.startsWith('annex6.')?0:id.startsWith('annex7.')?4:/carbon|recycled|material|sourcing|renewable|waste|electrode|hazardous|rawMaterial/i.test(id)?2:/lifecycle|health|usage|remaining|soce|throughput|cycles|selfDischarge|ohmic/i.test(id)?4:1,
  labels:fieldLabelsFor(id,englishLabel(id),label),
}));

const generalIds=['annex6.manufacturer','annex6.manufacturerAddress','annex6.batteryCategory','annex6.productionMonth','annex6.mass','annex6.capacity','annex6.chemistry','annex13.ratedCapacity','annex13.voltageNominal','annex13.expectedCycleLife'];
export const passportTemplates = {
  genericBattery:{id:'genericBattery',name:'通用电池一码',description:'产品身份、基础技术参数与生产信息。',baseType:'generic',version:1,fieldIds:['model.name','company.contact','model.energy','instance.serial',...generalIds]},
  euBattery:{id:'euBattery',name:'欧盟电池护照',description:'欧盟电池护照展示字段组合；按产品类别和业务要求维护。',baseType:'eu',version:1,fieldIds:['model.name','company.contact','model.energy','instance.serial',...passportFieldCatalog.map(field=>field.id)]},
  customerBattery:{id:'customerBattery',name:'客户指定模板',description:'以通用字段为基础，按客户资料要求调整。',baseType:'customer',version:1,fieldIds:['model.name','company.contact','model.energy','instance.serial',...generalIds]},
};

export function passportFieldsFor(db={}) {
  const overrides=db.passportFieldOverrides||{};
  return passportFieldCatalog.map(field=>({...field,...overrides[field.id],labels:{...field.labels,...overrides[field.id]?.labels}}));
}

export function passportTemplatesFor(db={}) {
  const stored=db.passportTemplates||{};
  return {...passportTemplates,...stored};
}
