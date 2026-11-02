import { EXPANDED_ROLES as ROLES } from './role-catalog.js';
import { BOT_NAMES } from './classic-engine.js';
import { nightAbilities, executeNightAbility, nightStart, nightAftermath } from './night-abilities.js';
import { dayAbilities, executeDayAbility, onDeath, afterVote, passiveDescription } from './day-abilities.js';
const pick = (items, rng) => items[Math.floor(rng() * items.length)];
const living = state => state.players.filter(p => p.alive);
const isWolf = player => player.team === 'wolves';
const me = state => state.players[0];
const hasRole = role => Object.hasOwn(ROLES, role);
const active = (value, day) => Number.isInteger(value) && value >= day;

export function buildRoleDeck(count = 8, preferred = 'random') {
  if (!Number.isInteger(count) || count < 8 || count > 30) throw new Error('Chỉ nhận số nguyên từ 8 đến 30 người.');
  if (preferred !== 'random' && !hasRole(preferred)) throw new Error('Vai trò không hợp lệ.');
  const deck = Array(Math.floor(count / 4)).fill('wolf');
  if (count >= 20) deck[0] = 'stubbornWolf';
  deck.push('seer', 'guard');
  for (const [minimum, role] of [[10,'doctor'],[12,'cursed'],[14,'witch'],[16,'mayor'],[18,'fool'],[20,'medium'],[24,'detective'],[28,'cupid']]) if (count >= minimum) deck.push(role);
  while (deck.length < count) deck.push('villager');
  if (preferred !== 'random' && !deck.includes(preferred)) {
    const index = ROLES[preferred].team === 'wolves' ? deck.indexOf('wolf') : deck.lastIndexOf('villager');
    deck[index] = preferred;
  }
  // Dependent roles always have a partner, including in the smallest village.
  if (preferred === 'accomplice' && !deck.includes('bandit')) deck[deck.lastIndexOf('villager')] = 'bandit';
  return deck;
}

export function createGame(name = 'Bạn', role = 'random', rng = Math.random, count = 8) {
  if (role === 'random') role = pick(Object.keys(ROLES), rng);
  const deck = buildRoleDeck(count, role);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const index = deck.indexOf(role);
  [deck[0], deck[index]] = [deck[index], deck[0]];
  const state = {
    version: 3, mode: 'expanded', day: 1, phase: 'night', winner: null, winners: [],
    players: [String(name).trim().slice(0,20) || 'Bạn', ...BOT_NAMES.slice(0,count-1)].map((name,i) => ({
      id:`p${i}`, name, role:deck[i], initialRole:deck[i], team:ROLES[deck[i]].team,
      alive:true, known:{}, suspicion:{}, claimed:false, publicRole:null, lastGuard:null,
      data:{acted:{},kills:[]}, used:{}, effects:{},
    })),
    roster:[...deck], log:[], roundStart:null, votes:[], accused:null, selected:null, selectedTargets:[], selectedAction:null,
    links:[], snapshots:[], data:{deaths:[],noLynchStreak:0},
  };
  for (const p of state.players) {
    if (p.team === 'killer') p.team = p.role === 'zombie' ? 'zombie' : p.role === 'sectLeader' ? `sect:${p.id}` : `killer:${p.id}`;
    if (p.role === 'headhunter') p.data.huntTarget = pick(state.players.filter(x => x.id !== p.id && x.team === 'village'),rng)?.id;
    if (p.role === 'admirer') p.data.admireTarget = pick(state.players.filter(x => x.id !== p.id),rng)?.id;
  }
  const bandit = state.players.find(p => p.role === 'bandit');
  for (const p of state.players.filter(p => p.role === 'accomplice')) if (bandit) p.team = bandit.team;
  const ctx = context(state,rng);
  ctx.note(`${count} người bước vào làng. Có ${state.players.filter(isWolf).length} Sói. Bộ vai mở rộng dùng luật chơi đơn ghi trong kỹ năng.`);
  ctx.note(`Bạn là ${ROLES[me(state).role].name}. ${passiveDescription(me(state).role) || ''}`,'secret',me(state).id);
  for (const p of state.players.filter(p => ['headhunter','admirer'].includes(p.role))) {
    const target = ctx.get(p.data.huntTarget || p.data.admireTarget);
    if (target) ctx.note(`Mục tiêu của bạn: ${target.name}.`,'secret',p.id);
  }
  state.selectedAction = getAvailableActions(state)[0]?.id || null;
  return state;
}

function outcome(state, winner, winners, text) {
  state.winner = winner;
  state.winners = [...new Set(winners)];
  // Admirer shares a win whenever their assigned target is alive at the end.
  for (const p of state.players.filter(p => p.role === 'admirer')) if (state.players.find(x => x.id === p.data.admireTarget)?.alive) state.winners.push(p.id);
  if(winner!=='village' && winner!=='draw') for(const p of state.players.filter(p=>p.role==='headhunter' && p.data.huntFailed))state.winners.push(p.id);
  state.phase = 'over';
  state.selectedAction = null; state.selectedTargets = []; state.selected = null;
  context(state).note(text,'result');
  return true;
}

export function checkWinner(state) {
  if (state.phase === 'over') return true;
  const players = living(state);
  if (!players.length) return outcome(state,'draw',[],'Không còn ai sống sót. Ván chơi kết thúc hòa.');
  for(const siren of players.filter(p=>p.role==='siren'))if(players.filter(p=>p.id!==siren.id).every(p=>p.effects.charmedBy===siren.id))return outcome(state,`siren:${siren.id}`,[siren.id],`${siren.name} đã mê hoặc tất cả người còn sống và thắng riêng.`);
  const couples = state.links.filter(l => l.kind === 'lovers');
  if (players.length === 2 && couples.some(l => players.every(p => [l.a,l.b].includes(p.id)))) return outcome(state,'lovers',players.map(p => p.id),'Cặp tình nhân sống sót cuối cùng và chiến thắng cùng nhau.');
  const hostile = players.filter(p => p.team === 'wolves' || p.team.startsWith('killer:') || p.team.startsWith('sect:') || p.team === 'zombie');
  const teams = new Set(players.map(p => p.team));
  if (teams.size === 1 && hostile.length) {
    const team = players[0].team;
    return outcome(state,team,state.players.filter(p => p.team === team).map(p => p.id),'Phe còn sống cuối cùng đã kiểm soát ngôi làng.');
  }
  const wolves = players.filter(isWolf).length;
  const otherEnemies = hostile.filter(p => !isWolf(p));
  if (wolves && !otherEnemies.length && wolves >= players.length - wolves) return outcome(state,'wolves',state.players.filter(isWolf).map(p => p.id),'Đàn Sói đã kiểm soát ngôi làng.');
  if (!hostile.length) {
    const winners = state.players.filter(p => p.team === 'village').map(p => p.id);
    return outcome(state,'village',winners,'Ngôi làng đã loại hết các phe thù địch.');
  }
  return false;
}

function context(state, rng = Math.random) {
  const ctx = {
    state,rng,roles:ROLES,get:id=>state.players.find(p=>p.id===id),living:()=>living(state),isWolf,
    note(text,kind='story',recipientId=null) {
      state.log.push({text:String(text),kind,private:recipientId!==null,recipient:recipientId,day:state.day});
    },
    reveal(p) { p.publicRole=p.role; ctx.note(`${p.name} công khai vai ${ROLES[p.role].name}.`); },
    info(actor,target,kind='team') {
      let role = target.effects.disguise || target.role;
      if (!hasRole(role)) role=target.role;
      const team=role==='werewolfFan'?'village':role===target.role?target.team:ROLES[role].team;
      const result=kind==='role'?ROLES[role].name:kind==='aura'?(team==='village'?'tốt':team==='wolves'||team.startsWith('killer:')||team.startsWith('sect:')||team==='zombie'?'xấu':'không xác định'):team==='wolves'?'Sói':team==='village'?'Dân làng':'phe độc lập';
      actor.known[target.id]=kind==='team'?team==='wolves':`${kind}: ${result}`;
      ctx.note(`${target.name}: ${result}.`,'secret',actor.id);
      return result;
    },
    changeRole(p,role) {
      if (!hasRole(role)) return;
      p.role=role; p.publicRole=null; p.known={};
      const team=ROLES[role].team;
      p.team=team==='killer'?`killer:${p.id}`:team;
      ctx.note(`Bạn chuyển thành ${ROLES[role].name}.`,'secret',p.id);
    },
    convert(p,team,role=null) {
      if (role) ctx.changeRole(p,role);
      p.team=team;
      for (const observer of state.players) delete observer.known[p.id];
      ctx.note(`Bạn đã gia nhập ${team==='wolves'?'phe Sói':team==='village'?'phe Dân':'một phe độc lập'}.`,'secret',p.id);
    },
    block(p) {p.effects.blockedThrough=state.day;},
    protect(target,source,options={}) {
      target.effects.protections??=[];
      target.effects.protections.push({source:source?.id,expires:state.day+(options.persist||0),...options});
    },
    addVote(target,amount,day=state.day) {target.effects.voteBonuses??=[];target.effects.voteBonuses.push({amount,day});},
    link(a,b,kind='death') {
      if(a.id!==b.id && !state.links.some(l=>l.kind===kind && [l.a,l.b].includes(a.id) && [l.a,l.b].includes(b.id))) state.links.push({a:a.id,b:b.id,kind});
    },
    revive(p) {
      if (p.alive) return;
      p.alive=true; p.effects={};ctx.note(`${p.name} trở lại ngôi làng. Vai trò vẫn là ${ROLES[p.role].name}.`,'dawn');
    },
    rewind(actor) {
      const snap=state.snapshots.at(-1);
      if (!snap) return ctx.note('Chưa có ngày trước để quay lại.','secret',actor.id);
      const remembered=Object.fromEntries(state.players.map(p=>[p.id,{...p.used}]));
      const spent={...(state.data.rewindSpent||{}),[actor.id]:true};
      const logs=state.log;
      const history=state.snapshots.slice(0,-1);
      Object.assign(state,structuredClone(snap));state.log=logs;state.snapshots=history;
      for(const p of state.players)for(const [id,count]of Object.entries(remembered[p.id]||{}))p.used[id]=Math.max(p.used[id]||0,count);
      state.data.rewindSpent=spent;
      ctx.note(`${actor.name} đưa ngôi làng trở lại đầu đêm ${state.day}. Các lượt dùng kỹ năng du hành đã tiêu hao vẫn được giữ.`,'story');
    },
    kill(target,source,reason='tấn công',options={}) {
      if(!target?.alive)return false;
      if (target.role==='headlessHorseman' && reason==='vote' && living(state).some(isWolf)) {ctx.note(`${target.name} thoát treo cổ khi Sói vẫn còn.`);return false;}
      if (target.role==='stubbornWolf' && !target.data.resisted) {target.data.resisted=true;ctx.reveal(target);ctx.note(`${target.name} sống sót sau đòn đầu tiên.`);return false;}
      if (reason==='pack' && ['cursed','werewolfFan','lurker'].includes(target.role)) {
        const protections=(target.effects.protections||[]).filter(p=>p.expires>=state.day);
        if(!protections.length || options.ignoreProtection) {
          target.data.adopted=true;ctx.convert(target,'wolves','wolf');ctx.note('Bình minh không có người mất tích.','dawn');return false;
        }
      }
      if(target.role==='lurker' && !target.data.adopted && source && reason!=='vote') {target.data.adopted=true;ctx.convert(target,source.team);return false;}
      if(reason!=='vote' && !options.ignoreProtection) {
        const list=target.effects.protections||[];
        const index=list.findIndex(p=>p.expires>=state.day);
        if(index>=0) {
          const protection=list.splice(index,1)[0];
          if(protection.redirect && ctx.get(protection.redirect)?.alive && protection.redirect!==target.id) return ctx.kill(ctx.get(protection.redirect),source,reason,{ignoreProtection:true});
          if(protection.delay) {target.effects.delayedDeath=state.day;ctx.note(`${target.name} được trì hoãn cái chết đến cuối ngày.`);return false;}
          if(protection.link && ctx.get(protection.source))ctx.link(target,ctx.get(protection.source));
          if(protection.reflect && source?.alive)ctx.kill(source,target,'bẫy',{ignoreProtection:true});
          ctx.note(`${target.name} được bảo vệ khỏi một đòn tấn công.`,'dawn');return false;
        }
        if(target.role==='toughGuy' && !target.data.wounded) {target.data.wounded=true;target.effects.delayedDeath=state.day;ctx.note('Bạn bị thương và sẽ mất vào cuối ngày nếu chưa hồi sinh.','secret',target.id);return false;}
      }
      target.alive=false;
      state.data.deaths.push({victim:target.id,source:source?.id||null,day:state.day,phase:state.phase,reason});
      if(source)source.data.kills.push({day:state.day,target:target.id});
      const disguise=target.effects.disguise;
      target.publicRole=disguise&&hasRole(disguise)?disguise:target.role;
      const hidden=state.data.hideDeathsDay===state.day || state.data.hideDeathRolesDay===state.day;
      ctx.note(`${target.name} đã mất (${reason==='vote'?'bỏ phiếu':reason}).${hidden?' Vai trò bị che.':` Vai trò: ${ROLES[target.publicRole].name}.`}`,'death');
      target.data.hiddenDeath=hidden;
      if(hidden){target.publicRole=null;for(const wolf of state.players.filter(isWolf))ctx.note(`${target.name} đã mất; vai thật: ${ROLES[target.role].name}.`,'secret',wolf.id);}
      onDeath(ctx,target,source,reason);
      if(target.alive)return true;
      for(const l of state.links.filter(l=>['death','lovers','split','instigator'].includes(l.kind) && [l.a,l.b].includes(target.id))) {
        const partner=ctx.get(l.a===target.id?l.b:l.a);
        if(partner?.alive)ctx.kill(partner,target,'liên kết sinh mệnh',{ignoreProtection:true});
      }
      for(const hunter of state.players.filter(p=>p.role==='headhunter' && p.data.huntTarget===target.id)) {
        if(reason==='vote') hunter.data.huntWon=true;
        else hunter.data.huntFailed=true;
      }
      return true;
    },
  };
  return ctx;
}

export function getAvailableActions(state,playerId=me(state).id) {
  if (state.phase==='over' || state.phase==='dusk') return [];
  const actor=state.players.find(p=>p.id===playerId);
  if(!actor || active(actor.effects.blockedThrough,state.day) || (state.phase==='day' && active(actor.effects.silencedThrough,state.day)))return [];
  let actions=state.phase==='night'?(actor.alive?nightAbilities(actor,state):[]):dayAbilities(actor,state);
  if(state.phase==='night' && actor.alive && isWolf(actor) && (!['sorcerer','wolfSeer','werewolfFan'].includes(actor.role)||actor.data.joinedPack)) actions=[{id:'hunt',label:'Cắn cùng đàn Sói',description:'Chọn một người không thuộc phe Sói. Cả đàn có một đòn cắn mỗi đêm.',min:1,max:1,target:'prey',order:'attack'},...actions];
  return actions.filter(a=>!(['rewind','rewindDay'].includes(a.id)&&state.data.rewindSpent?.[actor.id]) && !actor.data.acted[`${state.day}:${state.phase}:${a.id}`] && (!a.uses || (actor.used[a.id]||0)<a.uses)).map(a=>({...a,phase:state.phase,remaining:a.uses?Math.max(0,a.uses-(actor.used[a.id]||0)):null}));
}

export function getActionTargets(state,actionId,playerId=me(state).id) {
  const actor=state.players.find(p=>p.id===playerId);
  const action=getAvailableActions(state,playerId).find(a=>a.id===actionId);
  if(!actor||!action)return [];
  return state.players.filter(p=>{
    if(action.excludeIds?.includes(p.id))return false;
    if(action.includeIds && !action.includeIds.includes(p.id))return false;
    if(action.target==='any')return true;
    if(action.target==='dead')return !p.alive;
    if(!p.alive)return false;
    if(action.target==='wolves')return isWolf(p);
    if(action.target==='prey')return !isWolf(p)||p.role==='werewolfFan';
    if(action.target==='alive')return true;
    return p.id!==actor.id;
  });
}

function validate(state,actor,actionId,targetIds) {
  const action=getAvailableActions(state,actor.id).find(a=>a.id===actionId);
  if(!action)throw new Error('Kỹ năng không khả dụng ở lượt này.');
  if(!Array.isArray(targetIds)||new Set(targetIds).size!==targetIds.length || targetIds.length<action.min || targetIds.length>action.max)throw new Error(`Hãy chọn ${action.min===action.max?action.min:`${action.min}–${action.max}`} mục tiêu khác nhau.`);
  const eligible=new Set(getActionTargets(state,actionId,actor.id).map(p=>p.id));
  if(targetIds.some(id=>!eligible.has(id)))throw new Error('Mục tiêu kỹ năng không hợp lệ.');
  return action;
}
function run(ctx,actor,action,targets) {
  actor.used[action.id]=(actor.used[action.id]||0)+1;
  actor.data.acted[`${ctx.state.day}:${ctx.state.phase}:${action.id}`]=true;
  if(ctx.state.phase==='night')executeNightAbility(ctx,actor,action,targets);
  else executeDayAbility(ctx,actor,action,targets);
}

function chooseBotTargets(state,actor,action,rng) {
  let choices=getActionTargets(state,action.id,actor.id);
  if(action.order==='attack' && !['village','solo','teamless'].includes(actor.team))choices=choices.filter(p=>p.team!==actor.team);
  if(action.id==='instigate'){
    const village=choices.filter(p=>p.team==='village');
    const enemy=choices.filter(p=>p.team!=='village'&&p.team!==actor.team);
    return village.length&&enemy.length?[pick(village,rng),pick(enemy,rng)]:null;
  }
  if(['protect','save','heal'].some(part=>action.id.toLowerCase().includes(part))) {
    const exposed=choices.filter(p=>p.team===actor.team && (p.claimed||p.publicRole));
    if(exposed.length>=action.min)choices=exposed;
  }
  const targets=[];
  while(choices.length && targets.length<action.max) {
    const p=pick(choices,rng);targets.push(p);choices=choices.filter(x=>x.id!==p.id);
  }
  return targets.length>=action.min?targets:null;
}

export function performAction(state,actionId='skip',targetIds=[],rng=Math.random,playerId=me(state).id) {
  const actor=state.players.find(p=>p.id===playerId);
  if(!actor || !['night','day'].includes(state.phase))throw new Error('Chưa đến lượt dùng kỹ năng.');
  const skip=actionId==='skip'||actionId==='skip-night';
  if(skip && state.phase!=='night')throw new Error('Chỉ có thể chờ bình minh vào ban đêm.');
  const action=skip?null:validate(state,actor,actionId,targetIds);
  const ctx=context(state,rng);
  if(state.phase==='day') {
    run(ctx,actor,action,targetIds.map(ctx.get));
    state.selectedTargets=[];
    checkWinner(state);
    return state;
  }
  if(!state.roundStart)state.roundStart=structuredClone({...state,snapshots:[],roundStart:null,log:[]});
  const intents=[];
  for(const bot of living(state).filter(p=>p.id!==actor.id)) {
    const choices=getAvailableActions(state,bot.id).filter(a=>a.id!=='hunt');
    if(!choices.length)continue;
    const skill=pick(choices,rng);
    const targets=chooseBotTargets(state,bot,skill,rng);
    if(targets)intents.push({actor:bot,action:skill,targets});
  }
  if(action && action.id!=='hunt')intents.push({actor,action,targets:targetIds.map(ctx.get)});
  nightStart(ctx);
  const order=['block','protect','info','attack','other'];
  intents.sort((a,b)=>order.indexOf(a.action.order)-order.indexOf(b.action.order));
  const resolvingDay=state.day;
  for(const intent of intents)if(!active(intent.actor.effects.blockedThrough,state.day)){run(ctx,intent.actor,intent.action,intent.targets);if(state.day!==resolvingDay)return state;}
  if(state.phase!=='night')return state; // A time rewind may already have restored a different phase.
  const wolves=living(state).filter(p=>isWolf(p)&&!active(p.effects.blockedThrough,state.day)&&(!['sorcerer','wolfSeer','werewolfFan'].includes(p.role)||p.data.joinedPack));
  const exposed=living(state).filter(p=>(!isWolf(p)||p.role==='werewolfFan') && (p.claimed||p.publicRole||active(p.effects.attractPack,state.day)));
  let victim=action?.id==='hunt'?ctx.get(targetIds[0]):pick(exposed.length?exposed:living(state).filter(p=>!isWolf(p)||p.role==='werewolfFan'),rng);
  let killed=false;
  if(wolves.length && victim?.alive && state.data.blockWolfNight!==state.day) {
    const attacker=wolves.find(p=>p.id===actor.id)||pick(wolves,rng);
    killed=ctx.kill(victim,attacker,'pack',{ignoreProtection:state.data.berserkDay===state.day});
    if(wolves.some(p=>p.role==='alphaWerewolf')) {
      const adjacent=state.players[(state.players.indexOf(victim)+1)%state.players.length];
      if(adjacent.alive && !isWolf(adjacent))ctx.kill(adjacent,attacker,'pack');
    }
  }
  if(!killed)for(const p of state.players.filter(p=>p.role==='fireworkWolf'))p.data.fireworks=Math.min(2,(p.data.fireworks||0)+1);
  nightAftermath(ctx);
  state.selectedTargets=[];state.selected=null;state.accused=null;state.votes=[];
  if(checkWinner(state))return state;
  state.phase='day';state.selectedAction='vote';
  for(const p of living(state).filter(p=>p.id!==me(state).id&&!active(p.effects.silencedThrough,state.day))) {
    if(p.role==='seer') {
      const found=living(state).find(x=>p.known[x.id]===true);
      if(found){p.claimed=true;ctx.note(`${p.name}: “Tôi đã soi ${found.name}: đó là Sói!”`,'chat');}
    }
  }
  const speakers=living(state).filter(p=>p.id!==me(state).id&&!active(p.effects.silencedThrough,state.day));
  for(const p of speakers.slice((state.day-1)%Math.max(1,speakers.length)).slice(0,4)) {
    const suspect=pick(living(state).filter(x=>x.id!==p.id),rng);
    if(suspect)ctx.note(`${p.name}: “Tôi nghi ${suspect.name}. Hãy đối chiếu thông tin và lá phiếu.”`,'chat');
  }
  return state;
}

export function accuse(state,targetId) {
  const actor=me(state);const target=state.players.find(p=>p.id===targetId&&p.id!==actor.id&&p.alive);
  if(state.phase!=='day'||!actor.alive||state.accused||active(actor.effects.silencedThrough,state.day)||!target)throw new Error('Chỉ được nêu nghi vấn một người khác khi còn sống, không bị câm lặng, một lần mỗi ngày.');
  state.accused=targetId;
  if(actor.role==='seer'&&actor.known[targetId]===true)actor.claimed=true;
  context(state).note(`${actor.name}: “Tôi nghi ${target.name}.${actor.claimed&&actor.known[targetId]===true?' Tôi đã soi ra Sói!':''}”`,'chat');
  return state;
}

function botVote(state,actor,rng) {
  if(actor.effects.voteTarget && (actor.effects.forcedVoteDay??state.day)===state.day && living(state).some(p=>p.id===actor.effects.voteTarget))return actor.effects.voteTarget;
  const choices=living(state).filter(p=>p.id!==actor.id);
  const witnesses=living(state).filter(p=>p.claimed&&p.role==='seer');
  return choices.map(p=>{
    let score=rng()*4+(actor.suspicion[p.id]||0)+(state.accused===p.id?1.4:0);
    if(actor.team!=='village' && actor.team===p.team)score-=100;
    if(actor.known[p.id]===true||witnesses.some(s=>s.known[p.id]===true)||(p.publicRole&&ROLES[p.publicRole].team==='wolves'))score+=20;
    if(actor.known[p.id]===false||p.publicRole==='mayor')score-=4;
    return {p,score};
  }).sort((a,b)=>b.score-a.score)[0]?.p.id||null;
}

export function resolveVote(state,targetId=null,rng=Math.random) {
  const actor=me(state);
  if(state.phase!=='day')throw new Error('Chưa đến lúc bỏ phiếu.');
  if(targetId!==null && (!actor.alive||active(actor.effects.cannotVoteThrough,state.day)||active(actor.effects.silencedThrough,state.day)||!living(state).some(p=>p.id===targetId&&p.id!==actor.id)))throw new Error('Lá phiếu không hợp lệ hoặc bạn đang bị cấm bỏ phiếu.');
  const ctx=context(state,rng);
  // Bots use one applicable day ability before casting their ballots.
  for(const bot of [...living(state).filter(p=>p.id!==actor.id),...state.players.filter(p=>!p.alive&&p.id!==actor.id)]) {
    const actions=getAvailableActions(state,bot.id);
    if(!actions.length)continue;
    const skill=pick(actions,rng);const targets=chooseBotTargets(state,bot,skill,rng);
    if(targets)run(ctx,bot,skill,targets);
    if(state.phase!=='day')return state;
  }
  if(checkWinner(state))return state;
  const cancelled=state.data.cancelVoteDay===state.day||state.noLynchDay===state.day;
  state.votes=cancelled?[]:living(state).filter(p=>!active(p.effects.cannotVoteThrough,state.day)&&!active(p.effects.silencedThrough,state.day)).map(p=>{
    let target=p.id===actor.id?targetId:botVote(state,p,rng);
    if(p.effects.voteTarget && (p.effects.forcedVoteDay??state.day)===state.day && living(state).some(x=>x.id===p.effects.voteTarget))target=p.effects.voteTarget;
    const bonuses=(p.effects.voteBonuses||[]).filter(b=>b.day===state.day).reduce((n,b)=>n+b.amount,0);
    const doubleWolf=state.data.doubleWolfVotesDay===state.day&&isWolf(p)?2:1;
    return {voter:p.id,target,weight:Math.max(1,1+(p.data.permanentVoteBonus||0)+bonuses)*doubleWolf};
  });
  if(!cancelled)state.votes.push(...(state.data.ghostVotes||[]).filter(v=>v.day===state.day));
  const tally={};
  for(const v of state.votes)if(v.target)tally[v.target]=(tally[v.target]||0)+v.weight;
  if(state.data.tallyAdjust?.day===state.day)for(const [id,amount]of Object.entries(state.data.tallyAdjust.values))tally[id]=(tally[id]||0)+amount;
  const ranking=Object.entries(tally).filter(([id,total])=>ctx.get(id)?.alive&&total>0).sort((a,b)=>b[1]-a[1]);
  const chosen=[];
  if(!cancelled&&ranking.length&&(ranking.length===1||ranking[0][1]>ranking[1][1]))chosen.push(ctx.get(ranking[0][0]));
  if(state.data.doubleLynchDay===state.day && !cancelled){chosen.length=0;chosen.push(...ranking.slice(0,2).map(([id])=>ctx.get(id)));}
  let eliminated=null;
  const rainProtected=chosen.find(p=>p.effects.rainmaker);
  if(rainProtected){delete rainProtected.effects.rainmaker;chosen.length=0;ctx.note(`Gậy cầu mưa cứu ${rainProtected.name}, phiên bỏ phiếu bị hủy.`);}
  for(const p of [...new Set(chosen)]) {
    if(p.effects.lynchShield && (p.effects.lynchShieldDay??state.day)===state.day){delete p.effects.lynchShield;ctx.note(`${p.name} được cứu khỏi treo cổ.`);continue;}
    if(ctx.kill(p,null,'vote',{ignoreProtection:true}) && !p.alive) {
      eliminated=p;
      if(p.role==='fool')return outcome(state,`fool:${p.id}`,[p.id],`${p.name} là Kẻ ngốc và thắng riêng vì bị bỏ phiếu loại!`);
      const hunter=state.players.find(h=>h.role==='headhunter'&&h.data.huntWon);
      if(hunter)return outcome(state,`headhunter:${hunter.id}`,[hunter.id],`${hunter.name} đạt mục tiêu của Thợ săn đầu người và thắng riêng!`);
    }
  }
  if(!eliminated)ctx.note(cancelled?'Phiên biểu quyết hôm nay đã được hủy.':'Không ai bị loại qua biểu quyết hôm nay.');
  state.data.noLynchStreak=eliminated?0:state.data.noLynchStreak+1;
  afterVote(ctx,eliminated);
  if(state.data.noLynchStreak>=3){const anarchist=living(state).find(p=>p.role==='anarchist');if(anarchist)return outcome(state,`anarchist:${anarchist.id}`,[anarchist.id],`${anarchist.name} thắng riêng sau ba ngày liên tiếp không ai bị treo.`);}
  for(const p of [...living(state)])if(p.effects.corruptedDay===state.day||p.effects.delayedDeath===state.day)ctx.kill(p,null,'hiệu ứng trì hoãn',{ignoreProtection:true});
  for(const hunter of state.players.filter(p=>p.role==='headhunter'&&p.data.huntFailed))if(!living(state).some(p=>p.team==='village'))return outcome(state,'headhunter-fallback',[hunter.id],`${hunter.name} thắng vì phe Dân đã bị loại hết.`);
  state.selectedTargets=[];state.selectedAction=null;state.selected=null;
  if(!checkWinner(state))state.phase='dusk';
  return state;
}

export function nextNight(state) {
  if(state.phase!=='dusk')throw new Error('Chưa đến đêm tiếp theo.');
  if(state.roundStart)state.snapshots=[structuredClone(state.roundStart)];
  state.roundStart=null;
  state.day++;state.phase='night';state.accused=null;state.selectedTargets=[];state.selected=null;
  for(const p of state.players){p.effects.protections=(p.effects.protections||[]).filter(x=>x.expires>=state.day);if((p.effects.forcedVoteDay??0)<state.day)delete p.effects.voteTarget;
    if((p.effects.disguiseThrough??Infinity)<state.day)delete p.effects.disguise;}
  nightStart(context(state));
  state.selectedAction=getAvailableActions(state)[0]?.id||null;
  context(state).note(`Đêm ${state.day}. Các kỹ năng đêm bắt đầu.`);
  return state;
}

export function restoreGame(raw) {
  try {
    const s=JSON.parse(raw);
    const record=x=>x&&typeof x==='object'&&!Array.isArray(x);
    if(!record(s)||s.version!==3||s.mode!=='expanded'||!['night','day','dusk','over'].includes(s.phase)||!Number.isInteger(s.day)||s.day<1||!Array.isArray(s.players)||s.players.length<8||s.players.length>30||!Array.isArray(s.roster)||s.roster.length!==s.players.length)return null;
    if(s.players.some((p,i)=>!record(p)||p.id!==`p${i}`||!hasRole(p.role)||!hasRole(p.initialRole)||p.initialRole!==s.roster[i]||typeof p.name!=='string'||typeof p.team!=='string'||typeof p.alive!=='boolean'||!record(p.known)||!record(p.suspicion)||!record(p.data)||!record(p.data.acted)||!Array.isArray(p.data.kills)||!record(p.used)||!record(p.effects)||Object.values(p.used).some(n=>!Number.isInteger(n)||n<0)||p.publicRole!==null&&!hasRole(p.publicRole)))return null;
    const ids=new Set(s.players.map(p=>p.id));
    if(!Array.isArray(s.log)||s.log.some(e=>!record(e)||typeof e.text!=='string'||typeof e.kind!=='string'||typeof e.private!=='boolean'||!Number.isInteger(e.day)))return null;
    if(!Array.isArray(s.votes)||s.votes.some(v=>!record(v)||!ids.has(v.voter)||v.target!==null&&!ids.has(v.target)||!Number.isFinite(v.weight)||v.weight<=0))return null;
    if(!record(s.data)||!Array.isArray(s.data.deaths)||!Array.isArray(s.links)||s.links.some(l=>!ids.has(l.a)||!ids.has(l.b)||l.a===l.b||typeof l.kind!=='string')||!Array.isArray(s.snapshots)||s.snapshots.length>1||!Array.isArray(s.selectedTargets)||new Set(s.selectedTargets).size!==s.selectedTargets.length||s.selectedTargets.some(id=>!ids.has(id))||!Array.isArray(s.winners)||s.winners.some(id=>!ids.has(id)))return null;
    if((s.phase==='over')!==(typeof s.winner==='string') || s.phase!=='over'&&s.winner!==null)return null;
    if(s.snapshots.some(snapshot=>!restoreGame(JSON.stringify({...snapshot,snapshots:[],roundStart:null}))))return null;
    if(s.roundStart && !restoreGame(JSON.stringify({...s.roundStart,snapshots:[],roundStart:null})))return null;
    return s;
  }catch{return null;}
}

export function getRoleRules(role) {
  if(!hasRole(role))return {passive:'',actions:[]};
  const state=createGame('Vai mẫu',role,()=>0.4,30);
  const player=state.players[0];
  state.day=2;state.snapshots=[{}];
  Object.assign(player.data,{fireworks:2,courage:2,preacherBonus:1,markTarget:'p2',spyUnlockDay:2});
  state.players[1].alive=false;
  const actions=nightAbilities(player,state).map(a=>({...a,phase:'night'}));
  state.phase='day';
  actions.push(...dayAbilities(player,state).map(a=>({...a,phase:'day'})));
  player.alive=false;
  actions.push(...dayAbilities(player,state).map(a=>({...a,phase:'day',afterDeath:true})));
  return {passive:passiveDescription(role),actions};
}
