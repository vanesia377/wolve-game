import { ROLES, MIN_PLAYERS, MAX_PLAYERS, buildRoleDeck, isWolf, createGame, alive, human, nightTargets, resolveNight, accuse, resolveVote, revealMayor, nextNight, restoreGame, GROUPS, getAvailableActions, getActionTargets, performAction, hasWon, getRoleRules } from './engine.js';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'lang-suong-mu-v1';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let state = null;
let saved = null;
let storageAvailable = true;
try { saved = restoreGame(localStorage.getItem(STORAGE_KEY)); } catch { storageAvailable = false; }
$('resume-button').hidden = !saved;

const symbols = {
  wolf: '<path d="m6 4 7 5h6l7-5-2 14-8 10-8-10z"/><path d="m10 15 3 2m9-2-3 2m-5 5h4l-2 3z"/>',
  eye: '<path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16Z"/><circle cx="16" cy="16" r="4"/><path d="M16 1v3m0 24v3M5 5l2 2m18 18 2 2M27 5l-2 2M7 25l-2 2"/>',
  shield: '<path d="M16 2 4 7v9c0 8 12 14 12 14s12-6 12-14V7z"/><path d="m10 16 4 4 8-9"/>',
  home: '<path d="m2 14 14-11 14 11M6 12v17h20V12M13 29V18h6v11"/>',
};
const icon = type => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true">${symbols[type] || symbols.home}</svg>`;

function portrait(i) {
  i %= 8;
  const colors = ['#bd9b70', '#a6ab82', '#b6957b', '#a5aaa1', '#baaa82', '#95ad9c', '#c2a094', '#a2aab7'];
  const hairs = [
    '<path d="M24 34Q17 8 40 7q25 0 17 27l-9-15-15 8z"/>',
    '<path d="M22 35V20q3-17 19-15 23 2 17 33l-7-18-23 5z"/>',
    '<path d="M19 69V29Q17 7 40 7q25 0 22 26v36l-10-9V27L30 18l-4 41z"/>',
    '<path d="m23 31-3-14 9-4 5-8 9 4 13 3 5 17-10-10-22 7z"/>',
    '<path d="M21 38V24Q20 7 41 7q23 0 19 31l-10-19-22 8z"/>',
    '<path d="M19 72V31Q16 7 40 6q25 0 22 27v39l-9-20V28l-13-9-14 9v25z"/>',
    '<path d="M21 38Q13 6 40 5q27 0 20 33l-9-16-10 4-13-6z"/>',
    '<path d="M22 32q-6-26 18-26 26 0 19 28l-8-16-21 7z"/>',
  ];
  return `<svg viewBox="0 0 80 85" aria-hidden="true"><path d="M8 87q1-28 24-31h16q24 3 25 31" fill="${colors[i]}" opacity=".5"/><path d="M33 48h15v16l-8 8-8-8z" fill="${colors[i]}"/><ellipse cx="40" cy="34" rx="17" ry="23" fill="${colors[i]}"/><g fill="#1a2621">${hairs[i]}</g><path d="M31 36h4m10 0h4" stroke="#243128" stroke-width="2" stroke-linecap="round"/><path d="m38 46 5 0" stroke="#57604a" stroke-width="1.4" stroke-linecap="round"/><path d="m29 60 11 12 12-12" stroke="#111f18" stroke-width="2" fill="none"/></svg>`;
}

function save() {
  saved = state;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { storageAvailable = false; }
}

function showGame() {
  $('welcome').hidden = true;
  $('game').hidden = false;
  render();
  $('phase-title').focus({ preventScroll: true });
}

function announce(text) { $('status-message').textContent = text; }
const expanded = () => state?.version === 3 || state?.mode === 'expanded';
function roleSide(player) {
  const team = player.team || ROLES[player.role].team;
  return team === 'village' ? 'Phe Dân' : team === 'wolves' ? 'Phe Sói' : team === 'teamless' ? 'Chưa cố định phe' : 'Phe độc lập';
}
function canVote() {
  const me = human(state);
  return me.alive && (!expanded() || !((me.effects?.silencedThrough ?? -1) >= state.day || (me.effects?.cannotVoteThrough ?? -1) >= state.day));
}
function expandedActions() {
  return getAvailableActions(state).filter(action => action.phase === state.phase || action.phase === 'any' || !action.phase);
}
function expandedSelection() {
  const actions = expandedActions();
  const available = state.phase === 'day' ? [{ id: 'vote', label: 'Nghi vấn và bỏ phiếu', min: 0, max: 1 }, ...actions] : actions;
  if (!available.some(action => action.id === state.selectedAction)) state.selectedAction = available[0]?.id || null;
  const action = available.find(action => action.id === state.selectedAction);
  const targets = state.selectedAction === 'vote'
    ? canVote() ? alive(state).filter(player => player.id !== human(state).id) : []
    : action && (action.max ?? 0) > 0 ? getActionTargets(state, action.id) : [];
  const ids = targets.map(player => player.id);
  state.selectedTargets = (Array.isArray(state.selectedTargets) ? state.selectedTargets : []).filter(id => ids.includes(id)).slice(0, action?.max ?? 1);
  return { actions, available, action, targets };
}

function render() {
  const me = human(state);
  const over = state.phase === 'over';
  document.body.dataset.phase = state.phase;
  $('phase-eyebrow').textContent = `${state.phase === 'night' ? '☾ ĐÊM' : '✧ NGÀY'} ${String(state.day).padStart(2, '0')} / LÀNG SƯƠNG MÙ`;
  $('phase-title').textContent = ({ night: 'Khi mọi cánh cửa khép lại.', day: 'Ai đang giấu một bí mật?', dusk: 'Một lá phiếu. Một số phận.', over: 'Màn sương đã tan.' })[state.phase];
  $('alive-count').textContent = `${alive(state).length} / ${state.players.length} người còn sống`;
  $('players').classList.toggle('large-village', state.players.length > 16);
  $('game-deck').innerHTML = deckTags(state.players.map(p => p.initialRole));
  const role = ROLES[me.role];
  const allies = state.players.filter(p => p.id !== me.id && isWolf(p));
  $('role-panel').innerHTML = `<p class="eyebrow">VAI TRÒ CỦA BẠN ${me.alive ? '' : '· ĐÃ MẤT'}</p><div class="role-emblem">${icon(role.icon)}</div><h2>${role.name}</h2><span class="role-side">${escape(expanded() ? roleSide(me) : role.side)} · ${escape(me.name)}</span><p>${escape(role.description)}</p>${expanded() ? roleRulesMarkup(me.role) : ''}${isWolf(me) ? `<p class="secret-note">Đồng đội: ${allies.map(p => `${escape(p.name)}${p.alive ? '' : ' (đã mất)'}`).join(', ')}.</p>` : ''}${!me.alive && !over ? `<p class="secret-note">Bạn đã mất. ${expanded() ? 'Kỹ năng sau khi chết sẽ xuất hiện khi đủ điều kiện; bạn vẫn có thể theo dõi ván.' : 'Tiếp tục theo dõi để biết phe nào chiến thắng.'}</p>` : ''}`;
  const targets = expanded() && ['night', 'day'].includes(state.phase) ? expandedSelection().targets.map(p => p.id) : state.phase === 'night' ? nightTargets(state).map(p => p.id) : state.phase === 'day' && me.alive ? alive(state).filter(p => p.id !== me.id).map(p => p.id) : [];
  if (!targets.includes(state.selected)) state.selected = null;
  const hint = targets.length ? expanded() && (expandedSelection().action?.max ?? 1) > 1 ? 'Chọn các mục tiêu bên dưới' : 'Chọn một người bên dưới' : over ? 'Tất cả vai trò đã lộ diện' : 'Quan sát ngôi làng';
  $('village-hint').textContent = state.players.length > 16 ? `${hint} · Cuộn để xem đủ ${state.players.length} người` : hint;
  $('players').innerHTML = state.players.map((p, i) => {
    const own = p.id === me.id;
    const ally = isWolf(me) && isWolf(p);
    const hiddenDeath = expanded() && !p.alive && (p.data?.hiddenDeath || state.data?.hideDeathsDay === state.day) && !over && !own && !ally && !p.publicRole;
    const revealed = over || (!p.alive && !hiddenDeath) || own || ally || p.publicRole || p.mayorRevealed || (p.role === 'stubbornWolf' && p.resisted);
    const visibleRole = p.publicRole || (!over && !own && !ally && p.effects?.disguise) || p.role;
    let label = revealed ? ROLES[visibleRole]?.name || 'Vai trò đã công khai' : hiddenDeath ? 'Vai trò bị che giấu' : p.claimed ? 'Tự nhận Tiên tri' : 'Chưa rõ vai trò';
    let known = '';
    if (!revealed && p.id in me.known) {
      const result = me.known[p.id];
      label = typeof result === 'boolean' ? result ? 'Đã soi: Ma Sói' : 'Đã soi: không phải Sói' : `Đã biết: ${ROLES[result]?.name || GROUPS[result]?.side || String(result)}`;
      known = result === true || result === 'wolves' ? 'known-wolf' : result === false || result === 'village' ? 'known-village' : '';
    }
    const selected = expanded() ? (state.selectedTargets || []).includes(p.id) : state.selected === p.id;
    return `<button type="button" class="player-card ${p.alive ? '' : 'dead'} ${selected ? 'selected' : ''} ${known}" data-player="${p.id}" ${targets.includes(p.id) ? '' : 'disabled'} aria-pressed="${selected}" aria-label="${escape(p.name)}, ${p.alive ? escape(label) : `đã mất, ${escape(label)}`}">${i === 0 ? '<span class="self-tag">BẠN</span>' : ''}<div class="portrait" style="--portrait-color:${['#57614a', '#4a6557', '#715947', '#4e5b62', '#686344', '#4d675d', '#6e5351', '#4f5d70'][i % 8]}">${portrait(i)}</div><span class="player-name">${escape(p.name)}</span><span class="player-label">${p.alive ? '' : '† '}${escape(label)}</span></button>`;
  }).join('');
  renderAction();
  renderVotes();
  renderJournal();
  $('end-banner').hidden = !over;
  if (over) {
    const won = hasWon(state, me);
    $('end-banner').innerHTML = `<div><h2>${won ? 'Phe của bạn đã chiến thắng!' : 'Phe của bạn đã thất bại.'}</h2><p>${winnerMessage()} Kết thúc sau ${state.day} đêm.</p></div><button class="primary-button" data-action="replay">Một ván nữa →</button>`;
  }
  if (!storageAvailable) announce('Trình duyệt không cho lưu dữ liệu. Bạn vẫn chơi được, nhưng ván sẽ mất khi tải lại trang.');
}

function renderAction() {
  if (expanded()) return renderExpandedAction();
  const me = human(state);
  const selected = state.players.find(p => p.id === state.selected);
  let title, detail, buttons;
  const disabled = selected ? '' : 'disabled';
  if (state.phase === 'night') {
    const targets = nightTargets(state);
    if (!me.alive || !targets.length) {
      title = !me.alive ? 'Dõi theo bóng đêm' : me.role === 'seer' ? 'Bạn đã soi hết những người còn sống' : 'Đã đến giờ nhắm mắt';
      detail = !me.alive ? 'Những người còn sống đang hành động. Tiếp tục để xem điều gì xảy ra.' : 'Ngôi làng chìm vào giấc ngủ. Sáng mai, hãy xem ai còn ngồi quanh bàn.';
      buttons = '<button class="primary-button" data-action="night">Chờ bình minh →</button>';
    } else {
      const actionRole = isWolf(me) ? 'wolf' : me.role;
      title = ({ wolf: 'Đêm nay, đàn Sói săn ai?', seer: 'Bạn muốn soi ai đêm nay?', guard: 'Bạn muốn bảo vệ ai?', doctor: 'Bạn muốn cứu ai đêm nay?' })[actionRole];
      detail = ({ wolf: 'Chọn một người phe Dân để tấn công. Bảo vệ có thể cứu họ.', seer: 'Kết quả chỉ mình bạn biết. Người đã soi sẽ được đánh dấu trên thẻ.', guard: 'Có thể bảo vệ chính mình. Người đã bảo vệ đêm trước không thể được chọn lại.', doctor: 'Chọn một người khác để cứu. Không thể tự cứu; có thể cứu cùng người nhiều đêm.' })[actionRole];
      buttons = `<button class="primary-button" data-action="night" ${disabled}>${({ wolf: 'Xác nhận tấn công', seer: 'Soi vai trò', guard: 'Xác nhận bảo vệ', doctor: 'Xác nhận cứu' })[actionRole]} →</button>`;
    }
  } else if (state.phase === 'day') {
    title = me.alive ? 'Lắng nghe. Suy luận. Bỏ phiếu.' : 'Cuộc tranh luận vẫn tiếp tục';
    detail = me.alive ? 'Nêu nghi vấn để tác động đến người chơi máy, rồi bỏ phiếu loại một người. Lá phiếu chỉ được chốt sau khi bạn xác nhận.' : 'Bạn không còn quyền bỏ phiếu. Hãy xem ngôi làng sẽ lựa chọn ai.';
    buttons = me.alive
      ? `<button class="secondary-button" data-action="accuse" ${!selected || state.accused ? 'disabled' : ''}>${state.accused ? 'Đã nêu nghi vấn' : 'Nêu nghi vấn'}</button><button class="primary-button" data-action="vote" ${disabled}>Bỏ phiếu loại →</button><button class="text-button" data-action="abstain">Không bỏ phiếu</button>`
      : '<button class="primary-button" data-action="abstain">Xem kết quả bỏ phiếu →</button>';
  } else if (state.phase === 'dusk') {
    title = 'Hoàng hôn buông xuống';
    detail = 'Lá phiếu đã được công khai bên dưới. Hãy ghi nhớ ai đã chọn ai trước khi đêm tiếp theo bắt đầu.';
    buttons = '<button class="primary-button" data-action="next">Bước vào đêm tiếp theo →</button>';
  } else {
    title = 'Mỗi bí mật đều có lời giải';
    detail = 'Vai trò của tất cả mọi người đã được công khai. Thử một vai trò khác để nhìn câu chuyện từ phía bên kia.';
    buttons = '<button class="primary-button" data-action="replay">Chơi ván mới →</button>';
  }
  if (state.phase === 'day' && me.alive && me.role === 'mayor' && !me.mayorRevealed) {
    buttons += '<button class="secondary-button" data-action="reveal-mayor">Công khai Thị trưởng · phiếu ×2</button>';
  }
  $('action-panel').innerHTML = `<p class="eyebrow">${me.alive ? 'LƯỢT CỦA BẠN' : 'CHẾ ĐỘ THEO DÕI'}</p><h2 id="action-title">${title}</h2><p>${detail}</p>${state.phase === 'night' || state.phase === 'day' ? `<span class="selection-label">${selected ? `Đã chọn: ${escape(selected.name)}` : 'Chưa chọn người nào'}</span>` : ''}<div class="action-buttons">${buttons}</div>`;
}

function winnerMessage() {
  if (state.winner === 'village') return 'Phe Dân đã loại được các phe thù địch.';
  if (state.winner === 'wolves') return 'Đàn Sói đã chiếm lấy ngôi làng.';
  if (state.winner === 'draw') return 'Ván chơi kết thúc với kết quả hòa.';
  const key = String(state.winner || '');
  const winner = state.players.find(player => player.id === key.split(':').at(-1));
  return winner ? `${escape(winner.name)} đã đạt điều kiện chiến thắng riêng.` : 'Điều kiện chiến thắng của một phe đã được hoàn thành.';
}
function renderExpandedAction() {
  const me = human(state);
  if (!['night', 'day'].includes(state.phase)) {
    const over = state.phase === 'over';
    $('action-panel').innerHTML = `<p class="eyebrow">${over ? 'KẾT THÚC' : 'HOÀNG HÔN'}</p><h2 id="action-title">${over ? 'Mỗi bí mật đều có lời giải' : 'Hoàng hôn buông xuống'}</h2><p>${over ? 'Các vai trò đã được công khai. Chọn một vai khác để khám phá kỹ năng và điều kiện thắng mới.' : 'Xem lại các lá phiếu và thông báo trước khi bước vào đêm tiếp theo.'}</p><div class="action-buttons"><button class="primary-button" data-action="${over ? 'replay' : 'next'}">${over ? 'Chơi ván mới' : 'Bước vào đêm tiếp theo'} →</button></div>`;
    return;
  }
  const { available, action } = expandedSelection();
  const selected = state.selectedTargets || [];
  const names = selected.map(id => state.players.find(player => player.id === id)?.name).filter(Boolean);
  let title, detail, buttons;
  const chooser = available.length > 1 ? `<label class="ability-label">Hành động trong lượt<select id="ability-choice">${available.map(item => `<option value="${escape(item.id)}" ${state.selectedAction === item.id ? 'selected' : ''}>${escape(item.label)}</option>`).join('')}</select></label>` : '';
  if (state.selectedAction === 'vote') {
    title = me.alive ? 'Lắng nghe. Suy luận. Bỏ phiếu.' : 'Cuộc tranh luận vẫn tiếp tục';
    detail = me.alive ? canVote() ? 'Chọn một người để nêu nghi vấn hoặc xác nhận bỏ phiếu. Có thể chuyển sang kỹ năng riêng trong danh sách hành động.' : 'Bạn đang bị câm lặng hoặc khóa phiếu trong ngày này. Có thể xem kết quả và chờ kỹ năng khả dụng trở lại.' : 'Bạn không còn bỏ phiếu được. Nếu có kỹ năng sau khi chết, bạn vẫn có thể chọn trong danh sách hành động.';
    buttons = canVote() ? `<button class="secondary-button" data-action="accuse" ${!selected.length || state.accused ? 'disabled' : ''}>${state.accused ? 'Đã nêu nghi vấn' : 'Nêu nghi vấn'}</button><button class="primary-button" data-action="vote" ${selected.length !== 1 ? 'disabled' : ''}>Bỏ phiếu loại →</button><button class="text-button" data-action="abstain">Không bỏ phiếu</button>` : '<button class="primary-button" data-action="abstain">Xem kết quả bỏ phiếu →</button>';
  } else if (action) {
    title = action.label;
    detail = action.description || ROLES[me.role].description;
    const min = action.min ?? 0, max = action.max ?? min;
    const remaining = Number.isFinite(action.remaining) ? ` · Còn ${action.remaining} lượt` : '';
    detail += max ? ` Chọn ${min === max ? min : `${min}–${max}`} mục tiêu${remaining}.` : `${remaining}.`;
    buttons = `<button class="primary-button" data-action="skill" ${selected.length < min || selected.length > max ? 'disabled' : ''}>${escape(action.label)}${state.phase === 'night' ? ' · Sang bình minh' : ''} →</button>${state.phase === 'day' ? '<button class="text-button" data-action="return-vote">Trở lại bỏ phiếu</button>' : ''}`;
  } else {
    title = me.alive ? 'Đã đến giờ nhắm mắt' : 'Dõi theo bóng đêm';
    detail = me.alive ? 'Hiện không có kỹ năng có thể dùng. Tiếp tục để xem diễn biến ban đêm.' : 'Bạn đang theo dõi ván chơi. Những kỹ năng sau khi chết sẽ xuất hiện khi đủ điều kiện.';
    buttons = '';
  }
  if (state.phase === 'night') buttons += `<button class="${action ? 'secondary' : 'primary'}-button" data-action="skip-night">${action ? 'Bỏ qua kỹ năng, chờ bình minh' : 'Chờ bình minh →'}</button>`;
  const selection = action?.max || state.selectedAction === 'vote' ? `<span class="selection-label">${names.length ? `Đã chọn ${names.length}${action?.max ? ` / ${action.max}` : ''}: ${names.map(escape).join(', ')}` : 'Chưa chọn mục tiêu nào'}</span>` : '';
  $('action-panel').innerHTML = `<p class="eyebrow">${me.alive ? 'LƯỢT CỦA BẠN' : 'KỸ NĂNG SAU KHI CHẾT / THEO DÕI'}</p><h2 id="action-title">${escape(title)}</h2>${chooser}<p>${escape(detail)}</p>${selection}<div class="action-buttons">${buttons}</div>`;
}

function renderVotes() {
  const hidden = expanded() && state.data?.hiddenVotesDay === state.day && state.phase !== 'over';
  const show = state.votes.length && (state.phase === 'dusk' || state.phase === 'over');
  $('vote-panel').hidden = !show;
  if (show && hidden) {
    $('vote-panel').innerHTML = `<h3>Lá phiếu · Ngày ${state.day}</h3><p class="hidden-votes">Lá phiếu hôm nay bị che giấu bởi kỹ năng. Xem kết quả trong diễn biến ván chơi.</p>`;
    return;
  }
  if (show) $('vote-panel').innerHTML = `<h3>Lá phiếu công khai · Ngày ${state.day}</h3><div class="vote-list">${state.votes.map(v => {
    const voter = state.players.find(p => p.id === v.voter);
    const target = state.players.find(p => p.id === v.target);
    return `<span>${escape(voter.name)} <b>→ ${target ? escape(target.name) : 'Bỏ qua'}${(v.weight ?? 1) > 1 ? ` (×${v.weight})` : ''}</b></span>`;
  }).join('')}</div>`;
}

function renderJournal() {
  const journal = $('journal');
  const entries = state.log.filter(entry => !entry.private || !entry.recipient || entry.recipient === human(state).id);
  const labels = { story: 'Diễn biến', secret: 'Chỉ bạn biết', dawn: 'Bình minh', death: 'Người rời làng', chat: 'Quảng trường', result: 'Kết thúc' };
  journal.innerHTML = entries.map(e => `<div class="journal-entry ${escape(e.kind)}"><small>${labels[e.kind] || 'Diễn biến'} · ${e.private ? 'Riêng tư' : `Lượt ${e.day}`}</small>${escape(e.text)}</div>`).join('');
  journal.scrollTop = journal.scrollHeight;
}

$('new-game-form').addEventListener('submit', event => {
  event.preventDefault();
  if (validatePlayerCount() === null) {
    $('player-count').reportValidity();
    $('player-count').focus();
    return;
  }
  if (saved && saved.phase !== 'over' && !$('resume-button').hidden) {
    pendingStart = true;
    $('restart-dialog').showModal();
    return;
  }
  start();
});
function start() {
  const count = validatePlayerCount();
  if (count === null) {
    $('player-count').reportValidity();
    $('player-count').focus();
    return;
  }
  state = createGame($('player-name').value, $('role-choice').value, Math.random, count, { mode: 'expanded' });
  save();
  announce('');
  showGame();
}
$('resume-button').addEventListener('click', () => { state = saved; showGame(); });
$('players').addEventListener('click', event => {
  const card = event.target.closest('[data-player]');
  if (!card || card.disabled) return;
  if (expanded()) {
    const { action } = expandedSelection();
    const selected = state.selectedTargets || [];
    if (selected.includes(card.dataset.player)) state.selectedTargets = selected.filter(id => id !== card.dataset.player);
    else if ((action?.max ?? 1) === 1) state.selectedTargets = [card.dataset.player];
    else if (selected.length < (action?.max ?? 1)) state.selectedTargets = [...selected, card.dataset.player];
    else {
      announce(`Chỉ được chọn tối đa ${action.max} mục tiêu. Bỏ chọn một người trước khi chọn người khác.`);
      return;
    }
  } else state.selected = state.selected === card.dataset.player ? null : card.dataset.player;
  save();
  render();
  const fresh = $('players').querySelector(`[data-player="${card.dataset.player}"]`);
  fresh?.focus({ preventScroll: true });
});
$('game').addEventListener('change', event => {
  if (event.target.id !== 'ability-choice' || !expanded()) return;
  state.selectedAction = event.target.value;
  state.selectedTargets = [];
  save();
  announce('');
  render();
  $('ability-choice')?.focus({ preventScroll: true });
});
$('game').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'replay') return returnToWelcome();
  if (action === 'return-vote') {
    state.selectedAction = 'vote'; state.selectedTargets = []; save(); render(); return;
  }
  try {
    if (action === 'skill') performAction(state, state.selectedAction, state.selectedTargets || []);
    else if (action === 'skip-night') performAction(state, 'skip', []);
    else if (action === 'night') resolveNight(state, state.selected);
    else if (action === 'accuse') accuse(state, expanded() ? state.selectedTargets?.[0] : state.selected);
    else if (action === 'vote') resolveVote(state, expanded() ? state.selectedTargets?.[0] : state.selected);
    else if (action === 'abstain') resolveVote(state);
    else if (action === 'next') nextNight(state);
    else if (action === 'reveal-mayor') revealMayor(state);
    else return;
    save();
    announce('');
    render();
    if (action !== 'accuse') $('phase-title').focus({ preventScroll: true });
    else announce('Nghi vấn của bạn đã được chia sẻ với ngôi làng.');
    if (action === 'reveal-mayor') announce('Bạn đã công khai là Thị trưởng. Lá phiếu từ nay có trọng số 2.');
  } catch (error) { announce(error.message); }
});
let pendingStart = false;
function returnToWelcome() {
  $('game').hidden = true;
  $('welcome').hidden = false;
  document.body.dataset.phase = 'night';
  $('resume-button').hidden = !saved || saved.phase === 'over';
  $('player-name').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
$('new-game-button').addEventListener('click', () => {
  if (state.phase === 'over') return returnToWelcome();
  pendingStart = false;
  $('restart-dialog').showModal();
});
$('cancel-restart').addEventListener('click', () => $('restart-dialog').close());
$('confirm-restart').addEventListener('click', () => {
  $('restart-dialog').close();
  if (pendingStart) start(); else returnToWelcome();
});
$('help-button').addEventListener('click', () => $('help-dialog').showModal());
document.querySelectorAll('.close-dialog, .close-help').forEach(button => button.addEventListener('click', () => $('help-dialog').close()));
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });

function deckTags(deck) {
  return [...new Set(deck)].map(role => `<span>${deck.filter(r => r === role).length} ${ROLES[role].name}</span>`).join('');
}

function roleOptions() {
  return '<option value="random">✦ Để số phận chọn</option>' + Object.entries(GROUPS).map(([id, group]) => `<optgroup label="${escape(group.name)}">${Object.entries(ROLES).filter(([, role]) => role.group === id).map(([roleId, role]) => `<option value="${roleId}">${escape(role.name)}${role.officialName && role.officialName !== role.name ? ` · ${escape(role.officialName)}` : ''}</option>`).join('')}</optgroup>`).join('');
}
function updateSetup() {
  const count = validatePlayerCount();
  if (count === null) return;
  const selected = $('role-choice').value || 'random';
  $('bot-count').textContent = `${count - 1} người chơi máy`;
  $('setup-deck').innerHTML = deckTags(buildRoleDeck(count, 'expanded', selected));
  updateRoleDescription();
}
function validatePlayerCount() {
  const input = $('player-count');
  const raw = input.value;
  const count = Number(raw);
  // Check the entered notation too: exponent, signed and decimal forms are not accepted.
  const valid = /^\d+$/.test(raw) && Number.isInteger(count) && count >= MIN_PLAYERS && count <= MAX_PLAYERS;
  const message = valid ? '' : `Hãy nhập số nguyên từ ${MIN_PLAYERS} đến ${MAX_PLAYERS} người (không dùng số thập phân, dấu hoặc chữ).`;
  input.setCustomValidity(message);
  input.setAttribute('aria-invalid', String(!valid));
  $('player-count-error').textContent = message;
  $('player-count-error').hidden = valid;
  $('new-game-form').querySelector('[type="submit"]').disabled = !valid;
  $('role-choice').disabled = !valid;
  return valid ? count : null;
}
function roleRulesMarkup(roleId) {
  const { passive, actions } = getRoleRules(roleId);
  if (!passive && !actions.length) return '';
  return `<details class="adapted-rules"><summary>Luật áp dụng trong bản chơi đơn</summary>${passive ? `<p>${escape(passive)}</p>` : ''}${actions.length ? `<ul>${actions.map(action => `<li><strong>${escape(action.label)}</strong> · ${action.afterDeath ? 'Sau khi chết' : action.phase === 'night' ? 'Ban đêm' : 'Ban ngày'}${action.uses ? ` · tối đa ${action.uses} lần` : ''}<br>${escape(action.description)}</li>`).join('')}</ul>` : ''}</details>`;
}
function updateRoleDescription() {
  const role = $('role-choice').value;
  $('setup-role-rules').innerHTML = role === 'random' ? '' : roleRulesMarkup(role);
  $('setup-role-description').textContent = role === 'random' ? `Chọn ngẫu nhiên trong ${Object.keys(ROLES).length} vai. Bộ vai được cân đối theo số người; kỹ năng cụ thể hiển thị khi đến lượt.` : `${ROLES[role].description} Kỹ năng áp dụng trong bản chơi đơn được giải thích ở bảng hành động trong ván.`;
}
function renderRoleGuide() {
  const query = $('role-search').value.trim().toLocaleLowerCase('vi');
  let total = 0;
  $('role-guide').innerHTML = Object.entries(GROUPS).map(([id, group]) => {
    const entries = Object.entries(ROLES).filter(([, role]) => role.group === id && `${role.name} ${role.officialName || ''} ${role.description}`.toLocaleLowerCase('vi').includes(query));
    total += entries.length;
    if (!entries.length) return '';
    return `<div class="role-guide-group"><h4>${escape(group.name)} · ${entries.length} vai</h4>${entries.map(([, role]) => `<div class="role-guide-entry"><dt>${escape(role.name)}${role.officialName && role.officialName !== role.name ? ` <small>· ${escape(role.officialName)}</small>` : ''}</dt><dd>${escape(role.description)}</dd></div>`).join('')}</div>`;
  }).join('');
  $('role-search-result').textContent = `${total} / ${Object.keys(ROLES).length} vai${total ? '' : ' · Không tìm thấy vai phù hợp'}`;
}
$('player-count').addEventListener('input', updateSetup);
$('player-count').addEventListener('change', updateSetup);
$('player-count').addEventListener('invalid', validatePlayerCount);
$('role-choice').innerHTML = roleOptions();
$('role-choice').addEventListener('change', updateSetup);
$('role-search').addEventListener('input', renderRoleGuide);
renderRoleGuide();
updateSetup();
