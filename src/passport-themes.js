export const passportThemes = [
  { id: 'forest', name: '生态绿', color: '#176443' },
  { id: 'ocean', name: '科技蓝', color: '#175b99' },
  { id: 'graphite', name: '石墨灰', color: '#374151' },
  { id: 'teal', name: '青碧色', color: '#086b72' },
];
export const safePassportTheme = value => passportThemes.some(t => t.id === value) ? value : 'forest';
