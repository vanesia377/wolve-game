export const ROLES = {
  wolf: { name: 'Ma Sói', icon: 'wolf', side: 'Phe Sói', description: 'Ẩn mình ban ngày. Mỗi đêm, chọn một người để cả đàn tấn công. Bạn biết ai là đồng đội.' },
  seer: { name: 'Tiên tri', icon: 'eye', side: 'Phe Dân', description: 'Mỗi đêm, soi một người để biết họ có phải Ma Sói. Dùng thông tin của bạn để dẫn dắt lá phiếu ban ngày.' },
  guard: { name: 'Bảo vệ', icon: 'shield', side: 'Phe Dân', description: 'Mỗi đêm, bảo vệ một người, kể cả chính mình. Không thể bảo vệ cùng một người hai đêm liên tiếp.' },
  villager: { name: 'Dân làng', icon: 'home', side: 'Phe Dân', description: 'Quan sát lời nói và lá phiếu. Cùng ngôi làng tìm ra hai Ma Sói trước khi quá muộn.' },
};
export const BOT_NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Linh', 'Minh'];
const ROLE_DECK = ['wolf', 'wolf', 'seer', 'guard', 'villager', 'villager', 'villager', 'villager'];
const pick = (items, rng) => items[Math.floor(rng() * items.length)];
export const alive = (state) => state.players.filter(p => p.alive);
export const human = (state) => state.players[0];
const add = (state, text, kind = 'story', privateEvent = false) => state.log.push({ text, kind, private: privateEvent, day: state.day });

export function createGame(name = 'Bạn', role = 'random', rng = Math.random) {
  if (role !== 'random' && !ROLES[role]) throw new Error('Vai trò không hợp lệ.');
  const deck = [...ROLE_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (role !== 'random') {
    const index = deck.indexOf(role);
    [deck[0], deck[index]] = [deck[index], deck[0]];
  }
  const state = {
    version: 1, phase: 'night', day: 1, winner: null,
    players: [String(name).trim().slice(0, 20) || 'Bạn', ...BOT_NAMES].map((n, i) => ({
      id: `p${i}`, name: n, role: deck[i], alive: true, known: {}, lastGuard: null,
      claimed: false, suspicion: {},
    })),
    log: [], accused: null, votes: [], selected: null,
  };
  add(state, 'Sương xuống. Tám người khép cửa, nhưng có hai kẻ không hề ngủ.');
  add(state, `Bạn là ${ROLES[human(state).role].name}.`, 'secret', true);
  return state;
}

export function checkWinner(state) {
  const wolves = alive(state).filter(p => p.role === 'wolf').length;
  const village = alive(state).length - wolves;
  if (wolves === 0 || wolves >= village) {
    state.winner = wolves === 0 ? 'village' : 'wolves';
    state.phase = 'over';
    add(state, wolves === 0 ? 'Bình minh đã trở lại. Ngôi làng tìm được tất cả Ma Sói!' : 'Tiếng tru phủ kín khu rừng. Đàn Sói đã chiếm ngôi làng.', 'result');
    return true;
  }
  return false;
}

export function nightTargets(state) {
  const me = human(state);
  if (state.phase !== 'night' || !me.alive || me.role === 'villager') return [];
  return alive(state).filter(p => {
    if (me.role === 'wolf') return p.role !== 'wolf';
    if (me.role === 'seer') return p.id !== me.id && !(p.id in me.known);
    return p.id !== me.lastGuard;
  });
}

export function resolveNight(state, targetId = null, rng = Math.random) {
  if (state.phase !== 'night') throw new Error('Chưa đến ban đêm.');
  const me = human(state);
  const targets = nightTargets(state);
  if (targets.length && !targets.some(p => p.id === targetId)) throw new Error('Hãy chọn một người hợp lệ.');
  const villagers = alive(state).filter(p => p.role !== 'wolf');
  const claimed = villagers.filter(p => p.claimed);
  const victim = me.alive && me.role === 'wolf'
    ? state.players.find(p => p.id === targetId)
    : pick(claimed.length ? claimed : villagers, rng);
  const guard = alive(state).find(p => p.role === 'guard');
  let protectedId = null;
  if (guard) {
    const eligible = alive(state).filter(p => p.id !== guard.lastGuard);
    const important = eligible.filter(p => p.claimed);
    protectedId = guard.id === me.id ? targetId : pick(important.length ? important : eligible, rng).id;
    guard.lastGuard = protectedId;
  }
  const seer = alive(state).find(p => p.role === 'seer');
  if (seer) {
    const choices = alive(state).filter(p => p.id !== seer.id && !(p.id in seer.known));
    const observed = seer.id === me.id ? state.players.find(p => p.id === targetId) : pick(choices, rng);
    if (observed) {
      seer.known[observed.id] = observed.role === 'wolf';
      if (seer.id === me.id) add(state, `Bạn soi ${observed.name}: ${observed.role === 'wolf' ? 'là Ma Sói' : 'không phải Ma Sói'}.`, 'secret', true);
    }
  }
  if (victim.id === protectedId) {
    add(state, 'Bình minh lên. Không ai mất tích đêm qua — Bảo vệ đã chặn cuộc tấn công.', 'dawn');
  } else {
    victim.alive = false;
    add(state, `${victim.name} đã bị Sói tấn công. Vai trò: ${ROLES[victim.role].name}.`, 'death');
  }
  state.selected = null;
  if (checkWinner(state)) return state;
  state.phase = 'day';
  state.accused = null;
  state.votes = [];
  for (const bot of alive(state).filter(p => p.id !== me.id && p.role === 'seer')) {
    const found = alive(state).find(p => bot.known[p.id] === true);
    if (found) {
      bot.claimed = true;
      add(state, `${bot.name}: “Tôi là Tiên tri. Tôi đã soi ${found.name}, đó là Ma Sói!”`, 'chat');
    }
  }
  const speakers = alive(state).filter(p => p.id !== me.id && !p.claimed);
  for (const speaker of speakers.slice(0, 3)) {
    const suspect = pick(alive(state).filter(p => p.id !== speaker.id), rng);
    const previous = speaker.suspicion[suspect.id] || 0;
    add(state, previous > 0
      ? `${speaker.name}: “Tôi vẫn nghi ${suspect.name}. Hãy nhìn lại lá phiếu hôm trước.”`
      : `${speaker.name}: “Tôi chưa tin ${suspect.name}. Mọi người nghĩ sao?”`, 'chat');
  }
  return state;
}

export function accuse(state, targetId) {
  if (state.phase !== 'day' || !human(state).alive || state.accused) throw new Error('Bạn chỉ được nêu nghi vấn một lần mỗi ngày.');
  const target = alive(state).find(p => p.id === targetId && p.id !== human(state).id);
  if (!target) throw new Error('Hãy chọn một người còn sống khác.');
  state.accused = targetId;
  const me = human(state);
  if (me.role === 'seer' && me.known[targetId] === true) {
    me.claimed = true;
    add(state, `${me.name}: “Tôi là Tiên tri. Tôi đã soi ${target.name}, đó là Ma Sói!”`, 'chat');
  } else add(state, `${me.name}: “Tôi nghi ${target.name} là Ma Sói. Hãy cân nhắc trước khi bỏ phiếu.”`, 'chat');
  return state;
}

function botVote(state, bot, rng) {
  const choices = alive(state).filter(p => p.id !== bot.id);
  const seer = alive(state).find(p => p.claimed && p.role === 'seer');
  const scores = choices.map(p => {
    let score = rng() * 4 + (bot.suspicion[p.id] || 0);
    if (state.accused === p.id) score += 1.4;
    if (bot.role === 'wolf') {
      if (p.role === 'wolf') score -= 100;
      if (p.claimed) score += 3;
    } else {
      if (bot.known[p.id] === true || (seer && seer.known[p.id] === true)) score += 20;
      if (bot.known[p.id] === false || p.claimed) score -= 5;
    }
    return { id: p.id, score };
  });
  return scores.sort((a, b) => b.score - a.score)[0].id;
}

export function resolveVote(state, targetId = null, rng = Math.random) {
  if (state.phase !== 'day') throw new Error('Chưa đến lúc bỏ phiếu.');
  const me = human(state);
  if (me.alive && targetId !== null && !alive(state).some(p => p.id === targetId && p.id !== me.id)) throw new Error('Lá phiếu không hợp lệ.');
  state.votes = alive(state).map(p => ({ voter: p.id, target: p.id === me.id ? targetId : botVote(state, p, rng) }));
  const tally = {};
  for (const vote of state.votes) if (vote.target) tally[vote.target] = (tally[vote.target] || 0) + 1;
  const ranking = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (ranking.length && (ranking.length === 1 || ranking[0][1] > ranking[1][1])) {
    const eliminated = state.players.find(p => p.id === ranking[0][0]);
    eliminated.alive = false;
    add(state, `${eliminated.name} bị loại với ${ranking[0][1]} phiếu. Vai trò: ${ROLES[eliminated.role].name}.`, 'death');
    for (const vote of state.votes) {
      if (vote.target === eliminated.id) {
        for (const observer of alive(state)) {
          observer.suspicion[vote.voter] = Math.max(-2, Math.min(3, (observer.suspicion[vote.voter] || 0) + (eliminated.role === 'wolf' ? -1 : 0.5)));
        }
      }
    }
  } else add(state, 'Số phiếu cao nhất bằng nhau. Ngôi làng không loại ai hôm nay.', 'story');
  state.selected = null;
  if (!checkWinner(state)) state.phase = 'dusk';
  return state;
}

export function nextNight(state) {
  if (state.phase !== 'dusk') throw new Error('Chưa đến đêm tiếp theo.');
  state.day++;
  state.phase = 'night';
  state.selected = null;
  add(state, `Đêm ${state.day}. Sương lại tràn qua những mái nhà.`, 'story');
  return state;
}

export function restoreGame(raw) {
  try {
    const s = JSON.parse(raw);
    if (s.version !== 1 || !['night', 'day', 'dusk', 'over'].includes(s.phase) || !Number.isInteger(s.day) || s.day < 1 ||
        !Array.isArray(s.players) || s.players.length !== 8 || !Array.isArray(s.log) || !Array.isArray(s.votes) ||
        ![null, 'village', 'wolves'].includes(s.winner)) return null;
    if (s.players.some((p, i) => p.id !== `p${i}` || !ROLES[p.role] || typeof p.name !== 'string' || typeof p.alive !== 'boolean' ||
        !p.known || typeof p.known !== 'object' || !p.suspicion || typeof p.suspicion !== 'object' || typeof p.claimed !== 'boolean')) return null;
    if (ROLE_DECK.some(role => s.players.filter(p => p.role === role).length !== ROLE_DECK.filter(r => r === role).length)) return null;
    if ((s.phase === 'over') !== (s.winner !== null)) return null;
    if (s.log.some(e => typeof e.text !== 'string' || typeof e.kind !== 'string')) return null;
    if (s.votes.some(v => !s.players.some(p => p.id === v.voter) || (v.target !== null && !s.players.some(p => p.id === v.target)))) return null;
    return s;
  } catch { return null; }
}
