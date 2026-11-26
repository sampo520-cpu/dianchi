import test from "node:test";
import assert from "node:assert/strict";
import { createSeed, latest } from "./data.js";
import {evidenceIssues} from './field-map.js';
test('evidence matches factory and period and requires explicit ambiguous selection',()=>{const db=ensureWorkflow(createSeed()),m=db.models[0];m.carbonApplicable=true;assert.ok(evidenceIssues(db,m.id,'A','2026-11-22').length);db.applicableMaterials=[{id:'E1',modelId:m.id,kind:'carbon',factory:'A',from:'2026-01-01',to:'2026-12-31',value:'10 kg CO2e'},{id:'E2',modelId:m.id,kind:'carbon',factory:'A',from:'2026-01-01',to:'2026-12-31',value:'11 kg CO2e'}];assert.ok(evidenceIssues(db,m.id,'A','2026-11-22').length);assert.equal(evidenceIssues(db,m.id,'A','2026-11-22',{carbon:'E1'}).length,0);assert.ok(evidenceIssues(db,m.id,'B','2026-11-22',{carbon:'E1'}).length)});
import {
  ensureWorkflow,
  createProduction,
  publishBatch,
  addMeasurements,
  saveMaterialVersion,
  validateRows,
  syncSimplePassports,
} from "./workflow.js";
test("readiness plans initialize in local workspace data", () => {
  const db=ensureWorkflow(createSeed());
  assert.deepEqual(db.readinessPlans,[]);
});

test("company information is isolated per product in published passports", () => {
  const db = ensureWorkflow(createSeed());
  const first = db.models[0],
    other = db.models[1];
  const original = other.company.name;
  first.company.name = "Product-specific manufacturer";
  const firstInstance = db.instances.find((i) => i.modelId === first.id);
  const before = structuredClone(db);
  before.models[0].company.name = "Old manufacturer";
  syncSimplePassports(db, before);
  assert.equal(
    latest(db, firstInstance.id).company.name,
    "Product-specific manufacturer",
  );
  assert.equal(other.company.name, original);
  assert.notEqual(first.company, other.company);
});
test("batch rule overrides are frozen and duplicates are rejected before creation", () => {
  const db = ensureWorkflow(createSeed()),
    m = db.models[0],
    material = db.materialVersions[0],
    start = m.codeRule.nextSequence;
  const input = {
    modelId: m.id,
    materialId: material.id,
    name: "202611-A",
    numberingBatch: "202611-A",
    date: "2026-11-22",
    factory: "Test factory",
    mode: "generate",
    count: 2,
    rows: [],
    rule: { ...m.codeRule, prefix: "TEST", nextSequence: start },
  };
  const batch = createProduction(db, input);
  const battery = db.instances.find((i) => i.productionBatchId === batch.id);
  assert.equal(
    battery.serial,
    `TEST-202611-A-${String(start).padStart(6, "0")}`,
  );
  assert.equal(batch.factory, "Test factory");
  m.codeRule.prefix = "CHANGED";
  assert.equal(batch.ruleSnapshot.prefix, "TEST");
  const before = JSON.stringify(db);
  assert.throws(() => createProduction(db, input), /重复/);
  assert.equal(JSON.stringify(db), before);
});
test("simple flow generates accessible passports and updates without changing links", () => {
  const { db, instance } = setup();
  const before = structuredClone(db);
  before.instances = before.instances.filter((i) => i.id !== instance.id);
  syncSimplePassports(db, before);
  const link = instance.passportId;
  assert.ok(latest(db, instance.id));
  const old = structuredClone(latest(db, instance.id));
  const prior = structuredClone(db);
  db.models.find((m) => m.id === instance.modelId).voltage = 888;
  syncSimplePassports(db, prior);
  assert.equal(instance.passportId, link);
  assert.equal(latest(db, instance.id).model.voltage, old.model.voltage);
  assert.equal(
    db.versions.find((v) => v.id === old.id).model.voltage,
    old.model.voltage,
  );
});
function setup() {
  const db = ensureWorkflow(createSeed()),
    material = db.materialVersions[0];
  const batch = createProduction(db, {
    modelId: material.modelId,
    materialId: material.id,
    name: "TEST-A",
    factory: "Factory",
    date: "2026-11-20",
    rows: [
      { serial: "QA-001", date: "2026-11-20" },
      { serial: "QA-002", date: "2026-11-20" },
    ],
  });
  return {
    db,
    batch,
    instance: db.instances.find((i) => i.serial === "QA-001"),
  };
}
test("batch creates unique identities and publishes independently", () => {
  const { db, batch } = setup();
  assert.equal(
    new Set(db.codeRecords.map((c) => c.passportId)).size,
    db.codeRecords.length,
  );
  assert.equal(publishBatch(db, batch.id), 2);
  assert.equal(
    db.codeRecords.filter(
      (c) => c.batchId === batch.codeBatchId && c.status === "已激活",
    ).length,
    2,
  );
});
test("shared draft changes do not change selected material or published snapshots", () => {
  const { db, batch, instance } = setup();
  publishBatch(db, batch.id);
  const old = structuredClone(latest(db, instance.id));
  db.models[0].voltage = 999;
  saveMaterialVersion(db, db.models[0].id);
  assert.equal(latest(db, instance.id).model.voltage, old.model.voltage);
  addMeasurements(
    db,
    [
      {
        serial: instance.serial,
        soh: "97",
        cycles: "10",
        measuredAt: "2026-11-19T00:00:00Z",
      },
    ],
    "BMS",
  );
  assert.equal(instance.status, "草稿");
  assert.equal(latest(db, instance.id).instance.soh, old.instance.soh);
  assert.equal(publishBatch(db, batch.id), 1);
  assert.equal(latest(db, instance.id).instance.soh, 97);
  assert.equal(latest(db, instance.id).model.voltage, old.model.voltage);
});
test("duplicate serials and invalid measurement batches leave data unchanged", () => {
  const { db, instance } = setup();
  assert.ok(
    validateRows(
      db,
      [{ serial: instance.serial, date: "2026-11-20" }],
      instance.modelId,
    )[0].error,
  );
  const before = JSON.stringify(db);
  assert.throws(() =>
    addMeasurements(
      db,
      [
        {
          serial: instance.serial,
          soh: "95",
          cycles: "12",
          measuredAt: "2026-11-19T00:00:00Z",
        },
        {
          serial: "UNKNOWN",
          soh: "90",
          cycles: "10",
          measuredAt: "2026-11-19T00:00:00Z",
        },
      ],
      "BMS",
    ),
  );
  assert.equal(JSON.stringify(db), before);
});
test("late historical measurements do not replace the newest reading", () => {
  const { db, instance } = setup();
  addMeasurements(
    db,
    [
      {
        serial: instance.serial,
        soh: "97",
        cycles: "12",
        measuredAt: "2026-11-19T00:00:00Z",
      },
    ],
    "BMS",
  );
  addMeasurements(
    db,
    [
      {
        serial: instance.serial,
        soh: "99",
        cycles: "2",
        measuredAt: "2026-11-18T00:00:00Z",
      },
    ],
    "Archive",
  );
  assert.equal(instance.soh, 97);
  assert.equal(db.measurements.length, 2);
});
test("platform generation uses one battery number and a hidden resolver ID", () => {
  const db = ensureWorkflow(createSeed()),
    model = db.models[0],
    material = db.materialVersions[0];
  const batch = createProduction(db, {
    mode: "generate",
    count: 2,
    modelId: model.id,
    materialId: material.id,
    name: "AUTO-A",
    date: "2026-11-20",
    factory: "Factory",
    rows: [],
  });
  const [a, b] = db.instances.filter((i) => i.productionBatchId === batch.id);
  assert.equal(a.serial, a.passportId);
  assert.equal(
    a.passportId,
    db.codeRecords.find((c) => c.instanceId === a.id).passportId,
  );
  assert.equal(Number(model.codeRule.nextSequence), 4);
  assert.equal(b.serial, "QY-ESS-202611-000003");
});
test("published page layout is frozen independently of later edits", () => {
  const { db, batch, instance } = setup();
  db.pageDrafts[instance.modelId] = {
    enabled: ["en"],
    hidden: [],
    order: [0, 1, 2, 3, 4],
    translations: { en: { status: "已审核", values: {} } },
  };
  publishBatch(db, batch.id);
  const frozen = latest(db, instance.id).page;
  db.pageDrafts[instance.modelId].order.reverse();
  assert.deepEqual(latest(db, instance.id).page.order, frozen.order);
});
