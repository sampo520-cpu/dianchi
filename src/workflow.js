import {
  id,
  log,
  batchCode,
  makePassportId,
  resolverUrl,
  check,
  snapshot,
  latest,
} from "./data.js";
import {
  extraFields,
  criticalKeys,
  matchingEvidence,
  evidenceIssues,
} from "./field-map.js";
import { batteryCategories } from './templates.js';
import { completeFieldLabels } from './field-labels.js';

export function ensureWorkflow(db) {
  db.productionBatches ||= [];
  db.materialVersions ||= [];
  db.measurements ||= [];
  db.pageDrafts ||= {};
  db.applicableMaterials ||= [];
  for (const rule of db.rules) rule.labels = completeFieldLabels(rule);
  for (const field of extraFields)
    if (!db.rules.some((r) => r.code === field.code))
      db.rules.push({
        ...field,
        categories: [...batteryCategories],
        ruleVersion: "DEMO-LAYERS-1",
      });
  for (const model of db.models) {
    model.template ||= 'eu';
    model.customFields ||= [];
    model.company ||= structuredClone(db.company);
    if (!db.materialVersions.some((v) => v.modelId === model.id))
      db.materialVersions.push({
        id: id("MAT"),
        modelId: model.id,
        version: 1,
        createdAt: new Date().toISOString(),
        model: structuredClone(model),
        company: structuredClone(model.company || db.company),
        documents: structuredClone(
          db.documents.filter((d) => d.target === model.id),
        ),
        status: "已审核",
      });
  }
  if (!db.categoryTemplateMigration) {
    for (const rule of db.rules) rule.categories = [...new Set([...rule.categories, ...batteryCategories.slice(3)])];
    db.categoryTemplateMigration = 1;
  }
  return db;
}

// Lightweight mode preserves immutable public history without an approval step.
export function syncSimplePassports(db, previous) {
  for (const instance of db.instances) {
    const model = db.models.find((m) => m.id === instance.modelId);
    if (!model) continue;
    const old = previous?.instances.find((i) => i.id === instance.id);
    const sharedChanged =
      JSON.stringify(model) !==
        JSON.stringify(previous?.models.find((m) => m.id === model.id)) ||
      JSON.stringify(db.company) !== JSON.stringify(previous?.company) ||
      JSON.stringify(db.documents) !== JSON.stringify(previous?.documents) ||
      JSON.stringify(db.pageDrafts?.[model.id]) !==
        JSON.stringify(previous?.pageDrafts?.[model.id]);
    if (!sharedChanged && JSON.stringify(instance) === JSON.stringify(old))
      continue;
    if (
      !db.codeRecords.some(
        (c) => c.instanceId === instance.id && c.status !== "作废",
      )
    )
      continue;
    const batch = db.productionBatches.find(
      (b) => b.id === instance.productionBatchId,
    );
    const resolvedModel = { ...model, ...batch?.fixedSpecs };
    for (const evidence of batch?.evidenceSnapshots || []) {
      resolvedModel[evidence.kind] = evidence.value;
      resolvedModel[evidence.kind + "En"] = evidence.value;
    }
    const resolvedDb = {
      ...db,
      models: db.models.map((m) => (m.id === model.id ? resolvedModel : m)),
    };
    if (check(resolvedDb, instance).length) {
      instance.status = "草稿";
      continue;
    }
    instance.status = "已发布";
    db.versions.push(
      snapshot(
        {
          ...resolvedDb,
          resolvedProductionBatch: db.productionBatches.find(
            (b) => b.id === instance.productionBatchId,
          ),
        },
        instance,
        (latest(db, instance.id)?.version || 0) + 1,
      ),
    );
    const code = db.codeRecords.find(
      (c) => c.instanceId === instance.id && c.status !== "作废",
    );
    code.status = "已激活";
    code.activatedAt ||= new Date().toISOString();
  }
}
export function saveMaterialVersion(db, modelId) {
  ensureWorkflow(db);
  const model = db.models.find((m) => m.id === modelId);
  if (!model) throw Error("型号不存在");
  const version =
    Math.max(
      0,
      ...db.materialVersions
        .filter((v) => v.modelId === modelId)
        .map((v) => v.version),
    ) + 1;
  const record = {
    id: id("MAT"),
    modelId,
    version,
    createdAt: new Date().toISOString(),
    model: structuredClone(model),
    company: structuredClone(model.company || db.company),
    documents: structuredClone(
      db.documents.filter((d) => d.target === modelId),
    ),
    status: "已审核",
  };
  db.materialVersions.push(record);
  log(db, "审核共享资料版本", model.name + " · v" + version);
  return record;
}
export function validateRows(db, rows, modelId) {
  const seen = new Set();
  return rows.map((row) => {
    const serial = String(row.serial || "").trim();
    let error = "";
    if (!serial) error = "序列号为空";
    else if (seen.has(serial)) error = "文件内重复";
    else if (db.instances.some((i) => i.serial === serial))
      error = "序列号已存在";
    else if (
      !/^\d{4}-\d{2}-\d{2}$/.test(row.date || "") ||
      Number.isNaN(Date.parse(row.date))
    )
      error = "生产日期无效";
    seen.add(serial);
    return { ...row, serial, error };
  });
}
export function createProduction(db, input) {
  ensureWorkflow(db);
  const model = db.models.find((m) => m.id === input.modelId),
    material = db.materialVersions.find(
      (v) => v.id === input.materialId && v.modelId === input.modelId,
    );
  if (!model || !material) throw Error("请选择有效型号和资料版本");
  for (const field of model.customFields || []) {
    const value = field.level === 'product' ? model.customValues?.[field.id] : input.customValues?.[field.id];
    if (field.required && !String(value ?? '').trim()) throw Error('请填写客户字段：' + field.label);
  }
  const evidenceProblems = evidenceIssues(
    db,
    model.id,
    input.factory,
    input.date,
    input.evidenceIds,
  );
  if (evidenceProblems.length) throw Error(evidenceProblems.join("；"));
  if (!input.name.trim()) throw Error("请填写生产批次号");
  if (db.productionBatches.some((b) => b.name === input.name.trim()))
    throw Error("生产批次号重复");
  const chosenRule = { ...model.codeRule, ...input.rule };
  if (
    !/^[A-Za-z0-9-]{1,32}$/.test(chosenRule.prefix) ||
    !Number.isInteger(Number(chosenRule.sequenceWidth)) ||
    chosenRule.sequenceWidth < 3 ||
    chosenRule.sequenceWidth > 12 ||
    !Number.isSafeInteger(Number(chosenRule.nextSequence)) ||
    Number(chosenRule.nextSequence) < Number(model.codeRule.nextSequence)
  )
    throw Error("编号规则无效，起始流水不得小于产品当前流水");
  const numberingPart =
    input.numberingBatch ||
    batchCode(chosenRule.batchFormat, new Date(input.date + "T00:00:00"));
  if (!/^[A-Za-z0-9-]{1,40}$/.test(numberingPart))
    throw Error("编号批次段无效");
  if (input.mode === "generate") {
    const count = Number(input.count);
    if (!Number.isInteger(count) || count < 1 || count > 5000)
      throw Error("数量须为 1–5000 的整数");
    const rule = chosenRule;
    const start = Number(rule.nextSequence) || 1;
    input = {
      ...input,
      rows: Array.from({ length: count }, (_, n) => {
        const serial = makePassportId(rule, numberingPart, start + n);
        return { serial, generatedPassportId: serial, date: input.date };
      }),
    };
  }
  if (!input.rows.length || input.rows.length > 5000)
    throw Error("每批需要 1–5000 条序列号");
  const rows = validateRows(db, input.rows, input.modelId);
  if (rows.some((r) => r.error)) throw Error("请先处理序列号或日期错误");
  const rule = structuredClone(chosenRule),
    start = Number(rule.nextSequence) || 1,
    end = start + rows.length - 1;
  if (String(end).length > rule.sequenceWidth)
    throw Error("流水号超出位数，请调整编号规则");
  const ids = rows.map((row) => row.serial);
  const passportIds = rows.map(
    (row, n) =>
      row.generatedPassportId ||
      makePassportId(rule, input.name.trim(), start + n),
  );
  if (
    new Set(ids).size !== ids.length ||
    ids.some((serial) => db.instances.some((i) => i.serial === serial)) ||
    passportIds.some((pid) => db.codeRecords.some((c) => c.passportId === pid))
  )
    throw Error("电池编号或历史链接冲突");
  const batchId = id("PROD"),
    codeBatchId = id("BATCH"),
    now = new Date().toISOString();
  const batch = {
    customValues: structuredClone(input.customValues || {}),
    id: batchId,
    name: input.name.trim(),
    modelId: model.id,
    materialId: material.id,
    factory: input.factory,
    date: input.date,
    count: rows.length,
    codeBatchId,
    ruleSnapshot: structuredClone(rule),
    numberingBatch: numberingPart,
    fixedSpecs: Object.fromEntries(criticalKeys.map((k) => [k, model[k]])),
    evidenceSnapshots: structuredClone(
      ["carbon", "recycled", "diligence"].flatMap((kind) => {
        const candidates = matchingEvidence(
          db,
          model.id,
          input.factory,
          input.date,
        ).filter((r) => r.kind === kind);
        const chosen =
          candidates.find((r) => r.id === input.evidenceIds?.[kind]) ||
          candidates[0];
        return chosen ? [chosen] : [];
      }),
    ),
    createdAt: now,
  };
  db.productionBatches.push(batch);
  db.codeBatches.push({
    id: codeBatchId,
    productionBatchId: batchId,
    modelId: model.id,
    batchCode: batch.name,
    count: rows.length,
    startSequence: start,
    endSequence: end,
    ruleSnapshot: rule,
    createdAt: now,
    status: "已分配",
  });
  rows.forEach((row, n) => {
    const instance = {
      customValues: structuredClone(input.customValues || {}),
      id: id("BAT"),
      modelId: model.id,
      productionBatchId: batchId,
      materialId: material.id,
      passportId: passportIds[n],
      serial: row.serial,
      date: row.date,
      state: "在役",
      status: "草稿",
      soh: "",
      cycles: 0,
    };
    db.instances.push(instance);
    db.codeRecords.push({
      id: id("CODE"),
      batchId: codeBatchId,
      passportId: passportIds[n],
      modelId: model.id,
      instanceId: instance.id,
      enterpriseSerial: row.serial,
      productionDate: row.date,
      status: "已分配",
      resolverUrl: resolverUrl(db.company.resolverBaseUrl, passportIds[n]),
      createdAt: now,
      activatedAt: "",
      voidedAt: "",
      voidReason: "",
      ruleSnapshot: rule,
    });
  });
  model.codeRule.nextSequence = Math.max(
    Number(model.codeRule.nextSequence) || 1,
    end + 1,
  );
  log(db, "创建生产批次并自动分码", batch.name + " · " + rows.length + " 块");
  return batch;
}
export function effectiveDb(db, instance) {
  const version = db.materialVersions?.find(
    (v) => v.id === instance.materialId,
  );
  if (!version) return db;
  return {
    ...db,
    resolvedProductionBatch:
      db.productionBatches?.find((b) => b.id === instance.productionBatchId) ||
      null,
    company: version.company,
    models: db.models.map((m) =>
      m.id === instance.modelId ? version.model : m,
    ),
    documents: [
      ...db.documents.filter((d) => d.target !== instance.modelId),
      ...version.documents,
    ],
  };
}
export function productionIssues(db, i) {
  const code = db.codeRecords.find(
    (c) => c.instanceId === i.id && c.status !== "作废",
  );
  return [
    ...check(effectiveDb(db, i), i),
    ...(!code ? ["未绑定有效护照码"] : []),
  ];
}
export function publishBatch(db, batchId) {
  const rows = db.instances.filter((i) => i.productionBatchId === batchId),
    ready = rows.filter(
      (i) => !productionIssues(db, i).length && i.status !== "已发布",
    );
  if (!ready.length) throw Error("没有待发布且资料完整的电池");
  for (const i of ready) {
    const c = db.codeRecords.find(
      (c) => c.instanceId === i.id && c.status !== "作废",
    );
    i.status = "已发布";
    db.versions.push(
      snapshot(
        {
          ...effectiveDb(db, i),
          publishedPageOverride: structuredClone(
            db.pageDrafts?.[i.modelId] || null,
          ),
        },
        i,
        (latest(db, i.id)?.version || 0) + 1,
      ),
    );
    c.status = "已激活";
    c.activatedAt ||= new Date().toISOString();
  }
  log(db, "批量审核发布", batchId + " · " + ready.length + " 份");
  return ready.length;
}
export function addMeasurements(db, rows, source) {
  if (!source.trim()) throw Error("请填写数据来源");
  const seen = new Set();
  const prepared = rows.map((row) => {
    const instance = db.instances.find((i) => i.serial === row.serial);
    if (!instance) throw Error("序列号不存在：" + row.serial);
    if (seen.has(row.serial)) throw Error("重复序列号：" + row.serial);
    seen.add(row.serial);
    if (
      !row.measuredAt ||
      Number.isNaN(Date.parse(row.measuredAt)) ||
      Date.parse(row.measuredAt) > Date.now()
    )
      throw Error("测量时间无效");
    const soh = Number(row.soh),
      cycles = Number(row.cycles);
    if (
      row.soh === "" ||
      row.cycles === "" ||
      !Number.isFinite(soh) ||
      soh < 0 ||
      soh > 100 ||
      !Number.isInteger(cycles) ||
      cycles < 0
    )
      throw Error("健康状态或循环次数无效");
    return {
      ...row,
      soh,
      cycles,
      instanceId: instance.id,
      id: id("MEASURE"),
      source: source.trim(),
      createdAt: new Date().toISOString(),
    };
  });
  ensureWorkflow(db);
  for (const r of prepared) {
    db.measurements.push(r);
    const current = db.measurements
      .filter((m) => m.instanceId === r.instanceId)
      .sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt))[0];
    const instance = db.instances.find((i) => i.id === r.instanceId);
    instance.soh = current.soh;
    instance.cycles = current.cycles;
    instance.measuredAt = current.measuredAt;
    instance.status = "草稿";
  }
  log(db, "追加运行数据", source + " · " + rows.length + " 条");
}
