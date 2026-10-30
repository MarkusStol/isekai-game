/** v60 — Nocturna hub map metadata (presets + battle BGs + secrets). */
export const NOCTURNA_HUBS = {
  throne: {
    orts: ['Thronsaal der Nacht', 'Festung', 'Schatzkatakomben'],
    preset: 'throne',
    battleBg: 'assets/pixel/bg-battle/nocturna/throne.png',
    grade: 'throne',
    secrets: ['velka_ledger'],
  },
  pass: {
    orts: ['Grenzpass', 'Pass-Lager', 'Wachtürme am Pass'],
    preset: 'wall',
    battleBg: 'assets/pixel/bg-battle/nocturna/pass.png',
    grade: 'pass',
    secrets: ['nyx_cache'],
  },
  crypt: {
    orts: ['Ruinen von Solmir', 'Gruft von Solmir', 'Schattenmarkt'],
    preset: 'graveyard',
    battleBg: 'assets/pixel/bg-battle/nocturna/crypt.png',
    grade: 'crypt',
    secrets: ['lich_name'],
  },
  cathedral: {
    orts: ['Kathedrale des Lichts', 'Kathedrale Solari'],
    preset: 'church',
    battleBg: 'assets/pixel/bg-battle/nocturna/cathedral.png',
    grade: 'cathedral',
    secrets: ['solara_prayer'],
  },
};

export function hubForOrt(ort){
  const low = String(ort||'').toLowerCase();
  for(const [id,h] of Object.entries(NOCTURNA_HUBS)){
    if(h.orts.some(o=>low.includes(o.toLowerCase().slice(0,6)))) return {id, ...h};
    if(id==='throne' && /thron|festung|katakomb/.test(low)) return {id, ...h};
    if(id==='pass' && /pass|grenze|wachturm/.test(low)) return {id, ...h};
    if(id==='crypt' && /solmir|gruft|krypta|ruine|schattenmarkt/.test(low)) return {id, ...h};
    if(id==='cathedral' && /kathedrale|solari|kirche/.test(low)) return {id, ...h};
  }
  return null;
}

export default { NOCTURNA_HUBS, hubForOrt };
