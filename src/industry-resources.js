export const ecosystemCategories = [
  '检测与符合性',
  '可持续与供应链',
  '欧盟市场与回收',
  '标识、标签与打印',
  '数据与系统对接',
  '翻译与专业咨询',
];

export const ecosystemResources = [
  {id:'eu-battery-regulation',category:'检测与符合性',title:'欧盟电池法规与实施信息',provider:'欧盟委员会',kind:'官方资源',summary:'查看法规框架、电池护照政策信息及欧委会发布的配套说明。用于核对政策来源，不提供产品认证服务。',region:'欧盟',languages:'英语及欧盟官方语言（以页面提供为准）',url:'https://single-market-economy.ec.europa.eu/sectors/batteries_en',source:'欧盟委员会电池专题页',reviewedAt:'2026-11-27',tags:['法规','电池护照','官方']},
  {id:'ul-battery-services',category:'检测与符合性',title:'电池法规测试与符合性服务信息',provider:'UL Solutions',kind:'公开机构资源',summary:'公开介绍电池测试、认证及欧盟电池法规相关服务。具体标准、范围、报价与资质应直接向服务机构核实。',region:'全球 / 欧盟市场相关服务',languages:'以服务机构说明为准',url:'https://www.ul.com/services/eu-battery-regulation-compliance',source:'UL Solutions 服务说明',reviewedAt:'2026-11-27',tags:['测试','认证服务','符合性']},
  {id:'ul-carbon',category:'可持续与供应链',title:'产品碳足迹核查服务信息',provider:'UL Solutions',kind:'公开机构资源',summary:'了解第三方产品碳足迹核查服务的公开介绍。具体方法学、边界和适用性需按项目与法规要求确认。',region:'全球',languages:'以服务机构说明为准',url:'https://www.ul.com/services/product-carbon-footprint-verification',source:'UL Solutions 服务说明',reviewedAt:'2026-11-27',tags:['碳足迹','生命周期','核查']},
  {id:'echa-candidate-list',category:'可持续与供应链',title:'REACH 候选清单义务说明',provider:'欧洲化学品管理局（ECHA）',kind:'官方资源',summary:'查看候选清单物质相关的供应链信息义务与官方说明。该资源是法规信息，不代表已完成产品评估。',region:'欧盟',languages:'英语及网站提供的语言',url:'https://echa.europa.eu/candidate-list-obligations',source:'ECHA 官方说明',reviewedAt:'2026-11-27',tags:['物质信息','供应链','REACH']},
  {id:'eu-battery-recycling',category:'欧盟市场与回收',title:'欧盟电池法规生产者责任与回收框架',provider:'欧盟委员会',kind:'官方资源',summary:'查阅电池法规中生产者责任、收集处理及回收相关政策信息。成员国执行、注册和申报要求需按销售国家另行核实。',region:'欧盟及成员国',languages:'英语及欧盟官方语言（以页面提供为准）',url:'https://environment.ec.europa.eu/topics/waste-and-recycling/batteries_en',source:'欧盟委员会环境专题页',reviewedAt:'2026-11-27',tags:['生产者责任','回收','成员国']},
  {id:'gs1-identification',category:'标识、标签与打印',title:'GS1 标识与二维码资源',provider:'GS1',kind:'公开机构资源',summary:'了解 GS1 标识体系及二维码标准化相关资源。具体标识方案是否适用于产品与法规场景，需结合正式要求确认。',region:'全球',languages:'多语言（因国家组织而异）',url:'https://www.gs1.org/standards/2d-barcodes',source:'GS1 标准资源',reviewedAt:'2026-11-27',tags:['标识','二维码','标准']},
  {id:'dpp-registry',category:'数据与系统对接',title:'DPP Registry 官方入口与支持资料',provider:'欧盟委员会',kind:'官方资源',summary:'获取 Registry 官方信息、测试环境和操作资料。本系统当前未连接真实 Registry，测试环境不等于正式登记。',region:'欧盟',languages:'英语为主',url:'https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/batteries_en',source:'欧盟委员会 DPP Batteries 页面',reviewedAt:'2026-11-27',tags:['Registry','登记','数据']},
  {id:'eidas-trust',category:'数据与系统对接',title:'欧盟电子身份与信任服务法规',provider:'欧盟委员会 / EUR-Lex',kind:'官方资源',summary:'查看 eIDAS 法规原文及电子身份、信任服务的法规基础。并非身份验证服务商目录。',region:'欧盟',languages:'欧盟官方语言',url:'https://eur-lex.europa.eu/eli/reg/2014/910/oj/eng',source:'EUR-Lex 法规原文',reviewedAt:'2026-11-27',tags:['电子身份','信任服务','法规']},
];

export const industryUpdates = [
  {id:'battery-regulation-2023',category:'法规进展',title:'欧盟电池法规 (EU) 2023/1542 原文',summary:'法规规定电池可持续性、安全、标签、尽职调查、生产者责任及电池护照等要求。请结合后续修订与实施文件阅读。',date:'2023-07-28',source:'EUR-Lex 官方公报',url:'https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng',tags:['法规','电池护照']},
  {id:'battery-regulation-amendment-2025',category:'官方公告',title:'法规 (EU) 2025/1561 修订文件',summary:'查看欧盟电池法规修订文本。本文仅提供来源入口，适用时间和具体影响需以正式文本及后续说明为准。',date:'2025-07-30',source:'EUR-Lex 官方公报',url:'https://eur-lex.europa.eu/eli/reg/2025/1561/oj/eng',tags:['修订','法规']},
  {id:'battery-passport-faq',category:'技术资料',title:'欧委会电池护照常见问题',summary:'汇总电池护照范围、数据、语言和 Registry 等问题的欧委会说明。FAQ 属解释性资料，具体法律判断以法规文本为准。',date:'持续更新',source:'欧盟委员会 FAQ',url:'https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/eu-digital-product-passport-faq-batteries_en',tags:['FAQ','护照','数据']},
];
