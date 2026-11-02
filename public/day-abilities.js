// Single-player interpretations of daytime and death-trigger abilities.
// Usage counters are enforced by the engine; resources earned in play live in data.
const ability = (id, label, description, min = 1, max = min, target = 'other', uses) => ({ id, label, description, min, max, target, ...(uses === undefined ? {} : { uses }) });
const privateNote = (ctx, actor, text) => ctx.note(text, 'secret', actor.id);
const roleName = (ctx, player) => ctx.roles[player.role]?.name || player.role;
const ensure = p => { p.data ||= {}; p.effects ||= {}; p.used ||= {}; return p; };

export function dayAbilities(player, state) {
  const p = ensure(player);
  const result = [];
  const a = (...args) => result.push(ability(...args));
  if (!p.alive) {
    if (p.role === 'ghostWolf' && state.players.some(q => q.alive && q.team === 'wolves')) a('ghostVote', 'Lá phiếu từ cõi chết', 'Khi còn Sói sống, góp một phiếu chống một người còn sống mỗi ngày.', 1);
    if (p.role === 'cowardlyLion' && (p.data.courage || 0) > 0) a('lastRoar', 'Tiếng gầm cuối cùng', 'Một lần sau khi chết: có 1 can đảm thì câm lặng mục tiêu hôm nay; có từ 2 thì giết mục tiêu.', 1, 1, 'alive', 1);
    return result;
  }
  switch (p.role) {
    case 'bully':
      if ((p.data.bullyKills || 0) < 2) a('throwStone', 'Ném đá', 'Một viên/ngày: gây choáng, cấm nói, phiếu và kỹ năng đến hết hôm nay. Trúng viên thứ hai sẽ chết; tối đa 2 lần giết cả ván.');
      break;
    case 'flowerChild': a('flowerSave', 'Hoa cứu mạng', 'Một lần: người được chọn không thể bị treo trong phiên bỏ phiếu hôm nay.', 1, 1, 'alive', 1); break;
    case 'gunner': if (state.day > 1) a('gunshot', 'Bắn súng', 'Từ ngày 2, bắn một người ban ngày. Có 2 viên cho cả ván; bắn làm lộ danh tính.', 1, 1, 'other', 2); break;
    case 'judge':
      if ((p.data.judgeExecutions || 0) < 2) a('judgeMark', 'Đánh dấu xét xử', 'Đánh dấu một người cho hôm nay. Nếu không ai bị treo, xử tử người đó; chọn Dân khiến chính bạn chết. Tối đa 2 lần xử tử.');
      break;
    case 'marksman':
      if (p.data.markTarget && state.players.some(q => q.id === p.data.markTarget && q.alive)) a('markedShot', 'Bắn mục tiêu đã đánh dấu', 'Một phát cả ván vào người đã đánh dấu ban đêm. Chọn nhầm Dân khiến bạn chết thay.', 0, 0, 'other', 1);
      break;
    case 'mayor': if (!p.publicRole) a('mayorReveal', 'Công khai Thị trưởng', 'Công khai vai để lá phiếu có trọng số 2 đến hết ván.', 0, 0, 'alive', 1); break;
    case 'nutcracker': a('doubleLynch', 'Biểu quyết kép', 'Một lần: công khai vai và treo hai người đứng đầu phiếu hôm nay nếu có hai ứng viên, kể cả khi hòa.', 0, 0, 'alive', 1); break;
    case 'pacifist': a('peaceReveal', 'Dừng bỏ phiếu và soi vai', 'Một lần: biết vai thật một người và hủy phiên treo cổ hôm nay.', 1, 1, 'alive', 1); break;
    case 'preacher': if (!p.publicRole && (p.data.preacherBonus || 0) > 0) a('preacherReveal', 'Công khai lời tiên báo', 'Công khai vai để mỗi dự đoán đúng trước đó tăng vĩnh viễn 1 trọng số phiếu.', 0, 0, 'alive', 1); break;
    case 'priest': a('holyWater', 'Dùng nước thánh', 'Một lần: giết Sói; dùng vào người không phải Sói khiến chính bạn chết.', 1, 1, 'other', 1); break;
    case 'pumpkinDealer': a('pumpkinDeal', 'Thỏa thuận bí ngô', 'Tối đa 3 lần: mục tiêu nhận ngẫu nhiên cái chết, bảo vệ, vũ khí, khóa kỹ năng hoặc dấu nguy hiểm công khai.', 1, 1, 'other', 3); break;
    case 'pumpkinKing': a('pumpkinGift', 'Tặng quà Halloween', 'Tặng quà cho một người đã chết, nhận lời cảm ơn và kỷ niệm về lá phiếu. Quà chỉ mang tính giao tiếp.', 1, 1, 'dead'); break;
    case 'santaClaus': a('christmasGift', 'Tặng quà Giáng sinh', 'Tặng quà cho một người đã chết, nhận lời cảm ơn và kỷ niệm về lá phiếu. Quà chỉ mang tính giao tiếp.', 1, 1, 'dead'); break;
    case 'timeTraveler': case 'wolfTimeTraveler':
      if (state.snapshots?.length) a('rewindDay', 'Quay lại đầu ngày trước', 'Một lần cả ván: khôi phục bản lưu đầu ngày trước; mọi lượt kỹ năng đã tiêu hao vẫn được giữ, mỗi người chỉ quay thời gian một lần cả ván.', 0, 0, 'alive', 1);
      break;
    case 'vigilante':
      a('vigilanteReveal', 'Công khai vai một người', 'Một lần: công khai vai thật của một người cho cả làng.', 1, 1, 'alive', 1);
      a('vigilanteShot', 'Ra tay cảnh vệ', 'Một lần: công khai danh tính và giết một người ban ngày.', 1, 1, 'other', 1);
      break;
    case 'fireworkWolf': if ((p.data.fireworks || 0) > 0) a('fireworkShot', 'Bắn pháo hoa', 'Dùng 1 pháo hoa tích từ đêm Sói không giết được ai để giết một người. Tự lộ vai.'); break;
    case 'gentlewolf': a('gentleVotes', 'Điều chỉnh lá phiếu', 'Một lần: cộng 3 phiếu chống người thứ nhất, giảm 3 phiếu chống người thứ hai trong hôm nay.', 2, 2, 'other', 1); break;
    case 'guardianWolf': a('guardianSave', 'Cứu khỏi treo cổ', 'Hai lần cả ván: bảo vệ người được chọn khỏi phiên treo cổ hôm nay.', 1, 1, 'alive', 2); break;
    case 'jellyWolf': a('jellyShield', 'Lớp thạch bảo hộ', 'Hai lần: chống một đòn giết trong ngày/đêm kế và chống treo cổ hôm nay.', 1, 1, 'alive', 2); break;
    case 'partyWolf': a('partyKill', 'Đòn giết giữa ban ngày', 'Một lần: giết một người ban ngày và công khai danh tính Sói.', 1, 1, 'other', 1); break;
    case 'shadowWolf': a('shadowVotes', 'Biểu quyết trong bóng tối', 'Một lần: giấu phiếu công khai hôm nay và nhân đôi trọng số phiếu của Sói.', 0, 0, 'alive', 1); break;
    case 'werewolfFan': if (!p.publicRole) a('fanReveal', 'Công khai người hâm mộ Sói', 'Một lần: công khai vai và thông báo cho cả làng rằng bạn thuộc phe Sói.', 0, 0, 'alive', 1); break;
    case 'wolfPacifist': a('wolfPeace', 'Đình chiến của Sói', 'Một lần: cả đàn biết vai thật mục tiêu, hôm nay không treo ai.', 1, 1, 'alive', 1); break;
    case 'wolfShaman': a('shamanDisguise', 'Phù phép hào quang', 'Phù phép một người: các lần điều tra đến hết đêm kế tiếp nhìn họ như Wolf Shaman.'); break;
    case 'wolffluencer': a('influenceVote', 'Thao túng phiếu ngày sau', 'Chọn người bỏ phiếu trước rồi người bị bỏ phiếu: phiếu của người thứ nhất bị ép vào ngày mai.', 2, 2); break;
    case 'wolfSeer': case 'sorcerer': a('renounceVision', 'Từ bỏ năng lực soi', 'Một lần: trở thành Sói thường vĩnh viễn để cùng đàn săn trực tiếp.', 0, 0, 'alive', 1); break;
    case 'wizard': a('wizardOrder', 'Sắc lệnh biểu quyết', 'Ra lệnh mọi người bỏ phiếu chống một mục tiêu hôm nay. Ai chống lệnh bị khóa kỹ năng đến hết đêm kế tiếp.'); break;
    case 'anarchist': a('anarchy', 'Dừng biểu quyết', 'Một lần: hủy treo cổ hôm nay. Bạn thắng riêng khi ba ngày liên tiếp không ai bị treo.', 0, 0, 'alive', 1); break;
  }
  if (p.effects.weapon > 0) a('forgedShot', 'Dùng vũ khí được tặng', 'Dùng 1 vũ khí từ Forger hoặc bí ngô để bắn một người ban ngày.');
  if (p.effects.roleCard) a('publishCard', 'Công bố thẻ vai trò', 'Công khai thẻ đã nhận. Thẻ của phe xấu có thể mang vỏ bọc giả.', 0, 0, 'alive');
  if (p.effects.magicGift) {
    for (const role of ['wolfSeer', 'stubbornWolf', 'guardianWolf']) a(`magic_${role}`, `Nhận phép: ${role}`, 'Dùng quà phép của Wolf Magician để đổi sang vai Sói đã chọn.', 0, 0, 'alive', 1);
  }
  return result;
}

export function executeDayAbility(ctx, actor, descriptor, targets) {
  ensure(actor);
  const target = targets[0];
  const state = ctx.state;
  state.data ||= {};
  const publicAction = text => ctx.note(`${actor.name}: ${text}`, 'story');
  switch (descriptor.id) {
    case 'throwStone': {
      ensure(target);
      target.effects.stones = (target.effects.stones || 0) + 1;
      target.effects.silencedThrough = state.day;
      target.effects.blockedThrough = state.day;
      target.effects.cannotVoteThrough = state.day;
      publicAction(`ném đá vào ${target.name}; người này bị choáng trong hôm nay.`);
      if (target.effects.stones >= 2) {
        actor.data.bullyKills = (actor.data.bullyKills || 0) + 1;
        ctx.kill(target, actor, 'trúng viên đá thứ hai');
      }
      break;
    }
    case 'flowerSave': case 'guardianSave':
      ensure(target).effects.lynchShield = true;
      target.effects.lynchShieldDay = state.day;
      privateNote(ctx, actor, `${target.name} được cứu nếu bị treo trong hôm nay.`);
      break;
    case 'gunshot': case 'vigilanteShot': case 'partyKill':
      ctx.reveal(actor); ctx.kill(target, actor, descriptor.id === 'gunshot' ? 'trúng đạn Gunner' : 'bị tấn công giữa ban ngày'); break;
    case 'judgeMark':
      actor.data.judgeTarget = target.id;
      actor.data.judgeMarkDay = state.day;
      privateNote(ctx, actor, `Đã đánh dấu ${target.name}; chỉ xử tử nếu phiên bỏ phiếu không treo ai.`);
      break;
    case 'markedShot': {
      const marked = ctx.get(actor.data.markTarget);
      if (!marked?.alive) throw new Error('Mục tiêu đã đánh dấu không còn sống.');
      ctx.reveal(actor);
      if (marked.team === 'village') ctx.kill(actor, actor, 'Marksman bắn nhầm Dân');
      else ctx.kill(marked, actor, 'trúng phát bắn đã đánh dấu');
      break;
    }
    case 'mayorReveal':
      ctx.reveal(actor); actor.data.permanentVoteBonus = Math.max(1, actor.data.permanentVoteBonus || 0); publicAction('công khai Thị trưởng: lá phiếu từ nay có trọng số 2.'); break;
    case 'doubleLynch': ctx.reveal(actor); state.data.doubleLynchDay = state.day; publicAction('kích hoạt biểu quyết kép trong hôm nay.'); break;
    case 'peaceReveal':
      ctx.info(actor, target, 'role'); state.data.cancelVoteDay = state.day; state.noLynchDay = state.day; publicAction('đình chỉ cuộc treo cổ hôm nay.'); break;
    case 'preacherReveal':
      ctx.reveal(actor); actor.data.permanentVoteBonus = (actor.data.permanentVoteBonus || 0) + (actor.data.preacherBonus || 0); publicAction(`công khai ${actor.data.preacherBonus || 0} lời tiên báo đúng; phiếu mạnh thêm tương ứng.`); break;
    case 'holyWater':
      ctx.reveal(actor);
      if (ctx.isWolf(target)) ctx.kill(target, actor, 'trúng nước thánh');
      else ctx.kill(actor, actor, 'Priest dùng nước thánh nhầm người không phải Sói');
      break;
    case 'pumpkinDeal': {
      ensure(target);
      const effect = Math.min(4, Math.floor(ctx.rng() * 5));
      const effects = ['một cái chết', 'bảo vệ đến hết đêm sau', 'một vũ khí', 'khóa kỹ năng đến hết đêm sau', 'dấu nguy hiểm công khai'];
      publicAction(`trao bí ngô cho ${target.name}: ${effects[effect]}.`);
      if (effect === 0) ctx.kill(target, actor, 'thỏa thuận bí ngô');
      if (effect === 1) ctx.protect(target, actor, { persist: 1 });
      if (effect === 2) target.effects.weapon = (target.effects.weapon || 0) + 1;
      if (effect === 3) target.effects.blockedThrough = state.day + 1;
      if (effect === 4) {
        target.effects.attractPack = state.day + 1;
        for (const player of ctx.living()) if (player.id !== target.id) player.suspicion[target.id] = (player.suspicion[target.id] || 0) + 2;
      }
      break;
    }
    case 'pumpkinGift': case 'christmasGift': {
      ensure(target);
      target.data.gifts = (target.data.gifts || 0) + 1;
      actor.data.giftsSent = (actor.data.giftsSent || 0) + 1;
      const vote = state.votes.find(v => v.voter === target.id);
      const remembered = vote?.target ? ctx.get(vote.target)?.name : null;
      publicAction(`gửi quà ${descriptor.id === 'pumpkinGift' ? 'Halloween' : 'Giáng sinh'} tới ${target.name} ở cõi bên kia.`);
      privateNote(ctx, actor, `${target.name}: “Cảm ơn món quà thứ ${target.data.gifts}! ${remembered ? `Tôi vẫn nhớ lần bỏ phiếu cho ${remembered}.` : 'Tôi sẽ dõi theo ngôi làng đến cuối ván.'}”`);
      break;
    }
    case 'rewindDay': ctx.rewind(actor); break;
    case 'vigilanteReveal': ctx.reveal(target); publicAction(`công khai ${target.name} là ${roleName(ctx, target)}.`); break;
    case 'fireworkShot':
      if (!(actor.data.fireworks > 0)) throw new Error('Bạn chưa tích được pháo hoa.');
      actor.data.fireworks--; ctx.reveal(actor); ctx.kill(target, actor, 'trúng pháo hoa của Sói'); break;
    case 'gentleVotes':
      state.data.tallyAdjust = { day: state.day, values: { [targets[0].id]: 3, [targets[1].id]: -3 } };
      privateNote(ctx, actor, `Hôm nay: +3 phiếu chống ${targets[0].name}, -3 phiếu chống ${targets[1].name}.`); break;
    case 'jellyShield':
      ctx.protect(target, actor, { persist: 1 }); ensure(target).effects.lynchShield = true; target.effects.lynchShieldDay = state.day;
      privateNote(ctx, actor, `${target.name} nhận lớp thạch chống đòn giết và chống treo cổ hôm nay.`); break;
    case 'shadowVotes':
      state.data.hiddenVotesDay = state.day; state.data.doubleWolfVotesDay = state.day; publicAction('phủ bóng tối lên phiên bỏ phiếu. Phiếu Sói ×2; danh sách phiếu được giấu.'); break;
    case 'fanReveal': ctx.reveal(actor); publicAction('công khai mình là Werewolf Fan, đồng minh của Sói.'); break;
    case 'wolfPeace':
      for (const wolf of ctx.living().filter(ctx.isWolf)) ctx.info(wolf, target, 'role');
      state.data.cancelVoteDay = state.day; state.noLynchDay = state.day; publicAction('đình chiến; hôm nay không treo ai.'); break;
    case 'shamanDisguise':
      ensure(target).effects.disguise = 'wolfShaman'; target.effects.disguiseThrough = state.day + 1;
      privateNote(ctx, actor, `${target.name} sẽ bị điều tra như Wolf Shaman đến hết đêm kế tiếp.`); break;
    case 'influenceVote':
      ensure(target).effects.voteTarget = targets[1].id;
      target.effects.forcedVoteDay = state.day + 1;
      privateNote(ctx, actor, `Ngày mai, ${target.name} buộc phải bỏ phiếu cho ${targets[1].name} nếu người này còn sống.`); break;
    case 'renounceVision': ctx.changeRole(actor, 'wolf'); privateNote(ctx, actor, 'Bạn đã từ bỏ kỹ năng soi và trở thành Ma Sói thường.'); break;
    case 'wizardOrder':
      state.data.wizardOrder = { actor: actor.id, target: target.id, day: state.day };
      publicAction(`ra lệnh mọi người bỏ phiếu chống ${target.name}; người chống lệnh bị khóa kỹ năng đêm sau.`); break;
    case 'anarchy':
      state.data.cancelVoteDay = state.day; state.noLynchDay = state.day; publicAction('gây hỗn loạn và hủy treo cổ hôm nay.'); break;
    case 'ghostVote':
      state.data.ghostVotes ||= [];
      state.data.ghostVotes = state.data.ghostVotes.filter(v => v.voter !== actor.id || v.day !== state.day);
      state.data.ghostVotes.push({ voter: actor.id, target: target.id, weight: 1, day: state.day });
      privateNote(ctx, actor, `Lá phiếu cõi chết của bạn chống ${target.name} đã được ghi nhận.`); break;
    case 'lastRoar':
      if ((actor.data.courage || 0) >= 2) ctx.kill(target, actor, 'tiếng gầm cuối cùng của Cowardly Lion');
      else {
        ensure(target).effects.silencedThrough = state.day;
        target.effects.cannotVoteThrough = state.day;
        publicAction(`tiếng gầm từ cõi chết khiến ${target.name} không thể nói hay bỏ phiếu hôm nay.`);
      }
      actor.data.courage = 0; break;
    case 'forgedShot':
      if (!(actor.effects.weapon > 0)) throw new Error('Bạn không còn vũ khí được tặng.');
      actor.effects.weapon--; ctx.kill(target, actor, 'trúng vũ khí được tặng'); break;
    case 'publishCard':
      actor.publicRole = actor.effects.roleCard;
      publicAction(`công bố thẻ: ${ctx.roles[actor.effects.roleCard]?.name || actor.effects.roleCard}.`);
      delete actor.effects.roleCard; break;
    default:
      if (descriptor.id.startsWith('magic_') && actor.effects.magicGift) {
        const newRole = descriptor.id.slice(6);
        if (!['wolfSeer', 'stubbornWolf', 'guardianWolf'].includes(newRole)) throw new Error('Phép biến đổi không hợp lệ.');
        delete actor.effects.magicGift;
        ctx.changeRole(actor, newRole);
        privateNote(ctx, actor, `Quà phép biến bạn thành ${roleName(ctx, actor)}.`);
      } else throw new Error('Kỹ năng ban ngày không hợp lệ.');
  }
}

export function onDeath(ctx, dead, source = null, reason = '') {
  ensure(dead);
  const state = ctx.state;
  if (dead.effects.reviveCharm) {
    delete dead.effects.reviveCharm;
    ctx.revive(dead);
    ctx.note(`${dead.name} được bùa Ritualist hồi sinh.`, 'story');
    return;
  }
  if (['avenger', 'juniorWerewolf'].includes(dead.role) && dead.data.deathTarget && !dead.data.deathTriggerUsed) {
    dead.data.deathTriggerUsed = true;
    const marked = ctx.get(dead.data.deathTarget);
    if (marked?.alive) ctx.kill(marked, dead, `bị ${roleName(ctx, dead)} kéo theo khi chết`, { ignoreProtection: true });
  }
  if (dead.role === 'loudmouth' && dead.data.loudmouthTarget) {
    const target = ctx.get(dead.data.loudmouthTarget);
    if (target) { ctx.reveal(target); ctx.note(`${dead.name} hé lộ bí mật cuối cùng: ${target.name} là ${roleName(ctx, target)}.`, 'story'); }
  }
  for (const player of state.players) {
    ensure(player);
    if (player.alive && player.role === 'graveRobber' && player.data.inheritTarget === dead.id) {
      delete player.data.inheritTarget;
      const inheritedUses = { ...dead.used };
      ctx.changeRole(player, dead.role);
      // Inheriting a role must not refill bullets, poison, revives or rewinds.
      player.used = inheritedUses;
      // Inherit a converter's established faction rather than opening a new faction.
      ctx.convert(player, dead.team);
      privateNote(ctx, player, `Bạn kế thừa vai ${roleName(ctx, dead)} và phe của ${dead.name}.`);
    }
    if (player.alive && player.role === 'bellRinger' && player.data.bellPair?.includes(dead.id)) {
      const other = ctx.get(player.data.bellPair.find(id => id !== dead.id));
      if (other) ctx.info(player, other, 'role');
      delete player.data.bellPair;
    }
    if (player.alive && player.role === 'preacher' && player.data.predictTarget === dead.id && player.data.predictDay === state.day && state.phase === 'night') {
      player.data.preacherBonus = (player.data.preacherBonus || 0) + 1;
      if (player.publicRole) player.data.permanentVoteBonus = (player.data.permanentVoteBonus || 0) + 1;
      privateNote(ctx, player, `Bạn đã đoán đúng ${dead.name} chết đêm nay. Tích lũy ${player.data.preacherBonus} trọng số phiếu.`);
      delete player.data.predictTarget;
    }
    if (player.role === 'headhunter' && player.data.huntTarget === dead.id && reason !== 'vote' && reason !== 'lynch' && !/treo|bỏ phiếu/.test(reason)) player.data.targetDiedOtherwise = true;
  }
  if (dead.role === 'seer' && !ctx.living().some(p => p.role === 'seer')) {
    const apprentice = ctx.living().find(p => p.role === 'apprentice');
    if (apprentice) {
      ctx.changeRole(apprentice, 'seer');
      privateNote(ctx, apprentice, 'Tiên tri đã chết. Bạn thức tỉnh thành Tiên tri; kết quả soi của người cũ không được kế thừa.');
    }
  }
}

export function afterVote(ctx, eliminated) {
  const state = ctx.state;
  for (const p of state.players) {
    ensure(p);
    const vote = state.votes.find(v => v.voter === p.id);
    if (p.role === 'cowardlyLion' && p.alive && vote?.target === null) {
      p.data.courage = (p.data.courage || 0) + 1;
      privateNote(ctx, p, `Không bỏ phiếu giúp bạn tích ${p.data.courage} can đảm.`);
    }
    if (p.role === 'resolutionist' && p.alive) {
      if (!vote?.target) {
        p.data.resolutionBroken = true;
        p.data.permanentVoteBonus = 0;
      } else if (!p.data.resolutionBroken) p.data.permanentVoteBonus = (p.data.permanentVoteBonus || 0) + 1;
    }
    if (p.alive && p.role === 'judge' && !eliminated && p.data.judgeMarkDay === state.day && (p.data.judgeExecutions || 0) < 2) {
      const marked = ctx.get(p.data.judgeTarget);
      delete p.data.judgeTarget;
      if (marked?.alive) {
        p.data.judgeExecutions = (p.data.judgeExecutions || 0) + 1;
        ctx.reveal(p);
        if (marked.team === 'village') ctx.kill(p, p, 'Judge xét xử nhầm Dân');
        else ctx.kill(marked, p, 'bị Judge xét xử sau biểu quyết không treo ai');
      }
    }
  }
  const order = state.data?.wizardOrder;
  if (order?.day === state.day) {
    for (const vote of state.votes) {
      const voter = ctx.get(vote.voter);
      if (voter?.alive && voter.id !== order.actor && vote.target !== order.target) {
        ensure(voter).effects.blockedThrough = state.day + 1;
        ctx.note(`${voter.name} chống sắc lệnh Wizard và bị khóa kỹ năng đến hết đêm sau.`, 'story');
      }
    }
  }
}

const PASSIVES = {
  wolf: 'Biết các Sói đồng đội. Mỗi đêm cả đàn có một đòn cắn vào người không phải Sói; có thể chọn mục tiêu hoặc để đàn tự chọn khi dùng kỹ năng khác.',
  alphaWerewolf: 'Khi còn sống, đòn cắn của đàn nhắm cả mục tiêu đã chọn và ghế liền sau (vòng theo thứ tự thẻ); bỏ qua ghế không còn sống hoặc là Sói.',
  villager: 'Không có kỹ năng riêng; thảo luận và bỏ phiếu để thắng cùng phe Dân.',
  cursed: 'Đòn cắn Sói không bị chặn biến bạn thành Sói thường thay vì giết; đổi phe thắng ngay lúc đó.',
  apprentice: 'Khi Tiên tri chết, bạn thành Tiên tri và bắt đầu soi ở đêm tiếp theo, không kế thừa dữ liệu soi cũ.',
  fool: 'Thắng riêng ngay nếu bị biểu quyết treo; chết bằng kỹ năng hoặc đòn cắn không tính.',
  headhunter: 'Mục tiêu được chỉ định từ đầu: thắng riêng nếu mục tiêu bị treo; nếu chết cách khác, cùng thắng khi phe Dân thua.',
  admirer: 'Mục tiêu được chỉ định từ đầu; được tính cùng chiến thắng cuối ván nếu mục tiêu còn sống.',
  lurker: 'Lần đầu bị tấn công bởi một phe có sát thương, sống sót và gia nhập phe kẻ tấn công; các lần sau chịu sát thương bình thường.',
  stubbornWolf: 'Lần đầu nhận một đòn giết hoặc bị treo sẽ sống sót, công khai vai và mất lớp kháng; lần sau có thể chết.',
  toughGuy: 'Chặn cái chết đầu tiên, được báo bị thương; vẫn hoạt động trong ngày tiếp theo và chết vào cuối ngày đó.',
  werewolfFan: 'Thuộc phe Sói nhưng điều tra phe cho kết quả giống Dân khi chưa biến đổi; bị Sói cắn sẽ thành Sói thường.',
  cowardlyLion: 'Mỗi lần bỏ qua phiếu tích 1 can đảm. Sau khi chết dùng một tiếng gầm: 1 điểm cấm mục tiêu nói/phiếu; từ 2 điểm giết mục tiêu.',
  ghostWolf: 'Sau khi chết, khi còn Sói sống, mỗi ngày vẫn có thể góp một lá phiếu từ cõi chết.',
  resolutionist: 'Mỗi ngày bỏ phiếu hợp lệ tăng vĩnh viễn 1 trọng số. Bỏ qua hoặc mất quyền bỏ phiếu sẽ mất quyền tăng và mọi điểm tích lũy.',
  fireworkWolf: 'Mỗi đêm Sói không giết được ai tích 1 pháo hoa, tối đa 2. Dùng pháo ban ngày sẽ tự công khai.',
  pumpkinKing: 'Quà Halloween và hồi đáp từ người chết mang tính giao tiếp, được ghi lại trong ván; không gây sát thương hay thay đổi điều kiện thắng.',
  santaClaus: 'Quà Giáng sinh và hồi đáp từ người chết mang tính giao tiếp, được ghi lại trong ván; không gây sát thương hay thay đổi điều kiện thắng.',
  avenger: 'Một lần khi chết, kéo theo mục tiêu trả thù đã chọn ban đêm; liên kết xử lý một lần để tránh vòng lặp.',
  juniorWerewolf: 'Một lần khi chết, kéo theo mục tiêu trả thù đã chọn ban đêm; các Sói đồng đội vẫn tiếp tục săn.',
  loudmouth: 'Khi chết, công khai vai thật của người được đánh dấu trong đêm gần nhất.',
  graveRobber: 'Khi người đã chọn chết, bạn nhận vai và phe hiện tại của họ, không nhận thêm lượt dùng hay kết quả điều tra đã tiêu.',
  bellRinger: 'Khi một người trong cặp đánh dấu chết, riêng bạn biết vai thật người còn lại; dấu cũ hết hiệu lực.',
  headlessHorseman: 'Khi còn Sói sống, không bị treo cổ; vẫn có thể chết bởi kỹ năng, đòn đánh hoặc khi không còn Sói.',
};
export const passiveDescription = roleId => PASSIVES[roleId] || '';
