import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, buildRoleDeck, isWolf, revealMayor, createGame, alive, nightTargets, resolveNight, accuse, resolveVote, nextNight, checkWinner, restoreGame } from '../public/engine.js';

function random(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
function fixture(role = 'seer') {
  const s = createGame('Người chơi', role, random(42));
  const deck = ['wolf', 'wolf', 'seer', 'guard', 'villager', 'villager', 'villager', 'villager'];
  const index = deck.indexOf(role);
  [deck[0], deck[index]] = [deck[index], deck[0]];
  s.players.forEach((p, i) => { p.role = deck[i]; p.initialRole = deck[i]; });
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

function expandedFixture(role, count = 30) {
  const s = createGame('Mai', role, random(42), count);
  const deck = buildRoleDeck(count);
  const index = deck.indexOf(role);
  [deck[0], deck[index]] = [deck[index], deck[0]];
  s.players.forEach((p, i) => { p.role = deck[i]; p.initialRole = deck[i]; });
  return s;
}
function removeProtectors(s) {
  s.players.filter(p => ['guard', 'doctor'].includes(p.role)).forEach(p => p.alive = false);
}
function forceVote(s, target) {
  s.phase = 'day';
  for (const p of alive(s)) p.suspicion[target.id] = 200;
  resolveVote(s, target.id === 'p0' ? null : target.id, () => 0);
}

test('every size from 8 to 30 has an exact deck, unique bot names, and selectable roles', () => {
  for (let count = 8; count <= 30; count++) {
    const deck = buildRoleDeck(count);
    assert.equal(deck.length, count);
    assert.equal(deck.filter(role => ROLES[role].team === 'wolves').length, Math.floor(count / 4));
    for (const role of new Set(deck)) {
      const s = createGame('Mai', role, random(count), count);
      assert.equal(s.players.length, count);
      assert.equal(s.players[0].role, role);
      assert.equal(new Set(s.players.map(p => p.id)).size, count);
      assert.equal(new Set(s.players.slice(1).map(p => p.name)).size, count - 1);
      assert.deepEqual(s.players.map(p => p.role).sort(), [...deck].sort());
      assert.deepEqual(restoreGame(JSON.stringify(s)), s);
    }
  }
  assert.equal(new Set(buildRoleDeck(30)).size, 10);
  for (const count of [0, 7, 31, 10.5, '30', null, NaN]) assert.throws(() => createGame('Mai', 'random', Math.random, count));
  for (const role of ['doctor', 'fool', 'stubbornWolf', '__proto__', 'toString']) assert.throws(() => createGame('Mai', role));
});

test('Doctor cannot self-save, saves another player, and can repeat that target', () => {
  const s = expandedFixture('doctor', 10);
  const victim = s.players.find(p => p.role === 'villager');
  s.players.find(p => p.role === 'guard').alive = false;
  victim.claimed = true;
  assert.ok(!nightTargets(s).some(p => p.id === 'p0'));
  const before = structuredClone(s);
  assert.throws(() => resolveNight(s, 'p0'));
  assert.deepEqual(s, before);
  resolveNight(s, victim.id, () => 0);
  assert.equal(victim.alive, true);
  s.phase = 'dusk';
  nextNight(s);
  assert.ok(nightTargets(s).some(p => p.id === victim.id));
  resolveNight(s, victim.id, () => 0);
  assert.equal(victim.alive, true);
  assert.ok(restoreGame(JSON.stringify(s)));
});

test('Cursed survives a bite, switches team, and invalidates old Seer observations', () => {
  const s = expandedFixture('cursed', 12);
  removeProtectors(s);
  s.players[0].claimed = true; // Ensure the pack chooses this sole exposed target.
  const seer = s.players.find(p => p.role === 'seer');
  seer.known.p0 = false;
  const wolves = alive(s).filter(isWolf).length;
  resolveNight(s, null, () => 0);
  assert.equal(s.players[0].alive, true);
  assert.equal(s.players[0].role, 'wolf');
  assert.equal(alive(s).filter(isWolf).length, wolves + 1);
  assert.ok(!Object.hasOwn(seer.known, 'p0'));
  assert.ok(s.log.some(e => e.private && e.text.includes('trở thành Ma Sói')));
  assert.ok(!s.log.some(e => !e.private && /biến thành|trở thành|gia nhập đàn/.test(e.text)));
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
  s.phase = 'dusk';
  nextNight(s);
  assert.ok(nightTargets(s).every(p => !isWolf(p)));
});

test('protection prevents Cursed conversion', () => {
  const s = expandedFixture('guard', 12);
  const cursed = s.players.find(p => p.role === 'cursed');
  s.players.find(p => p.role === 'doctor').alive = false;
  cursed.claimed = true;
  resolveNight(s, cursed.id, () => 0);
  assert.equal(cursed.role, 'cursed');
  assert.equal(cursed.alive, true);
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
});

test('Apprentice wakes after Seer dies at night and investigates starting next night', () => {
  const s = expandedFixture('apprentice', 14);
  removeProtectors(s);
  const seer = s.players.find(p => p.role === 'seer');
  seer.claimed = true;
  assert.deepEqual(nightTargets(s), []);
  resolveNight(s, null, () => 0);
  assert.equal(seer.alive, false);
  assert.equal(s.players[0].role, 'seer');
  assert.deepEqual(s.players[0].known, {});
  assert.ok(s.log.some(e => e.private && e.text.includes('thức tỉnh')));
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
  s.phase = 'dusk';
  nextNight(s);
  const target = nightTargets(s).find(isWolf);
  resolveNight(s, target.id, () => 0);
  assert.equal(s.players[0].known[target.id], true);
});

test('Apprentice also wakes after a daytime elimination of Seer', () => {
  const s = expandedFixture('apprentice', 14);
  const seer = s.players.find(p => p.role === 'seer');
  forceVote(s, seer);
  assert.equal(seer.alive, false);
  assert.equal(s.players[0].role, 'seer');
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
});

test('Mayor must reveal in daylight, doubles an actual vote, and cannot reveal twice', () => {
  function smallVote() {
    const s = expandedFixture('mayor', 16);
    const wolf = s.players.find(isWolf);
    const [a, b] = s.players.filter(p => p.role === 'villager');
    const active = ['p0', wolf.id, a.id, b.id];
    s.players.forEach(p => p.alive = active.includes(p.id));
    wolf.suspicion[a.id] = 200;
    a.suspicion[wolf.id] = 200;
    b.suspicion[a.id] = 200;
    return { s, wolf };
  }
  const plain = smallVote();
  assert.throws(() => revealMayor(plain.s));
  plain.s.phase = 'day';
  resolveVote(plain.s, plain.wolf.id, () => 0);
  assert.equal(plain.s.phase, 'dusk'); // 2 vs 2: tie without reveal.
  assert.equal(plain.wolf.alive, true);
  const { s, wolf } = smallVote();
  s.phase = 'day';
  revealMayor(s);
  const before = structuredClone(s);
  assert.throws(() => revealMayor(s));
  assert.deepEqual(s, before);
  resolveVote(s, wolf.id, () => 0);
  assert.equal(s.votes.find(v => v.voter === 'p0').weight, 2);
  assert.equal(wolf.alive, false); // 3 vs 2 after reveal.
  assert.equal(s.winner, 'village');
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
});

test('bot Doctor protects an exposed player, and bot Mayor reveals and casts a doubled vote', () => {
  const s = expandedFixture('guard', 16);
  const victim = s.players.find(p => p.role === 'villager');
  victim.claimed = true;
  resolveNight(s, 'p0', () => 0);
  assert.equal(victim.alive, true); // Guard saves self; only bot Doctor saves victim.
  const mayor = s.players.find(p => p.role === 'mayor');
  assert.equal(mayor.mayorRevealed, true);
  resolveVote(s, victim.id, () => 0);
  assert.equal(s.votes.find(v => v.voter === mayor.id).weight, 2);
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
});

test('Stubborn Wolf shares the pack, survives one elimination, and dies on the second', () => {
  const s = expandedFixture('stubbornWolf', 20);
  assert.ok(nightTargets(s).every(p => !isWolf(p)));
  forceVote(s, s.players[0]);
  assert.equal(s.players[0].alive, true);
  assert.equal(s.players[0].resisted, true);
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
  forceVote(s, s.players[0]);
  assert.equal(s.players[0].alive, false);
  assert.notEqual(s.winner, 'fool');
});

test('Fool wins only by a vote, before normal parity, and the result is stable', () => {
  const s = expandedFixture('fool', 18);
  // Eliminating Fool here also gives the two wolves parity (2 vs 2).
  const [wolfA, wolfB] = s.players.filter(isWolf);
  const [a, b] = s.players.filter(p => p.role === 'villager');
  s.players.forEach(p => p.alive = ['p0', wolfA.id, wolfB.id, a.id, b.id].includes(p.id));
  forceVote(s, s.players[0]);
  assert.equal(s.winner, 'fool');
  assert.equal(s.phase, 'over');
  const before = structuredClone(s);
  assert.equal(checkWinner(s), true);
  assert.deepEqual(s, before);
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
  const bitten = expandedFixture('fool', 18);
  removeProtectors(bitten);
  bitten.players[0].claimed = true;
  resolveNight(bitten, null, () => 0);
  assert.equal(bitten.players[0].alive, false);
  assert.equal(bitten.winner, null);
});

test('all Wolf roles count for parity, including Cursed after conversion; Fool counts as opposition', () => {
  const s = expandedFixture('stubbornWolf', 20);
  const wolf = s.players.find(p => p.role === 'wolf');
  const [a, b] = s.players.filter(p => p.role === 'villager');
  const fool = s.players.find(p => p.role === 'fool');
  s.players.forEach(p => p.alive = ['p0', wolf.id, a.id, b.id, fool.id].includes(p.id));
  assert.equal(checkWinner(s), false); // 2 wolves against 3 others.
  fool.alive = false;
  assert.equal(checkWinner(s), true);
  assert.equal(s.winner, 'wolves');
});

test('legacy eight-player saves migrate and continue; malformed extended saves are rejected', () => {
  const s = fixture('seer');
  s.phase = 'day';
  resolveVote(s, 'p1', () => 0);
  const legacy = structuredClone(s);
  legacy.version = 1;
  for (const p of legacy.players) {
    delete p.initialRole; delete p.mayorRevealed; delete p.resisted;
  }
  legacy.votes.forEach(v => delete v.weight);
  assert.deepEqual(restoreGame(JSON.stringify(legacy)), s);
  const original = createGame('Mai', 'random', random(17), 30);
  for (const mutate of [
    s => s.players.pop(),
    s => s.players[0].role = 'not-a-role',
    s => s.players[0].initialRole = 'not-a-role',
    s => s.players[0].role = 'fool',
    s => s.players[0].known = [],
    s => s.players[0].known.p99 = true,
    s => s.players[0].lastGuard = 'p99',
    s => s.players[0].mayorRevealed = true,
    s => s.selected = 'p99',
    s => s.votes = [{ voter: 'p0', target: 'p1', weight: 9 }],
    s => s.votes = [{ voter: 'p0', target: 'p1', weight: 1 }, { voter: 'p0', target: 'p2', weight: 1 }],
  ]) {
    const invalid = structuredClone(original);
    mutate(invalid);
    assert.equal(restoreGame(JSON.stringify(invalid)), null);
  }
});

test('seeded complete games at every size exercise every selectable role and roundtrip each phase', () => {
  let games = 0;
  for (let count = 8; count <= 30; count++) {
    for (const role of new Set(buildRoleDeck(count))) {
      for (let seed = 1; seed <= 3; seed++) {
        const rng = random(count * 1000 + seed);
        const s = createGame('Mai', role, rng, count);
        let turns = 0;
        while (s.phase !== 'over' && turns++ < 300) {
          const before = s.phase;
          if (s.phase === 'night') {
            const targets = nightTargets(s);
            resolveNight(s, targets.length ? targets[Math.floor(rng() * targets.length)].id : null, rng);
          } else if (s.phase === 'day') {
            if (s.players[0].alive && s.players[0].role === 'mayor' && !s.players[0].mayorRevealed) revealMayor(s);
            const targets = alive(s).filter(p => p.id !== 'p0');
            const target = targets[Math.floor(rng() * targets.length)];
            if (s.players[0].alive) accuse(s, target.id);
            resolveVote(s, s.players[0].alive ? target.id : null, rng);
          } else nextNight(s);
          assert.deepEqual(restoreGame(JSON.stringify(s)), s, `${count}/${role}/${seed}/${before}`);
          assert.equal(s.players.length, count);
          assert.ok(alive(s).length <= count);
          if (s.phase === 'dusk') assert.equal(new Set(s.votes.map(v => v.voter)).size, s.votes.length);
        }
        assert.equal(s.phase, 'over', `${count}/${role}/${seed} did not finish`);
        games++;
      }
    }
  }
  assert.ok(games >= 400);
});
