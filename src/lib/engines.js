import { EUROPE_PLAYERS, USA_PLAYERS, ERAS, REGIONS, VENUES } from './gameData.js';

const r = (min, max) => Math.random() * (max - min) + min;
export const countryCounts = team => team.reduce((acc,p)=>({ ...acc, [p.nationality]:(acc[p.nationality]||0)+1 }),{});
export const uniqueByBase = arr => Array.from(new Map(arr.map(p=>[p.baseId,p])).values());
export const shuffle = arr => [...arr].sort(()=>Math.random()-.5);

export function rollPool(team, mode, usedBaseIds) {
  for (let attempt=0; attempt<50; attempt++) {
    const region = REGIONS[Math.floor(Math.random()*REGIONS.length)];
    const era = ERAS[Math.floor(Math.random()*ERAS.length)];
    if (region === 'Mainland Europe' && era === '1920s–1970s') continue;
    const counts = countryCounts(team);
    const pool = uniqueByBase(EUROPE_PLAYERS.filter(p =>
      p.region === region && p.era === era && !usedBaseIds.has(p.baseId) && (counts[p.nationality] || 0) < 3
    ));
    if (pool.length >= 3) return { region, era, choices: shuffle(pool).slice(0,6), message:null };
  }
  return { region:'', era:'', choices:[], message:'Not enough available players… re-rolling' };
}

export function autoGenerateUSA() {
  const byBase = uniqueByBase(USA_PLAYERS);
  const elite = byBase.filter(p => p.overall >= 90);
  const others = byBase.filter(p => p.overall < 90);
  return [...shuffle(elite).slice(0,7), ...shuffle(others).slice(0,5)].slice(0,12);
}

export function autoPair(team) {
  const priorities = [
    ['tommy-fleetwood','francesco-molinari'],['seve-ballesteros','jose-maria-olazabal'],['sergio-garcia','jon-rahm'],['rory-mcilroy','shane-lowry'],['justin-rose','ian-poulter'],['lee-westwood','luke-donald'],['jordan-spieth','justin-thomas'],['scottie-scheffler','xander-schauffele']
  ];
  const used = new Set(); const pairs=[];
  priorities.forEach(([a,b])=>{
    const p1 = team.find(p=>p.baseId===a && !used.has(p.baseId));
    const p2 = team.find(p=>p.baseId===b && !used.has(p.baseId));
    if (p1 && p2 && pairs.length<6) { pairs.push([p1,p2]); used.add(p1.baseId); used.add(p2.baseId); }
  });
  const rest = team.filter(p=>!used.has(p.baseId));
  for (let i=0; i<rest.length-1 && pairs.length<6; i+=2) pairs.push([rest[i],rest[i+1]]);
  return pairs;
}

export function pairingBonus(pairs) {
  const links = {
    'tommy-fleetwood|francesco-molinari':5,'seve-ballesteros|jose-maria-olazabal':5,'sergio-garcia|jon-rahm':4,'rory-mcilroy|shane-lowry':4,'justin-rose|ian-poulter':3,'lee-westwood|luke-donald':3,'jordan-spieth|justin-thomas':4,'scottie-scheffler|xander-schauffele':3,'nicolai-hojgaard|rasmus-hojgaard':3
  };
  let total=0;
  for (const [a,b] of pairs) {
    const key = [a.baseId,b.baseId].sort().join('|');
    total += links[key] || (a.nationality===b.nationality ? 1 : 0);
  }
  return total;
}

export function venueBonus(team, venue, side) {
  let venueFit = 0, homeNation = 0, homeAdvantage = venue.side === side ? 1 : 0;
  for (const p of team) {
    const fit = venue.attrs.reduce((s,attr)=>{
      if (attr==='APP') return s + (p.overall+p.foursomes)/2;
      if (attr==='FOR') return s + p.foursomes;
      if (attr==='FOB') return s + p.fourballs;
      if (attr==='CLT') return s + p.clutch;
      if (attr==='EXP') return s + p.aura;
      if (attr==='PUT') return s + (p.fourballs+p.clutch)/2;
      if (attr==='ACC') return s + (p.singles+p.foursomes)/2;
      if (attr==='POW') return s + p.overall;
      return s;
    },0) / venue.attrs.length;
    if (fit >= 92) venueFit += 1;
    if (p.nationality === venue.homeNation) homeNation += 1;
  }
  return { venue: venueFit, homeNation, homeAdvantage, total: venueFit + homeNation + homeAdvantage };
}

function matchOutcome(aPower, bPower) {
  const diff = aPower - bPower;
  if (Math.abs(diff) < 3) return { winner:'half', score:'AS', eu:0.5, us:0.5 };
  const europeWins = diff > 0;
  const abs = Math.abs(diff);
  const score = abs > 16 ? '5&4' : abs > 11 ? '3&2' : abs > 6 ? '2&1' : '1UP';
  return europeWins ? { winner:'eu', score, eu:1, us:0 } : { winner:'us', score, eu:0, us:1 };
}

function pairPower(pair, format, sideBonus=0) {
  const avg = (key)=>(pair[0][key]+pair[1][key])/2;
  const base = format==='foursomes' ? avg('foursomes')*.52 + avg('chemistry')*.24 + avg('clutch')*.16 : avg('fourballs')*.52 + avg('clutch')*.22 + avg('aura')*.12;
  return base + sideBonus + r(-8,8);
}
function singlePower(p, sideBonus=0) { return p.singles*.54 + p.clutch*.22 + p.aura*.12 + sideBonus + r(-9,9); }

export function simulateDay(teamEu, teamUs, pairsEu, venue, dayNum) {
  const pairsUs = autoPair(teamUs);
  const pb = pairingBonus(pairsEu);
  const vbEu = venueBonus(teamEu, venue, 'Europe');
  const vbUs = venueBonus(teamUs, venue, 'USA');
  const sideEu = (pb/4) + (vbEu.total/5);
  const sideUs = (vbUs.total/5);
  const sessions=[]; let eu=0, us=0; const playerPts={}; const add=(p,pts)=>{playerPts[p.baseId]=(playerPts[p.baseId]||0)+pts};
  for (const format of ['foursomes','fourballs']) {
    const matches=[]; let seu=0, sus=0;
    for (let i=0;i<4;i++) {
      const a = pairsEu[i % pairsEu.length]; const b = pairsUs[i % pairsUs.length];
      const out = matchOutcome(pairPower(a,format,sideEu), pairPower(b,format,sideUs));
      a.forEach(p=>add(p,out.eu)); b.forEach(p=>add(p,out.us));
      seu += out.eu; sus += out.us;
      matches.push({ euNames:a.map(p=>p.name).join(' / '), usNames:b.map(p=>p.name).join(' / '), score:out.score, winner:out.winner });
    }
    eu += seu; us += sus;
    sessions.push({ name:`Day ${dayNum} ${format==='foursomes'?'Foursomes':'Fourballs'}`, eu:seu, us:sus, matches });
  }
  return { eu, us, sessions, playerPts };
}

export function simulateSingles(teamEu, teamUs, venue) {
  let eu=0, us=0; const matches=[]; const playerPts={}; const vbEu=venueBonus(teamEu,venue,'Europe'); const vbUs=venueBonus(teamUs,venue,'USA');
  for (let i=0;i<12;i++) {
    const a=teamEu[i], b=teamUs[i]; const out=matchOutcome(singlePower(a,vbEu.total/5), singlePower(b,vbUs.total/5));
    playerPts[a.baseId]=out.eu; playerPts[b.baseId]=out.us; eu+=out.eu; us+=out.us;
    matches.push({ euNames:a.name, usNames:b.name, score:out.score, winner:out.winner });
  }
  return { eu, us, sessions:[{ name:'Singles Day', eu, us, matches }], playerPts };
}

export function getEuropeanMVP(team, pts) {
  return [...team].sort((a,b)=>(pts[b.baseId]||0)-(pts[a.baseId]||0) || b.overall-a.overall)[0];
}

export function hallSave(result) {
  const h = JSON.parse(localStorage.getItem('twentyEightHall')||'[]'); h.unshift({...result, date:new Date().toISOString()}); localStorage.setItem('twentyEightHall', JSON.stringify(h.slice(0,20)));
}
export function hallRead() { return JSON.parse(localStorage.getItem('twentyEightHall')||'[]'); }
export function randomVenue(){ return VENUES[Math.floor(Math.random()*VENUES.length)]; }
