export const manualSource = {
  title: 'DPP Registry User Guide for Economic Operators',
  author: 'DG Grow Digital Solutions', version: 'v1.03', published: '2026-09-16',
  pdf: '/registry-manual/original-v1.03.pdf',
  official: 'https://single-market-economy.ec.europa.eu/document/download/079a45e2-469f-4eec-b1e5-32e8e05d1357_en?filename=dpp_registry_user_guide_for_economic_operators.pdf',
  production: 'https://registry.product-passport.ec.europa.eu/',
  test: 'https://registry.acc.product-passport.ec.europa.eu/',
};

// Page numbers refer to the printed source pages; the PDF file has a cover offset of one.
export const chapters = [
  {id:'introduction',title:'介绍',pages:[
    {p:2,title:'1.1 关于本用户指南',text:[
      '目标读者：本指南旨在指导经济运营者使用 DPP Registry（数字产品护照登记系统）。',
      '范围：本文件提供组织入驻与身份验证，以及数字产品护照（DPP）登记的相关信息和操作说明。',
    ]},
  ]},
  {id:'journey',title:'经济运营者与 Registry',pages:[
    {p:3,title:'新组织的使用路径',text:[
      '登记 DPP 前，组织必须先通过验证。根据法规 (EU) 2024/1781，只有已验证的经济运营者才能登记和管理数字产品护照。',
      '访问 Registry 并创建 EU Login：EU Login 用于在 Registry 中进行身份认证。没有账户时先创建；如需使用另一邮箱访问 Registry，也可以创建新的 EU Login。',
      '组织入驻与验证：使用 EU Login 登录后，新用户进入欢迎页（Welcome）。从这里按向导提交所需信息，以便欧委会核验组织。通过验证后，可按权限使用 Registry 的操作功能。',
    ]},
    {p:4,title:'登记、帮助和测试',text:[
      '注意：组织成功验证后，你将成为该新组织在 Registry 中的管理员（Administrator）。',
      '登记 DPP：准备好 DPP 后，使用可用的提交方式提供所需数据。必须提供唯一产品标识（Unique Product Identifier，UPI），其应解析至你所托管的对应 DPP 数据位置。',
      '帮助中心（Help Center）始终可以访问，提供用户文档、支持联系方式、常见问题和测试环境入口。测试环境可用于安全体验 DPP 的功能和工作流。',
    ]},
  ]},
  {id:'login',title:'访问与 EU Login',pages:[
    {p:5,title:'3.1 登录与身份认证',text:[
      '在浏览器中访问 https://registry.product-passport.ec.europa.eu/。Registry 使用 EU Login 进行用户认证，因此会自动转到 EU Login 登录页面。认证成功后，自动返回 Registry 欢迎页。',
      '如已有 EU Login，输入账户凭据登录。登录成功后显示欢迎页；没有账户的用户请按下一节创建。',
    ],caption:'EU Login 登录页面'},
    {p:6,title:'3.2 获取 EU Login 账户',text:[
      'EU Login 让用户通过一个账户访问多种欧盟资源。尚无账户的用户必须先创建账户才能访问 Registry。',
      '打开 EU Login 登录页；从 Registry 入口访问时会自动跳转。点击“创建账户（Create an account）”链接，填写表单，阅读隐私声明（Privacy Statement），勾选相应复选框，再点击“创建账户（Create an account）”提交申请。',
      '你应会收到确认注册的邮件。详细步骤可查阅 EU Login 页面中的“How do I create my EU Login account?”；遇到问题时使用表单上方的“Help for external users”。',
    ],caption:'新用户 EU Login 注册表单'},
  ]},
  {id:'enrolment',title:'组织申请与验证',pages:[
    {p:7,title:'4 组织入驻；4.1 创建组织申请',text:[
      '组织入驻（Enrolment）是申请人提交资料的过程：欧委会据此核验其是否有权代表该经济运营者，并创建组织档案和 Registry 管理员账户。',
      '验证方式：组织资料被写入不可编辑的 PDF 声明，欧委会对声明加盖电子印章以确保真实性。随后在 Registry 外使用合格信任服务提供者（QTSP）提供的合格电子签名（QES）或合格电子印章（QSeal）进行加签/盖章，再上传提交。',
      '系统检查文件、签名或印章、证书及所含信息的完整性、有效性和真实性。全部检查通过则组织已验证；任何检查不通过则申请被拒，可按错误修正后重新提交。使用 EU Login 登录后，欢迎页将显示创建申请的入口。',
    ],caption:'Registry 欢迎页面'},
    {p:8,title:'创建新组织',text:[
      '点击“登记新组织（Enrol New Organisation）”，打开“组织信息（Organisation Information）”页面。',
      '每个输入框右上角提供剩余字符计数，起始值是允许的最大长度。红色星号（*）表示必填；必须填写全部必填资料后才能继续。',
      '输入资料后若切换主体类型，已填内容会丢失，并显示新的空白表单。需要暂停时，下次返回将显示上次能够完成的页面或已保存操作。',
    ],caption:'组织信息页面'},
    {p:9,title:'选择组织类型（Organisation type）',text:[
      '法人（Legal Person）：经济运营者是依法注册的公司或其他法律实体。',
      '自然人（Natural Person）：经济运营者是以本人名义经营的个人。',
      '根据所选主体类型填写对应资料，再按照下述法人或自然人分支继续操作。',
    ],caption:'组织类型选择'},
    {p:10,title:'4.1.1 法人组织信息',text:['法人申请人应填写以下页面所示的组织信息。填写前先核对拟用于盖章的证书属性。'],caption:'法人组织信息表单'},
    {p:11,title:'法人名称、注册地址及标识类型',text:[
      '填写所选主体类型的全部必填信息。填写前检查证书属性，并参阅“QSeal—法人”中的对应关系。',
    ],fields:[
      ['法定名称','Legal name','必填；最多 150 字符','必须使用注册名称，而非商号或经营别名。'],
      ['街道地址','Street address','必填；最多 50 字符','使用注册的官方地址，不是邮寄地址。'],
      ['邮政信箱','Post Office Box Number','选填；最多 6 字符','可补充或替代普通地址。'],
      ['补充地址','Extended address','选填；最多 50 字符','法定地址第二行。'],
      ['所在地','Locality','选填；最多 50 字符','例如市镇或区。'],
      ['邮政编码','Postal Code','选填；最多 12 字符','对应法定地址。'],
      ['地区','Region','选填；最多 50 字符','例如省或州。'],
      ['注册国家','Country of Registration','必填','法人注册所在国，决定管辖法律。'],
      ['标识类型','Identifier Type','从下拉菜单选择','NTR 为原文优先推荐类型。'],
      ['国家商业登记号','NTR — National Trade Register','最多 50 字符','用于核验经济运营者在欧盟的登记；可含数字或字母。'],
    ]},
    {p:12,title:'法人标识与合规联系人',text:[
      '根据 Identifier Type 选择标识类型，再填写相应完整标识值。不确定时联系签发企业电子印章的 QTSP；所填标识必须与证书属性完全一致，不能只填其中一部分。',
      '合规联系人资料供主管机关就 DPP 登记或产品合规问题联系组织使用，不会公开展示。',
    ],fields:[
      ['法人识别编码','LEI — Legal Entity Identifier','最多 50 字符','ISO 17442 所定义、用于参与金融交易的法律实体的全球标识。'],
      ['增值税识别号','VAT — Value Added Tax Identification Number','最多 50 字符','由国家税务机关签发，用于核验增值税登记身份。'],
      ['电子身份标识','eID — Electronic ID','最多 50 字符','与电子身份凭证关联的唯一编号。'],
      ['本地定义','Local definition','国家两字母代码前缀','在新增下拉菜单选择注册国代码，作为标识值前缀。'],
      ['标识值','Identifier','最多 50 字符','按照所选类型填写数字或字母数字标识。'],
    ]},
    {p:13,title:'保存法人资料并开始验证',fields:[
      ['邮箱','Email','必填','负责合规事务的人员或部门邮箱。'],
      ['国际区号','Country Code','必填','国际电话国家或地区数字前缀。'],
      ['电话','Phone','必填','负责合规事务的人员或部门电话号码。'],
    ],text:[
      '点击“保存（Save）”。若发现错误，请参见组织信息错误；资料完整且格式正确时，系统保存并显示确认消息。',
      '点击“开始验证（Start Verification）”进入组织验证步骤。',
    ],caption:'资料保存确认'},
    {p:14,title:'4.1.2 自然人组织信息',text:['自然人申请人应填写本页表单所列信息。填写前先检查用于签署的证书属性。'],caption:'自然人组织信息表单'},
    {p:15,title:'自然人姓名、地址及标识',text:[
      '填写所选主体类型的全部必填资料；填写前参照“QES—自然人”核对证书属性。',
      '注册地址各项与法人表单相同：街道地址必填、最多 50 字符；邮政信箱选填、最多 6 字符；补充地址、所在地和地区均选填、最多 50 字符；邮编选填、最多 12 字符；注册国家必填，决定该主体的管辖法律。使用注册的官方地址，而不是邮寄地址。',
    ],fields:[
      ['名字','First Name','必填；最多 50 字符','作为组织的自然人的名字。'],
      ['姓氏','Last Name','必填；最多 50 字符','作为组织的自然人的姓氏。'],
      ['标识类型','Identifier Type','必填','从所支持的个人标识类型中选择。'],
    ]},
    {p:16,title:'自然人标识类型与标识值',text:[
      '标识必须与签名证书中的属性完全一致，而不是部分标识。不确定时联系签发电子签名的 QTSP。合规联系方式可供主管机关就 DPP 登记或产品合规事项联系，不会公开显示。',
    ],fields:[
      ['国家纳税人识别号','TIN — National Tax Identification Number','优先推荐；8–50 字符','国家税务机关签发，用于核验税务登记及身份。'],
      ['个人编号','PNO — Personal Number','最多 50 字符','国家赋予的个人编号，例如社保或民事登记号。'],
      ['电子身份标识','eID — Electronic ID','最多 50 字符','与电子身份凭证关联的唯一编号。'],
      ['国家身份证号','IDC — National ID Card','最多 50 字符','用于核验个人身份及居住情况。'],
      ['护照号','PAS — Passport','最多 50 字符','用于核验个人身份及护照真实性。'],
      ['本地定义','Local definition','选择注册国两字母代码','选择代码为标识值添加前缀。'],
      ['标识值','Identifier','最多 50 字符','按选定类型填写数字或字母数字标识。'],
    ]},
    {p:17,title:'保存自然人资料；4.1.3 组织信息错误',text:[
      '合规联系信息：邮箱（Email）、国际电话区号（Country Code）和电话（Phone）均为必填，不公开显示。点击“保存（Save）”；资料完整且格式正确时会出现保存确认，再点击“开始验证（Start Verification）”。',
      '存在错误时，页面顶部显示错误消息。',
    ],errors:[
      ['Some values do not match expected formats. Please review the highlighted fields.','部分值不符合预期格式，请检查高亮字段。','例如邮箱缺少 @，或者电话号码中含有字母；按字段格式修正。'],
      ['Some required information is missing. Please review the highlighted fields.','缺少必填信息，请检查高亮字段。','补齐红色标记字段。'],
    ],caption:'保存确认和错误提示'},
    {p:18,title:'必填检查',text:['缺少必填项时，补齐红色高亮字段。全部必填资料填写完成后，“保存（Save）”按钮才会启用。']},
    {p:19,title:'4.2 验证组织：七步总览',text:[
      '填写完组织资料后，按七步流程完成验证：',
    ],list:['提供法定代表人信息。','请求欧委会盖章的 PDF 声明。','下载生成的 PDF 声明。','在系统外对 PDF 声明合格签署或盖章。','上传已签署/盖章的原始 PDF 声明。','提交声明进行组织验证。','在活动面板查看申请状态。']},
    {p:20,title:'步骤 1：代表人资料；步骤 2：请求声明',fields:[
      ['代表人的名字','First Name','必填；最多 50 字符','有权合法代表组织并签署/盖章声明的人。'],
      ['代表人的姓氏','Last Name','必填；最多 50 字符','同上。'],
      ['代表人的邮箱','Email','必填','有权合法代表组织的人员邮箱。'],
    ],text:['点击“请求声明（Request Declaration）”获取欧委会盖章的 PDF 声明，再点击“继续（Continue）”确认请求。'],caption:'请求声明及确认'},
    {p:21,title:'步骤 3：下载 PDF 声明',text:[
      '修改组织资料会重新启动验证流程。确认请求后开始生成 PDF 声明；生成完成后，“下载 PDF（Download PDF）”按钮可用。点击按钮将声明下载到本地。',
    ],caption:'下载欧委会盖章的声明'},
    {p:22,title:'法人 PDF 声明样例',text:['下图为官方指南提供的法人声明样例；实际签署应使用 Registry 根据本组织资料生成并盖章的原文件。'],caption:'法人 PDF 声明样例'},
    {p:23,title:'自然人 PDF 声明样例',text:['下图为自然人声明样例。注意：该版指南说明 PDF 声明仅提供英文版本。'],caption:'自然人 PDF 声明样例'},
    {p:24,title:'步骤 4：签署或盖章',text:[
      '由法定代表人使用组织电子证书对欧委会盖章的原始声明加签或盖章。此步骤在 Registry 外完成。准备好后点击“继续（Continue）”。',
      '法人使用 QTSP 提供的合格电子印章（QSeal）；以个体经营者身份经营的自然人使用 QTSP 提供的合格电子签名（QES）。',
      '仅持有合格证书并不足够：需使用保存证书的合格签名创建设备（QTSP 提供的智能卡或 USB 令牌），或 QTSP 运营的合格远程签名服务。以 .p12/.pfx 等软件文件安装的证书仅生成高级签名（AdES/QC），该版验证流程会拒绝。',
      '法人：表单信息必须与印章证书属性一致。在已盖章 PDF 中打开“签名面板（Signature Panel）→证书详细信息（Certificate Details）→详细信息（Details）→主体（Subject）”检查。',
    ],kind:'important'},
    {p:25,title:'法人证书属性对应',fields:[
      ['法定名称','organizationName / O','OID 2.5.4.10','与 Legal Name 一致。'],
      ['注册国家','countryName / C','OID 2.5.4.6','与 Country of Registration 一致。'],
      ['组织标识','organizationIdentifier','OID 2.5.4.97','与 Organisation Identifier 一致。'],
    ],text:['企业合格电子印章必须嵌入 PDF 声明，使用下一页列出的 PAdES Baseline 格式。'],caption:'法人证书签名面板与属性'},
    {p:26,title:'PAdES 格式与自然人证书属性',text:[
      '可接受的 PAdES Baseline 等级为 B、T、LT 或 LTA。PDF 验证程序不接受其他文档格式或电子签名容器。',
      '自然人：表单信息必须与签名证书主体属性一致。使用签名面板 → 证书详细信息 → 详细信息 → 主体检查。',
    ],fields:[
      ['名字','givenName','OID 2.5.4.42','对应 First Name。'],
      ['姓氏','surname / sn','OID 2.5.4.4','对应 Last Name。'],
      ['注册国家','countryName / C','OID 2.5.4.6','对应 Country of Registration。'],
      ['标识','serialNumber','OID 2.5.4.5','对应 Identifier。'],
    ],caption:'自然人证书签名面板'},
    {p:27,title:'自然人签名格式',text:['自然人的合格电子签名须嵌入 PDF 声明，采用 PAdES Baseline B、T、LT 或 LTA。该 PDF 验证流程不接受其他文档格式或电子签名容器。'],caption:'自然人证书属性'},
    {p:28,title:'Adobe Acrobat：检查默认签名格式',text:[
      '无论操作系统为何，Acrobat 默认可能采用不符合 PAdES 的格式。即使证书有效，这种格式的声明也会被拒。',
    ],list:[
      '打开“首选项（Preferences）”，选择“签名（Signatures）”。',
      '在“创建和外观（Creation & Appearance）”下点击“更多（More…）”。',
      '在“创建（Creation）”区域，将“默认签名格式（Default Signing Format）”设置为“CAdES-Equivalent”。',
      '点击“确定（OK）”保存设置，再对声明签署。',
    ],caption:'Acrobat 首选项：签名',kind:'important'},
    {p:29,title:'Acrobat：创建和外观设置',text:['设置 CAdES-Equivalent 可使签名以符合该 PDF 验证程序要求的 PAdES 格式嵌入文件。'],caption:'默认签名格式设置'},
    {p:30,title:'欧委会 DSS 独立签署工具',text:[
      '欧委会也提供基于数字签名服务（DSS）框架的免费工具，作为替代方案，用于以符合 PAdES 的格式签署，并在上传前检查签署文件。',
      'DSS Standalone Application 在桌面本地签署。选择签名格式 PAdES，并选择接受的 PAdES-BASELINE 等级之一。',
    ],links:[['DSS 独立签署工具','https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/signature-standalone']],caption:'DSS 独立应用签名设置'},
    {p:31,title:'DSS 在线验证工具',text:[
      '签署声明后，可通过 DSS Validation WebApp 检查结果中的“签名格式（Signature format）”是否属于接受的 PAdES-BASELINE 格式。',
      '同时检查“资格（Qualification）”：自然人应为 QESig，法人应为 QESeal。若显示 AdESig-QC 或 AdESeal-QC，说明未使用合格设备或合格远程签署服务（常见原因是软件证书），验证将失败。',
    ],links:[['DSS 在线验证工具','https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation']],caption:'DSS 验证结果'},
    {p:32,title:'合格签名、印章和信任服务',text:[
      'QES 和 QSeal 是 eIDAS 定义的合格信任服务，属于最高级别的电子签名及电子印章。QTSP 是获准签发合格证书的认可组织，其服务满足更高法律标准。',
      '为什么合格证书不一定产生合格签名？除证书合格外，私钥必须保存在经认证的安全签署环境（QSCD）。可使用 QTSP 提供的智能卡/USB 令牌，或由 QTSP 代为保管密钥的合格远程服务。软件证书文件不满足条件，只会产生高级（AdES/QC）签名；应联系 QTSP 更换为上述方式之一。',
      '合格信任服务追求成员国间互操作和相互认可。某成员国 QTSP 的合格信任服务所提供的合格产品，可在所有成员国被视为合格。欧盟/欧洲经济区成员国公布的信任列表可在下列入口查询。来源：原文所引 eSignature FAQ。',
    ],links:[['欧盟/欧洲经济区信任服务列表','https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls']]},
    {p:33,title:'步骤 5：上传已签署或盖章声明',text:[
      '点击“选择文件（Choose File）”浏览本地文件，或把文件拖入蓝色虚线区域。必须上传之前下载的、已有欧委会印章且再由企业加签/盖章的 PDF，不应有其他修改。',
      '文件要求：仅接受 PDF；最大 1 GB；文件名不超过 100 字符。',
    ],caption:'上传已签署的原始声明'},
    {p:34,title:'上传导航；步骤 6：提交验证',text:[
      '随时可点击“返回（Back）”重新下载声明或回到先前步骤；点击“重新开始（Restart）”可直接返回法定代表人资料页检查或编辑。',
      '上传完成后，文件会列出。需要删除或替换时，使用删除图标。准备提交时，点击“验证组织（Verify your Organisation）”，再点击“继续（Continue）”确认。',
    ],caption:'上传列表与提交组织验证'},
    {p:35,title:'步骤 7：查看申请状态',text:['页面将刷新，显示操作处理中，或验证完成后的最终结果。可在“活动面板（Activity Dashboard）”查看此次提交的状态。'],caption:'处理进度和活动面板'},
    {p:36,title:'4.3 查看申请状态',text:[
      '活动面板为每个请求展示：请求日期和时间、请求类型、提交人（Actor）、状态（Status）及查看详情（View Detail）。',
      '入驻有两类请求：“生成 PDF 声明（Generate PDF Declaration）”用于跟踪声明生成是否处理中、完成或错误；若盖章服务暂不可用导致失败，可重新请求声明重试。',
      '“组织验证（Organisation Verification）”用于跟踪提交的验证过程；完成后查看结果获得更多信息。',
    ],caption:'活动面板请求列表'},
    {p:37,title:'组织验证结果',fields:[
      ['处理中','PROCESSING','请求尚未处理完','当前没有最终结果。'],
      ['成功','SUCCESS','申请已接受','组织已验证，Registry 登记操作可用。'],
      ['失败','FAILURE','申请被拒','系统生成错误报告；修正问题后重新验证。'],
    ],text:[
      '成功时，“查看详情（View Details）”提供包含签名/印章到期日的成功报告；失败时提供错误报告，可复制并独立保存。',
    ]},
    {p:38,title:'4.3.1 被拒申请与错误报告',text:[
      '申请处理完成且结果为 VERIFIED 时，你将成为该组织在 Registry 中的管理员。',
      '验证失败意味着组织未能通过验证，错误报告是检查并解决拒绝原因的重要依据。',
    ],caption:'组织验证结果与错误报告'},
    {p:39,title:'验证错误：签名数量与原始文件',text:['系统即使已发现错误也会完成所有检查，因此一份报告可包含多条错误，同一类型也可能因不同字段不匹配重复出现。'],errors:[
      ['The document does not contain the required number of signatures. Exactly two signatures are expected: the Commission institutional seal and the organisation’s countersignature or counterseal.','签名数量不符合要求：应有欧委会机构印章和组织加签/加章，恰好两项。','缺少其中一项或两项；使用欧委会原声明并补齐组织合格签署。'],
      ['The countersigned document does not match the original declaration sealed by the Commission. This may indicate that the document was altered after the Commission seal was applied, or that a different document was signed instead of the one provided. The countersignature or counterseal must be applied to the original sealed declaration without any modifications.','加签文件与欧委会盖章的原始声明不一致，可能被修改或签错了文件。','在原始盖章声明上加签/盖章，不进行任何其他修改，再重新提交。'],
      ['The Commission institutional seal is missing from the document.','文件缺少欧委会机构印章。','先生成欧委会盖章声明，在同一文件上加签后重新提交。'],
    ]},
    {p:40,title:'验证错误：欧委会及组织印章',text:[
      '下列欧委会印章错误可能表示文件与原始声明不符、已损坏或已修改。下载后唯一允许的修改是添加组织的合格电子签名/印章；重新启动验证并提交新声明。',
    ],errors:[
      ['The Commission institutional seal is present but could not be validated. Please restart the verification process.','存在欧委会印章，但无法验证。','重新启动验证流程。'],
      ['The identity contained in the Commission seal does not match the expected identity. Please restart the verification process.','欧委会印章的身份与预期不符。','重新启动验证流程。'],
      ['The Commission seal does not meet the required Qualified Electronic Seal (QSeal) level. Please restart the verification process.','欧委会印章不满足 QSeal 级别。','重新启动验证流程。'],
      ['The qualification level of the Commission seal could not be determined. Please restart the verification process.','无法确定欧委会印章资格级别。','重新启动验证流程。'],
      ['The Commission seal does not conform to the required PAdES Baseline signature format (B, T, LT, or LTA level). Please restart the verification process.','欧委会印章不符合所需 PAdES Baseline 格式。','重新启动验证流程。'],
      ['The Commission seal validation did not pass. The seal status is invalid or could not be determined. Please restart the verification process.','欧委会印章验证未通过，状态无效或无法确定。','重新启动验证流程。'],
      ['The certificate used for the Commission seal is not trusted, has been revoked, or could not be verified against a trusted certificate authority. Please restart the verification process.','欧委会印章证书不受信、已撤销或无法按受信机构验证。','重新启动验证流程。'],
      ['The organisation’s countersignature or counterseal is missing from the document.','缺少组织的加签或加章。','对原始声明合格签署/盖章后重交。'],
      ['The organisation’s countersignature or counterseal is present but could not be validated.','组织加签/加章存在但无法验证。','可能无效、损坏或证书不受信；使用有效签署/印章后重新提交。'],
    ]},
    {p:41,title:'验证错误：证书资料不匹配',text:[
      '组织表单（写入声明的信息）必须与用于签署/盖章的 QES/QSeal 证书一致。错误报告按每个不匹配字段分别列出表单中的 <…> 与证书中的 {0}。',
      '法人比对 Legal Name、Identifier、Country of Registration 与电子印章；自然人比对 First name、Last name、Country of Registration、Identifier 与电子签名。',
    ],errors:[
      ...['Legal Name','Identifier','Country of Registration'].map(field=>[`The "${field}": "<${field}>" provided in the organisation registration form, does not correspond to the value: "{0}", mentioned in the electronic seal.`,`法人表单的“${field}”与电子印章值不一致。`,'逐字核对表单和证书的完整值，修正组织资料后重新生成声明并盖章。']),
      ...['First name','Last name','Country of Registration','Identifier'].map(field=>[`The "${field}": "<${field==='First name'?'First Name':field==='Last name'?'Last Name':field}>" provided in the organisation registration form, does not correspond to the value: "{0}", mentioned in the electronic signature.`,`自然人表单的“${field}”与电子签名值不一致。`,'核对姓名、国家和完整标识，修正后重新申请声明并签署。']),
      ['The organisation’s seal does not meet the required Qualified Electronic Seal (QSeal) level. Legal persons must use a qualified electronic seal.','组织印章未达到 QSeal 级别；法人必须使用合格电子印章。','使用有效 QSeal 盖章后重新提交。'],
    ]},
    {p:42,title:'验证错误：资格、格式和信任',errors:[
      ['The organisation’s signature does not meet the required Qualified Electronic Signature (QES) level. Natural persons must use a qualified electronic signature.','组织签名不符合 QES 级别；自然人必须使用合格电子签名。','使用有效 QES 签署后重新提交。'],
      ['The required qualification level for the organisation’s signature or seal could not be determined.','无法确定组织签名或印章的所需资格级别。','证书可能缺少所需的 eIDAS 合格属性；联系 QTSP 核实 QES/QSeal 要求。'],
      ['The organisation’s signature or seal format "{0}" does not conform to the required PAdES Baseline signature format (B, T, LT, or LTA level). For more details please check the DPP Registry User Guide for Economic Operators.','检测到的格式 {0} 不符合 PAdES Baseline B、T、LT、LTA。','检查签署工具和设置，以及可信时间戳、长期验证信息与 PDF 内嵌验证数据，再以合规格式重签。'],
      ['The organisation’s signature or seal validation did not pass. The signature status is invalid or could not be determined.','组织签名/印章验证失败，状态无效或无法确定。','可能无效、损坏或不支持；检查签署后重新提交声明。'],
      ['The certificate used for the organisation’s signature or seal is not trusted, has been revoked, or could not be verified against a trusted certificate authority.','组织签署证书不受信、已撤销或无法按可信证书机构验证。','改用有效且受信的证书签署后重新提交。'],
    ]},
    {p:43,title:'4.3.2 查看问题与采取措施',list:[
      '上传 PDF 声明（Upload PDF Declaration）：已准备好修正文件时，直接进入上传页。',
      '重新验证（Restart Verification）：回到代表人信息页，检查/编辑资料并请求新声明。',
      '组织信息（Organisation Information）：直接进入组织信息页检查或编辑组织资料。',
    ],caption:'验证结果页的后续操作'},
  ]},
  {id:'homepage',title:'首页与导航',pages:[
    {p:44,title:'5 首页',text:[
      '组织验证通过后，下次会话将进入首页。',
    ],list:[
      '用户资料菜单（User Profile Menu）：显示当前用户、角色及所选组织。展开后“My Profile Information”显示角色和组织名；“Sign-out”退出会话。',
      '帮助中心（Help Center）：汇总可用操作及帮助中心资源。',
      '语言（Language）：该版 Registry 提供英文界面。',
      '侧栏（Side Menu）：组织（Organisation）下包含组织信息（Organisation Information）与验证（Verification）；另有 DPP 登记（DPP Registration）。',
    ],caption:'Registry 首页与编号导航'},
    {p:45,title:'首页其他功能',list:[
      '活动面板（Activity Dashboard）：在侧栏查看操作请求。',
      '文档（Documentation）：数字产品护照相关欧盟立法与支持文件。',
      '页脚（Footer）：包含隐私声明、环境名称（例如 Production）和当前版本。',
    ]},
  ]},
  {id:'registration',title:'DPP 登记与错误处理',pages:[
    {p:46,title:'6 DPP 登记；6.1 护照与登记记录的区别',text:[
      'Registry 不保存完整 DPP 数据，只记录识别和访问护照所需的信息子集，例如唯一产品标识和护照托管位置。完整产品、可持续性和合规数据仍由经济运营者或指定服务商托管维护；你负责护照生命周期内的可用性、准确性和更新。',
      'DPP 登记记录（DPP Registration Record）是欧盟层级的数字记录，用来登记已验证经济运营者创建的护照标识，不是完整护照。它是用于合规检查、主管机关检索及跨境执法的权威索引，支持引用、发现、验证及产品更新和监管流程关联。',
      '记录包括登记元数据、链接/标识、语义验证和互操作元数据及访问规则，不含完整技术数据集。存于欧委会中央 Registry 数据库，由公共基础设施控制；该版表示预计无订阅费，仅已验证运营者可登记。',
    ]},
    {p:47,title:'DPP 数据由谁保存',text:[
      'DPP Data 是遵循预定义规格的数据实例，包含护照完整内容。它根据产品适用立法的技术及其他要求独立建立。',
      '目的：提供所需信息。消费者扫描包含 UPI 的数据载体后可查看，且必须始终可解析。',
      '内容至少包括权威数据结构要求的必需属性，最多包括其中定义的全部必需与可选属性。数据存储在经济运营者或服务商数据库中，由经济运营者全面控制并承担责任。',
    ]},
    {p:48,title:'6.2 登记 DPP；6.2.1 如何登记',text:[
      '重要：该版指南说明，由于电池产品组的语义目录尚未定义，目前不能成功登记电池 DPP。这是 2026-09-16 版原文状态，不代表本手册已核实当前系统仍处于相同状态。',
      '准备好符合要求的 DPP 后，从侧栏选择“DPP 登记（DPP Registration）”。产品组“电池（Batteries）”已预选，点击“继续（Continue）”。电池是首个计划提供 DPP 登记的产品组。',
    ],kind:'important',caption:'DPP 登记：产品组选择'},
    {p:49,title:'提交方式与登记层级',text:[
      'DPP 将按 ESPR 工作计划和生态设计要求逐步扩展至其他产品组，详情参见 DPP 常见问题。',
      '选择“在线登记表（Online registration form）”可填写单个 DPP；选择“文件上传提交（File upload submission）”可提交一个或一批 DPP。',
      '在线表单先选择粒度：型号（Model）、批次（Batch）或单体（Item）。该版电池仅开放并预选单体级（Item），这是电池产品组已确定的登记层级。',
    ],caption:'选择提交方式与单体层级'},
    {p:50,title:'在线表单填写与提交',fields:[
      ['唯一产品标识','Unique Product Identifier (UPI)','必填；最多 2000 字符','唯一识别 DPP，须为符合 JTC 24 标准要求的 URL 格式。'],
      ['型号标识','Model Identifier','选填','指定该单体关联的型号。'],
      ['批次标识','Batch Identifier','选填','指定该单体关联的批次。'],
    ],text:['点击“提交（Submit）”，再点击“继续（Continue）”确认登记请求。'],caption:'在线登记字段与确认'},
    {p:51,title:'粒度解释与文件批量提交',text:[
      '型号（Model）表示某产品的一般设计/版本，覆盖同系列规格特征相同的单体；批次（Batch）表示特定时间范围的生产批次，涵盖该次生产的质量、条件和差异；单体（Item）对应某一个具体售出产品，可精确关联该件产品的唯一身份及制造资料。这是通用粒度说明，不能理解成电池可自由选择型号或批次登记。',
      '提交后会分配关联编号（correlation ID）并提供预计验证完成时间；在活动面板查看请求状态。',
      '文件提交可一次登记多个 DPP。该版规定每次最多 100 个；仅接受 XML 或 JSON，选择该方式后可下载两种格式的模板。',
    ]},
    {p:52,title:'上传 JSON/XML 文件',text:[
      '拖放文件，或点击“选择文件（Choose file）”浏览本地文件。上传后展示文件名、大小及格式。误选时点击删除图标移除，再选择正确文件。',
      '点击“提交（Submit）”。',
    ],caption:'JSON/XML 上传与提交'},
    {p:53,title:'确认提交和上传错误',text:[
      '点击“继续（Continue）”确认登记请求。系统为请求分配 correlation ID 并给出预计验证时间，可在活动面板查看。',
    ],errors:[
      ['The file exceeds the maximum allowed size of 1 GB.','文件超过最大 1 GB。','缩小文件或拆分为多个文件再提交。'],
      ['The file name contains unsupported characters.','文件名包含不支持字符。','仅用 a-z、A-Z、0-9、点、下划线、连字符；不接受空格/空值、斜杠、反斜杠及路径导航字符。'],
      ['Invalid URL format. Enter a URL starting with https://.','URL 无效，请输入以 https:// 开头的地址。','检查格式和协议。'],
    ],caption:'登记请求确认'},
    {p:54,title:'6.2.2 登记请求结果',text:[
      '从侧栏打开“活动面板（Activity Dashboard）”，查看过去请求和状态。重要：批量提交中，只要一个 DPP 出错，同次提交的全部 DPP 都会被拒绝。',
      '该版再次说明：电池产品组的语义内容仍在开发，暂不能成功登记。请结合最新官方发布核对当前状态。',
      '未完成验证的请求显示 PROCESSING；已完成请求为 SUCCESS 或 FAILURE，可点击“查看详情（View Detail）”。',
    ],kind:'important',caption:'DPP 登记请求结果列表'},
    {p:55,title:'结果详情和 CSV 导出',text:[
      '所有请求的详情均提供提交关联编号（correlation ID）。成功（SUCCESS）时，列出每个 DPP 的 UPI、URI 和关联产品组；失败（FAILURE）时列出每个失败 DPP 的 UPI、产品组及具体错误。',
      '在请求详情点击“导出 CSV（Export as CSV）”，可将错误报告中的全部错误导出为 CSV。点击左上角“关闭（X Close）”返回活动面板。',
    ],caption:'成功与失败请求详情'},
    {p:56,title:'登记验证错误',errors:[
      ['The submitted file does not conform to the required schema.','提交文件不符合要求的数据结构。','检查 XML/JSON 的结构、格式和所适用数据结构的校验规则。'],
      ['The same unique identifier has been used for more than one DPP in the same registration request.','同一请求中多个 DPP 使用同一唯一标识。','消除重复标识，每个 DPP 必须唯一。'],
      ['The UPI URL is invalid.','UPI URL 无效。','检查格式、协议、域名限制和允许的网络端口。'],
      ['The submitted file exceeds the maximum of 100 registration requests.','文件超过最多 100 条登记请求。','每个文件不超过 100 条，拆分后提交。'],
      ['Semantic validation failed due to its unavailability.','语义验证服务不可用，导致验证失败。','服务尚未可用时无法完成验证，关注官方服务状态。'],
      ['The system is unable to process your request at this time. Please try again later.','系统暂时无法处理，请稍后重试。','可能有过多 URL 跳转、降级到较不安全协议，或资源响应超出处理能力；检查地址和响应后重试。'],
    ]},
  ]},
  {id:'help',title:'帮助中心',pages:[
    {p:57,title:'7 帮助中心',text:['可始终从页头访问帮助中心（Help Center），其中提供用户文档、支持联系方式、DPP 常见问题链接和测试环境链接。'],caption:'帮助中心概览'},
  ]},
  {id:'test-environment',title:'测试环境',pages:[
    {p:58,title:'8 测试环境',text:[
      'Registry 测试环境是用来试验组织入驻、创建组织档案及登记流程的沙箱。原文提供 http://registry.acc.product-passport.ec.europa.eu/；本网页入口使用欧委会公开的 HTTPS 地址。',
      '测试站点有不同 Logo；正式站点页脚标识生产环境（Production）。务必核对环境标识。',
      '测试和正式环境相互独立，测试操作不会影响任何正式数据。需要创建或使用与正式环境不同的 EU Login。',
      '测试中的修改不会反映或迁移到正式环境，创建的对象可能被数据清理删除。',
      '该版说明：测试与正式环境的组织验证流程相同；测试组织也必须使用有效组织资料及要求的签名/印章完成验证。',
    ],caption:'测试站与正式站环境标识',kind:'important'},
  ]},
  {id:'glossary',title:'术语表',pages:[
    {p:59,title:'9 术语：批次、护照及登记',fields:[
      ['批次','Batch','制造批次/时间范围内的一组产品','在大体一致条件下生产，涵盖该批差异和质量/合规信息；通用批次级登记覆盖该批单体。'],
      ['批次标识','Batch Identifier','登记时可选提供','指定所登记单体关联的具体批次。'],
      ['数字产品护照','Digital Product Passport (DPP)','产品相关的结构化数据集合','通过唯一标识共享，并经二维码等载体电子访问；包括可持续性及再使用、制造和回收的价值保留信息。'],
      ['DPP 登记系统','DPP Registry','数据库、管理系统及用户界面','免费提供登记、查阅、搜索、选择等服务，也包括 API。'],
      ['护照数据','DPP Data','按预定义 XML/JSON 结构组织的属性及其值','构成型号、批次或单体的数字护照，由经济运营者创建和保存。'],
      ['护照登记记录','DPP Registration Record','Registry 保存的最少数据集合','保存 UPI 并关联 URI；URI 是运营者成功登记后由 Registry 返回的标识。'],
      ['经济运营者','Economic Operator (EO)','法规 (EU) 2024/1781 第 2(46) 条列举的主体','制造商、授权代表、进口商、分销商、经销商及履约服务提供商。'],
    ]},
    {p:60,title:'身份、组织和型号术语',fields:[
      ['电子身份与信任服务法规','eIDAS','法规 (EU) No 910/2014','建立欧盟电子身份识别及电子交易信任服务法律框架；规范跨境承认和互操作，以及签名、印章、时间戳、挂号投递和网站认证证书等法律效力与要求。'],
      ['欧盟登录服务','EU Login','欧盟机构、机关和组织的集中身份认证服务','通过单一账户访问欧盟资源，配合多因素认证增加保护；个人可自行或代表组织使用，也可由组织自动传送用户资料至欧委会。'],
      ['自然人','Natural Person','以本人名义经营的个人','经济运营者的一种法律性质。'],
      ['法人','Legal Person','依法注册的组织','例如公司或其他法律实体。'],
      ['法定代表人','Legal Representative','有权代表组织的自然人','具备合法代表能力。'],
      ['型号','Model','具有相同相关技术特征的产品版本','共享标签/产品信息表相关技术特征和制造商或供应者赋予的型号标识。'],
      ['型号标识','Model Identifier','登记时可选提供','指定单体或批次对应的具体型号。'],
    ]},
    {p:61,title:'声明、签署与标识术语',fields:[
      ['组织','Organisation','代表经济运营者','可以是法人或自然人。'],
      ['PDF 声明','PDF Declaration','用于身份核验的声明模板','包含入驻时提供的名称、地址、联系人及标识信息。'],
      ['产品组','Product Group','主要功能相同的一组产品','用于产品分类。'],
      ['合格电子签名','Qualified Electronic Signature (QES)','依据 eIDAS 签发','自然人用于签署电子文件。'],
      ['合格电子印章','Qualified Electronic Seal (QSeal)','依据 eIDAS 签发','法人或组织用于电子文件盖章。'],
      ['合格信任服务提供者','Qualified Trust Service Provider (QTSP)','获授权提供合格信任服务','依据 eIDAS 提供合格电子签名和印章。'],
      ['唯一产品标识','Unique Product Identifier (UPI)','唯一标识一个 DPP 的 URL 型标识','登记时由经济运营者提供的必填属性，须符合 JTC 24 标准要求的 URL 格式。'],
      ['唯一登记标识','Unique Registration Identifier (URI)','成功登记后由 Registry 返回','标识中央登记记录，并通过 UPI 连接已有 DPP 数据；此处 URI 按原手册术语使用。'],
    ]},
  ]},
  {id:'contacts',title:'支持联系方式',pages:[
    {p:62,title:'10 Helpdesk 联系方式',text:[
      '使用平台需要帮助或遇到技术问题，可联系支持团队：',
      '邮箱：EC-HELPDESK-DPP@ec.europa.eu。响应时间：周一至周五，欧洲中部时间（CET）08:00–20:00。',
      '电话：+32 22960431。服务时间：周一至周五，CET 08:00–20:00。',
    ]},
  ]},
];
