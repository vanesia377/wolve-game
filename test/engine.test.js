import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, alive, nightTargets, resolveNight, accuse, resolveVote, nextNight, checkWinner, restoreGame } from '../public/engine.js';

function random(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
function fixture(role = 'seer') {
  const s = createGame('Người chơi', role, random(42));
  const deck = ['wolf', 'wolf', 'seer', 'guard', 'villager', 'villager', 'villager', 'villager'];
  const index = deck.indexOf(role);
  [deck[0], deck[index]] = [deck[index], deck[0]];
  s.players.forEach((p, i) => p.role = deck[i]);
  return s;
}

test('deals exactly eight players with two wolves and honors each selected role', () => {
  for (const role of ['seer', 'guard', 'wolf', 'villager']) {
    const s = createGame('Mai', role, random(17));
    assert.equal(s.players.length, 8);
    assert.equal(s.players[0].role, role);
    assert.equal(s.players.filter(p => p.role === 'wolf').length, 2);
    assert.equal(s.players.filter(p => p.role === 'seer').length, 1);
    assert.equal(s.players.filter(p => p.role === 'guard').length, 1);
    assert.equal(s.players.filter(p => p.role === 'villager').length, 4);
    assert.equal(s.phase, 'night');
  }
});
test('rejects invalid roles and normalizes the name', () => {
  assert.throws(() => createGame('Mai', 'witch'));
  assert.equal(createGame('   ').players[0].name, 'Bạn');
  assert.equal(createGame('x'.repeat(100)).players[0].name.length, 20);
});
test('wolves cannot target their allies or themselves; invalid action does not mutate game', () => {
  const s = fixture('wolf');
  assert.deepEqual(nightTargets(s).map(p => p.id), ['p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
  const before = structuredClone(s);
  assert.throws(() => resolveNight(s, 'p1'));
  assert.deepEqual(s, before);
});
test('wolf attack removes the chosen unprotected player', () => {
  const s = fixture('wolf');
  resolveNight(s, 'p4', () => 0);
  assert.equal(s.players[4].alive, false);
  assert.equal(s.phase, 'day');
});
test('guard can save themselves and cannot repeat the same target next night', () => {
  const s = fixture('guard');
  resolveNight(s, 'p0', () => 0);
  assert.equal(alive(s).length, 8);
  assert.equal(s.players[0].lastGuard, 'p0');
  s.phase = 'dusk';
  nextNight(s);
  assert.equal(s.day, 2);
  assert.ok(!nightTargets(s).some(p => p.id === 'p0'));
  assert.throws(() => resolveNight(s, 'p0'));
});
test('seer receives private result and cannot rescan an observed player', () => {
  const s = fixture('seer');
  resolveNight(s, 'p1', () => .3);
  assert.equal(s.players[0].known.p1, true);
  assert.ok(s.log.some(e => e.private && e.text.includes('là Ma Sói')));
  s.phase = 'dusk';
  nextNight(s);
  assert.ok(!nightTargets(s).some(p => p.id === 'p1'));
});
test('seer can announce a discovered wolf through an accusation', () => {
  const s = fixture('seer');
  s.phase = 'day';
  s.players[0].known.p1 = true;
  accuse(s, 'p1');
  assert.equal(s.players[0].claimed, true);
  assert.match(s.log.at(-1).text, /Tôi là Tiên tri/);
  resolveVote(s, 'p1', () => 0);
  assert.ok(s.votes.filter(v => v.target === 'p1').length >= 5);
});
test('accusations only work once a day, for living targets other than self', () => {
  const s = fixture();
  assert.throws(() => accuse(s, 'p1'));
  s.phase = 'day';
  assert.throws(() => accuse(s, 'p0'));
  s.players[1].alive = false;
  assert.throws(() => accuse(s, 'p1'));
  accuse(s, 'p2');
  assert.throws(() => accuse(s, 'p3'));
});
test('votes are recorded, abstention works, and a unique leading candidate is eliminated', () => {
  const s = fixture('villager');
  s.phase = 'day';
  resolveVote(s, null, () => 0);
  assert.equal(s.votes.length, 8);
  assert.equal(s.votes[0].target, null);
  assert.equal(s.players[0].alive, false);
  assert.equal(s.phase, 'dusk');
});
test('tied highest vote does not eliminate anyone', () => {
  const s = fixture('villager');
  s.phase = 'day';
  for (let i = 1; i < 8; i++) s.players[i].suspicion[i <= 4 ? 'p0' : 'p4'] = 200;
  resolveVote(s, 'p4', () => 0);
  assert.equal(alive(s).length, 8);
  assert.match(s.log.at(-1).text, /bằng nhau/);
});
test('dead human cannot accuse or affect votes and can spectate through a night', () => {
  const s = fixture('villager');
  s.players[0].alive = false;
  assert.deepEqual(nightTargets(s), []);
  resolveNight(s, null, () => .5);
  assert.throws(() => accuse(s, 'p2'));
  resolveVote(s, null, () => .5);
  assert.ok(s.votes.every(v => v.voter !== 'p0'));
});
test('village wins when all wolves are dead; wolves win at parity', () => {
  const village = fixture();
  village.players.filter(p => p.role === 'wolf').forEach(p => p.alive = false);
  assert.equal(checkWinner(village), true);
  assert.equal(village.winner, 'village');
  const wolves = fixture();
  let kept = 0;
  wolves.players.filter(p => p.role !== 'wolf').forEach(p => p.alive = kept++ < 2);
  assert.equal(checkWinner(wolves), true);
  assert.equal(wolves.winner, 'wolves');
});
test('phase guards prevent duplicated night resolution, voting and night transitions', () => {
  const s = fixture('guard');
  assert.throws(() => resolveVote(s, 'p1'));
  assert.throws(() => nextNight(s));
  resolveNight(s, 'p0', () => 0);
  assert.throws(() => resolveNight(s, 'p1'));
  resolveVote(s, 'p1', () => 0);
  assert.throws(() => resolveVote(s, 'p1'));
});
test('saved games roundtrip and invalid data is rejected safely', () => {
  const s = fixture();
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
  for (const data of [null, '', '{}', '{broken', '{"version":1}', JSON.stringify({ ...s, players: [] }), JSON.stringify({ ...s, phase: 'over' })]) assert.equal(restoreGame(data), null);
});
test('400 seeded complete games obey invariants and reach a winner', () => {
  const winners = new Set();
  for (let seed = 1; seed <= 400; seed++) {
    const rng = random(seed);
    const s = createGame('Bạn', 'random', rng);
    let turns = 0;
    while (s.phase !== 'over' && turns++ < 200) {
      if (s.phase === 'night') {
        const choices = nightTargets(s);
        resolveNight(s, choices.length ? choices[Math.floor(rng() * choices.length)].id : null, rng);
      } else if (s.phase === 'day') {
        const choices = alive(s).filter(p => p.id !== 'p0');
        const target = choices[Math.floor(rng() * choices.length)].id;
        if (s.players[0].alive) accuse(s, target);
        resolveVote(s, s.players[0].alive ? target : null, rng);
      } else nextNight(s);
      assert.ok(alive(s).length <= 8);
      assert.ok(restoreGame(JSON.stringify(s)));
    }
    assert.equal(s.phase, 'over', `seed ${seed} did not finish`);
    winners.add(s.winner);
  }
  assert.deepEqual([...winners].sort(), ['village', 'wolves']);
});
