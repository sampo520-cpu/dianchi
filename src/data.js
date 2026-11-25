import { batteryCategories, templateIncludes } from './templates.js';
import { extraFields } from './field-map.js';
import { fieldDataTypes, inferFieldDataType } from './field-types.js';
import { fieldLabelsFor } from './field-labels.js';
export const RULE_VERSION = "DEMO-2026.11";
export const categories = batteryCategories;
const baseFields = [
  {
    code: "company.name",
    zh: "企业名称",
    en: "Manufacturer",
    level: "company",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "model.name",
    zh: "型号名称",
    en: "Model",
    level: "model",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "model.chem",
    zh: "化学体系",
    en: "Chemistry",
    level: "model",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "model.energy",
    zh: "额定能量",
    en: "Rated energy",
    unit: "kWh",
    level: "model",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "model.capacity",
    zh: "额定容量",
    en: "Rated capacity",
    unit: "Ah",
    level: "model",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(d)",
  },
  {
    code: "model.voltage",
    zh: "额定电压",
    en: "Nominal voltage",
    unit: "V",
    level: "model",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(d)",
  },
  {
    code: "model.weight",
    zh: "重量",
    en: "Weight",
    unit: "kg",
    level: "model",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "instance.serial",
    zh: "序列号",
    en: "Serial number",
    level: "instance",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "instance.date",
    zh: "生产日期",
    en: "Production date",
    level: "instance",
    required: "必填",
    access: "公开",
    source: "Annex XIII 1(a)",
  },
  {
    code: "model.carbon",
    zh: "碳足迹声明",
    en: "Carbon footprint declaration",
    level: "model",
    required: "条件适用",
    condition: "carbonApplicable",
    access: "公开",
    source: "Article 7 / Annex XIII 1(b)",
  },
  {
    code: "model.recycled",
    zh: "再生材料含量",
    en: "Recycled content",
    level: "model",
    required: "后续适用",
    access: "公开",
    source: "Article 8 / Annex XIII 1(f)",
  },
  {
    code: "model.diligence",
    zh: "尽职调查资料",
    en: "Due diligence information",
    level: "model",
    required: "后续适用",
    access: "公开",
    source: "Annex XIII 1(e)",
  },
  {
    code: "instance.soh",
    zh: "健康状态",
    en: "State of health",
    unit: "%",
    level: "instance",
    required: "后续适用",
    access: "受限",
    roles: ["维修回收", "监管"],
    source: "Annex XIII 4",
  },
  {
    code: "instance.cycles",
    zh: "循环次数",
    en: "Cycle count",
    unit: "次",
    level: "instance",
    required: "后续适用",
    access: "受限",
    roles: ["维修回收", "监管"],
    source: "Annex XIII 4",
  },
  {
    code: "model.disassembly",
    zh: "拆解与回收说明",
    en: "Disassembly and recycling",
    level: "model",
    required: "条件适用",
    condition: "disassemblyApplicable",
    access: "受限",
    roles: ["维修回收", "监管"],
    source: "Annex XIII 2",
  },
  {
    code: "model.composition",
    zh: "详细材料组成",
    en: "Detailed composition",
    level: "model",
    required: "后续适用",
    access: "受限",
    roles: ["维修回收", "监管"],
    source: "Annex XIII 2",
  },
];
export const fields = baseFields.map((f) => ({
  ...f,
  labels: fieldLabelsFor(f.code, f.en, f.zh),
  dataType: inferFieldDataType(f.code, f.unit),
  categories: [...categories],
  ruleVersion: RULE_VERSION,
}));
const baseModels = [
  {
    id: "MOD-ESS-240",
    name: "ESS PowerPack 240",
    nameEn: "ESS PowerPack 240",
    type: "工业储能",
    chem: "LFP",
    energy: 241.2,
    capacity: 314,
    voltage: 768,
    weight: 1860,
    life: "6000 cycles",
    materials: "磷酸铁锂、石墨、铝",
    materialsEn: "Lithium iron phosphate, graphite, aluminium",
    disassembly: "由授权人员断开高压回路后拆解。",
    disassemblyEn:
      "Authorized technicians must isolate the high-voltage circuit before disassembly.",
    composition: "演示配方：LFP 正极 / 石墨负极",
    compositionEn: "Demo composition: LFP cathode / graphite anode",
    carbonApplicable: false,
    disassemblyApplicable: true,
    carbon: "",
    recycled: "",
    diligence: "",
    power: "240 kW continuous / 300 kW peak",
    efficiency: "92% round-trip at 25°C, 0.5C test",
    resistance: "18 mΩ at 25°C, 50% SOC",
    hazardous: "No SVHC above the applicable threshold in the demonstration declaration",
    parts: "Module, BMS, cooling plate and service disconnect",
    updated: "2026-11-18",
    codeRule: {
      prefix: "QY-ESS",
      batchFormat: "YYYYMM",
      sequenceWidth: 6,
      nextSequence: 2,
    },
  },
  {
    id: "MOD-EV-082",
    name: "E-Drive 82",
    nameEn: "E-Drive 82",
    type: "电动汽车",
    chem: "NMC",
    energy: 82.4,
    capacity: 206,
    voltage: 400,
    weight: 520,
    life: "2000 cycles",
    materials: "镍锰钴、石墨",
    materialsEn: "Nickel manganese cobalt, graphite",
    disassembly: "请联系授权维修服务商。",
    disassemblyEn: "Contact an authorized service provider.",
    carbonApplicable: false,
    disassemblyApplicable: true,
    updated: "2026-11-19",
    codeRule: {
      prefix: "QY-EV",
      batchFormat: "YYYYMM",
      sequenceWidth: 6,
      nextSequence: 1,
    },
  },
  {
    id: "MOD-LMT-014",
    name: "CityMove 14",
    nameEn: "CityMove 14",
    type: "轻型交通工具",
    chem: "LFP",
    energy: 14.8,
    capacity: 200,
    voltage: "",
    weight: 94,
    life: "1500 cycles",
    materials: "磷酸铁锂",
    materialsEn: "Lithium iron phosphate",
    carbonApplicable: false,
    disassemblyApplicable: false,
    updated: "2026-11-20",
    codeRule: {
      prefix: "QY-LMT",
      batchFormat: "YYYYMM",
      sequenceWidth: 6,
      nextSequence: 1,
    },
  },
];
export function createSeed() {
  const company = {
    name: "中企新能源科技有限公司（虚构）",
    nameEn: "Zhongqi Energy Technologies (fictional)",
    factory: "苏州示范工厂",
    factoryEn: "Suzhou demonstration plant",
    address: "中国江苏省苏州市 · 演示地址",
    addressEn: "Suzhou, Jiangsu, China · demo address",
    contact: "passport@example.com",
    operator: "中企新能源科技有限公司",
    operatorEn: "Zhongqi Energy Technologies",
    operatorAddress: "苏州市 · 演示责任主体地址",
    resolverBaseUrl: "https://passport-demo.example.invalid",
  };
  const models = structuredClone(baseModels);
  const rules = structuredClone(fields);
  rules.find((r) => r.code === "model.energy").required = "条件适用";
  const instances = [
    {
      id: "BAT-ESS-000184",
      modelId: models[0].id,
      passportId: "QY-ESS-202611-000001",
      serial: "ESS240-2026-000184",
      date: "2026-08-12",
      state: "在役",
      status: "已发布",
      soh: 98,
      cycles: 128,
      previousId: "",
    },
    {
      id: "BAT-EV-000021",
      modelId: models[1].id,
      serial: "ED82-2026-000021",
      date: "2026-10-03",
      state: "在役",
      status: "待审核",
      soh: 100,
      cycles: 12,
    },
    {
      id: "BAT-LMT-000087",
      modelId: models[2].id,
      serial: "CM14-2026-000087",
      date: "2026-11-01",
      state: "在役",
      status: "草稿",
      soh: 100,
      cycles: 4,
    },
  ];
  const documents = [
    {
      id: "DOC-01",
      name: "ESS 240 产品说明（演示）.txt",
      nameEn: "ESS 240 product guide (demo).txt",
      target: models[0].id,
      access: "公开",
      version: "1.0",
      mime: "text/plain",
      content:
        "中企 ESS 240 产品说明 / Zhongqi ESS 240 guide\n此文件仅为虚构演示资料。 Fictional demonstration only.",
      updated: "2026-11-18",
    },
    {
      id: "DOC-03",
      name: "碳足迹核算声明（演示）.txt",
      nameEn: "Carbon footprint declaration (demo).txt",
      target: models[0].id,
      access: "公开",
      version: "1.0",
      mime: "text/plain",
      content: "演示声明：苏州示范工厂 ESS PowerPack 240 的产品碳足迹为 62 kg CO2e/kWh。虚构资料。",
      updated: "2026-11-18",
    },
    {
      id: "DOC-04",
      name: "再生材料与尽调声明（演示）.txt",
      nameEn: "Recycled content and due diligence statement (demo).txt",
      target: models[0].id,
      access: "公开",
      version: "1.0",
      mime: "text/plain",
      content: "演示声明：钴、镍、锂等关键材料的供应链尽调资料已归档；再生材料含量按供应商批次记录。虚构资料。",
      updated: "2026-11-18",
    },
    {
      id: "DOC-02",
      name: "高压拆解说明（演示）.txt",
      nameEn: "HV disassembly guide (demo).txt",
      target: models[0].id,
      access: "受限",
      version: "1.0",
      mime: "text/plain",
      content:
        "受限演示资料 / Restricted demo document\n请由授权人员操作。 Authorized technicians only.",
      updated: "2026-11-18",
    },
  ];
  const seed = {
    schemaVersion: 1,
    company,
    models,
    instances,
    documents,
    rules,
    versions: [],
    requests: [
      {
        id: "REQ-0084",
        entity: "Nordic Repair GmbH（演示）",
        email: "repair@example.com",
        purpose: "维修诊断",
        passportId: instances[0].passportId,
        status: "待处理",
        created: "2026-11-20T10:42:00+08:00",
        expires: "",
      },
    ],
    events: [
      {
        id: "EVT-01",
        instanceId: instances[0].id,
        type: "生产",
        date: "2026-08-12",
        note: "出厂检测完成",
        noteEn: "Factory inspection completed",
      },
      {
        id: "EVT-02",
        instanceId: instances[0].id,
        type: "维修",
        date: "2026-10-22",
        note: "年度检查，连接件复检",
        noteEn: "Annual inspection and connector check",
      },
    ],
    logs: [
      {
        id: "LOG-01",
        time: "2026-11-18T10:24:00+08:00",
        action: "发布护照",
        detail: "BAT-ESS-000184 · v1",
      },
    ],
    codeBatches: [],
    codeRecords: [],
    printJobs: [],
    importJobs: [],
    applicableMaterials: [
      { id: "EVIDENCE-CARBON-ESS", modelId: models[0].id, kind: "carbon", name: "ESS 240 碳足迹声明 v1", factory: "苏州示范工厂", from: "2026-01-01", to: "2026-12-31", value: "62 kg CO2e/kWh", documentId: "DOC-03", access: "公开" },
      { id: "EVIDENCE-RECYCLED-ESS", modelId: models[0].id, kind: "recycled", name: "ESS 240 再生材料声明 v1", factory: "苏州示范工厂", from: "2026-01-01", to: "2026-12-31", value: "再生材料比例按供应商批次记录", documentId: "DOC-04", access: "公开" },
      { id: "EVIDENCE-DILIGENCE-ESS", modelId: models[0].id, kind: "diligence", name: "ESS 240 尽调声明 v1", factory: "苏州示范工厂", from: "2026-01-01", to: "2026-12-31", value: "供应链尽调资料已归档", documentId: "DOC-04", access: "公开" },
    ],
  };
  const demoCode = {
    id: "CODE-DEMO-000001",
    batchId: "BATCH-DEMO-ESS",
    passportId: "QY-ESS-202611-000001",
    modelId: models[0].id,
    instanceId: instances[0].id,
    enterpriseSerial: instances[0].serial,
    productionDate: instances[0].date,
    status: "已激活",
    resolverUrl:
      "https://passport-demo.example.invalid/passport/QY-ESS-202611-000001",
    createdAt: "2026-11-18T10:24:00+08:00",
    activatedAt: "2026-11-18T10:24:00+08:00",
    voidReason: "",
    voidedAt: "",
    ruleSnapshot: { ...models[0].codeRule, batchFormat: "202611" },
  };
  seed.codeBatches = [
    {
      id: "BATCH-DEMO-ESS",
      modelId: models[0].id,
      batchCode: "202611",
      count: 1,
      startSequence: 1,
      endSequence: 1,
      status: "已完成",
      ruleSnapshot: structuredClone(demoCode.ruleSnapshot),
      createdAt: "2026-11-18T10:20:00+08:00",
    },
  ];
  seed.codeRecords = [demoCode];
  seed.versions = [snapshot(seed, instances[0], 1)];
  return seed;
}
export function snapshot(db, instance, version) {
  return {
    id: crypto.randomUUID(),
    passportId: instance.passportId || instance.id,
    batteryNumber: instance.serial,
    version,
    publishedAt: new Date().toISOString(),
    ruleVersion: RULE_VERSION,
    company: structuredClone(
      db.models.find((m) => m.id === instance.modelId)?.company || db.company,
    ),
    model: structuredClone(db.models.find((m) => m.id === instance.modelId)),
    instance: structuredClone(instance),
    page: structuredClone(
      db.publishedPageOverride || db.pageDrafts?.[instance.modelId] || null,
    ),
    dataSources: {
      materialId: instance.materialId || null,
      productionBatchId: instance.productionBatchId || null,
    },
    productionBatch: structuredClone(db.resolvedProductionBatch || null),
    documents: structuredClone(
      db.documents.filter(
        (d) => d.target === instance.id || d.target === instance.modelId,
      ),
    ),
    events: structuredClone(
      db.events.filter((e) => e.instanceId === instance.id),
    ),
    rules: structuredClone(db.rules),
  };
}
export function latest(db, id) {
  return db.versions
    .filter((v) => v.passportId === id || v.instance?.id === id)
    .sort((a, b) => b.version - a.version)[0];
}
export function applicable(rule, model) {
  return (
    rule.categories.includes(model?.type) && templateIncludes(rule, model) &&
    (!rule.condition || !!model?.[rule.condition])
  );
}
export function check(db, instance) {
  const model = db.models.find((m) => m.id === instance.modelId);
  if (!model) return ["关联型号不存在"];
  const data = { company: model.company || db.company, model, instance };
  const missingCustom = (model.customFields || []).filter(f => f.required && !String((f.level === 'product' ? model.customValues : f.level === 'batch' ? db.productionBatches?.find(b => b.id === instance.productionBatchId)?.customValues : instance.customValues)?.[f.id] ?? '').trim()).map(f => f.label);
  return db.rules
    .filter(
      (r) =>
        applicable(r, model) &&
        (r.required === "必填" || r.required === "条件适用"),
    )
    .filter((r) => {
      const [owner, key] = r.code.split(".");
      const value = data[owner]?.[key];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (r.unit &&
          (!Number.isFinite(Number(value)) ||
            (key === "cycles" ? Number(value) < 0 : Number(value) <= 0)))
      );
    })
    .map((r) => r.zh).concat(missingCustom);
}
export const batchCode = (format, date = new Date()) =>
  format
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", String(date.getMonth() + 1).padStart(2, "0"))
    .replace("DD", String(date.getDate()).padStart(2, "0"));
export const makePassportId = (rule, batch, sequence) =>
  `${rule.prefix}-${batch}-${String(sequence).padStart(rule.sequenceWidth, "0")}`;
export const resolverUrl = (base, passportId) =>
  `${base.replace(/\/$/, "")}/passport/${encodeURIComponent(passportId)}`;
export function ensureCodeData(db) {
  db.codeBatches ||= [];
  db.codeRecords ||= [];
  db.printJobs ||= [];
  db.importJobs ||= [];
  db.models.forEach((m) => {
    m.codeRule ||= {
      prefix:
        "QY-" +
        (m.type === "电动汽车"
          ? "EV"
          : m.type === "轻型交通工具"
            ? "LMT"
            : "ESS"),
      batchFormat: "YYYYMM",
      sequenceWidth: 6,
      nextSequence: 1,
    };
  });
  db.company.resolverBaseUrl ||= "https://passport-demo.example.invalid";
  if (!db.codeRecords.length) {
    db.instances
      .filter((instance) => latest(db, instance.passportId || instance.id))
      .forEach((instance) => {
        const model = db.models.find((item) => item.id === instance.modelId);
        if (!model) return;
        const rule = model.codeRule;
        const storedSequence = Number(
          instance.passportId?.match(/(\d+)$/)?.[1],
        );
        const sequence =
          Number.isInteger(storedSequence) && storedSequence > 0
            ? storedSequence
            : rule.nextSequence++;
        const passportId =
          instance.passportId ||
          makePassportId(rule, batchCode(rule.batchFormat), sequence);
        instance.passportId = passportId;
        const codeBatchId = id("BATCH-MIG");
        const date = new Date(instance.date || Date.now());
        const codeBatch = batchCode(rule.batchFormat, date);
        db.codeBatches.push({
          id: codeBatchId,
          modelId: model.id,
          batchCode: codeBatch,
          count: 1,
          startSequence: sequence,
          endSequence: sequence,
          status: "已完成",
          ruleSnapshot: { ...rule, batchFormat: codeBatch },
          createdAt: new Date().toISOString(),
        });
        db.codeRecords.push({
          id: id("CODE-MIG"),
          batchId: codeBatchId,
          passportId,
          modelId: model.id,
          instanceId: instance.id,
          enterpriseSerial: instance.serial,
          productionDate: instance.date,
          status: "已激活",
          resolverUrl: resolverUrl(db.company.resolverBaseUrl, passportId),
          createdAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
          voidReason: "",
          voidedAt: "",
          ruleSnapshot: { ...rule, batchFormat: codeBatch },
        });
      });
    db.versions.forEach((version) => {
      const instance = db.instances.find(
        (item) => item.id === version.instance?.id,
      );
      if (instance) version.passportId = instance.passportId || instance.id;
    });
    db.requests.forEach((request) => {
      const instance = db.instances.find(
        (item) => item.id === request.passportId,
      );
      if (instance?.passportId) request.passportId = instance.passportId;
    });
  }
  db.models.forEach((model) => {
    const width = Number(model.codeRule.sequenceWidth) || 6;
    const escapedPrefix = model.codeRule.prefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const sequencePattern = new RegExp("^" + escapedPrefix + "-.+-(\\d+)$");
    const recordedSequence = Math.max(
      0,
      ...db.codeRecords
        .filter((code) => code.modelId === model.id)
        .map((code) =>
          Number(code.passportId.match(sequencePattern)?.[1] || 0),
        ),
    );
    const reservedSequence = Math.max(
      0,
      ...db.codeBatches
        .filter((batch) => batch.modelId === model.id)
        .map((batch) => Number(batch.endSequence) || 0),
    );
    model.codeRule.nextSequence = Math.max(
      Number(model.codeRule.nextSequence) || 1,
      recordedSequence + 1,
      reservedSequence + 1,
    );
  });
  return db;
}
let sequence = 0;
export const id = (prefix) => {
  sequence = (sequence + 1) % 0x100000000;
  const random =
    globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() ||
    sequence.toString(16).padStart(8, "0").toUpperCase();
  return prefix + "-" + random;
};
export function log(db, action, detail) {
  db.logs.unshift({
    id: id("LOG"),
    time: new Date().toISOString(),
    action,
    detail,
  });
  return db;
}
export const repository = {
  async open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("dianchi-passport", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("state");
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  },
  async read() {
    const db = await this.open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction("state");
        const req = tx.objectStore("state").get("app");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } finally {
      db.close();
    }
  },
  async write(value) {
    const db = await this.open();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction("state", "readwrite");
        tx.objectStore("state").put(value, "app");
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  },
};
export function validateImport(value) {
  if (
    !value ||
    value.schemaVersion !== 1 ||
    !value.company ||
    typeof value.company.name !== "string"
  )
    throw Error("不支持的数据结构或版本");
  for (const key of [
    "models",
    "instances",
    "versions",
    "documents",
    "requests",
    "events",
    "logs",
    "rules",
  ])
    if (!Array.isArray(value[key])) throw Error("缺少数据集合：" + key);
  if (
    value.models.some((m) => !m.id || !m.name || !categories.includes(m.type))
  )
    throw Error("型号数据无效");
  if (new Set(value.models.map((m) => m.id)).size !== value.models.length)
    throw Error("型号 ID 重复");
  if (
    value.instances.some(
      (i) =>
        !i.id ||
        !i.serial ||
        !value.models.some((m) => m.id === i.modelId) ||
        !["在役", "再利用", "再制造", "已回收"].includes(i.state) ||
        !["草稿", "待审核", "已发布"].includes(i.status),
    )
  )
    throw Error("实例、状态或关联型号无效");
  if (
    new Set(value.instances.map((m) => m.id)).size !== value.instances.length ||
    new Set(value.instances.map((m) => m.serial)).size !==
      value.instances.length
  )
    throw Error("实例 ID 或序列号重复");
  if (
    new Set(value.rules.map((r) => r.code)).size !== value.rules.length ||
    fields.some(f => !value.rules.some(r => r.code === f.code)) ||
    value.rules.some(
      (r) =>
        ![...fields, ...extraFields].some((f) => f.code === r.code) ||
        !Array.isArray(r.categories) ||
        r.categories.some((c) => !categories.includes(c)) ||
        !["必填", "条件适用", "后续适用", "不适用"].includes(r.required) ||
        (r.dataType !== undefined && !fieldDataTypes.includes(r.dataType)),
    )
  )
    throw Error("字段规则无效");
  if (
    value.rules.some(
      (r) => [...fields, ...extraFields].find((f) => f.code === r.code)?.access !== r.access,
    )
  )
    throw Error("不能改变字段的公开/受限分类");
  if (
    value.versions.some(
      (v) =>
        !v.model ||
        !v.instance ||
        !v.company ||
        !Array.isArray(v.documents) ||
        !Array.isArray(v.events) ||
        !Array.isArray(v.rules) ||
        !value.instances.some((i) => (i.passportId || i.id) === v.passportId),
    )
  )
    throw Error("发布快照无效");
  if (
    value.requests.some(
      (r) =>
        !r.id ||
        !value.instances.some((i) => (i.passportId || i.id) === r.passportId) ||
        !["待处理", "已批准", "已拒绝", "已撤销"].includes(r.status),
    ) ||
    value.events.some(
      (e) => !value.instances.some((i) => i.id === e.instanceId),
    ) ||
    value.documents.some((d) => !d.id || !["公开", "受限"].includes(d.access))
  )
    throw Error("文件、访问申请或事件数据无效");
  if (
    value.codeRecords &&
    value.codeRecords.some(
      (c) =>
        !c.passportId ||
        !c.batchId ||
        !["待用", "已分配", "已激活", "作废"].includes(c.status) ||
        !value.models.some((m) => m.id === c.modelId) ||
        !value.codeBatches?.some((b) => b.id === c.batchId) ||
        (["已分配", "已激活"].includes(c.status) &&
          !value.instances.some((i) => i.id === c.instanceId)),
    )
  )
    throw Error("码记录无效");
  if (
    value.codeRecords &&
    (new Set(value.codeRecords.map((c) => c.passportId)).size !==
      value.codeRecords.length ||
      new Set(
        value.codeRecords
          .filter((c) => c.instanceId && c.status !== "作废")
          .map((c) => c.instanceId),
      ).size !==
        value.codeRecords.filter((c) => c.instanceId && c.status !== "作废")
          .length)
  )
    throw Error("护照编号或单体绑定重复");
  if (
    value.codeBatches &&
    value.codeBatches.some(
      (b) =>
        !b.id ||
        !value.models.some((m) => m.id === b.modelId) ||
        !Number.isInteger(b.count) ||
        b.count < 1 ||
        !Number.isInteger(b.startSequence) ||
        !Number.isInteger(b.endSequence) ||
        b.endSequence - b.startSequence + 1 !== b.count,
    )
  )
    throw Error("码批次无效");
  if (
    value.codeBatches &&
    new Set(value.codeBatches.map((b) => b.id)).size !==
      value.codeBatches.length
  )
    throw Error("码批次 ID 重复");
  return value;
}
export function download(name, content, type = "text/plain") {
  const url = URL.createObjectURL(
    content instanceof Blob ? content : new Blob([content], { type }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
