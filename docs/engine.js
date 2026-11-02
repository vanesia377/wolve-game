import * as classic from './classic-engine.js';
import * as expanded from './expanded-engine.js';
export { EXPANDED_ROLES as ROLES, GROUPS } from './role-catalog.js';
export const MIN_PLAYERS = 8;
export const MAX_PLAYERS = 30;
export const BOT_NAMES = classic.BOT_NAMES;
export const alive = state => state.players.filter(p => p.alive);
export const human = state => state.players[0];
const modern = state => state?.version === 3;
export const isWolf = player => player.team ? player.team === 'wolves' : classic.isWolf(player);
export const buildRoleDeck = (count = 8, mode = 'classic', role = 'random') => mode === 'expanded' ? expanded.buildRoleDeck(count, role) : classic.buildRoleDeck(count);
export const createGame = (name = 'Bạn', role = 'random', rng = Math.random, count = 8, options = {}) => options.mode === 'expanded' ? expanded.createGame(name, role, rng, count) : classic.createGame(name, role, rng, count);
export const checkWinner = state => modern(state) ? expanded.checkWinner(state) : classic.checkWinner(state);
export const nightTargets = state => modern(state) ? expanded.getActionTargets(state, state.selectedAction) : classic.nightTargets(state);
export const resolveNight = (state, target = null, rng = Math.random) => modern(state) ? expanded.performAction(state, state.selectedAction || 'skip', Array.isArray(target) ? target : target ? [target] : [], rng) : classic.resolveNight(state, target, rng);
export const accuse = (state, target) => modern(state) ? expanded.accuse(state, target) : classic.accuse(state, target);
export const resolveVote = (state, target = null, rng = Math.random) => modern(state) ? expanded.resolveVote(state, target, rng) : classic.resolveVote(state, target, rng);
export const revealMayor = (state, id) => modern(state) ? expanded.performAction(state, 'revealMayor', [], Math.random, id) : classic.revealMayor(state, id);
export const nextNight = state => modern(state) ? expanded.nextNight(state) : classic.nextNight(state);
export const getAvailableActions = (state, id) => modern(state) ? expanded.getAvailableActions(state, id) : [];
export const getActionTargets = (state, action, id) => modern(state) ? expanded.getActionTargets(state, action, id) : [];
export const performAction = (state, action, targets, rng = Math.random) => expanded.performAction(state, action, targets, rng);
export const hasWon = (state, player) => modern(state) ? state.winners?.includes(player.id) : (classic.isWolf(player) ? state.winner === 'wolves' : state.winner === (player.role === 'fool' ? 'fool' : 'village'));
export function restoreGame(raw) {
  try { return JSON.parse(raw)?.version === 3 ? expanded.restoreGame(raw) : classic.restoreGame(raw); } catch { return null; }
}

export const getRoleRules = role => expanded.getRoleRules(role);
