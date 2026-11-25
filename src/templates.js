export const batteryCategories = ['工业储能', '电动汽车', '轻型交通工具', '便携式电池', '启动照明点火（SLI）', '其他工业电池', '其他电池'];
export const templates = { generic: '通用电池一码', customer: '客户指定模板', eu: '欧盟电池护照' };
const common = new Set(['company.name', 'company.address', 'company.contact', 'model.name', 'model.chem', 'model.energy', 'model.capacity', 'model.voltage', 'model.weight', 'model.materials', 'instance.serial', 'instance.date', 'instance.state']);
export const templateOf = model => model?.template || 'eu';
export function templateIncludes(rule, model) {
  return templateOf(model) === 'eu' || common.has(rule.code);
}
export function euScope(model) {
  if (['电动汽车', '轻型交通工具'].includes(model?.type)) return '本类别属于强制护照范围，要求自 2027-02-18 起适用；具体产品需复核。';
  if (['工业储能', '其他工业电池'].includes(model?.type)) return Number(model.energy) > 2 ? '工业电池能量大于 2 kWh，属于强制护照范围；具体产品需复核。' : '工业电池能量不超过 2 kWh，或尚未填写能量；不据此判定强制护照适用。';
  return '当前类别不属于上述强制护照三类范围，可按客户要求提供电池一码资料。';
}
