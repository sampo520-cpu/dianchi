export const fieldDataTypes = ['文本', '数值', '日期', '长文本', '布尔值'];

export function inferFieldDataType(code, unit = '') {
  if (/\.(date|productionDate)$/.test(code)) return '日期';
  if (unit || /\.(energy|capacity|voltage|weight|soh|cycles|power|efficiency|resistance|remainingCapacity)$/.test(code)) return '数值';
  if (/\.(address|operatorAddress|materials|disassembly|composition|life|hazardous|parts)$/.test(code)) return '长文本';
  if (/\.(enabled|applicable)$/.test(code)) return '布尔值';
  return '文本';
}
