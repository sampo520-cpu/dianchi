import { syncSimplePassports } from './workflow.js';

// Only known demo products receive additive content; customer-entered values win.
export function enrichSampleContent(db) {
  if (db.sampleRichContentVersion >= 2) return db;
  const previous = structuredClone(db);
  for (const m of db.models.filter(m => /^(MOD-(ESS-240|EV-082|LMT-014)|FULL-SAMPLE-(ESS|EV|LMT)|GENERAL-SAMPLE-(PORTABLE|SLI|SMALL)|DEMO-LR03-ALKALINE)$/.test(m.id))) {
    const primary = m.id === 'DEMO-LR03-ALKALINE';
    const lead = m.chem === 'Lead-acid';
    const ev = m.type === '电动汽车';
    const ess = m.type === '工业储能';
    const lmt = m.type === '轻型交通工具';
    const application = primary ? 'remote controls, clocks and low-drain household devices' : lead ? '12 V vehicle starting, lighting and ignition systems' : ev ? 'electric vehicle traction systems with a compatible vehicle controller' : ess ? 'stationary commercial and industrial energy storage systems' : lmt ? 'light electric mobility with a compatible charger and controller' : 'compatible portable equipment and compact industrial power systems';
    const safety = primary ? 'Do not recharge. Do not mix old and new cells or different battery types. Observe polarity.' : lead ? 'Corrosive sulfuric acid and lead compounds. Avoid sparks, flames and short circuits. Provide ventilation during charging; wear appropriate eye and hand protection.' : 'Use only a compatible charger and observe the manufacturer’s operating limits. Do not crush, puncture, short-circuit or use a swollen or damaged battery. Installation and electrical isolation require trained personnel.';
    const defaults = {
      productOverviewEn: `<p><strong>${m.nameEn || m.name}</strong> is an illustrative ${m.chem} battery for ${application}.</p><ul><li>Nominal voltage: ${m.voltage} V; rated capacity: ${m.capacity} Ah; rated energy: ${m.energy} kWh.</li><li>Model data is shared across units; production date, batch and serial number identify this individual battery.</li><li>${primary ? 'Single-use primary cell; remove exhausted cells from equipment.' : 'Inspect the enclosure, terminals and connectors before commissioning. Keep the product label legible.'}</li></ul><p>Fictional product example. Values and instructions must be replaced with approved product documentation before commercial use.</p>`,
      safetyEn: `<h3>Handling and installation</h3><p>${safety}</p><ul><li>Keep away from children and unauthorized handling.</li><li>Store in a dry, ventilated area away from heat and direct sunlight. Protect terminals during transport.</li><li>Stop use if leakage, unusual heat, odor or physical damage is observed. Follow the product safety data sheet.</li></ul>`,
      cautionEn: `<p>${primary ? 'Remove exhausted cells and keep terminals away from metal objects. Store unused cells in their original packaging.' : lead ? 'Keep the battery upright and maintain ventilation. Check terminals and installation instructions before connection.' : 'Before use, check enclosure integrity and connector compatibility. Keep the battery within its declared operating and storage limits.'}</p><p>Follow the model-specific user guide and obtain qualified support when condition or compatibility is uncertain.</p>`,
      extinguishingEn: `<h3>Emergency response</h3><p>${lead ? 'Keep ignition sources away from charging areas. Avoid contact with leaked acid and isolate the area.' : primary ? 'Avoid contact with leaked alkaline electrolyte. Keep damaged cells separate and prevent terminal short circuits.' : 'If smoke, abnormal heat or venting occurs, keep people away, isolate the area and contact emergency services. Do not handle or reconnect the battery.'}</p><p>Fire response and extinguishing media must follow the specific safety data sheet and site emergency plan. This illustrative information is not an emergency operating procedure.</p>`,
      wasteEn: `<p>Collect used batteries separately. Do not dispose of them with unsorted household waste, burn them or dismantle them without authorization.</p><ul><li>${lead ? 'Return lead-acid batteries to a qualified collection point; prevent acid leakage during storage and transport.' : primary ? 'Return depleted primary cells to a designated battery collection point. Protect exposed terminals.' : 'Contact the supplier or an authorized battery collection operator. Damaged lithium batteries require an appropriate handling and transport assessment.'}</li><li>Keep the battery identity and service records available to the receiving operator.</li><li>Local collection arrangements and qualified recycling instructions take precedence.</li></ul>`,
      characteristics: [
        { id: `${m.id}-V`, name: 'Nominal voltage', value: String(m.voltage), unit: 'V', condition: 'Model nameplate rating; individual readings vary with state of charge.', note: 'Illustrative model declaration, not a laboratory result.' },
        { id: `${m.id}-CAP`, name: 'Rated capacity', value: String(m.capacity), unit: 'Ah', condition: primary ? 'Illustrative low-drain discharge profile; cutoff depends on application.' : lead ? 'Illustrative 20-hour discharge profile at 25 °C.' : 'Illustrative 0.5 C discharge at 25 °C within declared voltage limits.', note: 'Fictional value. Verify the rate, temperature and cutoff in the model test report.' },
        { id: `${m.id}-ENERGY`, name: 'Rated energy', value: String(m.energy), unit: 'kWh', condition: 'Model declaration; usable system energy depends on configuration.', note: 'Fictional demo rating.' },
        { id: `${m.id}-MASS`, name: 'Battery mass', value: String(m.weight), unit: 'kg', condition: 'Battery assembly excluding shipping packaging.', note: 'Illustrative nominal mass; production tolerance requires confirmation.' },
        { id: `${m.id}-LIFE`, name: primary ? 'Storage life' : 'Durability reference', value: primary ? '5 years' : lead ? '500 cycles' : ess ? '6000 cycles' : ev ? '2000 cycles' : '1800 cycles', unit: '', condition: primary ? 'Unopened original packaging under declared storage conditions.' : 'Illustrative cycle count to 80% capacity at 25 °C; load and depth of discharge affect life.', note: 'Fictional demonstration only; not a warranty or verified test result.' },
      ],
      markings: [
        { id: 'COLLECTION', nameEn: 'Separate collection', descriptionEn: 'Return to a designated collection point. Do not discard with household waste.', imageUrl: '/demo-mark-waste.png' },
        ...(primary ? [{ id: 'NO-RECHARGE', nameEn: 'Do not recharge', descriptionEn: 'Single-use primary cell. Never connect to a charger.', imageUrl: '/demo-mark-no-recharge.png' }] : []),
        { id: 'CHILDREN', nameEn: 'Keep away from children', descriptionEn: 'Prevent access to cells, terminals and damaged battery components.', imageUrl: '/demo-mark-children.png' },
      ],
    };
    for (const [key, val] of Object.entries(defaults)) if (m[key] == null || m[key] === '' || (Array.isArray(m[key]) && !m[key].length)) m[key] = val;
    if (m.company?.address === '江苏省苏州市示例路 88 号（虚构）') m.company.addressEn ||= '88 Sample Road, Suzhou, China (fictional)';
  }
  syncSimplePassports(db, previous);
  db.sampleRichContentVersion = 2;
  return db;
}
