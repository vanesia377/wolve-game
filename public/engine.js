export const MIN_PLAYERS = 8;
export const MAX_PLAYERS = 30;
export const ROLES = {
  wolf: { name: 'Ma Sói', icon: 'wolf', team: 'wolves', side: 'Phe Sói', description: 'Ẩn mình ban ngày. Mỗi đêm, chọn một người để cả đàn tấn công. Bạn biết ai là đồng đội.' },
  seer: { name: 'Tiên tri', icon: 'eye', team: 'village', side: 'Phe Dân', description: 'Mỗi đêm, soi một người để biết họ có phải Sói. Dùng thông tin của bạn để dẫn dắt lá phiếu ban ngày.' },
  guard: { name: 'Bảo vệ', icon: 'shield', team: 'village', side: 'Phe Dân', description: 'Mỗi đêm, bảo vệ một người, kể cả chính mình. Không thể bảo vệ cùng một người hai đêm liên tiếp.' },
  villager: { name: 'Dân làng', icon: 'home', team: 'village', side: 'Phe Dân', description: 'Quan sát lời nói và lá phiếu. Cùng ngôi làng tìm ra tất cả Sói trước khi quá muộn.' },
  doctor: { name: 'Bác sĩ', icon: 'shield', team: 'village', side: 'Phe Dân', description: 'Mỗi đêm, cứu một người khác khỏi Sói. Không thể tự cứu, nhưng có thể chọn lại cùng người ở đêm sau.' },
  cursed: { name: 'Người bị nguyền', icon: 'home', team: 'village', side: 'Phe Dân', description: 'Ban đầu thuộc phe Dân. Nếu bị Sói cắn mà không được bảo vệ, bạn sống sót và biến thành Ma Sói, đổi sang phe Sói.' },
  apprentice: { name: 'Học việc Tiên tri', icon: 'eye', team: 'village', side: 'Phe Dân', description: 'Khi Tiên tri chết, bạn trở thành Tiên tri từ đêm tiếp theo. Bạn không kế thừa kết quả soi cũ.' },
  mayor: { name: 'Thị trưởng', icon: 'home', team: 'village', side: 'Phe Dân', description: 'Ban ngày, có thể công khai danh tính. Sau đó lá phiếu của bạn có trọng số 2 đến hết ván, nhưng Sói cũng biết bạn là ai.' },
  fool: { name: 'Kẻ ngốc', icon: 'home', team: 'solo', side: 'Phe độc lập', description: 'Thắng riêng ngay khi bị làng bỏ phiếu loại. Bị Sói giết không đem lại chiến thắng. Hãy khiến ngôi làng nghi ngờ bạn.' },
  stubbornWolf: { name: 'Sói lì đòn', icon: 'wolf', team: 'wolves', side: 'Phe Sói', description: 'Săn cùng đàn Sói. Sống sót sau lần đầu bị làng bỏ phiếu loại; lần tiếp theo mới chết. Lần sống sót sẽ công khai vai trò của bạn.' },
};
export const BOT_NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Linh', 'Minh', 'Ngọc', 'Huy', 'Lan', 'Nam', 'Mai', 'Phong', 'Quỳnh', 'Sơn', 'Thảo', 'Tuấn', 'Vy', 'Đạt', 'Giang', 'Khang', 'Liên', 'Phúc', 'Trang', 'Vân', 'Yến', 'Bảo', 'Khánh', 'Tâm'];
export const isWolf = player => ROLES[player.role]?.team === 'wolves';
export const alive = state => state.players.filter(p => p.alive);
export const human = state => state.players[0];
const pick = (items, rng) => items[Math.floor(rng() * items.length)];
const add = (state, text, kind = 'story', privateEvent = false) => state.log.push({ text, kind, private: privateEvent, day: state.day });
const hasRole = role => Object.hasOwn(ROLES, role);

export function buildRoleDeck(playerCount = MIN_PLAYERS) {
  if (!Number.isInteger(playerCount) || playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) throw new Error('Số người phải là số nguyên từ 8 đến 30.');
  const deck = Array(Math.floor(playerCount / 4)).fill('wolf');
  if (playerCount >= 20) deck[0] = 'stubbornWolf';
  deck.push('seer', 'guard');
  for (const [minimum, role] of [[10, 'doctor'], [12, 'cursed'], [14, 'apprentice'], [16, 'mayor'], [18, 'fool']]) {
    if (playerCount >= minimum) deck.push(role);
  }
  while (deck.length < playerCount) deck.push('villager');
  return deck;
}

export function createGame(name = 'Bạn', role = 'random', rng = Math.random, playerCount = MIN_PLAYERS) {
  const deck = buildRoleDeck(playerCount);
  if (role !== 'random' && (!hasRole(role) || !deck.includes(role))) throw new Error('Vai trò không có trong quy mô ván này.');
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (role !== 'random') {
    const index = deck.indexOf(role);
    [deck[0], deck[index]] = [deck[index], deck[0]];
  }
  const state = {
    version: 2, phase: 'night', day: 1, winner: null,
    players: [String(name).trim().slice(0, 20) || 'Bạn', ...BOT_NAMES.slice(0, playerCount - 1)].map((n, i) => ({
      id: `p${i}`, name: n, role: deck[i], initialRole: deck[i], alive: true, known: {}, lastGuard: null,
      claimed: false, suspicion: {}, mayorRevealed: false, resisted: false,
    })),
    log: [], accused: null, votes: [], selected: null,
  };
  add(state, `Sương xuống. ${playerCount} người khép cửa, nhưng có ${deck.filter(r => ROLES[r].team === 'wolves').length} Sói không hề ngủ.`);
  add(state, `Bạn là ${ROLES[human(state).role].name}.`, 'secret', true);
  return state;
}

export function checkWinner(state) {
  if (state.phase === 'over') return true;
  const wolves = alive(state).filter(isWolf).length;
  const others = alive(state).length - wolves;
  if (wolves === 0 || wolves >= others) {
    state.winner = wolves === 0 ? 'village' : 'wolves';
    state.phase = 'over';
    add(state, wolves === 0 ? 'Bình minh đã trở lại. Ngôi làng tìm được tất cả Sói!' : 'Tiếng tru phủ kín khu rừng. Đàn Sói đã chiếm ngôi làng.', 'result');
    return true;
  }
  return false;
}

function targetsFor(state, player) {
  if (!player.alive) return [];
  return alive(state).filter(p => {
    if (isWolf(player)) return !isWolf(p);
    if (player.role === 'seer') return p.id !== player.id && !Object.hasOwn(player.known, p.id);
    if (player.role === 'guard') return p.id !== player.lastGuard;
    if (player.role === 'doctor') return p.id !== player.id;
    return false;
  });
}

export function nightTargets(state) {
  return state.phase === 'night' ? targetsFor(state, human(state)) : [];
}

function awakenApprentice(state) {
  if (alive(state).some(p => p.role === 'seer')) return;
  const apprentice = alive(state).find(p => p.role === 'apprentice');
  if (!apprentice) return;
  apprentice.role = 'seer';
  if (apprentice.id === human(state).id) add(state, 'Tiên tri đã mất. Bạn thức tỉnh thành Tiên tri, có thể soi từ đêm tiếp theo.', 'secret', true);
}

export function resolveNight(state, targetId = null, rng = Math.random) {
  if (state.phase !== 'night') throw new Error('Chưa đến ban đêm.');
  const me = human(state);
  const targets = nightTargets(state);
  if ((targets.length && !targets.some(p => p.id === targetId)) || (!targets.length && targetId !== null)) throw new Error('Hãy chọn một người hợp lệ.');
  const prey = alive(state).filter(p => !isWolf(p));
  const claimed = prey.filter(p => p.claimed || p.mayorRevealed);
  const victim = me.alive && isWolf(me)
    ? state.players.find(p => p.id === targetId)
    : pick(claimed.length ? claimed : prey, rng);
  const protectedIds = new Set();
  for (const protector of alive(state).filter(p => p.role === 'guard' || p.role === 'doctor')) {
    const eligible = targetsFor(state, protector);
    const important = eligible.filter(p => p.claimed || p.mayorRevealed);
    const protectedId = protector.id === me.id ? targetId : pick(important.length ? important : eligible, rng)?.id;
    if (protectedId) protectedIds.add(protectedId);
    if (protector.role === 'guard') protector.lastGuard = protectedId ?? null;
  }
  // All living actors act before the attack resolves, including a Seer killed tonight.
  for (const seer of alive(state).filter(p => p.role === 'seer')) {
    const observed = seer.id === me.id ? state.players.find(p => p.id === targetId) : pick(targetsFor(state, seer), rng);
    if (observed) {
      seer.known[observed.id] = isWolf(observed);
      if (seer.id === me.id) add(state, `Bạn soi ${observed.name}: ${isWolf(observed) ? 'là Ma Sói' : 'không phải Ma Sói'}.`, 'secret', true);
    }
  }
  if (victim && protectedIds.has(victim.id)) {
    add(state, 'Bình minh lên. Không ai mất tích đêm qua — người bảo vệ đã chặn cuộc tấn công.', 'dawn');
  } else if (victim?.role === 'cursed') {
    victim.role = 'wolf';
    // Old investigations no longer describe this player's current team.
    for (const player of state.players) delete player.known[victim.id];
    add(state, 'Bình minh lên. Không ai mất tích đêm qua.', 'dawn');
    if (victim.id === me.id) add(state, 'Lời nguyền thức tỉnh: bạn đã bị cắn và trở thành Ma Sói. Từ nay bạn thắng cùng phe Sói.', 'secret', true);
    else if (isWolf(me)) add(state, `${victim.name} đã biến thành Ma Sói và gia nhập đàn.`, 'secret', true);
  } else if (victim) {
    victim.alive = false;
    add(state, `${victim.name} đã bị Sói tấn công. Vai trò: ${ROLES[victim.role].name}.`, 'death');
  }
  awakenApprentice(state);
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
  for (const mayor of alive(state).filter(p => p.id !== me.id && p.role === 'mayor' && !p.mayorRevealed)) revealMayor(state, mayor.id);
  const speakers = alive(state).filter(p => p.id !== me.id && !p.claimed);
  // Rotate speakers so a large village does not always hear from the first three bots.
  const count = Math.min(5, Math.ceil(state.players.length / 4), speakers.length);
  for (let i = 0; i < count; i++) {
    const speaker = speakers[((state.day - 1) * count + i) % speakers.length];
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

export function revealMayor(state, playerId = human(state).id) {
  const mayor = alive(state).find(p => p.id === playerId && p.role === 'mayor' && !p.mayorRevealed);
  if (state.phase !== 'day' || !mayor) throw new Error('Chỉ Thị trưởng còn sống mới có thể công khai một lần vào ban ngày.');
  mayor.mayorRevealed = true;
  add(state, `${mayor.name} công khai là Thị trưởng. Lá phiếu từ nay có trọng số 2.`, 'story');
  return state;
}

function botVote(state, bot, rng) {
  const choices = alive(state).filter(p => p.id !== bot.id);
  const seer = alive(state).find(p => p.claimed && p.role === 'seer');
  const scores = choices.map(p => {
    let score = rng() * 4 + (bot.suspicion[p.id] || 0);
    if (state.accused === p.id) score += 1.4;
    if (isWolf(bot)) {
      if (isWolf(p)) score -= 100;
      if (p.claimed || p.mayorRevealed) score += 3;
    } else if (bot.role !== 'fool') {
      if (bot.known[p.id] === true || (seer && seer.known[p.id] === true) || (p.role === 'stubbornWolf' && p.resisted)) score += 20;
      if (bot.known[p.id] === false || p.claimed || p.mayorRevealed) score -= 5;
    }
    return { id: p.id, score };
  });
  return scores.sort((a, b) => b.score - a.score)[0].id;
}

export function resolveVote(state, targetId = null, rng = Math.random) {
  if (state.phase !== 'day') throw new Error('Chưa đến lúc bỏ phiếu.');
  const me = human(state);
  if (me.alive && targetId !== null && !alive(state).some(p => p.id === targetId && p.id !== me.id)) throw new Error('Lá phiếu không hợp lệ.');
  state.votes = alive(state).map(p => ({ voter: p.id, target: p.id === me.id ? targetId : botVote(state, p, rng), weight: p.role === 'mayor' && p.mayorRevealed ? 2 : 1 }));
  const tally = {};
  for (const vote of state.votes) if (vote.target) tally[vote.target] = (tally[vote.target] || 0) + vote.weight;
  const ranking = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (ranking.length && (ranking.length === 1 || ranking[0][1] > ranking[1][1])) {
    const eliminated = state.players.find(p => p.id === ranking[0][0]);
    if (eliminated.role === 'stubbornWolf' && !eliminated.resisted) {
      eliminated.resisted = true;
      add(state, `${eliminated.name} nhận ${ranking[0][1]} phiếu nhưng sống sót! Vai trò Sói lì đòn đã lộ; lần bị loại tiếp theo sẽ chết.`, 'story');
    } else {
      eliminated.alive = false;
      add(state, `${eliminated.name} bị loại với ${ranking[0][1]} phiếu. Vai trò: ${ROLES[eliminated.role].name}.`, 'death');
      if (eliminated.role === 'fool') {
        state.winner = 'fool';
        state.phase = 'over';
        state.selected = null;
        add(state, `${eliminated.name} là Kẻ ngốc và đã thắng riêng vì bị làng bỏ phiếu loại!`, 'result');
        return state;
      }
      for (const vote of state.votes) {
        if (vote.target === eliminated.id) {
          for (const observer of alive(state)) {
            observer.suspicion[vote.voter] = Math.max(-2, Math.min(3, (observer.suspicion[vote.voter] || 0) + (isWolf(eliminated) ? -1 : 0.5)));
          }
        }
      }
      awakenApprentice(state);
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
    if (!s || ![1, 2].includes(s.version) || !['night', 'day', 'dusk', 'over'].includes(s.phase) || !Number.isInteger(s.day) || s.day < 1 ||
        !Array.isArray(s.players) || !Array.isArray(s.log) || !Array.isArray(s.votes) ||
        ![null, 'village', 'wolves', 'fool'].includes(s.winner)) return null;
    const legacy = s.version === 1;
    if (legacy && s.players.length !== 8) return null;
    const deck = buildRoleDeck(s.players.length);
    const ids = new Set(s.players.map((_, i) => `p${i}`));
    const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const idOrNull = id => id === null || ids.has(id);
    if (!idOrNull(s.selected) || !idOrNull(s.accused)) return null;
    for (const [i, p] of s.players.entries()) {
      if (!p || p.id !== `p${i}` || !hasRole(p.role) || typeof p.name !== 'string' || typeof p.alive !== 'boolean' ||
          !record(p.known) || !record(p.suspicion) || typeof p.claimed !== 'boolean' || !idOrNull(p.lastGuard)) return null;
      if (Object.entries(p.known).some(([id, value]) => !ids.has(id) || typeof value !== 'boolean') ||
          Object.entries(p.suspicion).some(([id, value]) => !ids.has(id) || !Number.isFinite(value))) return null;
      if (legacy) {
        p.initialRole = p.role;
        p.mayorRevealed = false;
        p.resisted = false;
      }
      if (!hasRole(p.initialRole) || typeof p.mayorRevealed !== 'boolean' || typeof p.resisted !== 'boolean' ||
          (p.mayorRevealed && p.role !== 'mayor') || (p.resisted && p.role !== 'stubbornWolf')) return null;
      const validChange = (p.initialRole === 'cursed' && p.role === 'wolf') || (p.initialRole === 'apprentice' && p.role === 'seer');
      if (p.initialRole !== p.role && !validChange) return null;
    }
    for (const role of Object.keys(ROLES)) {
      if (s.players.filter(p => p.initialRole === role).length !== deck.filter(r => r === role).length) return null;
    }
    if ((s.phase === 'over') !== (s.winner !== null)) return null;
    if (s.winner === 'fool' && !s.players.some(p => p.role === 'fool' && !p.alive)) return null;
    if (s.log.some(e => !e || typeof e.text !== 'string' || typeof e.kind !== 'string' || typeof e.private !== 'boolean' || !Number.isInteger(e.day))) return null;
    const voters = new Set();
    for (const v of s.votes) {
      if (!v || !ids.has(v.voter) || !idOrNull(v.target) || voters.has(v.voter)) return null;
      voters.add(v.voter);
      if (legacy) v.weight = 1;
      const voter = s.players.find(p => p.id === v.voter);
      if (v.weight !== (voter.role === 'mayor' && voter.mayorRevealed ? 2 : 1)) return null;
    }
    s.version = 2;
    return s;
  } catch { return null; }
}
