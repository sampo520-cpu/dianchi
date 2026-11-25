export function codeStatus(db, instance) {
  const codes = db.codeRecords.filter(c => c.instanceId === instance.id);
  if (codes.length && codes.every(c => c.status === '作废')) return '已作废';
  if (db.versions.some(v => v.instance.id === instance.id)) return '可访问';
  return '资料待补充';
}
