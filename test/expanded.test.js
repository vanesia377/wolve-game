import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES, GROUPS, createGame, buildRoleDeck, alive, getAvailableActions,
  getActionTargets, performAction, resolveVote, nextNight, checkWinner,
  restoreGame, hasWon,
} from '../public/engine.js';
import { passiveDescription } from '../public/day-abilities.js';

const ROLE_IDS = Object.keys(ROLES);
function random(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
function game(role, count = 8, seed = 42) {
  return createGame('Mai', role, random(seed), count, { mode: 'expanded' });
}
function roundtrip(state, label = '') {
  assert.deepEqual(restoreGame(JSON.stringify(state)), state, label);
}
function chooseTargets(state, descriptor, rng, actorId = 'p0') {
  const choices = [...getActionTargets(state, descriptor.id, actorId)];
  if (choices.length < descriptor.min) return null;
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const count = descriptor.min + Math.floor(rng() * (Math.min(descriptor.max, choices.length) - descriptor.min + 1));
  return choices.slice(0, count).map(p => p.id);
}
function playableActions(state, rng) {
  return getAvailableActions(state).map(action => ({ action, targets: chooseTargets(state, action, rng) })).filter(a => a.targets !== null);
}
function actionNamed(state, id) {
  const action = getAvailableActions(state).find(a => a.id === id);
  assert.ok(action, `Missing available action ${id} for ${state.players[0].role} in ${state.phase}`);
  return action;
}
function neutralizeOtherSkills(state) {
  for (const p of state.players.slice(1)) {
    if (p.team === 'village' && p.role !== 'villager') {
      p.role = 'villager'; p.initialRole = 'villager'; state.roster[Number(p.id.slice(1))] = 'villager';
    }
  }
}
function forceVotes(state, targetId) {
  state.phase = 'day';
  for (const p of state.players) p.suspicion[targetId] = 1000;
  resolveVote(state, targetId === 'p0' ? null : targetId, () => 0);
}

test('expanded catalog contains all 126 distinct supplied roles with their actual group totals', () => {
  assert.equal(ROLE_IDS.length, 126);
  assert.deepEqual(Object.fromEntries(Object.keys(GROUPS).map(group => [group, ROLE_IDS.filter(id => ROLES[id].group === group).length])), {
    village: 64, wolves: 35, killer: 22, solo: 3, teamless: 2,
  });
  const names = new Set();
  for (const role of Object.values(ROLES)) {
    assert.equal(typeof role.officialName, 'string');
    assert.ok(role.officialName.length > 0);
    assert.ok(!names.has(role.officialName), role.officialName);
    names.add(role.officialName);
    assert.ok(role.description.length > 10, role.officialName);
  }
});

test('every expanded role is selectable in an exact 8-, 16-, or 30-person roster and saves roundtrip', () => {
  for (const count of [8, 16, 30]) {
    for (const role of ROLE_IDS) {
      const s = game(role, count);
      const deck = buildRoleDeck(count, 'expanded', role);
      assert.equal(s.players.length, count, `${role}/${count}`);
      assert.equal(s.players[0].role, role);
      assert.equal(s.version, 3);
      assert.equal(new Set(s.players.map(p => p.id)).size, count);
      assert.equal(new Set(s.players.slice(1).map(p => p.name)).size, count - 1);
      assert.deepEqual(s.players.map(p => p.role).sort(), [...deck].sort());
      assert.deepEqual(s.roster, s.players.map(p => p.initialRole));
      roundtrip(s, `${role}/${count}`);
      if (role === 'accomplice') {
        const partner = s.players.find(p => p.role === 'bandit');
        assert.ok(partner);
        assert.equal(s.players[0].team, partner.team);
      }
    }
  }
});

test('expanded creation rejects unknown roles and invalid participant counts', () => {
  for (const role of ['__proto__', 'constructor', 'not-a-role']) assert.throws(() => game(role));
  for (const count of [7, 31, 8.5, '8', NaN, null]) assert.throws(() => game('seer', count));
});

test('all expanded roles expose a role skill or a documented passive under the right phase and prerequisites', () => {
  for (const role of ROLE_IDS) {
    const s = game(role);
    const actor = s.players[0];
    const night = getAvailableActions(s).filter(a => a.id !== 'hunt');
    s.phase = 'day'; s.day = 2;
    s.players[1].alive = false;
    actor.data.fireworks = 1;
    actor.data.preacherBonus = 1;
    actor.data.markTarget = 'p2';
    actor.data.courage = 2;
    s.snapshots = [structuredClone({ ...s, snapshots: [], log: [] })];
    const day = getAvailableActions(s);
    assert.ok(night.length || day.length || passiveDescription(role), `${role} has no role-specific skill or documented passive`);
    for (const action of [...night, ...day]) {
      assert.equal(typeof action.id, 'string');
      assert.ok(action.label.length);
      assert.ok(action.description.length);
      assert.ok(Number.isInteger(action.min) && action.min >= 0);
      assert.ok(Number.isInteger(action.max) && action.max >= action.min);
      assert.ok(action.remaining === null || Number.isInteger(action.remaining) && action.remaining >= 0);
    }
  }
});

test('unavailable actions, invalid target IDs, repeated targets and invalid counts never mutate the game', () => {
  for (const role of ROLE_IDS) {
    for (const phase of ['night', 'day']) {
      const s = game(role);
      s.phase = phase; s.day = 2;
      const actions = getAvailableActions(s);
      let before = structuredClone(s);
      assert.throws(() => performAction(s, 'not-an-action', [], random(1)));
      assert.deepEqual(s, before, `${role}/${phase}/unknown`);
      for (const action of actions) {
        before = structuredClone(s);
        assert.throws(() => performAction(s, action.id, ['p999'], random(1)));
        assert.deepEqual(s, before, `${role}/${phase}/${action.id}/invalid ID`);
        assert.throws(() => performAction(s, action.id, Array(action.max + 1).fill('p1'), random(1)));
        assert.deepEqual(s, before, `${role}/${phase}/${action.id}/invalid count`);
        if (action.min > 0) {
          assert.throws(() => performAction(s, action.id, [], random(1)));
          assert.deepEqual(s, before, `${role}/${phase}/${action.id}/empty`);
        }
      }
    }
  }
});

test('Doctor protects the selected exposed player from the pack and cannot target self', () => {
  const s = game('doctor');
  neutralizeOtherSkills(s);
  const victim = s.players.find(p => p.id !== 'p0' && p.team === 'village');
  victim.claimed = true;
  const action = getAvailableActions(s).find(a => /cứu|bảo vệ|chữa/i.test(a.label));
  assert.ok(action);
  assert.ok(!getActionTargets(s, action.id).some(p => p.id === 'p0'));
  performAction(s, action.id, [victim.id], () => 0);
  assert.equal(victim.alive, true);
  assert.equal(s.phase, 'day');
  assert.ok(s.log.some(e => /bảo vệ/.test(e.text)));
  roundtrip(s);
});

test('Guard cannot select the previous protected person in the following night', () => {
  const s = game('guard');
  neutralizeOtherSkills(s);
  performAction(s, 'guard', ['p0'], () => 0);
  assert.equal(s.players[0].alive, true);
  assert.equal(s.players[0].lastGuard, 'p0');
  s.phase = 'dusk';
  nextNight(s);
  assert.ok(!getActionTargets(s, 'guard').some(p => p.id === 'p0'));
  const before = structuredClone(s);
  assert.throws(() => performAction(s, 'guard', ['p0'], () => 0));
  assert.deepEqual(s, before);
  roundtrip(s);
});

test('multi-target Detective investigation reports a private result and rejects duplicate targets', () => {
  const s = game('detective');
  neutralizeOtherSkills(s);
  const action = getAvailableActions(s).find(a => a.min === 2);
  assert.ok(action);
  const wolf = s.players.find(p => p.team === 'wolves');
  const villager = s.players.find(p => p.id !== 'p0' && p.team === 'village');
  const before = structuredClone(s);
  assert.throws(() => performAction(s, action.id, [wolf.id, wolf.id], () => 0));
  assert.deepEqual(s, before);
  performAction(s, action.id, [wolf.id, villager.id], () => 0);
  assert.ok(s.log.some(e => e.private && e.recipient === 'p0' && /phe/.test(e.text)));
  assert.equal(s.players[0].used[action.id], 1);
  roundtrip(s);
});

test('Zombie and Sect Leader perform real faction conversion with distinct role inheritance rules', () => {
  for (const [role, action, team] of [['zombie', 'zombify', 'zombie'], ['sectLeader', 'recruitSect', 'sect:p0']]) {
    const s = game(role);
    neutralizeOtherSkills(s);
    const target = s.players.find(p => p.team === 'wolves');
    const initialRole = target.role;
    s.players[0].known[target.id] = true;
    performAction(s, action, [target.id], () => 0);
    assert.equal(target.alive, true);
    assert.equal(target.team, team);
    assert.equal(target.role, role === 'zombie' ? 'zombie' : initialRole);
    assert.ok(!Object.hasOwn(s.players[0].known, target.id));
    assert.equal(s.players[0].used[action], 1);
    roundtrip(s);
  }
});

test('Medium revives a dead player with their current role and faction and consumes the one revival', () => {
  const s = game('medium');
  neutralizeOtherSkills(s);
  const target = s.players.find(p => p.id !== 'p0' && p.team === 'village');
  target.alive = false;
  const originalRole = target.role;
  const originalTeam = target.team;
  assert.equal(actionNamed(s, 'revive').remaining, 1);
  performAction(s, 'revive', [target.id], () => 0);
  assert.equal(target.alive, true);
  assert.equal(target.role, originalRole);
  assert.equal(target.team, originalTeam);
  assert.equal(s.players[0].used.revive, 1);
  assert.ok(s.log.some(e => /trở lại ngôi làng/.test(e.text)));
  s.players[0].alive = true;
  s.phase = 'night'; s.day = 2;
  target.alive = false;
  const before = structuredClone(s);
  assert.throws(() => performAction(s, 'revive', [target.id], () => 0));
  assert.deepEqual(s, before);
  roundtrip(s);
});

test('Gunner starts on day two, consumes two bullets, and cannot shoot a third time', () => {
  const s = game('gunner', 16);
  s.phase = 'day';
  assert.ok(!getAvailableActions(s).some(a => a.id === 'gunshot'));
  s.day = 2;
  assert.equal(actionNamed(s, 'gunshot').remaining, 2);
  let target = s.players.find(p => p.id !== 'p0' && p.team === 'village');
  performAction(s, 'gunshot', [target.id], () => 0);
  assert.equal(target.alive, false);
  assert.equal(s.players[0].publicRole, 'gunner');
  assert.equal(s.players[0].used.gunshot, 1);
  assert.ok(!getAvailableActions(s).some(a => a.id === 'gunshot'), 'only one shot per day');
  s.day = 3;
  assert.equal(actionNamed(s, 'gunshot').remaining, 1);
  target = s.players.find(p => p.id !== 'p0' && p.alive && p.team === 'village');
  performAction(s, 'gunshot', [target.id], () => 0);
  assert.equal(target.alive, false);
  assert.equal(s.players[0].used.gunshot, 2);
  s.day = 4;
  const before = structuredClone(s);
  assert.throws(() => performAction(s, 'gunshot', [s.players.find(p => p.alive && p.id !== 'p0').id], () => 0));
  assert.deepEqual(s, before);
  roundtrip(s);
});

test('Mayor reveal persists and gives a genuine doubled ballot', () => {
  const s = game('mayor', 16);
  s.phase = 'day';
  performAction(s, 'mayorReveal', [], () => 0);
  assert.equal(s.players[0].publicRole, 'mayor');
  const target = s.players.find(p => p.team === 'wolves');
  resolveVote(s, target.id, () => 0);
  const vote = s.votes.find(v => v.voter === 'p0');
  assert.ok(vote);
  assert.equal(vote.weight, 2);
  roundtrip(s);
});

test('Fool wins alone through a vote, and its result survives saving and further winner checks', () => {
  const s = game('fool');
  forceVotes(s, 'p0');
  assert.equal(s.phase, 'over');
  assert.deepEqual(s.winners, ['p0']);
  assert.equal(hasWon(s, s.players[0]), true);
  assert.equal(hasWon(s, s.players[1]), false);
  const before = structuredClone(s);
  assert.equal(checkWinner(s), true);
  assert.deepEqual(s, before);
  roundtrip(s);
});

test('a killer still alive prevents an early village victory after the wolves die', () => {
  const s = game('serialKiller');
  s.players.filter(p => p.team === 'wolves').forEach(p => p.alive = false);
  assert.equal(checkWinner(s), false);
  s.players.filter(p => p.id !== 'p0').forEach(p => p.alive = false);
  assert.equal(checkWinner(s), true);
  assert.ok(s.winner.startsWith('killer:'));
  assert.equal(hasWon(s, s.players[0]), true);
  roundtrip(s);
});

test('pair-target killers can attack their last opponent instead of creating an endless tie', () => {
  for (const [role, action] of [['evilSanta', 'lastGift'], ['evilDetective', 'evilDuel']]) {
    const s = game(role);
    neutralizeOtherSkills(s);
    const target = s.players.find(p => p.id !== 'p0' && p.team === 'village');
    s.players.forEach(p => p.alive = p.id === 'p0' || p.id === target.id);
    const descriptor = actionNamed(s, action);
    assert.equal(descriptor.min, 1);
    assert.equal(descriptor.max, 1);
    performAction(s, action, [target.id], () => 0);
    assert.equal(target.alive, false);
    assert.equal(s.phase, 'over');
    assert.equal(hasWon(s, s.players[0]), true);
    roundtrip(s);
  }
});

test('Nutcracker eliminates both leading candidates even when their totals are tied', () => {
  const s = game('nutcracker');
  neutralizeOtherSkills(s);
  s.phase = 'day';
  performAction(s, 'doubleLynch', [], () => 0);
  const [a, b] = s.players.slice(1, 3);
  a.suspicion[b.id] = 1000;
  b.suspicion[a.id] = 1000;
  s.players.slice(3).forEach((p, i) => p.suspicion[i < 2 ? a.id : b.id] = 1000);
  resolveVote(s, a.id, () => 0);
  assert.equal(s.votes.filter(v => v.target === a.id).length, 4);
  assert.equal(s.votes.filter(v => v.target === b.id).length, 4);
  assert.equal(a.alive, false);
  assert.equal(b.alive, false);
  assert.equal(s.data.deaths.length, 2);
  roundtrip(s);
});

test('Time Traveler restores previous state while retaining spent abilities and one shared rewind limit', () => {
  const s = game('timeTraveler');
  neutralizeOtherSkills(s);
  // Complete a real night so the engine retains its beginning as the rewind point.
  performAction(s, 'skip', [], () => 0.9);
  assert.equal(s.players[0].alive, true);
  s.phase = 'dusk';
  nextNight(s);
  const target = s.players.find(p => p.id !== 'p0' && p.alive && p.team === 'village');
  target.alive = false;
  const resourceOwner = s.players[1];
  resourceOwner.used.savePotion = 1;
  s.phase = 'day';
  const descriptor = actionNamed(s, 'rewindDay');
  assert.equal(descriptor.remaining, 1);
  performAction(s, 'rewindDay', [], () => 0);
  assert.equal(s.day, 1);
  assert.equal(s.phase, 'night');
  assert.equal(s.players.find(p => p.id === target.id).alive, true);
  assert.equal(s.players.find(p => p.id === resourceOwner.id).used.savePotion, 1);
  assert.equal(s.players[0].used.rewindDay, 1);
  assert.equal(s.data.rewindSpent.p0, true);
  s.phase = 'dusk';
  nextNight(s);
  assert.ok(!getAvailableActions(s).some(a => a.id === 'rewindDay'));
  s.phase = 'day';
  assert.ok(!getAvailableActions(s).some(a => a.id === 'rewindDay'));
  const before = structuredClone(s);
  assert.throws(() => performAction(s, 'rewindDay', [], () => 0));
  assert.deepEqual(s, before);
  roundtrip(s);
});

test('Preacher rewards a prediction only on its intended night and can turn the reward into vote weight', () => {
  const correct = game('preacher');
  neutralizeOtherSkills(correct);
  const victim = correct.players.find(p => p.id !== 'p0' && p.team === 'village');
  victim.claimed = true;
  performAction(correct, 'predict', [victim.id], () => 0);
  assert.equal(victim.alive, false);
  assert.equal(correct.players[0].data.preacherBonus, 1);
  performAction(correct, 'preacherReveal', [], () => 0);
  resolveVote(correct, correct.players.find(p => p.team === 'wolves').id, () => 0);
  assert.equal(correct.votes.find(v => v.voter === 'p0').weight, 2);
  roundtrip(correct);

  const stale = game('preacher');
  neutralizeOtherSkills(stale);
  const laterVictim = stale.players.find(p => p.id !== 'p0' && p.team === 'village');
  stale.players[0].effects.protections = [{ source: 'p0', expires: 1 }];
  performAction(stale, 'predict', [laterVictim.id], () => 0);
  assert.equal(laterVictim.alive, true);
  stale.phase = 'dusk';
  nextNight(stale);
  laterVictim.claimed = true;
  performAction(stale, 'skip', [], () => 0);
  assert.equal(laterVictim.alive, false);
  assert.equal(stale.players[0].data.preacherBonus || 0, 0);
  roundtrip(stale);
});

test('death-linked players both die when one is eliminated without recursing forever', () => {
  const s = game('cupid');
  const pair = s.players.filter(p => p.id !== 'p0' && p.team === 'village').slice(0, 2);
  s.links.push({ a: pair[0].id, b: pair[1].id, kind: 'lovers' });
  forceVotes(s, pair[0].id);
  assert.equal(pair[0].alive, false);
  assert.equal(pair[1].alive, false);
  assert.equal(s.data.deaths.filter(d => d.victim === pair[0].id).length, 1);
  assert.equal(s.data.deaths.filter(d => d.victim === pair[1].id).length, 1);
  roundtrip(s);
});

test('event-only gift roles send a real recorded gift to a dead player without combat effects', () => {
  for (const [role, action] of [['pumpkinKing', 'pumpkinGift'], ['santaClaus', 'christmasGift']]) {
    const s = game(role);
    s.phase = 'day';
    const target = s.players.find(p => p.id !== 'p0' && p.team === 'village');
    target.alive = false;
    const aliveBefore = alive(s).map(p => p.id);
    performAction(s, action, [target.id], () => 0);
    assert.equal(target.data.gifts, 1);
    assert.equal(s.players[0].data.giftsSent, 1);
    assert.deepEqual(alive(s).map(p => p.id), aliveBefore);
    assert.ok(s.log.some(e => e.private && e.recipient === 'p0' && /Cảm ơn/.test(e.text)));
    roundtrip(s);
  }
});

test('malformed extended saves are rejected without affecting valid v3 data', () => {
  const original = game('seer', 30);
  for (const mutate of [
    s => s.players[0].role = 'not-a-role',
    s => s.roster[0] = 'wolf',
    s => s.players[0].used.something = -1,
    s => s.players[0].used.something = 0.5,
    s => s.players[0].data.acted = [],
    s => s.selectedTargets = ['p0', 'p0'],
    s => s.selectedTargets = ['p999'],
    s => s.links = [{ a: 'p0', b: 'p999', kind: 'death' }],
    s => s.links = [{ a: 'p0', b: 'p0', kind: 'death' }],
    s => s.winners = ['p999'],
    s => s.phase = 'over',
  ]) {
    const invalid = structuredClone(original);
    mutate(invalid);
    assert.equal(restoreGame(JSON.stringify(invalid)), null);
  }
  roundtrip(original);
});

test('every expanded role completes seeded games at 8, 16 and 30 players with per-phase save roundtrips', () => {
  const wins = new Set();
  let completed = 0;
  for (const count of [8, 16, 30]) {
    for (const role of ROLE_IDS) {
      const rng = random(count * 997 + ROLE_IDS.indexOf(role) * 31 + 1);
      const s = createGame('Mai', role, rng, count, { mode: 'expanded' });
      let turns = 0;
      roundtrip(s, `${role}/${count}/initial`);
      while (s.phase !== 'over' && turns++ < 400) {
        const label = `${role}/${count}/${turns}/${s.phase}`;
        if (s.phase === 'night') {
          const choices = playableActions(s, rng);
          const choice = choices.length ? choices[Math.floor(rng() * choices.length)] : null;
          performAction(s, choice?.action.id || 'skip', choice?.targets || [], rng);
        } else if (s.phase === 'day') {
          const choices = playableActions(s, rng);
          const choice = choices.length ? choices[Math.floor(rng() * choices.length)] : null;
          if (choice) performAction(s, choice.action.id, choice.targets, rng);
          if (s.phase === 'day') {
            const human = s.players[0];
            const targets = alive(s).filter(p => p.id !== 'p0');
            const cannotVote = human.effects.cannotVoteThrough >= s.day || human.effects.silencedThrough >= s.day;
            const target = human.alive && !cannotVote && targets.length ? targets[Math.floor(rng() * targets.length)].id : null;
            resolveVote(s, target, rng);
          }
        } else nextNight(s);
        assert.equal(s.players.length, count, label);
        assert.ok(s.players.every(p => ROLE_IDS.includes(p.role)), label);
        for (const p of s.players) assert.ok(Object.values(p.used).every(value => Number.isInteger(value) && value >= 0), label);
        roundtrip(s, label);
      }
      assert.equal(s.phase, 'over', `${role}/${count} did not reach a result within 400 phase transitions`);
      assert.ok(s.winners.every(id => s.players.some(p => p.id === id)), `${role}/${count}`);
      assert.ok(s.winners.every(id => hasWon(s, s.players.find(p => p.id === id))), `${role}/${count}`);
      wins.add(s.winner);
      completed++;
    }
  }
  assert.equal(completed, 378);
  assert.ok(wins.has('village'));
  assert.ok(wins.has('wolves'));
  assert.ok([...wins].some(winner => winner.startsWith('killer:') || winner.startsWith('sect:') || winner === 'zombie'));
});
