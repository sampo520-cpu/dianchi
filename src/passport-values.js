export function fieldMaintenanceLevel(code) {
  if (code.startsWith('batch.') || code === 'instance.date' || ['carbon', 'recycled', 'diligence'].includes(code.split('.')[1])) return 'batch';
  return code.startsWith('instance.') ? 'instance' : 'product';
}

export function passportFieldValue(version, page, language, code) {
  const [owner, key] = code.split('.');
  const source = version?.[owner] || {};
  return source[key] ?? '';
}
