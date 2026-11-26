export function queryPassportScope({category,energy,date,market='yes',finished='yes',exception='no',operation='original'}) {
  const reasons=[];
  const result=(status,title)=>({status,title,reasons});
  if(market==='no'){reasons.push('本次不涉及欧盟市场投放或投入使用，不触发本次欧盟电池护照判断。后续进入欧盟时应重新评估。');return result('outside','本次不属于欧盟投放场景');}
  if(market!=='yes'||finished!=='yes'||exception!=='no'||!category||category==='其他电池'){
    reasons.push('需先确认成品电池边界、法定类别及第 1 条排除情形。电芯、模组或营销名称本身不足以确定分类。');return result('review','需进一步确认产品分类或适用范围');
  }
  let covered=['电动汽车','轻型交通工具'].includes(category);
  if(['工业储能','其他工业电池'].includes(category)){
    if(energy===''||energy==null||!Number.isFinite(Number(energy))||Number(energy)<=0){reasons.push('工业电池需提供有效的额定能量，单位 kWh。');return result('review','请补充工业电池能量');}
    covered=Number(energy)>2;
    reasons.push('工业电池的护照门槛是大于 2 kWh；等于 2 kWh 不属于该门槛。');
  }
  if(!covered){reasons.push('根据所选分类，不属于第 77(1) 条列明的 EV、LMT 或大于 2 kWh 工业电池范围。');reasons.push('仍需评估第 13 条二维码及其他电池信息义务；可自愿提供一物一码信息页。');return result('outside','不属于第 77 条强制电池护照范围');}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||Number.isNaN(Date.parse(date))){reasons.push('请填写本次首次投放欧盟市场或投入使用的预计日期，不是生产日期。');return result('review','请补充本次投放或投入使用日期');}
  if(date<'2027-02-18'){reasons.push('第 77(1) 条从 2027-02-18 起适用；本次日期早于该日期。');reasons.push('后续准备再使用、准备转用、改变用途或再制造后重新投放/投入使用，应按新场景重新查询。');return result('later','本次日期尚未触发护照义务');}
  reasons.push('第 77(1) 条要求，自 2027-02-18 起，该类别每个投放市场或投入使用的具体成品电池具有电池护照。');
  if(operation!=='original')reasons.push('本次涉及再使用准备、转用或再制造，应按第 77(7) 条核对新护照、原护照关联及责任转移。普通维修通常不因此建立新护照。');
  return result('required','属于强制电池护照范围');
}
