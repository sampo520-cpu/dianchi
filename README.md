# Zhongqi Battery Passport Demo

演示展示精简：主列表保留六款代表产品（工业储能、动力、轻型交通、铅酸 SLI、小容量工业、6F22 一次电池），各补充 5–9 项认证/声明/测试/法规参考。重复内置演示仅设置 `demoArchived`，从产品、批次选择和工作台统计中收起；历史扫码页、批次、单体、文件和用户创建产品均保留。启动迁移幂等，不重复造码或覆盖原图标说明。

2026-11-24 多语言：接入 i18next、react-i18next 和浏览器语言检测，扫码页提供英/德/法/西/意/葡/荷/波/中文。固定栏目有本地译文，产品编辑“多语言内容”维护独立图文译文，空值回退英文并提示；不接外部机器翻译、不声称已完成全部产品翻译。6F22 附中文产品概览、名称和警告示例。语言链接使用 `?lang=zh` 等参数，手动切换后保留选择。数据及二维码、数值、单位不由翻译引擎改写。

CCC、圆形 PSE、UL 元器件认可、UKCA 采用官方参考图样，出处见 `public/MARK-SOURCES.md`。RoHS、REACH 和 (EU) 2023/1542 以法规资料图标呈现；英国电池本身不要求 UKCA，电池本身不在 RoHS 指令范围。各条目的适用性说明与依据独立维护，储能完整示例展示全部参考选项，不代表该示例实际获得这些认证。

图标管理：产品编辑中的“图标与标识管理”提供 19 个内置选项，分为安全与使用注意、回收处置、认证与符合性。可选图标、上传 PNG/JPG/WebP、改分组、编辑说明及删除。认证/声明/测试资料分别记录类型、市场、主体、编号、期限和依据文件；界面不把添加图标视为认证通过。CE 使用既有参考素材，UL 等预设使用通用资料图标，正式图样由企业提供；内置提示图来自现有 Lucide 图标库，不是标准印刷标识原稿。已有标识自动归类并保留图片，示例按一次电池、储能等场景补图，二维码身份不变。

2026-11-24：统一中企品牌（含已有本地资料及显示快照，二维码编号不变）。新增 6F22 9V 参考案例和 3 个码，覆盖参考参数、测试条件、原厂及欧代来源、有害物质/SVHC、关键原材料、警告/注意/应急、回收、法规注释及原厂文件链接。说明文字重新编写，第三方报告不会标记为中企检测认证。产品编辑可维护独立注意事项、声明、法规条款/适用说明/官方链接/资料日期及参考文件。分区使用 Lucide SVG 图标；红/黄/蓝提示含文字和图标，不仅靠颜色区分。

A lightweight, client-side demonstration for battery passport administration and public passport pages. It uses fictional sample records and is not a compliance certification or production access-control system.

## Run

```powershell
npm install
npm run dev
```

Open the Vite URL. The sample workspace is stored in the current browser's IndexedDB. Data does not synchronize to another browser or phone. Use **规则与记录 → 导出数据** to make a local backup; imports replace the current local workspace after validation.

## Demonstration route

Open `/passport/QY-ESS-202611-000001` to view the published sample passport. Use the admin menu to edit the sample model, complete missing fields, submit it for review, and publish a new immutable snapshot. The first publication begins at version 1; later publications preserve prior versions.

The advanced code workspace is retained under **系统设置** for per-model rules, legacy code import/export, A4 3 × 8 demo labels and void history. Daily production batches use the battery number as the public passport identifier. The configured `.invalid` resolver address is explicitly non-production; deploy a real HTTPS resolver before production printing.

The access flow accepts a request on a public passport, approves it in **访问管理**, and selects the approved request in the public page's simulated viewer selector. The simulated regulator role is explicitly labeled and must never be used to view real confidential information.

## Technical notes

## Production Workflow

### Simplified Daily Entry

Product details now include **字段层级** and **适用资料**. The mapping describes product, batch, individual and in-use ownership, access and illustrative rule applicability. Carbon/recycled/due-diligence evidence is scoped to a product, factory and date period, with a linked public evidence file. New batches auto-match a single eligible record, require explicit selection when ambiguous, and preserve selected evidence snapshots. Critical physical specifications are frozen per new batch; existing products with batteries require a new product for critical specification changes. Production date/factory corrections require a reason and must remain inside the original evidence coverage. This remains a prototype subset, not a complete legal field inventory or compliance determination.

The main entry is now **产品与批次**, with **批次与二维码** retained for cross-product lookup. Manufacturer/operator information is stored per product and edited in its visual form; no separate company menu is needed. New products have a live passport preview with explicitly illustrative serial/date values. Clicking a product opens its batches, clicking a batch opens the shared batch/passport view, and clicking a serial opens the individual passport with parent navigation. Batch date/factory edits preserve existing serials and links. Product company records are cloned, so edits do not propagate to other products.

Current navigation separates **产品资料** (`/admin/products`) from **批次与二维码** (`/admin/batches`). Maintain fixed product data once. Create a batch by selecting that product, setting a unique batch name, production date, factory, and batch-specific numbering prefix, width and starting sequence. The suggested rule comes from the product, overrides are saved with the batch, and sequence numbers are never recycled. A live first/last preview matches generation. Each batch has its own QR list and filtered Excel, label PDF and ZIP downloads. Product edits continue to update shared passport content without an approval step; existing batch metadata and QR identities remain unchanged.

Open `/admin/products`. Select a product, maintain its shared data and scan-page presentation, then choose **生成二维码**. Enter a quantity or import serial numbers via XLSX/CSV/paste. The system checks required data and creates accessible passports immediately without material approval, manual batch setup, or a separate publication action. The **二维码** tab provides search, single-battery editing, Excel export, A4 labels, and QR ZIP downloads. Shared-data saves automatically update complete passports while retaining immutable historical snapshots and stable QR URLs. **更新记录** displays that history. The legacy routes remain compatible but lead daily users to this consolidated workspace.

Use **产品资料** to edit company, model and files, then approve a shared material version. Use **护照页面** to edit the English base presentation, preview it at phone/desktop widths, enable German or French market-language drafts, and review page labels and terminology. Translation generation is explicitly simulated in this frontend-only prototype. Use **生产建档** to select that immutable version and create a batch; choose platform-generated battery numbers or import existing ERP/MES serials via CSV/XLSX/paste. Both paths create the same battery ledger record and a QR link; the battery number is also the public passport identifier, while the database ID stays internal. The batch supports bulk review/publication, Excel mapping export, A4 labels and a ZIP of QR images. Published passport versions retain their snapshot.

The ledger provides source attribution, append-only measurement history, XLSX measurement import and maintenance event entry. Measurements update the internal draft; public passports remain unchanged until publication. Changing a batch's shared version requires explicit selection and republishes only that batch. **待办中心** collects incomplete instances and review requests. Advanced code operations and rules are retained under settings.

Run workflow regression checks with `node --test src/workflow.test.js`.

- React, Vite, TypeScript-free JSX, and IndexedDB. The repository module isolates browser persistence from UI operations for a future API adapter.
- Fixed illustrative field rules map to Regulation (EU) 2023/1542 Annex XIII references. They are a subset for demonstration and are not legal advice or a complete applicability matrix.
- Uploaded documents are limited to PDF/TXT files up to 2 MB; demo text content is also supported. Documents are stored locally in the browser.
- Published public and restricted data are snapshot based. The admin can see all local demo data; simulated public roles control display only and provide no actual data security.
- QR downloads point to the current origin plus `/passport/{internalPassportId}`; the human-facing battery number is the enterprise serial. QR ZIP exports, PDF snapshots, and Excel files are generated locally. Only fixed seed data is available on another device; local edits require a backend for cross-device access.
- No EU Registry, identity provider, external email, ERP/MES/BMS, carbon-footprint engine, or production compliance calculation is integrated.
# 通用电池一码与模板

现有演示产品自动补齐分类图文资料（仅补空值，不覆盖自定义资料）。在“产品与批次 → 编辑产品信息 → 产品图文资料”选择生态绿、科技蓝、石墨灰或青碧色，右侧即时预览；保存产品后更新关联护照。手机正文 16px，平板 17px，电脑 18px；按预览容器宽度适配，手机测试表改为逐项展示。示例数据与标识不构成检测或合规认证。

图文示例：产品编辑支持富文本介绍、安全与处置说明、结构化测试表和标识图片。LR03 示例的三张警示/分类收集 PNG 图片取自 https://www.newleader.top/batteryinfo.html?type=lr03 （对应 images/eu-rubish.png、images/no-recharge.png、images/staty-away-child.png），仅用于本地演示，商用前应核实使用权并替换为企业自有素材。示例参数为虚构值，图片不构成认证声明。

新建产品时分别选择电池类别和资料模板。支持通用电池一码、客户指定模板、欧盟电池护照；新产品默认通用模板，旧产品保留原欧盟模板。通用与客户模板仅校验基础资料和客户必填项，不因欧盟专用声明缺失而阻止生码。

产品编辑中的客户扩展字段可配置名称、产品/批次/单码维护层级及必填规则；客户字段当前均为公开文本，勿录入敏感资料。批次生成时的单码字段作为共同初始值，生成后可逐码修改。字段名称直接用于扫码展示，请填写目标语言。

追加示例：便携式电池、SLI 客户定制、小容量工业电池，各一个批次三个码；原有数据保留。启动后自动追加一次。欧盟模板仍是当前原型字段集合，不代表已实现完整法规字段及认证。

