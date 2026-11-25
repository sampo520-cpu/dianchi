import { passportLanguages } from './passport-locales.js';

const translations = {
  'company.name': ['Manufacturer','Hersteller','Fabricant','Fabricante','Produttore','Fabricante','Fabrikant','Producent','制造商'],
  'company.address': ['Manufacturer address','Herstelleradresse','Adresse du fabricant','Dirección del fabricante','Indirizzo del produttore','Endereço do fabricante','Adres van de fabrikant','Adres producenta','制造商地址'],
  'company.contact': ['Contact email','Kontakt-E-Mail','E-mail de contact','Correo electrónico de contacto','E-mail di contatto','E-mail de contacto','Contact-e-mail','E-mail kontaktowy','联系邮箱'],
  'company.operator': ['Responsible economic operator','Verantwortlicher Wirtschaftsakteur','Opérateur économique responsable','Operador económico responsable','Operatore economico responsabile','Operador económico responsável','Verantwoordelijke marktdeelnemer','Odpowiedzialny podmiot gospodarczy','责任经济运营者'],
  'model.name': ['Model','Modell','Modèle','Modelo','Modello','Modelo','Model','Model','型号名称'],
  'model.chem': ['Chemistry','Chemie','Chimie','Química','Chimica','Química','Chemie','Chemia','化学体系'],
  'model.energy': ['Rated energy','Nennenergie','Énergie nominale','Energía nominal','Energia nominale','Energia nominal','Nominale energie','Energia znamionowa','额定能量'],
  'model.capacity': ['Rated capacity','Nennkapazität','Capacité nominale','Capacidad nominal','Capacità nominale','Capacidade nominal','Nominale capaciteit','Pojemność znamionowa','额定容量'],
  'model.voltage': ['Nominal voltage','Nennspannung','Tension nominale','Tensión nominal','Tensione nominale','Tensão nominal','Nominale spanning','Napięcie znamionowe','额定电压'],
  'model.weight': ['Weight','Gewicht','Poids','Peso','Peso','Peso','Gewicht','Masa','重量'],
  'instance.serial': ['Battery identifier','Batteriekennung','Identifiant de la batterie','Identificador de batería','Identificativo della batteria','Identificador da bateria','Batterij-identificatie','Identyfikator baterii','电池标识码'],
  'instance.date': ['Manufacturing date','Herstellungsdatum','Date de fabrication','Fecha de fabricación','Data di produzione','Data de fabrico','Productiedatum','Data produkcji','生产日期'],
  'model.carbon': ['Carbon footprint declaration','CO₂-Fußabdruckerklärung','Déclaration d’empreinte carbone','Declaración de huella de carbono','Dichiarazione dell’impronta di carbonio','Declaração da pegada de carbono','Verklaring over de koolstofvoetafdruk','Deklaracja śladu węglowego','碳足迹声明'],
  'model.recycled': ['Recycled content','Rezyklatanteil','Contenu recyclé','Contenido reciclado','Contenuto riciclato','Conteúdo reciclado','Gerecycled materiaal','Zawartość materiałów z recyklingu','再生材料含量'],
  'model.diligence': ['Due diligence information','Informationen zur Sorgfaltspflicht','Informations sur le devoir de diligence','Información sobre diligencia debida','Informazioni sulla dovuta diligenza','Informações sobre o dever de diligência','Informatie over passende zorgvuldigheid','Informacje o należytej staranności','尽职调查资料'],
  'instance.soh': ['State of health','Gesundheitszustand','État de santé','Estado de salud','Stato di salute','Estado de saúde','Gezondheidstoestand','Stan zdrowia','健康状态'],
  'instance.cycles': ['Cycle count','Zyklenzahl','Nombre de cycles','Número de ciclos','Numero di cicli','Número de ciclos','Aantal cycli','Liczba cykli','循环次数'],
  'model.disassembly': ['Disassembly and recycling information','Informationen zu Demontage und Recycling','Informations sur le démontage et le recyclage','Información sobre desmontaje y reciclaje','Informazioni sullo smontaggio e riciclaggio','Informações sobre desmontagem e reciclagem','Informatie over demontage en recycling','Informacje o demontażu i recyklingu','拆解与回收说明'],
  'model.composition': ['Detailed material composition','Detaillierte Materialzusammensetzung','Composition détaillée des matériaux','Composición detallada de materiales','Composizione dettagliata dei materiali','Composição detalhada dos materiais','Gedetailleerde materiaalsamenstelling','Szczegółowy skład materiałowy','详细材料组成'],
  'model.materials': ['Material information','Materialinformationen','Informations sur les matériaux','Información sobre materiales','Informazioni sui materiali','Informações sobre materiais','Materia informatie','Informacje o materiałach','材料信息'],
  'model.life': ['Expected lifetime and test conditions','Erwartete Lebensdauer und Prüfbedingungen','Durée de vie prévue et conditions d’essai','Vida útil prevista y condiciones de ensayo','Durata prevista e condizioni di prova','Vida útil prevista e condições de ensaio','Verwachte levensduur en testomstandigheden','Przewidywana trwałość i warunki badań','预计使用寿命及测试条件'],
  'model.power': ['Original power capability','Ursprüngliche Leistungsfähigkeit','Capacité de puissance initiale','Capacidad de potencia original','Capacità di potenza iniziale','Capacidade de potência inicial','Oorspronkelijk vermogen','Początkowa zdolność mocy','原始功率能力'],
  'model.efficiency': ['Initial round-trip efficiency and test conditions','Anfänglicher Wirkungsgrad und Prüfbedingungen','Rendement aller-retour initial et conditions d’essai','Eficiencia inicial de ciclo y condiciones de ensayo','Efficienza iniziale di ciclo e condizioni di prova','Eficiência inicial de ciclo e condições de ensaio','Initiële round-trip-efficiëntie en testomstandigheden','Początkowa sprawność cyklu i warunki badań','初始往返效率及测试条件'],
  'model.resistance': ['Initial internal resistance and test conditions','Anfangs-Innenwiderstand und Prüfbedingungen','Résistance interne initiale et conditions d’essai','Resistencia interna inicial y condiciones de ensayo','Resistenza interna iniziale e condizioni di prova','Resistência interna inicial e condições de ensaio','Initiële interne weerstand en testomstandigheden','Początkowa rezystancja wewnętrzna i warunki badań','初始内阻及测试条件'],
  'model.hazardous': ['Hazardous substances and evidence','Gefährliche Stoffe und Nachweise','Substances dangereuses et preuves','Sustancias peligrosas y pruebas','Sostanze pericolose e prove','Substâncias perigosas e evidências','Gevaarlijke stoffen en bewijsstukken','Substancje niebezpieczne i dowody','有害物质与依据'],
  'model.parts': ['Parts and repair information','Informationen zu Ersatzteilen und Reparatur','Informations sur les pièces et la réparation','Información sobre piezas y reparación','Informazioni su ricambi e riparazione','Informações sobre peças e reparação','Informatie over onderdelen en reparatie','Informacje o częściach i naprawie','零件与维修资料'],
  'instance.remainingCapacity': ['Remaining capacity and measurement conditions','Restkapazität und Messbedingungen','Capacité restante et conditions de mesure','Capacidad restante y condiciones de medición','Capacità residua e condizioni di misurazione','Capacidade restante e condições de medição','Resterende capaciteit en meetomstandigheden','Pozostała pojemność i warunki pomiaru','剩余容量及测量条件'],
  'instance.state': ['Battery lifecycle status','Batterie-Lebenszyklusstatus','État du cycle de vie de la batterie','Estado del ciclo de vida de la batería','Stato del ciclo di vita della batteria','Estado do ciclo de vida da bateria','Batterijstatus in de levenscyclus','Status cyklu życia baterii','电池生命周期状态'],
};

export function fieldLabelsFor(code, english = code, chinese = english) {
  const values = translations[code];
  return Object.fromEntries(Object.keys(passportLanguages).map((language, index) => [
    language,
    values?.[index] || (language === 'zh' ? chinese : english),
  ]));
}

export function completeFieldLabels(rule) {
  const defaults = fieldLabelsFor(rule.code, rule.en, rule.zh);
  return Object.fromEntries(Object.entries(defaults).map(([language, value]) => [
    language,
    rule.labels?.[language]?.trim() || value,
  ]));
}
