// Night skills for the expanded single-player rules. The descriptors are also the
// player's rules reference: limits and deliberate adaptations are stated here.
const skill = (id, label, description, order = 'other', min = 1, max = min, target = 'other', uses) => ({ id, label, description, order, min, max, target, ...(uses === undefined ? {} : { uses }) });
const mark = (id, label, description, uses) => skill(id, label, description, 'info', 1, 1, 'other', uses);
const used = (p, id) => p.used?.[id] || 0;
const data = p => (p.data ||= {});
const effects = p => (p.effects ||= {});
const living = s => s.players.filter(p => p.alive);
const count = (p, key) => data(p)[key] || 0;
const byId = (s, id) => s.players.find(p => p.id === id);
const list = (p, key) => (data(p)[key] ||= []);
const hasMarks = (p, key, state) => list(p, key).some(id => byId(state, id)?.alive);
const attack = (description = 'Tấn công một người khác mỗi đêm. Người được bảo vệ có thể sống sót.') => skill('attack', 'Tấn công', description, 'attack');
const pair = (id, label, description, order = 'info', uses) => skill(id, label, description, order, 2, 2, 'other', uses);
const corpse = (id, label, description, uses) => skill(id, label, description, 'info', 1, 1, 'dead', uses);

export function nightAbilities(player, state) {
  const p = player;
  const day = state.day;
  switch (p.role) {
    case 'seer': return [skill('inspect', 'Soi phe', 'Biết phe hiện tại của một người khác. Có thể soi lại để phát hiện người đã đổi phe.', 'info')];
    case 'guard': return [{ ...skill('guard', 'Bảo vệ', 'Che chở một người, kể cả chính mình; không chọn lại người ở đêm trước.', 'protect', 1, 1, 'alive'), excludeIds: p.lastGuard ? [p.lastGuard] : [] }];
    case 'doctor': return [skill('heal', 'Chữa trị', 'Bảo vệ một người khác; không tự cứu, được lặp mục tiêu qua các đêm.', 'protect')];
    case 'analyst': return day <= (data(p).analystRestThrough || 0) ? [] : [pair('analyse', 'Phân tích hai hào quang', 'Xem hào quang của hai người. Nếu giống nhau, phải nghỉ soi ở đêm kế tiếp.')];
    case 'astronomer': return [skill('newMoon', 'Tạo trăng mới', 'Một lần mỗi ván, chặn toàn bộ đòn săn của đàn Sói trong đêm này.', 'protect', 0, 0, 'alive', 1), skill('meteor', 'Gọi thiên thạch', 'Một lần mỗi ván, thiên thạch tấn công mục tiêu. Nếu giết trúng người phe Dân, bạn cũng chết.', 'attack', 1, 1, 'other', 1)];
    case 'auraSeer': return [skill('aura', 'Soi hào quang', 'Biết hào quang tốt, xấu hoặc không xác định của một người; không biết tên vai.', 'info')];
    case 'avenger': case 'juniorWerewolf': return [mark('revengeMark', 'Đánh dấu trả thù', 'Đổi mục tiêu trả thù. Khi bạn chết, người đang bị đánh dấu cũng bị tấn công.')];
    case 'baker': return [skill('bread', 'Tặng bánh', 'Tặng một người lá phiếu có thêm trọng số 1 trong ngày sắp tới; có thể tự nhận.', 'protect', 1, 1, 'alive')];
    case 'beastHunter': return [skill('beastTrap', 'Đặt bẫy bảo vệ', 'Hai lần mỗi ván, bảo vệ một người trong đêm. Bẫy phản kích kẻ tấn công nếu kích hoạt.', 'protect', 1, 1, 'alive', 2)];
    case 'bellRinger': return [pair('bellPair', 'Liên kết chuông', 'Chọn hai người; khi một người chết, bạn biết vai của người còn lại. Đây là liên kết thông tin, không gây chết theo.', 'protect')];
    case 'butcher': return count(p, 'meatUsed') >= 5 ? [] : [skill('meat', 'Phát thịt bảo vệ', `Bảo vệ 1–${Math.min(3, 5 - count(p, 'meatUsed'))} người đêm nay. Còn ${5 - count(p, 'meatUsed')} phần thịt cho cả ván.`, 'protect', 1, Math.min(3, 5 - count(p, 'meatUsed')), 'alive')];
    case 'conjuror': return [{ ...corpse('conjure', 'Mượn vai người chết', 'Mượn vai của một dân làng đã chết đến đêm kế tiếp. Được nghe lời nhắn từ người đó.'), includeIds: state.players.filter(t => !t.alive && t.team === 'village' && t.role !== 'conjuror').map(t => t.id) }];
    case 'cupid': return [pair('lovers', 'Ghép đôi tình nhân', 'Một lần mỗi ván, ghép hai người. Hai người chết theo nhau, giữ phe hiện tại; nếu là hai người sống cuối cùng thì thắng cùng nhau.', 'protect', 1)];
    case 'detective': return [pair('detect', 'So sánh hai phe', 'Biết hai người được chọn có cùng phe hiện tại hay không; không biết chính xác vai.')];
    case 'dorothy': return [mark('visitDorothy', 'Ghé thăm thu thập', 'Mỗi người khác nhau được ghé thăm cho một phần bộ ba trí óc, trái tim, lòng can đảm. Đủ ba người khác nhau thì mở nước khắc chế.'), ...(list(p, 'dorothyVisits').length >= 3 ? [skill('dorothyWater', 'Dùng nước khắc chế', 'Một lần sau khi đủ ba món, hạ mục tiêu phe ác; chọn dân làng thì nước không có tác dụng.', 'attack', 1, 1, 'other', 1)] : [])];
    case 'easterBunny': return [skill('eggProtect', 'Trứng bảo vệ', 'Trao trứng che chở mục tiêu trong đêm này.', 'protect', 1, 1, 'alive'), skill('eggSilence', 'Trứng câm lặng', 'Mục tiêu không thể nói hoặc bỏ phiếu trong ngày sắp tới.', 'block'), skill('eggBlock', 'Trứng khóa kỹ năng', 'Khóa kỹ năng của mục tiêu trong đêm và ngày sắp tới.', 'block'), skill('eggAura', 'Trứng hào quang', 'Biết hào quang mục tiêu; không biết chính xác vai.', 'info')];
    case 'ferryman': return [skill('ferry', 'Chèo đò', 'Hai lần mỗi ván, nếu mục tiêu bị giết trong đêm, họ sống thêm một ngày rồi mới chết.', 'protect', 1, 1, 'alive', 2)];
    case 'flagger': return [pair('redirect', 'Chuyển hướng đòn đánh', 'Hai lần mỗi ván: bảo vệ người chọn đầu tiên, chuyển đòn đánh sang người chọn thứ hai.', 'protect', 2)];
    case 'forger': return [skill('forgeArmor', 'Rèn áo giáp', 'Hai lần mỗi ván, trao giáp chặn một đòn giết; giáp tồn tại đến hết đêm sau.', 'protect', 1, 1, 'other', 2), skill('forgeWeapon', 'Rèn vũ khí', 'Một lần mỗi ván, trao mục tiêu một phát súng dùng ban ngày. Bắn sẽ công khai người dùng.', 'other', 1, 1, 'other', 1)];
    case 'fortuneTeller': return [skill('roleCard', 'Trao thẻ vai trò', 'Trao thẻ ghi vai thật hiện tại cho một người; người nhận có thể tự công khai thẻ vào ban ngày.', 'info')];
    case 'gambler': return count(p, 'gambles') >= 4 ? [] : [skill('betVillage', 'Cược phe Dân', 'Cược mục tiêu thuộc phe Dân. Đoán đúng nhận vai thật; dùng chung tối đa 4 lần cược.', 'info'), skill('betWolves', 'Cược phe Sói', 'Cược mục tiêu thuộc phe Sói. Đoán đúng nhận vai thật; dùng chung tối đa 4 lần cược.', 'info')];
    case 'ghostLady': return [skill('ghostVisit', 'Ghé thăm che chở', 'Che chở một người khác; nếu đỡ được đòn đánh, bạn và người đó bị liên kết sinh tử.', 'protect')];
    case 'graveRobber': return day === 1 ? [mark('inherit', 'Chọn người để kế thừa', 'Chọn một người trong đêm đầu. Khi họ chết, bạn kế thừa vai và phe của họ.', 1)] : [];
    case 'grumpyGrandma': return [skill('silence', 'Bắt im lặng', 'Người được chọn không thể nói hoặc bỏ phiếu trong ngày sắp tới.', 'block')];
    case 'jailer': return [skill('jail', 'Giam và thẩm vấn', 'Giam một người, khóa kỹ năng và bảo vệ họ trong đêm. Nhận lời thẩm vấn về nghi vấn công khai của họ.', 'block'), ...(data(p).jailedId && byId(state, data(p).jailedId)?.alive ? [{ ...skill('jailExecute', 'Xử tử người đã giam', 'Một lần mỗi ván, xử tử người đã bị bạn giam ở đêm trước.', 'attack', 1, 1, 'other', 1), includeIds: [data(p).jailedId] }] : [])];
    case 'journalist': return [corpse('journalism', 'Điều tra hiện trường', 'Chọn một người chết. Nếu xác định được kẻ giết, biết hàng hoặc cột chỗ ngồi của họ (bàn gồm 5 cột).')];
    case 'loudmouth': return [mark('loudmouthMark', 'Đánh dấu công khai', 'Khi bạn chết, công khai vai thật của mục tiêu đang được đánh dấu.')];
    case 'marksman': return [mark('aim', 'Ngắm bắn', 'Đánh dấu một mục tiêu để bắn từ ban ngày sau đêm đánh dấu. Bắn nhầm dân sẽ làm bạn chết thay.')];
    case 'medium': return [corpse('speakDead', 'Hỏi người chết', 'Nghe kết quả điều tra hoặc nghi vấn cuối cùng của người chết.'), { ...skill('revive', 'Hồi sinh', 'Một lần mỗi ván, đưa một người chết trở lại ván với vai và phe hiện tại.', 'other', 1, 1, 'dead', 1), excludeIds: [p.id] }];
    case 'mortician': return [corpse('autopsy', 'Khám nghiệm', 'Nhận nhóm tối đa ba nghi phạm còn sống, gồm kẻ giết nếu họ còn sống; không chỉ rõ người nào.')];
    case 'nightWatchman': return [skill('nightWatch', 'Canh gác', 'Ba lần mỗi ván, bảo vệ một người khỏi đòn giết trong đêm.', 'protect', 1, 1, 'alive', 3), skill('watchProtection', 'Quan sát bảo vệ', 'Hai lần mỗi ván, biết những người đang có lớp bảo vệ.', 'info', 0, 0, 'alive', 2)];
    case 'preacher': return [mark('predict', 'Dự đoán người chết', 'Chọn một người. Nếu họ chết trong đêm này, tích lũy thêm một trọng số phiếu; cần tự công khai vào ban ngày để dùng.')];
    case 'pumpkinOracle': return [skill('oracle', 'Tiên đoán ba người', 'Biết tổng số hào quang tốt, xấu và không xác định trong nhóm ba người, không gán kết quả cho từng người.', 'info', 3, 3, 'other')];
    case 'rainmaker': return [{ ...skill('rainStick', 'Trao gậy cầu mưa', 'Hai lần mỗi ván, trao một người gậy hủy cuộc treo cổ nếu họ bị chọn loại. Gậy chỉ dùng được một lần.', 'other', 1, 1, 'other', 2), excludeIds: state.players.filter(t => t.effects?.rainmaker).map(t => t.id) }];
    case 'redLady': return [skill('redVisit', 'Đi thăm ban đêm', 'Rời nhà để tránh đòn đánh nhắm vào bạn. Ghé Sói, sát nhân hoặc người bị giết trong đêm sẽ khiến bạn chết.', 'protect')];
    case 'ritualist': return [skill('reviveCharm', 'Đặt bùa hồi sinh', 'Một lần mỗi ván, đặt bùa lên người sống. Lần chết kế tiếp của họ sẽ kích hoạt hồi sinh.', 'protect', 1, 1, 'alive', 1), corpse('spiritTalk', 'Liên lạc linh hồn', 'Nghe kết quả điều tra hoặc nghi vấn cuối cùng của một người đã chết.')];
    case 'sheriff': return [pair('sheriffWatch', 'Theo dõi hai người', 'Nếu một trong hai người bị giết đêm nay, bạn nhận nhóm nghi phạm có kẻ tấn công nếu còn sống.', 'other')];
    case 'snowAngel': return count(p, 'snowGifts') >= 3 ? [] : [{ ...skill('snowGuard', 'Che chở hai đêm', 'Chọn tối đa ba người khác nhau cả ván. Mỗi người nhận bảo vệ tồn tại đêm này và đêm sau, kể cả khi bạn chết.', 'protect', 1, 1, 'other'), excludeIds: list(p, 'snowTargets') }];
    case 'soulbinder': return [{ ...skill('bindSoul', 'Liên kết linh hồn', 'Hai lần mỗi ván, mở liên kết riêng với người sống hoặc chết. Mỗi đêm nhận lời nhắn về thông tin hoặc nghi vấn của họ.', 'other', 1, 1, 'any', 2), excludeIds: [p.id, ...list(p, 'soulBonds')] }];
    case 'spiritSeer': return [skill('spiritInspect', 'Soi dấu vết giết người', 'Chọn một hoặc hai người, biết có ít nhất một người trong nhóm đã giết ở đêm này hoặc ngày trước hay không.', 'info', 1, 2, 'other')];
    case 'spy': return [skill('spyWatch', 'Theo dõi ba người', 'Theo dõi tối đa ba người; nếu phát hiện người đã giết trong ngày trước, đêm sau mở quyền điều tra phe cả nhóm.', 'info', 1, 3, 'other'), ...(data(p).spyUnlockDay === day ? [skill('spyInspect', 'Điều tra nhóm đã theo dõi', 'Kiểm tra phe những người trong nhóm có dấu vết giết người ở đêm trước.', 'info', 0, 0, 'alive')] : [])];
    case 'timeTraveler': case 'wolfTimeTraveler': return day > 1 ? [skill('rewindDay', 'Quay lại một ngày', 'Một lần mỗi ván, khôi phục người sống/chết, vai và phe ở đầu ngày trước; không hoàn lại các lượt kỹ năng đã dùng.', 'other', 0, 0, 'alive', 1)] : [];
    case 'trapper': return [...(list(p, 'traps').length < 3 ? [{ ...mark('plantTrap', 'Đặt bẫy', 'Đặt bẫy cho tối đa ba người. Bẫy chưa bảo vệ cho đến khi bạn chọn kích hoạt.'), excludeIds: list(p, 'traps') }] : []), ...(hasMarks(p, 'traps', state) ? [skill('activateTraps', 'Kích hoạt bẫy', 'Một lần mỗi ván, tất cả bẫy đã đặt bảo vệ mục tiêu trong đêm và phản kích kẻ tấn công.', 'protect', 0, 0, 'alive', 1)] : [])];
    case 'violinist': return [skill('violin', 'Lắng nghe thương tiếc', 'So sánh phe người được chọn với người chết gần nhất, nếu đã có người chết; không biết chính xác vai.', 'info')];
    case 'warden': return [pair('prisonRoom', 'Giam chung hai người', 'Khóa và bảo vệ hai người đêm nay. Hai Sói sẽ vượt ngục giết bạn; nếu có dân, một người có thể dùng vũ khí trong phòng.', 'block')];
    case 'witch': return [skill('savePotion', 'Thuốc cứu', 'Một lần mỗi ván, che chở một người khỏi đòn tấn công đêm nay; có thể tự cứu.', 'protect', 1, 1, 'alive', 1), skill('poisonPotion', 'Thuốc độc', 'Một lần mỗi ván, dùng độc tấn công một người khác.', 'attack', 1, 1, 'other', 1)];
    case 'blindWerewolf': return [skill('blindInspect', 'Điều tra hào quang', 'Bốn lần mỗi ván, biết hào quang một người; không biết chính xác vai.', 'info', 1, 1, 'other', 4)];
    case 'candyWolf': return [skill('candy', 'Phát kẹo độc', 'Mục tiêu nhận độc, bị tấn công vào cuối đêm kế tiếp. Bảo vệ ở đêm đó có thể cứu họ.', 'other', 1, 1, 'other', 2)];
    case 'confusionWolf': return [skill('confuseDeaths', 'Làm nhiễu vai người chết', 'Hai lần mỗi ván, che vai của người chết trong đêm này trước làng. Phe Sói vẫn được biết.', 'block', 0, 0, 'alive', 2)];
    case 'kittenWolf': return [skill('kittenBite', 'Cắn chuyển hóa', 'Một lần mỗi ván, chuyển một người không phải Sói thành Ma Sói. Người đang được bảo vệ chống lại được chuyển hóa.', 'attack', 1, 1, 'other', 1)];
    case 'nightmareWerewolf': return [skill('nightmare', 'Gây ác mộng', 'Hai lần mỗi ván, khóa kỹ năng một người trong đêm và ngày sắp tới.', 'block', 1, 1, 'other', 2)];
    case 'snatcherWolf': return [skill('snatch', 'Cướp lớp bảo vệ', 'Gỡ mọi lớp bảo vệ hiện có của một người trước lượt săn của đàn Sói.', 'attack')];
    case 'sorcerer': case 'wolfSeer': return [skill('wolfInspect', 'Soi vai thật', 'Biết vai thật một người. Bạn chỉ tham gia trực tiếp chọn đòn săn sau khi từ bỏ năng lực soi.', 'info'), skill('surrenderSight', 'Từ bỏ năng lực soi', 'Trở thành Ma Sói thường vĩnh viễn, có thể trực tiếp chọn đòn săn của đàn.', 'other', 0, 0, 'alive', 1)];
    case 'splitWolf': return [mark('splitBond', 'Ràng buộc sinh mạng', 'Một lần mỗi ván, liên kết sinh tử với một người. Hai bên chết theo nhau, giữ nguyên phe.', 1)];
    case 'stormWolf': return [skill('storm', 'Tạo bão', 'Một lần mỗi ván, xóa lời thảo luận cũ và che danh sách phiếu ngày sắp tới. Không thay đổi vai hoặc chỗ ngồi.', 'block', 0, 0, 'alive', 1)];
    case 'swampWolf': return [skill('swamp', 'Tạo đầm lầy', 'Khóa nói, bỏ phiếu và kỹ năng của một người trong đêm và ngày sắp tới.', 'block', 1, 1, 'other', 2)];
    case 'toxicWolf': return [skill('toxin', 'Đầu độc', 'Hai lần mỗi ván, gây độc. Nạn nhân bị tấn công vào cuối đêm kế tiếp, có thể được bảo vệ.', 'other', 1, 1, 'other', 2)];
    case 'voodooWerewolf': return [skill('voodoo', 'Áp lời nguyền', 'Hai lần mỗi ván, người được chọn không thể nói, bỏ phiếu và dùng kỹ năng trong ngày sắp tới.', 'block', 1, 1, 'other', 2)];
    case 'werewolfBerserk': return [skill('berserk', 'Cuồng sát', 'Một lần mỗi ván, đòn săn của Sói đêm nay bỏ qua bảo vệ.', 'protect', 0, 0, 'alive', 1)];
    case 'wolfMagician': return [{ ...skill('wolfMagic', 'Biến hóa đồng đội', 'Một lần mỗi ván, biến một Sói đồng đội thành ngẫu nhiên Sói đầu đàn, Sói lì đòn hoặc Wolf Seer.', 'other', 1, 1, 'wolves', 1), excludeIds: [p.id] }];
    case 'wolfScribe': return [skill('scribe', 'Ngụy tạo vai', 'Che vai hiện tại của một người thành Dân làng trước điều tra và công bố tử vong cho đến đêm kế tiếp.', 'block')];
    case 'wolfSummoner': return [{ ...skill('summonWolf', 'Triệu hồi Sói', 'Một lần mỗi ván, hồi sinh một Sói đã chết thành Ma Sói thường.', 'other', 1, 1, 'dead', 1), includeIds: state.players.filter(t => !t.alive && t.team === 'wolves').map(t => t.id) }];
    case 'wolfTrickster': return [skill('stealMask', 'Trộm vỏ bọc', 'Mượn tên vai của một người làm vỏ bọc trước điều tra và công bố tử vong cho tới khi chọn vỏ bọc mới.', 'block')];
    case 'yuleWolf': return [skill('yuleLock', 'Phong tỏa mùa đông', 'Một lần mỗi ván, phong tỏa tối đa ba người: không nói, không bỏ phiếu, không dùng kỹ năng trong đêm và ngày này.', 'block', 1, 3, 'other', 1)];
    case 'accomplice': case 'assassin': case 'headlessHorseman': case 'serialKiller': return [attack()];
    case 'alchemist': return [skill('blackPotion', 'Thuốc đen', 'Hai lọ mỗi ván, một liều tấn công mục tiêu trong đêm.', 'attack', 1, 1, 'other', 2), skill('redPotion', 'Thuốc đỏ', 'Tích liều trên một người. Đủ hai liều sẽ tấn công họ; các liều tồn tại qua các đêm.', 'attack')];
    case 'arsonist': return [skill('douse', 'Tẩm xăng', 'Tẩm xăng tối đa hai người mỗi đêm. Có thể tích lũy nhiều đêm trước khi đốt.', 'other', 1, 2), ...(hasMarks(p, 'doused', state) ? [skill('ignite', 'Châm lửa', 'Tấn công tất cả mục tiêu đã tẩm xăng, rồi xóa các dấu xăng.', 'attack', 0, 0, 'alive')] : [])];
    case 'bandit': return [skill('recruitBandit', 'Chiêu mộ đồng phạm', 'Một lần mỗi ván, chuyển một người thành Accomplice cùng phe của bạn, nếu không được bảo vệ.', 'attack', 1, 1, 'other', 1), attack()];
    case 'blight': return [skill('infect', 'Gây bệnh', 'Gây bệnh cho tối đa hai người. Bệnh lây thêm qua những tương tác kỹ năng ban đêm.', 'other', 1, 2), ...(hasMarks(p, 'infected', state) ? [skill('releaseBlight', 'Kích phát bệnh', 'Tấn công mọi người đã bị bạn gây bệnh, rồi xóa danh sách.', 'attack', 0, 0, 'alive')] : [])];
    case 'bomber': return [skill('plantBomb', 'Gài bom', 'Gài bom lên tối đa hai người, giữ dấu qua các đêm.', 'other', 1, 2), ...(hasMarks(p, 'bombed', state) ? [skill('detonate', 'Kích nổ', 'Tấn công tất cả người đang mang bom của bạn, rồi xóa các dấu bom.', 'attack', 0, 0, 'alive')] : [])];
    case 'cannibal': return [skill('feast', 'Ăn thịt', `Tấn công tối đa ${Math.min(3, 1 + count(p, 'hunger'))} người; nhịn ăn sẽ tích thêm một mục tiêu, tối đa ba.`, 'attack', 1, Math.min(3, 1 + count(p, 'hunger'))), skill('fast', 'Nhịn ăn tích sức', 'Không tấn công đêm này, tích thêm một mục tiêu cho lần ăn sau (tối đa ba).', 'other', 0, 0, 'alive')];
    case 'corruptor': return [skill('corrupt', 'Gây lỗi', 'Mục tiêu mất quyền nói, bỏ phiếu và dùng kỹ năng trong ngày, rồi chết khi ngày kết thúc.', 'block')];
    case 'deepSeaTerror': return [skill('seaMark', 'Dấu ấn biển sâu', 'Đánh dấu tối đa ba người, họ không được nói hoặc bỏ phiếu trong ngày sắp tới.', 'block', 1, 3), ...(hasMarks(p, 'seaMarked', state) ? [skill('seaRelease', 'Kết liễu dấu ấn', 'Tấn công tất cả người đang mang dấu ấn của bạn.', 'attack', 0, 0, 'alive')] : [])];
    case 'evilCupid': return [pair('evilLovers', 'Ghép đôi tử thần', 'Một lần mỗi ván, hai người chết theo nhau nhưng giữ nguyên phe.', 'other', 1), attack()];
    case 'evilDetective': return living(state).filter(t => t.id !== p.id).length === 1 ? [skill('evilDuel', 'Điều tra đối thủ cuối', 'Khi chỉ còn hai người, điều tra biến thành đòn tấn công đối thủ cuối để ván có thể kết thúc.', 'attack')] : [pair('evilDetect', 'Điều tra nguy hiểm', 'Nếu khác phe hiện tại, cả hai bị tấn công. Nếu cùng phe, bạn biết tên phe của họ.', 'attack')];
    case 'evilSanta': return living(state).filter(t => t.id !== p.id).length === 1 ? [skill('lastGift', 'Quà cho đối thủ cuối', 'Khi chỉ còn hai người, trao quà sinh tử cho người còn lại và tấn công họ.', 'attack')] : [pair('deadlyGifts', 'Trao quà sinh tử', 'Hai người nhận quà; một trong hai được chọn ngẫu nhiên để bị tấn công. Không có lựa chọn trực tuyến của người nhận.', 'attack')];
    case 'illusionist': return [skill('illusion', 'Gieo ảo ảnh', 'Đánh dấu tối đa ba người bằng ảo ảnh.', 'other', 1, 3), ...(hasMarks(p, 'illusions', state) ? [skill('collapseIllusions', 'Phá vỡ ảo ảnh', 'Tấn công tất cả người đang bị bạn đánh dấu.', 'attack', 0, 0, 'alive')] : [])];
    case 'instigator': return [pair('instigate', 'Lập đội bí mật', 'Một lần mỗi ván, chọn một dân và một người khác phe để lập đội cùng bạn, liên kết sinh tử với nhau. Chọn sai cặp thì lần dùng không thành công.', 'other', 1)];
    case 'sectLeader': return [skill('recruitSect', 'Chiêu mộ giáo phái', 'Chuyển một người không được bảo vệ sang giáo phái của bạn; giữ vai và kỹ năng hiện tại.', 'attack')];
    case 'shapeshifter': return [skill('shapeKill', 'Giết và mượn dạng', 'Tấn công một người. Nếu họ chết, bạn mang vỏ bọc vai của họ trước điều tra và công bố tử vong.', 'attack')];
    case 'siren': return [skill('charm', 'Mê hoặc', 'Mê hoặc tối đa hai người. Thắng khi tất cả người còn sống khác đều mang dấu mê hoặc của bạn.', 'other', 1, 2), ...(hasMarks(p, 'charmed', state) ? [skill('drown', 'Kết liễu người mê', 'Tấn công mọi người đã bị bạn mê hoặc, rồi xóa dấu.', 'attack', 0, 0, 'alive')] : [])];
    case 'zombie': return [skill('zombify', 'Lây nhiễm Zombie', 'Chuyển một người không được bảo vệ thành Zombie, cùng thắng khi nhóm Zombie thống trị.', 'attack')];
    case 'headhunter': return !data(p).huntTarget ? [mark('huntContract', 'Chọn mục tiêu săn', 'Một lần mỗi ván, chọn người cần bị làng bỏ phiếu loại. Nếu họ chết cách khác, bạn chỉ có thể thắng khi phe Dân thua.', 1)] : [];
    case 'admirer': return [!data(p).admireTarget ? mark('admire', 'Chọn người ngưỡng mộ', 'Chọn một người. Bạn cùng hưởng chiến thắng nếu họ còn sống khi ván kết thúc.', 1) : null, ...(data(p).admireTarget && byId(state, data(p).admireTarget)?.alive ? [skill('admireSave', 'Che chở người ngưỡng mộ', 'Một lần mỗi ván, bảo vệ người bạn đã chọn trong đêm này.', 'protect', 0, 0, 'alive', 1)] : [])].filter(Boolean);
    default: return [];
  }
}

const remember = (actor, key, targets) => { const ids = list(actor, key); for (const t of targets) if (!ids.includes(t.id)) ids.push(t.id); };
const publicTeam = p => p.team === 'village' ? 'phe Dân' : p.team === 'wolves' ? 'phe Sói' : p.team.startsWith('sect:') ? 'giáo phái' : p.team === 'zombie' ? 'nhóm Zombie' : p.team.startsWith('killer:') ? 'phe sát nhân độc lập' : 'phe độc lập';
const auraOf = p => p.team === 'village' ? 'tốt' : p.team === 'wolves' || p.team.startsWith('killer:') || p.team.startsWith('sect:') || p.team === 'zombie' ? 'xấu' : 'không xác định';
const tell = (ctx, actor, message) => ctx.note(message, 'secret', actor.id);
const report = (ctx, actor, target) => {
  const entries = Object.entries(target.known || {});
  const clue = entries.at(-1);
  if (clue && ctx.get(clue[0])) return `${target.name} nhắn: “Thông tin gần nhất của tôi về ${ctx.get(clue[0]).name}: ${typeof clue[1] === 'boolean' ? clue[1] ? 'thuộc Sói' : 'không thuộc Sói' : String(clue[1])}.”`;
  const suspicion = Object.entries(target.suspicion || {}).sort((a,b) => b[1]-a[1])[0];
  return suspicion && ctx.get(suspicion[0]) ? `${target.name} nhắn: “Tôi nghi ${ctx.get(suspicion[0]).name} nhất, nhưng đó chưa phải bằng chứng.”` : `${target.name} nhắn: “Tôi chưa có thông tin điều tra đáng tin cậy.”`;
};
const sourceOf = (ctx, victim) => [...(ctx.state.data?.deaths || [])].reverse().find(d => d.victim === victim.id)?.source;
function suspects(ctx, victim, actor) {
  const killer = ctx.get(sourceOf(ctx, victim));
  const candidates = ctx.living().filter(p => p.id !== actor.id && p.id !== victim.id);
  const others = candidates.filter(p => p.id !== killer?.id).sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
  const shift = others.length ? Math.floor(ctx.rng() * others.length) : 0;
  const chosen = killer?.alive ? [killer] : [];
  for (let i=0; i<others.length && chosen.length<3; i++) chosen.push(others[(shift+i)%others.length]);
  chosen.sort((a,b) => Number(a.id.slice(1))-Number(b.id.slice(1)));
  tell(ctx, actor, chosen.length ? `Nhóm nghi phạm liên quan đến ${victim.name}: ${chosen.map(p => p.name).join(', ')}.${killer?.alive ? ' Kẻ giết có trong nhóm, chưa biết là ai.' : ' Không thể xác nhận kẻ giết còn sống.'}` : 'Không còn nghi phạm sống để điều tra.');
}
function attackMarks(ctx, actor, key, reason) { for (const id of [...list(actor,key)]) { const target=ctx.get(id); if (target?.alive) ctx.kill(target,actor,reason); } data(actor)[key]=[]; }
function protectionExists(target, day) { return (effects(target).protections || []).some(p => p.expires === undefined || p.expires >= day); }
function safeConvert(ctx, actor, target, team, role) {
  if (protectionExists(target, ctx.state.day)) { tell(ctx, actor, `${target.name} đang được bảo vệ; chuyển hóa không thành công.`); return false; }
  ctx.convert(target, team, role);
  return true;
}

export function executeNightAbility(ctx, actor, ability, targets) {
  const state=ctx.state, day=state.day, a=data(actor), t=targets[0], other=targets[1];
  state.data ||= {};
  state.data.visits ||= [];
  state.data.visits.push({ actor:actor.id, targets:targets.map(p=>p.id), day });
  switch(ability.id) {
    case 'inspect': return ctx.info(actor,t,'team');
    case 'aura': case 'eggAura': case 'blindInspect': return ctx.info(actor,t,'aura');
    case 'analyse': {
      const result=targets.map(p=>ctx.info(actor,p,'aura'));
      tell(ctx,actor,`${targets[0].name}: hào quang ${result[0]}; ${targets[1].name}: hào quang ${result[1]}.`);
      if(result[0]===result[1]) { a.analystRestThrough=day+1; tell(ctx,actor,'Hai hào quang giống nhau. Bạn phải nghỉ soi ở đêm kế tiếp.'); }
      return;
    }
    case 'newMoon': state.data.blockWolfNight=day; ctx.note('Trăng mới che khuất bầu trời. Đàn Sói không thể săn đêm nay.'); return;
    case 'meteor': { const village=t.team==='village'; ctx.kill(t,actor,'thiên thạch'); if(village&&!t.alive) ctx.kill(actor,actor,'thiên thạch giết nhầm dân',{ignoreProtection:true}); return; }
    case 'revengeMark': a.deathTarget=t.id; return tell(ctx,actor,`Bạn đánh dấu trả thù ${t.name}.`);
    case 'bread': ctx.addVote(t,1,day); return tell(ctx,actor,`Bạn tặng bánh cho ${t.name}: lá phiếu hôm nay thêm trọng số 1.`);
    case 'beastTrap': return ctx.protect(t,actor,{reflect:true});
    case 'bellPair': a.bellPair=targets.map(p=>p.id); return tell(ctx,actor,`Chuông liên kết ${t.name} và ${other.name}.`);
    case 'guard': actor.lastGuard=t.id; return ctx.protect(t,actor);
    case 'heal': return ctx.protect(t,actor);
    case 'meat': a.meatUsed=(a.meatUsed||0)+targets.length; for(const p of targets) ctx.protect(p,actor); return;
    case 'conjure': {
      const original=actor.role;
      a.conjurorReturnRole=original; a.conjurorReturnDay=day+1;
      tell(ctx,actor,report(ctx,actor,t)); ctx.changeRole(actor,t.role); return;
    }
    case 'lovers': case 'evilLovers': ctx.link(t,other,ability.id==='lovers'?'lovers':'death'); return ctx.note(`${t.name} và ${other.name} đã được liên kết sinh tử.`, 'secret',actor.id);
    case 'detect': return tell(ctx,actor,`${t.name} và ${other.name} ${t.team===other.team?'cùng phe':'khác phe'} hiện tại.`);
    case 'visitDorothy': remember(actor,'dorothyVisits',targets); return tell(ctx,actor,`Bạn đã ghé ${list(actor,'dorothyVisits').length} người khác nhau, thu thập ${Math.min(3,list(actor,'dorothyVisits').length)}/3 món.`);
    case 'dorothyWater': if(t.team!=='village') ctx.kill(t,actor,'nước khắc chế'); else tell(ctx,actor,'Nước không có tác dụng trên người phe Dân.'); return;
    case 'eggProtect': return ctx.protect(t,actor);
    case 'eggSilence': case 'silence': effects(t).silencedThrough=day; return;
    case 'eggBlock': case 'nightmare': ctx.block(t); effects(t).blockedThrough=day; return;
    case 'ferry': return ctx.protect(t,actor,{delay:true});
    case 'redirect': return ctx.protect(t,actor,{redirect:other.id});
    case 'forgeArmor': return ctx.protect(t,actor,{persist:1});
    case 'forgeWeapon': effects(t).weapon=(effects(t).weapon||0)+1; return tell(ctx,t,`${actor.name} trao cho bạn một phát súng dùng ban ngày.`);
    case 'roleCard': effects(t).roleCard=t.role; return tell(ctx,t,`Bạn nhận thẻ ghi vai ${ctx.roles[t.role].name}; có thể công khai thẻ vào ban ngày.`);
    case 'betVillage': case 'betWolves': {
      a.gambles=(a.gambles||0)+1;
      const expected=ability.id==='betVillage'?'village':'wolves';
      if(t.team===expected) { tell(ctx,actor,'Bạn cược đúng!'); ctx.info(actor,t,'role'); }
      else tell(ctx,actor,'Bạn cược sai, không nhận được tên vai.');
      return;
    }
    case 'ghostVisit': return ctx.protect(t,actor,{link:true});
    case 'inherit': a.inheritTarget=t.id; return tell(ctx,actor,`Bạn sẽ kế thừa ${t.name} nếu họ chết.`);
    case 'jail': a.jailedId=t.id; ctx.block(t); ctx.protect(t,actor); tell(ctx,actor,report(ctx,actor,t)); return tell(ctx,t,`${actor.name} đang giam và bảo vệ bạn trong đêm. Bạn không thể dùng kỹ năng.`);
    case 'jailExecute': return ctx.kill(t,actor,'xử tử trong ngục',{ignoreProtection:true});
    case 'journalism': {
      const killer=ctx.get(sourceOf(ctx,t));
      if(!killer) return tell(ctx,actor,'Hiện trường không đủ bằng chứng để xác định hàng/cột của kẻ giết.');
      const seat=Number(killer.id.slice(1));
      return tell(ctx,actor,`Hiện trường của ${t.name}: kẻ giết ở ${ctx.rng()<0.5?`hàng ${Math.floor(seat/5)+1}`:`cột ${seat%5+1}`} trên bàn 5 cột (đếm từ chỗ ngồi đầu).`);
    }
    case 'loudmouthMark': a.loudmouthTarget=t.id; return;
    case 'aim': a.markTarget=t.id; a.markDay=day; return tell(ctx,actor,`Bạn ngắm ${t.name}; có thể bắn vào ban ngày sau đêm này.`);
    case 'speakDead': case 'spiritTalk': return tell(ctx,actor,report(ctx,actor,t));
    case 'revive': return ctx.revive(t);
    case 'autopsy': return suspects(ctx,t,actor);
    case 'nightWatch': return ctx.protect(t,actor);
    case 'watchProtection': return tell(ctx,actor,`Đang được bảo vệ: ${ctx.living().filter(p=>protectionExists(p,day)).map(p=>p.name).join(', ')||'chưa phát hiện ai'}.`);
    case 'predict': a.predictTarget=t.id; a.predictDay=day; return;
    case 'oracle': {
      const counts={tốt:0,xấu:0,'không xác định':0}; for(const p of targets) counts[auraOf(p)]++;
      return tell(ctx,actor,`Trong nhóm đã chọn: ${counts.tốt} hào quang tốt, ${counts.xấu} xấu, ${counts['không xác định']} không xác định.`);
    }
    case 'rainStick': effects(t).rainmaker=true; return tell(ctx,t,'Bạn nhận gậy cầu mưa: lần tới bị chọn treo cổ sẽ hủy cuộc biểu quyết.');
    case 'redVisit': a.redVisitTarget=t.id; a.redVisitDay=day; ctx.protect(actor,actor); return;
    case 'reviveCharm': effects(t).reviveCharm=true; return tell(ctx,actor,`Bạn đặt bùa hồi sinh lên ${t.name}.`);
    case 'sheriffWatch': a.sheriffTargets=targets.map(p=>p.id); a.sheriffDay=day; return;
    case 'snowGuard': a.snowGifts=(a.snowGifts||0)+1; remember(actor,'snowTargets',targets); return ctx.protect(t,actor,{persist:1});
    case 'bindSoul': remember(actor,'soulBonds',targets); tell(ctx,actor,report(ctx,actor,t)); return tell(ctx,t,`${actor.name} liên kết linh hồn với bạn; lời nhắn riêng được giữ cả khi một người chết.`);
    case 'spiritInspect': {
      const any=targets.some(p=>(data(p).kills||[]).some(k=>k.day>=day-1));
      return tell(ctx,actor,`Trong nhóm ${targets.map(p=>p.name).join(', ')}: ${any?'có ít nhất một người đã giết gần đây':'chưa phát hiện dấu vết giết người gần đây'}.`);
    }
    case 'spyWatch': {
      a.spyTargets=targets.map(p=>p.id);
      const any=targets.some(p=>(data(p).kills||[]).some(k=>k.day>=day-1));
      if(any) a.spyUnlockDay=day+1;
      return tell(ctx,actor,any?'Nhóm có dấu vết giết người. Đêm kế tiếp có thể điều tra phe nhóm này.':'Nhóm chưa có dấu vết giết người trong khoảng theo dõi.');
    }
    case 'spyInspect': for(const id of a.spyTargets||[]) { const p=ctx.get(id); if(p) ctx.info(actor,p,'team'); } return;
    case 'rewindDay': return ctx.rewind(actor);
    case 'plantTrap': remember(actor,'traps',targets); return tell(ctx,actor,`Bạn có ${list(actor,'traps').length}/3 bẫy đã đặt.`);
    case 'activateTraps': for(const id of list(actor,'traps')) { const p=ctx.get(id); if(p?.alive) ctx.protect(p,actor,{reflect:true}); } a.traps=[]; return;
    case 'violin': {
      const last=(state.data.deaths||[]).at(-1), dead=last&&ctx.get(last.victim);
      return tell(ctx,actor,dead?`${t.name} ${t.team===dead.team?'cùng phe với':'khác phe với'} ${dead.name}, người chết gần nhất.`:'Chưa có người chết để đối chiếu.');
    }
    case 'prisonRoom': {
      for(const p of targets) { ctx.block(p); ctx.protect(p,actor); }
      if(targets.every(ctx.isWolf)) return ctx.kill(actor,t,'hai Sói vượt ngục',{ignoreProtection:true});
      const inmate=targets.find(p=>p.team==='village');
      if(inmate&&ctx.rng()<0.5) ctx.kill(targets.find(p=>p.id!==inmate.id),inmate,'vũ khí trong phòng giam',{ignoreProtection:true});
      for(const p of targets) tell(ctx,actor,report(ctx,actor,p));
      return;
    }
    case 'savePotion': return ctx.protect(t,actor);
    case 'poisonPotion': case 'blackPotion': return ctx.kill(t,actor,'thuốc độc');
    case 'candy': case 'toxin': effects(t).nightPoison={day:day+1,source:actor.id}; return tell(ctx,actor,`${t.name} sẽ chịu độc ở cuối đêm ${day+1}.`);
    case 'confuseDeaths': state.data.hideDeathRolesDay=day; return;
    case 'kittenBite': if(!ctx.isWolf(t)) safeConvert(ctx,actor,t,'wolves','wolf'); return;
    case 'snatch': effects(t).protections=[]; return;
    case 'wolfInspect': return ctx.info(actor,t,'role');
    case 'surrenderSight': return ctx.changeRole(actor,'wolf');
    case 'splitBond': return ctx.link(actor,t,'death');
    case 'storm': state.log=state.log.filter(e=>e.kind!=='chat'); state.data.hiddenVotesDay=day; return ctx.note('Bão nổi lên: lời thảo luận cũ bị cuốn đi, phiếu hôm nay sẽ bị che.');
    case 'swamp': case 'voodoo': effects(t).silencedThrough=day; effects(t).blockedThrough=day; ctx.block(t); return;
    case 'berserk': state.data.berserkDay=day; return;
    case 'wolfMagic': return ctx.changeRole(t,['alphaWerewolf','stubbornWolf','wolfSeer'][Math.floor(ctx.rng()*3)]);
    case 'scribe': effects(t).disguise='villager'; effects(t).disguiseThrough=day; return;
    case 'summonWolf': ctx.changeRole(t,'wolf'); return ctx.revive(t);
    case 'stealMask': effects(actor).disguise=t.role; delete effects(actor).disguiseThrough; return tell(ctx,actor,`Bạn mượn vỏ bọc ${ctx.roles[t.role].name}.`);
    case 'yuleLock': for(const p of targets) { effects(p).silencedThrough=day; effects(p).blockedThrough=day; ctx.block(p); } return;
    case 'attack': case 'evilDuel': case 'lastGift': return ctx.kill(t,actor,'sát nhân tấn công');
    case 'redPotion': {
      const doses=(a.redDoses ||= {}); doses[t.id]=(doses[t.id]||0)+1;
      if(doses[t.id]>=2) { ctx.kill(t,actor,'hai liều thuốc đỏ'); delete doses[t.id]; }
      else tell(ctx,actor,`${t.name} nhận liều thuốc đỏ đầu tiên.`);
      return;
    }
    case 'douse': return remember(actor,'doused',targets);
    case 'ignite': return attackMarks(ctx,actor,'doused','lửa xăng');
    case 'recruitBandit': safeConvert(ctx,actor,t,actor.team,'accomplice'); return;
    case 'infect': remember(actor,'infected',targets); for(const p of targets) (effects(p).infectedBy ||= []).push(actor.id); return;
    case 'releaseBlight': return attackMarks(ctx,actor,'infected','bệnh bùng phát');
    case 'plantBomb': return remember(actor,'bombed',targets);
    case 'detonate': return attackMarks(ctx,actor,'bombed','bom phát nổ');
    case 'feast': for(const p of targets) ctx.kill(p,actor,'ăn thịt'); a.hunger=0; return;
    case 'fast': a.hunger=Math.min(2,(a.hunger||0)+1); return;
    case 'corrupt': effects(t).corruptedDay=day; effects(t).silencedThrough=day; effects(t).blockedThrough=day; ctx.block(t); return;
    case 'seaMark': remember(actor,'seaMarked',targets); for(const p of targets) effects(p).silencedThrough=day; return;
    case 'seaRelease': return attackMarks(ctx,actor,'seaMarked','dấu ấn biển sâu');
    case 'evilDetect': if(t.team!==other.team) { ctx.kill(t,actor,'điều tra khác phe'); ctx.kill(other,actor,'điều tra khác phe'); } else tell(ctx,actor,`${t.name} và ${other.name} cùng thuộc ${publicTeam(t)}.`); return;
    case 'deadlyGifts': return ctx.kill(targets[Math.floor(ctx.rng()*2)],actor,'quà sinh tử');
    case 'illusion': return remember(actor,'illusions',targets);
    case 'collapseIllusions': return attackMarks(ctx,actor,'illusions','ảo ảnh tan vỡ');
    case 'instigate': {
      if(t.team===other.team||!targets.some(p=>p.team==='village')) return tell(ctx,actor,'Cặp được chọn không có một dân và một người khác phe; lôi kéo không thành công.');
      for(const p of targets) ctx.convert(p,actor.team);
      ctx.link(t,other,'death');
      return;
    }
    case 'recruitSect': return safeConvert(ctx,actor,t,actor.team);
    case 'shapeKill': {
      const role=t.role; ctx.kill(t,actor,'kẻ biến hình tấn công');
      if(!t.alive) effects(actor).disguise=role;
      return;
    }
    case 'charm': remember(actor,'charmed',targets); for(const p of targets) effects(p).charmedBy=actor.id; return;
    case 'drown': return attackMarks(ctx,actor,'charmed','mê hoặc kết liễu');
    case 'zombify': return safeConvert(ctx,actor,t,'zombie','zombie');
    case 'huntContract': a.huntTarget=t.id; return tell(ctx,actor,`Hợp đồng săn của bạn là ${t.name}.`);
    case 'admire': a.admireTarget=t.id; return tell(ctx,actor,`Bạn ngưỡng mộ ${t.name}; hãy giúp họ sống đến hết ván.`);
    case 'admireSave': { const admired=ctx.get(a.admireTarget); if(admired?.alive) ctx.protect(admired,actor); return; }
    default: throw new Error(`Kỹ năng đêm chưa được xử lý: ${ability.id}`);
  }
}

export function nightStart(ctx) {
  const state=ctx.state; state.data ||= {};
  state.data.visits=[];
  for(const p of state.players) {
    const a=data(p), e=effects(p);
    if(a.conjurorReturnDay && state.day>=a.conjurorReturnDay) {
      const role=a.conjurorReturnRole; delete a.conjurorReturnDay; delete a.conjurorReturnRole;
      ctx.changeRole(p,role);
      tell(ctx,p,'Phép mượn vai hết hiệu lực; bạn trở lại Conjuror.');
    }
    if(e.disguiseThrough!==undefined&&e.disguiseThrough<state.day) { delete e.disguise; delete e.disguiseThrough; }
  }
}

export function nightAftermath(ctx) {
  const state=ctx.state, day=state.day;
  const deaths=()=> (state.data?.deaths||[]).filter(d=>d.day===day&&d.phase==='night');
  // Delayed poison resolves after the current night's protection skills.
  for(const p of state.players) {
    const poison=effects(p).nightPoison;
    if(poison&&poison.day<=day) {
      delete effects(p).nightPoison;
      if(p.alive) ctx.kill(p,ctx.get(poison.source),'độc phát tác');
    }
  }
  for(const p of state.players) {
    const a=data(p);
    if(a.redVisitDay===day&&p.alive) {
      const host=ctx.get(a.redVisitTarget);
      if(host&&(!host.alive||ctx.isWolf(host)||host.team.startsWith('killer:')||host.team==='zombie')) ctx.kill(p,host,'ghé nơi nguy hiểm',{ignoreProtection:true});
    }
    if(a.sheriffDay===day&&p.alive) for(const d of deaths()) {
      if((a.sheriffTargets||[]).includes(d.victim)) suspects(ctx,ctx.get(d.victim),p);
    }
    // Bonds continue to convey private, non-omniscient reports after either dies.
    for(const id of a.soulBonds||[]) {
      const bonded=ctx.get(id); if(bonded) tell(ctx,p,report(ctx,p,bonded));
    }
  }
  // Blight spreads through recorded night visits only, without inventing facts.
  for(const blight of state.players.filter(p=>p.role==='blight'&&p.alive)) {
    const infected=new Set(list(blight,'infected'));
    for(const visit of state.data.visits||[]) {
      if(visit.day!==day) continue;
      const contact=[visit.actor,...visit.targets];
      if(contact.some(id=>infected.has(id))) for(const id of contact) {
        const p=ctx.get(id); if(p?.alive&&p.id!==blight.id) infected.add(id);
      }
    }
    data(blight).infected=[...infected];
  }
}
