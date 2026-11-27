import React, { useState } from "react";
import { PassportSurface } from "./page-editor";
import { id, snapshot, log, categories } from "./data";
import { inferFieldDataType } from "./field-types.js";
import { extraFields, criticalKeys } from "./field-map";
import { templates, euScope } from "./templates.js";
import { CustomValues } from "./custom-fields";
import RichEditor from "./rich-editor";
import ProductReferenceFields from "./product-reference-fields";
import { BatteryMarkingEditor } from "./battery-symbols.jsx";
import { passportLanguages } from "./passport-locales.js";
import { passportThemes, safePassportTheme } from "./passport-themes.js";
import ProductLanguages from "./product-languages.jsx";
import {
  passportFieldCatalog,
  passportTemplates,
} from "./passport-field-catalog.js";
import {
  libraryTemplates,
  productTemplate,
  templateSnapshot,
  aliases,
  templateSections,
} from "./template-library.js";
export default function ProductForm({ db, change, close, done, value }) {
  const [form, F] = useState(() =>
    structuredClone(
      value || {
        id: id("MOD"),
        name: "",
        type: categories[0],
        template: "generic",
        customFields: [],
        enabledLanguages: ["en"],
        defaultLanguage: "en",
        displaySections: [0, 1, 2, 3, 4],
        sectionLabels: {},
        chem: "LFP",
        energy: "",
        capacity: "",
        voltage: "",
        weight: "",
        company: structuredClone(db.company),
        codeRule: {
          prefix: "QY-ESS",
          batchFormat: "YYYYMM",
          sequenceWidth: 6,
          nextSequence: 1,
        },
        passportFields: [],
      },
    ),
  );
  const [selected, S] = useState("model.name");
  const fields = [
    ["company.name", "制造商名称"],
    ["company.address", "制造商地址"],
    ["company.factory", "默认生产工厂"],
    ["company.contact", "联系邮箱"],
    ["company.operator", "责任主体"],
    ["company.operatorAddress", "责任主体地址"],
    ["model.name", "产品名称"],
    ["model.chem", "化学体系"],
    ["model.energy", "额定能量 kWh"],
    ["model.capacity", "额定容量 Ah"],
    ["model.voltage", "额定电压 V"],
    ["model.weight", "重量 kg"],
    ...extraFields
      .filter(
        (r) =>
          r.level === "model" && !["materials"].includes(r.code.split(".")[1]),
      )
      .map((r) => [r.code, r.zh]),
  ];
  const set = (code, v) => {
    const [owner, key] = code.split(".");
    F(
      owner === "company"
        ? { ...form, company: { ...form.company, [key]: v } }
        : { ...form, [key]: v },
    );
  };
  const [templateChosen, TC] = useState(!!value);
  const selectedPassportTemplate = productTemplate(db, form);
  const selectedPassportFields = selectedPassportTemplate.fields.filter(
    (f) => !f.code && !aliases[f.id],
  );
  const setPassportField = (fieldId, key, value) => {
    const current = form.passportFields || [],
      existing = current.find((field) => field.id === fieldId),
      definition = selectedPassportFields.find((field) => field.id === fieldId);
    F({
      ...form,
      passportFieldOverrides: db.passportFieldOverrides || {},
      passportFields: existing
        ? current.map((field) =>
            field.id === fieldId ? { ...field, [key]: value } : field,
          )
        : [
            ...current,
            { id: fieldId, label: definition.label, value: "", [key]: value },
          ],
    });
  };
  const preview = snapshot(
    { ...db, models: db.models.filter((m) => m.id !== form.id).concat(form) },
    {
      id: "PREVIEW",
      modelId: form.id,
      serial: "EXAMPLE-000001",
      date: "2026-01-01",
    },
    1,
  );
  async function save(generate) {
    if (!form.name.trim()) return;
    const ok = await change((d) => {
      if (
        value &&
        d.instances.some((i) => i.modelId === value.id) &&
        criticalKeys.some((k) => String(form[k]) !== String(value[k]))
      )
        throw Error("已有电池的关键规格不可直接覆盖，请复制为新产品后生码");
      const n = d.models.findIndex((m) => m.id === form.id);
      const saved = {
        ...form,
        templateConfig: structuredClone(selectedPassportTemplate),
        passportFieldOverrides: Object.fromEntries(
          selectedPassportTemplate.fields.map((f) => [
            f.id,
            { translatable: f.translatable },
          ]),
        ),
      };
      if (n >= 0) d.models[n] = saved;
      else d.models.push(saved);
      log(d, "保存产品资料", form.name);
    }, "产品资料已保存");
    if (ok) done(form.id, generate);
  }
  if (!templateChosen)
    return (
      <>
        <div className="page-title">
          <div>
            <h1>选择产品资料模板</h1>
          </div>
          <button className="outline" onClick={close}>
            返回
          </button>
        </div>
        <section className="support-card-grid">
          {libraryTemplates(db).map((t) => (
            <button
              key={t.id}
              className="support-card"
              onClick={() => {
                F({
                  ...form,
                  template: t.baseType,
                  euPassportTemplate: t.id,
                  templateConfig: templateSnapshot(db, t),
                });
                TC(true);
              }}
            >
              <strong>{t.name}</strong>
              <span>{t.description}</span>
              <small>
                {t.fieldIds.length} 个字段 · v{t.version}
              </small>
            </button>
          ))}
        </section>
      </>
    );
  return (
    <>
      <div className="page-title">
        <div>
          <h1>{value ? "编辑产品固定资料" : "新建产品"}</h1>
          <p>产品级预览 · 批次、生产日期和编号使用示例占位</p>
        </div>
        <div className="title-actions">
          <button className="outline" onClick={close}>
            返回
          </button>
          <button
            className="outline"
            disabled={!form.name.trim()}
            onClick={() => save(false)}
          >
            保存产品
          </button>
          <button
            className="primary"
            disabled={!form.name.trim()}
            onClick={() => save(true)}
          >
            保存并新建批次
          </button>
        </div>
      </div>
      {!value && (
        <label className="form-field">
          复制已有产品
          <select
            defaultValue=""
            onChange={(e) => {
              const m = db.models.find((m) => m.id === e.target.value);
              if (m)
                F({
                  ...structuredClone(m),
                  id: form.id,
                  name: m.name + " copy",
                  codeRule: { ...m.codeRule, nextSequence: 1 },
                });
            }}
          >
            <option value="">空白产品</option>
            {db.models
              .filter((m) => !m.demoArchived)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </label>
      )}
      <div className="product-form-layout">
        <div className="pe-preview">
          <PassportSurface
            version={preview}
            db={db}
            edit
            previewDevice
            onSelect={(s) => {
              if (s.rule) {
                S(s.rule.code);
                document.getElementById("pf-" + s.rule.code)?.focus();
              }
            }}
            selectedCode={selected}
          />
        </div>
        <form
          className="product-form-fields"
          onSubmit={(e) => {
            e.preventDefault();
            save(false);
          }}
        >
          <p>修改仅影响本产品及关联批次；其他产品独立保存。</p>
          <label className="form-field">
            资料模板
            <select
              value={form.euPassportTemplate || selectedPassportTemplate.id}
              onChange={(e) => {
                const t = libraryTemplates(db).find(
                  (t) => t.id === e.target.value,
                );
                F({
                  ...form,
                  template: t.baseType,
                  euPassportTemplate: t.id,
                  templateConfig: templateSnapshot(db, t),
                });
              }}
            >
              {libraryTemplates(db).map((t) => (
                <option value={t.id} key={t.id}>
                  {t.name} · v{t.version}
                </option>
              ))}
            </select>
          </label>
          {(
            <section className="passport-field-entry">
              <h2>模板资料</h2>
              <p>
                {selectedPassportTemplate.name} ·{" "}
                {selectedPassportTemplate.fieldIds.length}{" "}
                个数据点。根据类别和适用条件填写；此目录用于结构化维护，字段清单不代表所有项目均适用。
              </p>
              {selectedPassportFields.filter(f=>f.maintenance==='product').map((field) => {
                const stored = (form.passportFields || []).find(
                  (item) => item.id === field.id,
                );
                return (
                  <label className="form-field" key={field.id}>
                    {field.label}
                    <small>
                      {field.source} · {field.dataType}
                      {field.translatable ? " · 需翻译" : ""}
                    </small>
                    {field.dataType === "长文本" ? (
                      <textarea
                        value={stored?.value || ""}
                        onChange={(e) =>
                          setPassportField(field.id, "value", e.target.value)
                        }
                        rows={3}
                      />
                    ) : (
                      <input
                        type={
                          field.dataType === "数值"
                            ? "number"
                            : field.dataType === "日期"
                              ? "date"
                              : "text"
                        }
                        step={field.dataType === "数值" ? "any" : undefined}
                        value={stored?.value || ""}
                        onChange={(e) =>
                          setPassportField(field.id, "value", e.target.value)
                        }
                      />
                    )}
                  </label>
                );
              })}
              <p>批次与单体字段在对应层级维护：{selectedPassportTemplate.fields.filter(f=>f.maintenance!=='product').map(f=>f.label).join('、')}</p>
              <h3>客户扩展字段</h3>
              {(form.passportCustomFields || []).map((field, index) => (
                <div className="passport-custom-field" key={field.id}>
                  <label className="form-field">
                    字段名称
                    <input
                      value={field.label}
                      onChange={(e) =>
                        F({
                          ...form,
                          passportCustomFields: form.passportCustomFields.map(
                            (item, i) =>
                              i === index
                                ? { ...item, label: e.target.value }
                                : item,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="form-field">
                    数据类型
                    <select
                      value={field.dataType}
                      onChange={(e) =>
                        F({
                          ...form,
                          passportCustomFields: form.passportCustomFields.map(
                            (item, i) =>
                              i === index
                                ? { ...item, dataType: e.target.value }
                                : item,
                          ),
                        })
                      }
                    >
                      {["文本", "数值", "长文本", "日期"].map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!field.translatable}
                      onChange={(e) =>
                        F({
                          ...form,
                          passportCustomFields: form.passportCustomFields.map(
                            (item, i) =>
                              i === index
                                ? { ...item, translatable: e.target.checked }
                                : item,
                          ),
                        })
                      }
                    />
                    内容需要翻译
                  </label>
                  <label className="form-field">
                    字段值
                    <input
                      value={field.value || ""}
                      onChange={(e) =>
                        F({
                          ...form,
                          passportCustomFields: form.passportCustomFields.map(
                            (item, i) =>
                              i === index
                                ? { ...item, value: e.target.value }
                                : item,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                className="outline"
                onClick={() =>
                  F({
                    ...form,
                    passportCustomFields: [
                      ...(form.passportCustomFields || []),
                      {
                        id: id("DPP-FIELD"),
                        label: "",
                        dataType: "文本",
                        value: "",
                        translatable: false,
                      },
                    ],
                  })
                }
              >
                添加护照扩展字段
              </button>
            </section>
          )}
          <p>{euScope(form)} 使用二维码或选择模板不代表通过合规认证。</p>
          <label className="form-field">
            电池类别
            <select
              disabled={
                !!value && db.instances.some((i) => i.modelId === value.id)
              }
              value={form.type}
              onChange={(e) => F({ ...form, type: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {fields
            .filter(
              ([code]) =>
                selectedPassportTemplate.fields.some(
                  (f) => (aliases[f.id] || f.id) === code,
                ) || ["model.name", "company.factory"].includes(code),
            )
            .map(([code, label]) => {
              const [owner, key] = code.split(".");
              const rule = db.rules.find(
                (r) => r.code === code.replace(/En$/, ""),
              );
              const dataType =
                rule?.dataType || inferFieldDataType(code, rule?.unit);
              const currentValue =
                (owner === "company" ? form.company : form)[key] || "";
              const setValue = (next) => set(code, next);
              return (
                <label className="form-field" key={code}>
                  {label}
                  <small>
                    {code.startsWith("company.")
                      ? "产品责任信息"
                      : `产品资料 · ${dataType}`}
                  </small>
                  {dataType === "长文本" ? (
                    <textarea
                      readOnly={
                        !!value &&
                        db.instances.some((i) => i.modelId === value.id) &&
                        criticalKeys.includes(key)
                      }
                      id={"pf-" + code}
                      value={currentValue}
                      onFocus={() => S(code)}
                      onChange={(e) => setValue(e.target.value)}
                      rows={3}
                    />
                  ) : dataType === "布尔值" ? (
                    <select
                      id={"pf-" + code}
                      value={currentValue}
                      onFocus={() => S(code)}
                      onChange={(e) => setValue(e.target.value)}
                    >
                      <option value="">请选择</option>
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  ) : (
                    <input
                      type={
                        dataType === "数值"
                          ? "number"
                          : dataType === "日期"
                            ? "date"
                            : "text"
                      }
                      step={dataType === "数值" ? "any" : undefined}
                      readOnly={
                        !!value &&
                        db.instances.some((i) => i.modelId === value.id) &&
                        criticalKeys.includes(key)
                      }
                      id={"pf-" + code}
                      value={currentValue}
                      onFocus={() => S(code)}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  )}
                </label>
              );
            })}
          {value && db.instances.some((i) => i.modelId === value.id) && (
            <p>
              化学体系、类别、能量、容量、电压已关联实物，需创建新产品承接规格变化；联系方式和说明文件可直接更新。
            </p>
          )}
          <div className="section-divider" />
          <h2>产品图文资料</h2>
          <label className="form-field">
            扫码页配色模板
            <select
              aria-label="扫码页配色模板"
              value={safePassportTheme(form.passportTheme)}
              onChange={(e) => F({ ...form, passportTheme: e.target.value })}
            >
              {passportThemes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="passport-theme-options">
            {passportThemes.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={safePassportTheme(form.passportTheme) === t.id}
                onClick={() => F({ ...form, passportTheme: t.id })}
              >
                <i style={{ background: t.color }} />
                {t.name}
              </button>
            ))}
          </div>
          <RichEditor
            label="产品概览"
            value={form.productOverviewEn || ""}
            onChange={(v) => F({ ...form, productOverviewEn: v })}
          />
          <RichEditor
            label="安全警示与使用注意"
            value={form.safetyEn || ""}
            onChange={(v) => F({ ...form, safetyEn: v })}
          />
          <RichEditor
            label="注意事项（黄色提示）"
            value={form.cautionEn || ""}
            onChange={(v) => F({ ...form, cautionEn: v })}
          />
          <RichEditor
            label="废电池处置与回收"
            value={form.wasteEn || ""}
            onChange={(v) => F({ ...form, wasteEn: v })}
          />
          <RichEditor
            label="灭火介质与应急说明"
            value={form.extinguishingEn || ""}
            onChange={(v) => F({ ...form, extinguishingEn: v })}
          />
          <ProductReferenceFields form={form} onChange={F} />
          <div className="section-divider" />
          <h2>性能测试数据</h2>
          <p>
            每行记录测试项目、结果、单位和测试条件；声明值需关联真实测试依据。
          </p>
          {(form.characteristics || []).map((row, index) => (
            <div className="spec-row-editor" key={row.id || index}>
              {["name", "value", "unit", "condition", "note"].map((key, n) => (
                <label className="form-field" key={key}>
                  {
                    ["测试项目", "测试结果", "单位", "测试条件", "说明 / 依据"][
                      n
                    ]
                  }
                  <input
                    value={row[key] || ""}
                    onChange={(e) =>
                      F({
                        ...form,
                        characteristics: form.characteristics.map((r, i) =>
                          i === index ? { ...r, [key]: e.target.value } : r,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  F({
                    ...form,
                    characteristics: form.characteristics.filter(
                      (_, i) => i !== index,
                    ),
                  })
                }
              >
                删除
              </button>
            </div>
          ))}
          <button
            type="button"
            className="outline"
            onClick={() =>
              F({
                ...form,
                characteristics: [
                  ...(form.characteristics || []),
                  {
                    id: id("TEST"),
                    name: "",
                    value: "",
                    unit: "",
                    condition: "",
                    note: "",
                  },
                ],
              })
            }
          >
            添加测试项目
          </button>
          <div className="section-divider" />
          <BatteryMarkingEditor
            form={form}
            onChange={F}
            documents={db.documents}
          />
          <div className="section-divider" />
          <h2>扫码页展示设置</h2>
          <p>
            选择这个产品开放的语言和要显示的资料分区。产品内容值保持录入原文。
          </p>
          <fieldset className="product-display-options">
            <legend>扫码页语言</legend>
            <div>
              {Object.entries(passportLanguages).map(([code, name]) => (
                <label key={code}>
                  <input
                    type="checkbox"
                    checked={(form.enabledLanguages || ["en"]).includes(code)}
                    disabled={code === "en"}
                    onChange={(e) => {
                      const enabledLanguages = e.target.checked
                        ? [...(form.enabledLanguages || ["en"]), code]
                        : (form.enabledLanguages || ["en"]).filter(
                            (x) => x !== code,
                          );
                      F({
                        ...form,
                        enabledLanguages,
                        defaultLanguage: enabledLanguages.includes(
                          form.defaultLanguage,
                        )
                          ? form.defaultLanguage
                          : "en",
                      });
                    }}
                  />
                  {name}
                </label>
              ))}
            </div>
            <label className="form-field">
              默认显示语言
              <select
                value={
                  (form.enabledLanguages || ["en"]).includes(
                    form.defaultLanguage,
                  )
                    ? form.defaultLanguage
                    : "en"
                }
                onChange={(e) =>
                  F({ ...form, defaultLanguage: e.target.value })
                }
              >
                {(form.enabledLanguages || ["en"]).map((code) => (
                  <option key={code} value={code}>
                    {passportLanguages[code]}
                  </option>
                ))}
              </select>
            </label>
            <small>
              扫码后先显示默认语言，访客仍可切换已开放语言。语言只影响界面、参数名和分区名，产品内容保留原文。新批次自动沿用此产品设置。
            </small>
          </fieldset>
          <div className="product-section-labels">
            <strong>分区多语言名称</strong>
            {[
              "Battery identity",
              "Technical specifications",
              "Materials & sustainability",
              "Documents",
              "Lifecycle",
            ].map((key, index) => (
              <details key={key}>
                <summary>
                  {
                    [
                      "身份信息",
                      "技术参数",
                      "材料与可持续信息",
                      "文件资料",
                      "使用与生命周期",
                    ][index]
                  }
                </summary>
                {(form.enabledLanguages || ["en"]).map((code) => (
                  <label className="form-field" key={code}>
                    {passportLanguages[code]}
                    <input
                      value={
                        form.sectionLabels?.[code]?.[index] ??
                        passportResources[code]?.translation?.[key] ??
                        key
                      }
                      onChange={(e) =>
                        F({
                          ...form,
                          sectionLabels: {
                            ...form.sectionLabels,
                            [code]: {
                              ...form.sectionLabels?.[code],
                              [index]: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </details>
            ))}
          </div>
          <fieldset className="product-display-options">
            <legend>展示分区</legend>
            <div>
              {[
                "身份信息",
                "技术参数",
                "材料与可持续信息",
                "文件资料",
                "使用与生命周期",
              ].map((name, index) => (
                <label key={name}>
                  <input
                    type="checkbox"
                    checked={(form.displaySections || [0, 1, 2, 3, 4]).includes(
                      index,
                    )}
                    onChange={(e) =>
                      F({
                        ...form,
                        displaySections: e.target.checked
                          ? [
                              ...(form.displaySections || [0, 1, 2, 3, 4]),
                              index,
                            ]
                          : (form.displaySections || [0, 1, 2, 3, 4]).filter(
                              (x) => x !== index,
                            ),
                      })
                    }
                  />
                  {name}
                </label>
              ))}
            </div>
            <small>
              字段没有填写内容时不会显示；分区没有可显示内容时自动隐藏。
            </small>
          </fieldset>
          <h3>客户扩展字段</h3>
          {(form.customFields || []).map((field, index) => (
            <div key={field.id} className="form-field">
              <label>
                字段名称
                <input
                  value={field.label}
                  onChange={(e) =>
                    F({
                      ...form,
                      customFields: form.customFields.map((f, n) =>
                        n === index ? { ...f, label: e.target.value } : f,
                      ),
                    })
                  }
                />
              </label>
              <label>
                数据类型
                <select
                  value={field.dataType || "文本"}
                  onChange={(e) =>
                    F({
                      ...form,
                      customFields: form.customFields.map((f, n) =>
                        n === index ? { ...f, dataType: e.target.value } : f,
                      ),
                    })
                  }
                >
                  {["文本", "数值", "日期", "长文本", "布尔值"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <select
                aria-label="字段维护层级"
                value={field.level}
                onChange={(e) =>
                  F({
                    ...form,
                    customFields: form.customFields.map((f, n) =>
                      n === index ? { ...f, level: e.target.value } : f,
                    ),
                  })
                }
              >
                <option value="product">产品</option>
                <option value="batch">批次</option>
                <option value="instance">单码</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={!!field.required}
                  onChange={(e) =>
                    F({
                      ...form,
                      customFields: form.customFields.map((f, n) =>
                        n === index ? { ...f, required: e.target.checked } : f,
                      ),
                    })
                  }
                />
                资料提醒必填
              </label>
              <details>
                <summary>多语言字段名称</summary>
                {(form.enabledLanguages || ["en"]).map((code) => (
                  <label className="form-field" key={code}>
                    {passportLanguages[code]}
                    <input
                      value={
                        field.labels?.[code] ||
                        (code === "en" ? field.label : "")
                      }
                      onChange={(e) =>
                        F({
                          ...form,
                          customFields: form.customFields.map((f, n) =>
                            n === index
                              ? {
                                  ...f,
                                  labels: {
                                    ...f.labels,
                                    [code]: e.target.value,
                                  },
                                }
                              : f,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              </details>
            </div>
          ))}
          <button
            type="button"
            className="outline"
            onClick={() =>
              F({
                ...form,
                customFields: [
                  ...(form.customFields || []),
                  {
                    id: id("CUSTOM"),
                    label: "",
                    dataType: "文本",
                    labels: { en: "" },
                    level: "product",
                    required: false,
                  },
                ],
              })
            }
          >
            添加客户字段
          </button>
          <CustomValues
            definitions={form.customFields}
            level="product"
            values={form.customValues}
            onChange={(customValues) => F({ ...form, customValues })}
          />
          <ProductLanguages form={form} onChange={F} />
        </form>
      </div>
    </>
  );
}
