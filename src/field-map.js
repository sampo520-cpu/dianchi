import { templateOf } from './templates.js';
import { inferFieldDataType } from './field-types.js';
import { fieldLabelsFor } from './field-labels.js';
// Maintenance metadata is a prototype mapping, not a complete legal applicability matrix.
export const extraFields = [
  [
    "company.address",
    "制造商地址",
    "Manufacturer address",
    "company",
    "必填",
    "公开",
    "Annex XIII 1(a)",
  ],
  [
    "company.contact",
    "联系邮箱",
    "Contact",
    "company",
    "必填",
    "公开",
    "Annex XIII 1(a)",
  ],
  [
    "company.operator",
    "责任主体",
    "Responsible economic operator",
    "company",
    "后续适用",
    "公开",
    "Article 77",
  ],
  [
    "model.materials",
    "公开材料信息",
    "Material information",
    "model",
    "后续适用",
    "公开",
    "Annex XIII 1(a)",
  ],
  [
    "model.life",
    "预计使用寿命及测试条件",
    "Expected lifetime and test conditions",
    "model",
    "后续适用",
    "公开",
    "Annex XIII 1(d)",
  ],
  [
    "model.power",
    "原始功率能力",
    "Original power capability",
    "model",
    "后续适用",
    "公开",
    "Annex XIII 1(d)",
  ],
  [
    "model.efficiency",
    "初始往返效率及测试条件",
    "Initial round-trip efficiency and conditions",
    "model",
    "后续适用",
    "公开",
    "Annex XIII 1(d)",
  ],
  [
    "model.resistance",
    "初始内阻及测试条件",
    "Initial resistance and conditions",
    "model",
    "后续适用",
    "公开",
    "Annex XIII 1(d)",
  ],
  [
    "model.hazardous",
    "有害物质与依据",
    "Hazardous substances and evidence",
    "model",
    "后续适用",
    "公开",
    "Annex XIII 1(a)",
  ],
  [
    "model.parts",
    "零件与维修资料",
    "Parts and repair information",
    "model",
    "后续适用",
    "受限",
    "Annex XIII 2",
  ],
  [
    "instance.remainingCapacity",
    "剩余容量及测量条件",
    "Remaining capacity and conditions",
    "instance",
    "后续适用",
    "受限",
    "Annex XIII 4",
  ],
  [
    "instance.state",
    "电池生命周期状态",
    "Battery status",
    "instance",
    "后续适用",
    "公开",
    "Annex XIII 1",
  ],
].map(([code, zh, en, level, required, access, source]) => ({
  code,
  zh,
  en,
  labels: fieldLabelsFor(code, en, zh),
  level,
  dataType: inferFieldDataType(code),
  required,
  access,
  source,
}));
export const criticalKeys = ["type", "chem", "energy", "capacity", "voltage"];
export function matchingEvidence(db, modelId, factory, date) {
  return (db.applicableMaterials || []).filter(
    (r) =>
      r.modelId === modelId &&
      r.factory === factory &&
      r.from <= date &&
      r.to >= date,
  );
}
export function evidenceIssues(db, modelId, factory, date, selected = {}) {
  if (templateOf(db.models.find(m => m.id === modelId)) !== 'eu') return [];
  const model = db.models.find((m) => m.id === modelId),
    matches = matchingEvidence(db, modelId, factory, date),
    issues = [];
  for (const kind of ["carbon", "recycled", "diligence"]) {
    const candidates = matches.filter((r) => r.kind === kind),
      chosen = selected[kind];
    if (chosen && !candidates.some((r) => r.id === chosen))
      issues.push(kind + "：所选资料不适用于当前工厂或日期");
    else if (candidates.length > 1 && !chosen)
      issues.push(kind + "：匹配到多份资料，请明确选择");
    else if (model?.[kind + "Applicable"] && !candidates.length)
      issues.push(kind + "：缺少覆盖本工厂和生产日期的依据资料");
  }
  return issues;
}
