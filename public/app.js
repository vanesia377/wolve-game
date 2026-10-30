import { ROLES, createGame, alive, human, nightTargets, resolveNight, accuse, resolveVote, nextNight, restoreGame } from './engine.js';

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

function render() {
  const me = human(state);
  const over = state.phase === 'over';
  document.body.dataset.phase = state.phase;
  $('phase-eyebrow').textContent = `${state.phase === 'night' ? '☾ ĐÊM' : '✧ NGÀY'} ${String(state.day).padStart(2, '0')} / LÀNG SƯƠNG MÙ`;
  $('phase-title').textContent = ({ night: 'Khi mọi cánh cửa khép lại.', day: 'Ai đang giấu một bí mật?', dusk: 'Một lá phiếu. Một số phận.', over: 'Màn sương đã tan.' })[state.phase];
  $('alive-count').textContent = `${alive(state).length} / 8 người còn sống`;
  const role = ROLES[me.role];
  const allies = state.players.filter(p => p.id !== me.id && p.role === 'wolf');
  $('role-panel').innerHTML = `<p class="eyebrow">VAI TRÒ CỦA BẠN ${me.alive ? '' : '· ĐÃ MẤT'}</p><div class="role-emblem">${icon(role.icon)}</div><h2>${role.name}</h2><span class="role-side">${role.side} · ${escape(me.name)}</span><p>${role.description}</p>${me.role === 'wolf' ? `<p class="secret-note">Đồng đội: ${allies.map(p => `${escape(p.name)}${p.alive ? '' : ' (đã mất)'}`).join(', ')}.</p>` : ''}${!me.alive && !over ? '<p class="secret-note">Bạn đã mất. Tiếp tục theo dõi để biết phe nào chiến thắng.</p>' : ''}`;
  const targets = state.phase === 'night' ? nightTargets(state).map(p => p.id) : state.phase === 'day' && me.alive ? alive(state).filter(p => p.id !== me.id).map(p => p.id) : [];
  if (!targets.includes(state.selected)) state.selected = null;
  $('village-hint').textContent = targets.length ? 'Chọn một người bên dưới' : over ? 'Tất cả vai trò đã lộ diện' : 'Quan sát ngôi làng';
  $('players').innerHTML = state.players.map((p, i) => {
    const revealed = over || !p.alive || p.id === me.id || (me.role === 'wolf' && p.role === 'wolf');
    let label = revealed ? ROLES[p.role].name : p.claimed ? 'Tự nhận Tiên tri' : 'Chưa rõ vai trò';
    let known = '';
    if (!revealed && p.id in me.known) {
      label = me.known[p.id] ? 'Đã soi: Ma Sói' : 'Đã soi: không phải Sói';
      known = me.known[p.id] ? 'known-wolf' : 'known-village';
    }
    return `<button type="button" class="player-card ${p.alive ? '' : 'dead'} ${state.selected === p.id ? 'selected' : ''} ${known}" data-player="${p.id}" ${targets.includes(p.id) ? '' : 'disabled'} aria-pressed="${state.selected === p.id}" aria-label="${escape(p.name)}, ${p.alive ? label : `đã mất, ${label}`}">${i === 0 ? '<span class="self-tag">BẠN</span>' : ''}<div class="portrait" style="--portrait-color:${['#57614a', '#4a6557', '#715947', '#4e5b62', '#686344', '#4d675d', '#6e5351', '#4f5d70'][i]}">${portrait(i)}</div><span class="player-name">${escape(p.name)}</span><span class="player-label">${p.alive ? '' : '† '}${label}</span></button>`;
  }).join('');
  renderAction();
  renderVotes();
  renderJournal();
  $('end-banner').hidden = !over;
  if (over) {
    const won = (me.role === 'wolf') === (state.winner === 'wolves');
    $('end-banner').innerHTML = `<div><h2>${won ? 'Phe của bạn đã chiến thắng!' : 'Phe của bạn đã thất bại.'}</h2><p>${state.winner === 'village' ? 'Ngôi làng đã tìm được tất cả Ma Sói.' : 'Đàn Sói đã chiếm lấy ngôi làng.'} Kết thúc sau ${state.day} đêm.</p></div><button class="primary-button" data-action="replay">Một ván nữa →</button>`;
  }
  if (!storageAvailable) announce('Trình duyệt không cho lưu dữ liệu. Bạn vẫn chơi được, nhưng ván sẽ mất khi tải lại trang.');
}

function renderAction() {
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
      title = ({ wolf: 'Đêm nay, đàn Sói săn ai?', seer: 'Bạn muốn soi ai đêm nay?', guard: 'Bạn muốn bảo vệ ai?' })[me.role];
      detail = ({ wolf: 'Chọn một người phe Dân để tấn công. Bảo vệ có thể cứu họ.', seer: 'Kết quả chỉ mình bạn biết. Người đã soi sẽ được đánh dấu trên thẻ.', guard: 'Có thể bảo vệ chính mình. Người đã bảo vệ đêm trước không thể được chọn lại.' })[me.role];
      buttons = `<button class="primary-button" data-action="night" ${disabled}>${({ wolf: 'Xác nhận tấn công', seer: 'Soi vai trò', guard: 'Xác nhận bảo vệ' })[me.role]} →</button>`;
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
  $('action-panel').innerHTML = `<p class="eyebrow">${me.alive ? 'LƯỢT CỦA BẠN' : 'CHẾ ĐỘ THEO DÕI'}</p><h2 id="action-title">${title}</h2><p>${detail}</p>${state.phase === 'night' || state.phase === 'day' ? `<span class="selection-label">${selected ? `Đã chọn: ${escape(selected.name)}` : 'Chưa chọn người nào'}</span>` : ''}<div class="action-buttons">${buttons}</div>`;
}

function renderVotes() {
  const show = state.votes.length && (state.phase === 'dusk' || state.phase === 'over');
  $('vote-panel').hidden = !show;
  if (show) $('vote-panel').innerHTML = `<h3>Lá phiếu công khai · Ngày ${state.day}</h3><div class="vote-list">${state.votes.map(v => {
    const voter = state.players.find(p => p.id === v.voter);
    const target = state.players.find(p => p.id === v.target);
    return `<span>${escape(voter.name)} <b>→ ${target ? escape(target.name) : 'Bỏ qua'}</b></span>`;
  }).join('')}</div>`;
}

function renderJournal() {
  const journal = $('journal');
  const entries = state.log;
  const labels = { story: 'Diễn biến', secret: 'Chỉ bạn biết', dawn: 'Bình minh', death: 'Người rời làng', chat: 'Quảng trường', result: 'Kết thúc' };
  journal.innerHTML = entries.map(e => `<div class="journal-entry ${escape(e.kind)}"><small>${labels[e.kind] || 'Diễn biến'} · ${e.private ? 'Riêng tư' : `Lượt ${e.day}`}</small>${escape(e.text)}</div>`).join('');
  journal.scrollTop = journal.scrollHeight;
}

$('new-game-form').addEventListener('submit', event => {
  event.preventDefault();
  if (saved && saved.phase !== 'over' && !$('resume-button').hidden) {
    pendingStart = true;
    $('restart-dialog').showModal();
    return;
  }
  start();
});
function start() {
  state = createGame($('player-name').value, $('role-choice').value);
  save();
  announce('');
  showGame();
}
$('resume-button').addEventListener('click', () => { state = saved; showGame(); });
$('players').addEventListener('click', event => {
  const card = event.target.closest('[data-player]');
  if (!card || card.disabled) return;
  state.selected = state.selected === card.dataset.player ? null : card.dataset.player;
  save();
  render();
  const fresh = $('players').querySelector(`[data-player="${card.dataset.player}"]`);
  fresh?.focus({ preventScroll: true });
});
$('game').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'replay') return returnToWelcome();
  try {
    if (action === 'night') resolveNight(state, state.selected);
    else if (action === 'accuse') accuse(state, state.selected);
    else if (action === 'vote') resolveVote(state, state.selected);
    else if (action === 'abstain') resolveVote(state);
    else if (action === 'next') nextNight(state);
    else return;
    save();
    announce('');
    render();
    if (action !== 'accuse') $('phase-title').focus({ preventScroll: true });
    else announce('Nghi vấn của bạn đã được chia sẻ với ngôi làng.');
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
