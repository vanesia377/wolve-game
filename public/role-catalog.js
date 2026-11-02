// Catalog supplied by the user. Descriptions preserve the pasted source wording.
// Group totals reflect actual named rows (64 + 35 + 22 + 3 + 2 = 126),
// rather than the two overstated heading counts in that source.
export const GROUPS = {
  "village": {
    "name": "Làng",
    "side": "Phe Dân",
    "count": 64
  },
  "wolves": {
    "name": "Sói",
    "side": "Phe Sói",
    "count": 35
  },
  "killer": {
    "name": "Sát nhân / Chuyển hóa",
    "side": "Phe độc lập",
    "count": 22
  },
  "solo": {
    "name": "Thắng riêng qua biểu quyết",
    "side": "Phe độc lập",
    "count": 3
  },
  "teamless": {
    "name": "Không phe cố định",
    "side": "Chưa cố định phe",
    "count": 2
  }
};

export const EXPANDED_ROLES = {
  "analyst": {
    "name": "Analyst",
    "officialName": "Analyst",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Mỗi đêm xem hào quang của hai người. Nếu hai người có cùng hào quang, phải bỏ lượt soi đêm kế tiếp.",
    "group": "village"
  },
  "astronomer": {
    "name": "Astronomer",
    "officialName": "Astronomer",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Có thể tạo trăng mới để chặn đòn giết đêm sau của sói; dùng thiên thạch giết mục tiêu nhưng sẽ chết nếu mục tiêu chết là phe dân.",
    "group": "village"
  },
  "auraSeer": {
    "name": "Aura Seer",
    "officialName": "Aura Seer",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Soi hào quang một người mỗi đêm (tốt / xấu / không xác định), không biết chính xác tên role.",
    "group": "village"
  },
  "avenger": {
    "name": "Avenger",
    "officialName": "Avenger",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đánh dấu một người; khi bản thân chết, mục tiêu đã chọn có thể bị kéo chết theo.",
    "group": "village"
  },
  "baker": {
    "name": "Baker",
    "officialName": "Baker",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Phát bánh cho một người vào ban đêm, giúp lá phiếu của họ có trọng số cao hơn 1 ở lượt bỏ phiếu tiếp theo.",
    "group": "village"
  },
  "beastHunter": {
    "name": "Beast Hunter",
    "officialName": "Beast Hunter",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đặt bẫy bảo vệ một người; nếu sói/solo tấn công mục tiêu đã đặt bẫy, bẫy có thể giết sói.",
    "group": "village"
  },
  "bellRinger": {
    "name": "Bell-Ringer",
    "officialName": "Bell-Ringer",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Liên kết hai người đã chọn; khi một người chết, người còn lại được tiết lộ vai trò cho Bell-Ringer.",
    "group": "village"
  },
  "guard": {
    "name": "Bảo vệ",
    "officialName": "Bodyguard",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Bảo vệ một người khác (bao gồm bản thân) vào ban đêm khỏi bị giết; không thể bảo vệ 1 người 2 đêm liên tiếp.",
    "group": "village"
  },
  "bully": {
    "name": "Bully",
    "officialName": "Bully",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Ném đá khiến mục tiêu bị choáng, hạn chế nói chuyện, bỏ phiếu và dùng kỹ năng; trúng tiếp lần 2 có thể chết. Mỗi ngày chỉ được ném 1 viên đá, chỉ được giết tối đa 2 người",
    "group": "village"
  },
  "butcher": {
    "name": "Butcher",
    "officialName": "Butcher",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Sử dụng các phần thịt bảo vệ người chơi khỏi đòn tấn công ban đêm; có thể phân bổ bảo vệ nhiều mục tiêu. Được cho 5 miếng thịt",
    "group": "village"
  },
  "conjuror": {
    "name": "Conjuror",
    "officialName": "Conjuror",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Chọn vai trò của một dân làng đã chết để tạm biến thành role đó trong một ngày; có thể nói chuyện với người chết khi ở dạng tạm thời.",
    "group": "village"
  },
  "cowardlyLion": {
    "name": "Cowardly Lion",
    "officialName": "Cowardly Lion",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Tích lũy lòng can đảm khi không bỏ phiếu; sau khi chết có thể dùng sức mạnh tích lũy để tác động một lần lên một cá nhân.",
    "group": "village"
  },
  "cupid": {
    "name": "Cupid",
    "officialName": "Cupid",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Ghép hai người thành cặp tình nhân; khi một người chết người kia thường chết theo, điều kiện thắng có thể đổi theo cặp.",
    "group": "village"
  },
  "cursed": {
    "name": "Người bị nguyền",
    "officialName": "Cursed",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Bắt đầu thuộc làng; khi bị sói cắn có thể biến thành một con sói thường.",
    "group": "village"
  },
  "detective": {
    "name": "Detective",
    "officialName": "Detective",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Chọn hai người mỗi đêm để tìm hiểu họ có cùng phe hay không.",
    "group": "village"
  },
  "doctor": {
    "name": "Bác sĩ",
    "officialName": "Doctor",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Bảo vệ một người khác vào ban đêm khỏi bị giết; không thể tự chữa.",
    "group": "village"
  },
  "dorothy": {
    "name": "Dorothy",
    "officialName": "Dorothy",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đến thăm người chơi để thu thập trí óc, trái tim và lòng can đảm; đủ bộ có thể dùng nước khắc chế phe ác.",
    "group": "village"
  },
  "easterBunny": {
    "name": "Easter Bunny",
    "officialName": "Easter Bunny",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Phân phối những quả trứng có hiệu ứng khác nhau như bảo vệ, câm lặng, khóa kỹ năng hoặc soi hào quang.",
    "group": "village"
  },
  "ferryman": {
    "name": "Ferryman",
    "officialName": "Ferryman",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Chọn người để chèo đò: nếu bị giết đêm đó, họ được hoạt động thêm một ngày rồi mới chết; cứu trì hoãn tối đa hạn chế thời gian chết.",
    "group": "village"
  },
  "flagger": {
    "name": "Flagger",
    "officialName": "Flagger",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Chuyển hướng đòn tấn công nhắm vào người được bảo vệ sang một người khác; có số lượt thành công giới hạn là 2.",
    "group": "village"
  },
  "flowerChild": {
    "name": "Flower Child",
    "officialName": "Flower Child",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Dùng năng lực hạn chế để cứu một người khỏi kết quả treo cổ ban ngày.",
    "group": "village"
  },
  "forger": {
    "name": "Forger",
    "officialName": "Forger",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Rèn đồ cho đồng đội, gồm vật phẩm bảo vệ và vũ khí tấn công, rồi trao cho người chơi khác.",
    "group": "village"
  },
  "fortuneTeller": {
    "name": "Fortune Teller",
    "officialName": "Fortune Teller",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Phát thẻ tiết lộ role để người nhận tự công bố; người phe xấu có thể lợi dụng thẻ để đánh lừa.",
    "group": "village"
  },
  "gambler": {
    "name": "Gambler",
    "officialName": "Gambler",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đặt cược một mục tiêu thuộc phe nào; nếu đoán đúng sẽ thu được thông tin, số lần cược là 4.",
    "group": "village"
  },
  "ghostLady": {
    "name": "Ghost Lady",
    "officialName": "Ghost Lady",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Ghé thăm và bảo vệ một mục tiêu ban đêm; khi cứu thành công sẽ hình thành liên kết sinh tử với người đó. Sau khi có liên kết, nếu 1 trong 2 chết thì người còn lại chết theo",
    "group": "village"
  },
  "graveRobber": {
    "name": "Grave Robber",
    "officialName": "Grave Robber",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đêm đầu chọn một người để kế thừa role khi người đó chết, có thể vì vậy đổi luôn phe thắng.",
    "group": "village"
  },
  "grumpyGrandma": {
    "name": "Grumpy Grandma",
    "officialName": "Grumpy Grandma",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Chỉ định một người bị câm lặng và không thể biểu quyết trong ngày tiếp theo.",
    "group": "village"
  },
  "gunner": {
    "name": "Gunner",
    "officialName": "Gunner",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Sử dụng súng có lượng đạn hữu hạn để bắn một người vào ban ngày. Không được sử dụng chức năng vào ngày đầu tiên",
    "group": "village"
  },
  "jailer": {
    "name": "Jailer",
    "officialName": "Jailer",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Giam một người ban đêm để thẩm vấn, chặn kỹ năng và bảo vệ khỏi nhiều loại tấn công; có thể xử tử có giới hạn.",
    "group": "village"
  },
  "journalist": {
    "name": "Journalist",
    "officialName": "Journalist",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Điều tra thi thể bị phe xấu giết, xác định hàng hoặc cột trên bàn cờ có kẻ giết; từng được dùng trong tournament hoặc chế độ Moonlight.",
    "group": "village"
  },
  "judge": {
    "name": "Judge",
    "officialName": "Judge",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Khi bỏ phiếu không ai bị treo, có thể can thiệp để xử tử người đã đánh dấu (tối đa 2, mỗi ngày chỉ được 1 mục tiêu); chọn nhầm dân làng có thể khiến Judge chết.",
    "group": "village"
  },
  "loudmouth": {
    "name": "Loudmouth",
    "officialName": "Loudmouth",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Chỉ định một người; khi Loudmouth chết, role của người được đánh dấu sẽ bị công khai.",
    "group": "village"
  },
  "marksman": {
    "name": "Marksman",
    "officialName": "Marksman",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đánh dấu mục tiêu và dùng một đòn bắn hạn chế; bắn nhầm dân làng sẽ khiến bản thân chết thay vì mục tiêu.",
    "group": "village"
  },
  "mayor": {
    "name": "Thị trưởng",
    "officialName": "Mayor",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Tự công khai danh tính để lá phiếu của mình có trọng số gấp đôi trong phần còn lại của trận.",
    "group": "village"
  },
  "medium": {
    "name": "Medium",
    "officialName": "Medium",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Nói chuyện với người chết ban đêm và có cơ hội hồi sinh một người đã chết.",
    "group": "village"
  },
  "mortician": {
    "name": "Mortician",
    "officialName": "Mortician",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Khám nghiệm người chết để nhận nhóm nghi phạm có liên quan đến vụ giết của phe xấu.",
    "group": "village"
  },
  "nightWatchman": {
    "name": "Night Watchman",
    "officialName": "Night Watchman",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Bảo vệ người chơi ban đêm tối đa ba lần cả trận; đồng thời nhìn thấy những người đang được các role khác bảo vệ tối đa 2 lần.",
    "group": "village"
  },
  "nutcracker": {
    "name": "Nutcracker",
    "officialName": "Nutcracker",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Công khai vai để kích hoạt phiên bỏ phiếu đặc biệt, có thể khiến hai người nhiều phiếu nhất cùng bị treo.",
    "group": "village"
  },
  "pacifist": {
    "name": "Pacifist",
    "officialName": "Pacifist",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Dừng cuộc biểu quyết một lần và biết vai trò thật của mục tiêu mình chọn.",
    "group": "village"
  },
  "preacher": {
    "name": "Preacher",
    "officialName": "Preacher",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đoán ai sẽ chết ban đêm; khi đoán đúng tích lũy quyền tăng phiếu vĩnh viễn sau khi công khai vai.",
    "group": "village"
  },
  "priest": {
    "name": "Priest",
    "officialName": "Priest",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Dùng nước thánh để giết sói; nếu dùng nhầm vào dân làng, Priest có thể phải chết thay.",
    "group": "village"
  },
  "pumpkinDealer": {
    "name": "Pumpkin Dealer",
    "officialName": "Pumpkin Dealer",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đề nghị người chơi nhận thỏa thuận bí ngô với kết quả ngẫu nhiên: có thể chết, được bảo vệ, có đạn, bị khóa kỹ năng hoặc trở thành mục tiêu.",
    "group": "village"
  },
  "pumpkinKing": {
    "name": "Pumpkin King",
    "officialName": "Pumpkin King",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Role mùa Halloween mang tính sự kiện/xã hội: phát quà cho người chết; không có kỹ năng thay đổi chiến thuật cốt lõi.",
    "group": "village"
  },
  "pumpkinOracle": {
    "name": "Pumpkin Oracle",
    "officialName": "Pumpkin Oracle",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Lựa chọn nhóm ba người để nhận thông tin tổng hợp về phe/hào quang trong nhóm, không biết chính xác từng cá nhân.",
    "group": "village"
  },
  "rainmaker": {
    "name": "Rainmaker",
    "officialName": "Rainmaker",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Tối đa hai lần trao gậy cầu mưa cho người khác; nếu người ấy sắp bị treo cổ, gậy kích hoạt hủy phiên biểu quyết.",
    "group": "village"
  },
  "redLady": {
    "name": "Red Lady",
    "officialName": "Red Lady",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đến thăm một người ban đêm để tránh ở nhà; có thể chết nếu ghé nhầm nơi nguy hiểm.",
    "group": "village"
  },
  "resolutionist": {
    "name": "Resolutionist",
    "officialName": "Resolutionist",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Vai sự kiện tăng sức nặng lá phiếu khi duy trì cam kết luôn bỏ phiếu; bỏ lỡ một lượt bỏ phiếu sẽ mất vĩnh viễn quyền này.",
    "group": "village"
  },
  "ritualist": {
    "name": "Ritualist",
    "officialName": "Ritualist",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Liên lạc với người chết và đặt bùa hồi sinh lên người sống; nếu mục tiêu chết đúng điều kiện có thể sống lại.",
    "group": "village"
  },
  "santaClaus": {
    "name": "Santa Claus",
    "officialName": "Santa Claus",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Role mùa Giáng sinh, tặng quà mang tính trang trí/giao tiếp cho người đã chết; không đóng vai trò sát thương chiến thuật.",
    "group": "village"
  },
  "seer": {
    "name": "Tiên tri",
    "officialName": "Seer",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Kiểm tra một người mỗi đêm để biết phe của họ là gì.",
    "group": "village"
  },
  "apprentice": {
    "name": "Học việc Tiên tri",
    "officialName": "Seer Apprentice",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Khi Seer chết, có thể thức tỉnh để trở thành Seer và kế thừa khả năng soi.",
    "group": "village"
  },
  "sheriff": {
    "name": "Sheriff",
    "officialName": "Sheriff",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Theo dõi hai người mỗi đêm; nếu một người bị tấn công, nhận danh sách nghi phạm liên quan.",
    "group": "village"
  },
  "snowAngel": {
    "name": "Snow Angel",
    "officialName": "Snow Angel",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Bảo vệ một người khỏi một đòn tấn công trong hai đêm; chọn tối đa ba người khác nhau cả trận, hiệu ứng vẫn còn khi Snow Angel chết.",
    "group": "village"
  },
  "soulbinder": {
    "name": "Soulbinder",
    "officialName": "Soulbinder",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Tối đa hai lần, tự liên kết với một người sống hoặc đã chết để mở kênh trò chuyện riêng vĩnh viễn, kể cả sau khi một bên chết.",
    "group": "village"
  },
  "spiritSeer": {
    "name": "Spirit Seer",
    "officialName": "Spirit Seer",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Kiểm tra tối đa hai người, biết liệu một trong họ có thực hiện hành vi giết gần đây hay không.",
    "group": "village"
  },
  "spy": {
    "name": "Spy",
    "officialName": "Spy",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Theo dõi ba người ban đêm xem có ai trong số họ đã giết người; nếu có, được điều tra phe của các nghi phạm vào đêm tiếp theo.",
    "group": "village"
  },
  "timeTraveler": {
    "name": "Time Traveler",
    "officialName": "Time Traveler",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Role đặc biệt có thể đưa diễn biến quay lại một ngày trước, khôi phục các sự kiện nhất định; không khôi phục tất cả trạng thái.",
    "group": "village"
  },
  "toughGuy": {
    "name": "Tough Guy",
    "officialName": "Tough Guy",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đỡ được đòn giết một lần, thường được báo mình đã bị tấn công và sẽ chết chậm hơn nếu bị thương.",
    "group": "village"
  },
  "trapper": {
    "name": "Trapper",
    "officialName": "Trapper",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Đặt bẫy cho tối đa ba người rồi kích hoạt; bẫy chống tấn công ban đêm và có thể giết sói tấn công.",
    "group": "village"
  },
  "vigilante": {
    "name": "Vigilante",
    "officialName": "Vigilante",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Công khai vai trò và có thể dùng quyền giết vào ban ngày với số lượt giới hạn. 1 lần lộ vai trò người khác và 1 lần giết người khác",
    "group": "village"
  },
  "villager": {
    "name": "Dân làng",
    "officialName": "Villager",
    "icon": "home",
    "team": "village",
    "side": "Phe Dân",
    "description": "Dân làng thường, không có kỹ năng chủ động đặc biệt; dựa vào thảo luận và bỏ phiếu để thắng cùng làng.",
    "group": "village"
  },
  "violinist": {
    "name": "Violinist",
    "officialName": "Violinist",
    "icon": "eye",
    "team": "village",
    "side": "Phe Dân",
    "description": "Kiểm tra người chơi có đang thương tiếc người vừa chết hay không, từ đó suy ra liên hệ phe giữa họ.",
    "group": "village"
  },
  "warden": {
    "name": "Warden",
    "officialName": "Warden",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Giam hai người trong một phòng; họ có thể trò chuyện, một người dân làng có thể dùng vũ khí xử người kia, hai sói có thể cùng vượt ngục và giết Warden.",
    "group": "village"
  },
  "witch": {
    "name": "Witch",
    "officialName": "Witch",
    "icon": "shield",
    "team": "village",
    "side": "Phe Dân",
    "description": "Có lọ thuốc cứu và thuốc độc để lần lượt cứu hoặc hạ một người, mỗi loại sử dụng 1 lần.",
    "group": "village"
  },
  "alphaWerewolf": {
    "name": "Alpha Werewolf",
    "officialName": "Alpha Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Sói đầu đàn có sức mạnh cao hơn sói thường trong thứ tự xử lý một số tương tác. Nếu còn sống, mỗi đêm sói được cắn 2 người cạnh nhau thay vì 1",
    "group": "wolves"
  },
  "blindWerewolf": {
    "name": "Blind Werewolf",
    "officialName": "Blind Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Có kỹ năng điều tra hạn chế thông tin về vai trò/người chơi khác thay vì biết sẵn toàn bộ thông tin như một số sói điển hình.",
    "group": "wolves"
  },
  "candyWolf": {
    "name": "Candy Wolf",
    "officialName": "Candy Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Phát kẹo độc cho người chơi; mục tiêu có thể chết vào đêm kế nếu không được bảo vệ.",
    "group": "wolves"
  },
  "confusionWolf": {
    "name": "Confusion Wolf",
    "officialName": "Confusion Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Tối đa hai lần, giấu role của tất cả người bị giết trong đêm đó; chỉ phe sói xem được các role thật.",
    "group": "wolves"
  },
  "fireworkWolf": {
    "name": "Firework Wolf",
    "officialName": "Firework Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Khi sói không giết được ban đêm, tích trữ pháo hoa (tối đa hai) để giết người ban ngày; hành động làm lộ bản thân.",
    "group": "wolves"
  },
  "gentlewolf": {
    "name": "Gentlewolf",
    "officialName": "Gentlewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Một lần mỗi trận có thể cộng thêm ba phiếu chống một người và giảm ba phiếu chống người khác; vai thử nghiệm sử dụng trong Moonlight/Custom Games.",
    "group": "wolves"
  },
  "ghostWolf": {
    "name": "Ghost Wolf",
    "officialName": "Ghost Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Sau khi chết vẫn có thể ảnh hưởng đến lá phiếu/trao đổi với đồng đội khi còn sói sống.",
    "group": "wolves"
  },
  "guardianWolf": {
    "name": "Guardian Wolf",
    "officialName": "Guardian Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Trong giai đoạn bỏ phiếu, có thể cứu một người khỏi bị làng treo cổ; khả năng này không bảo vệ khỏi mọi cách giết khác.",
    "group": "wolves"
  },
  "jellyWolf": {
    "name": "Jelly Wolf",
    "officialName": "Jelly Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Bảo vệ một mục tiêu khỏi các đòn giết của phe làng và treo cổ trong một khoảng thời gian theo lượt dùng.",
    "group": "wolves"
  },
  "juniorWerewolf": {
    "name": "Junior Werewolf",
    "officialName": "Junior Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Khi Junior Werewolf chết, có thể kéo theo một mục tiêu trả thù đã đánh dấu.",
    "group": "wolves"
  },
  "kittenWolf": {
    "name": "Kitten Wolf",
    "officialName": "Kitten Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Có khả năng biến một số mục tiêu thành sói bằng cơ chế mèo con thay vì giết thông thường.",
    "group": "wolves"
  },
  "nightmareWerewolf": {
    "name": "Nightmare Werewolf",
    "officialName": "Nightmare Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Dùng ác mộng khóa kỹ năng của người chơi vào ban đêm trong số lượt nhất định.",
    "group": "wolves"
  },
  "partyWolf": {
    "name": "Party Wolf",
    "officialName": "Party Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Một lần mỗi trận được giết một người ngay ban ngày nhưng sẽ tự lộ danh tính; từng là role mùa, đã trở thành role cơ bản.",
    "group": "wolves"
  },
  "wolf": {
    "name": "Ma Sói",
    "officialName": "Regular Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Sói thường, nói chuyện với sói khác và bỏ phiếu chọn nạn nhân để giết mỗi đêm.",
    "group": "wolves"
  },
  "shadowWolf": {
    "name": "Shadow Wolf",
    "officialName": "Shadow Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Một lần mỗi trận, ẩn phiếu của toàn làng và nhân đôi trọng số phiếu của phe sói trong ngày kích hoạt.",
    "group": "wolves"
  },
  "snatcherWolf": {
    "name": "Snatcher Wolf",
    "officialName": "Snatcher Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Cướp hoặc vô hiệu lớp bảo vệ của một mục tiêu nhằm giúp phe sói tấn công thành công.",
    "group": "wolves"
  },
  "sorcerer": {
    "name": "Sorcerer",
    "officialName": "Sorcerer",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Đồng minh phe sói có năng lực soi/thu thập thông tin và có thể chuyển thành sói thường trong điều kiện nhất định.",
    "group": "wolves"
  },
  "splitWolf": {
    "name": "Split Wolf",
    "officialName": "Split Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Ràng buộc sinh mạng với một người chơi; liên kết tạo lợi thế đếm quân số nhưng một người chết có thể kéo theo người kia.",
    "group": "wolves"
  },
  "stormWolf": {
    "name": "Storm Wolf",
    "officialName": "Storm Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Tạo bão để đảo vị trí, che phiếu hoặc xóa thông tin thảo luận, làm nhiễu chiến thuật của làng.",
    "group": "wolves"
  },
  "stubbornWolf": {
    "name": "Sói lì đòn",
    "officialName": "Stubborn Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Kháng cái chết từ đòn tấn công hoặc treo cổ đầu tiên và chỉ bị thương; đòn tiếp theo mới gây tử vong.",
    "group": "wolves"
  },
  "swampWolf": {
    "name": "Swamp Wolf",
    "officialName": "Swamp Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Tạo đầm lầy gây cản trở nói chuyện và dùng kỹ năng, hoặc tung phiếu bầu giả.",
    "group": "wolves"
  },
  "toxicWolf": {
    "name": "Toxic Wolf",
    "officialName": "Toxic Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Sử dụng chất độc làm người chơi nhiễm hiệu ứng xấu, hỗ trợ giết hoặc làm tê liệt mục tiêu.",
    "group": "wolves"
  },
  "voodooWerewolf": {
    "name": "Voodoo Werewolf",
    "officialName": "Voodoo Werewolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Dùng lời nguyền/voodoo khiến người chơi bị hạn chế giao tiếp hoặc hành động ở ngày tiếp theo.",
    "group": "wolves"
  },
  "werewolfBerserk": {
    "name": "Werewolf Berserk",
    "officialName": "Werewolf Berserk",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Kích hoạt cơn cuồng sát, cho phép phe sói vượt qua một số dạng bảo vệ, có thể khiến người bảo vệ gặp nguy hiểm.",
    "group": "wolves"
  },
  "werewolfFan": {
    "name": "Werewolf Fan",
    "officialName": "Werewolf Fan",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Thuộc phe sói ngay từ đầu dù trông như làng; khi bị sói tấn công sẽ thành sói thường, có thể tự tiết lộ vai một lần.",
    "group": "wolves"
  },
  "wolfMagician": {
    "name": "Wolf Magician",
    "officialName": "Wolf Magician",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Chọn một sói đồng đội để trao khả năng đổi thành một role sói khác thông qua phép thuật.",
    "group": "wolves"
  },
  "wolfPacifist": {
    "name": "Wolf Pacifist",
    "officialName": "Wolf Pacifist",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Một lần mỗi trận, xem role thật của mục tiêu cùng đồng đội sói và buộc làng không thể bỏ phiếu treo cổ trong ngày đó.",
    "group": "wolves"
  },
  "wolfScribe": {
    "name": "Wolf Scribe",
    "officialName": "Wolf Scribe",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Ngụy tạo thông tin role hoặc nguyên nhân tử vong của người chơi bị giết để đánh lừa làng.",
    "group": "wolves"
  },
  "wolfSeer": {
    "name": "Wolf Seer",
    "officialName": "Wolf Seer",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Mỗi đêm kiểm tra vai trò của một người; có thể bỏ năng lực soi để trở thành sói thường và tham gia giết trực tiếp.",
    "group": "wolves"
  },
  "wolfShaman": {
    "name": "Wolf Shaman",
    "officialName": "Wolf Shaman",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Phù phép mục tiêu ban ngày để các role điều tra ở đêm tiếp theo nhìn họ như Wolf Shaman.",
    "group": "wolves"
  },
  "wolfSummoner": {
    "name": "Wolf Summoner",
    "officialName": "Wolf Summoner",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Triệu hồi một sói đã chết trở lại với vai trò sói thường theo điều kiện của kỹ năng.",
    "group": "wolves"
  },
  "wolfTimeTraveler": {
    "name": "Wolf Time Traveler",
    "officialName": "Wolf Time Traveler",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Biến thể phe sói của Time Traveler ở chế độ đặc biệt; thay đổi lại diễn biến một ngày theo cơ chế quay thời gian.",
    "group": "wolves"
  },
  "wolfTrickster": {
    "name": "Wolf Trickster",
    "officialName": "Wolf Trickster",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Trộm vỏ bọc vai trò của nạn nhân để che giấu sự thật trước các kỹ năng soi/điều tra.",
    "group": "wolves"
  },
  "wolffluencer": {
    "name": "Wolffluencer",
    "officialName": "Wolffluencer",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Thao túng lá phiếu của người chơi khác vào ngày tiếp theo.",
    "group": "wolves"
  },
  "yuleWolf": {
    "name": "Yule Wolf",
    "officialName": "Yule Wolf",
    "icon": "wolf",
    "team": "wolves",
    "side": "Phe Sói",
    "description": "Áp hiệu ứng phong tỏa lên nhóm người chơi, buộc họ lựa chọn hy sinh hoặc chịu hạn chế đến khi kết thúc hiệu ứng.",
    "group": "wolves"
  },
  "accomplice": {
    "name": "Accomplice",
    "officialName": "Accomplice",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Đồng phạm được Bandit chuyển hóa từ người khác; cùng Bandit chọn nạn nhân, có thể tiếp tục giết nếu Bandit chết hoặc bị khóa.",
    "group": "killer"
  },
  "alchemist": {
    "name": "Alchemist",
    "officialName": "Alchemist",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Phát hai loại thuốc cho các mục tiêu; thuốc đen có thể giết sau một liều, thuốc đỏ gây chết khi tích đủ liều.",
    "group": "killer"
  },
  "arsonist": {
    "name": "Arsonist",
    "officialName": "Arsonist",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Tẩm xăng lên nhiều người chơi ban đêm, sau đó châm lửa để đốt tất cả mục tiêu đã đánh dấu.",
    "group": "killer"
  },
  "assassin": {
    "name": "Assassin",
    "officialName": "Assassin",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Role đặc biệt trong Assassins Convention; loại mục tiêu và tương tác bỏ phiếu trong vòng chơi dành riêng cho chế độ này.",
    "group": "killer"
  },
  "bandit": {
    "name": "Bandit",
    "officialName": "Bandit",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Chọn một người để biến thành Accomplice rồi hợp tác giết người theo một phe độc lập.",
    "group": "killer"
  },
  "blight": {
    "name": "Blight",
    "officialName": "Blight",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Gây bệnh lây qua các hành động tương tác/soi; có thể kích hoạt giết những người đã nhiễm.",
    "group": "killer"
  },
  "bomber": {
    "name": "Bomber",
    "officialName": "Bomber",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Đặt bom lên mục tiêu và kích hoạt để giết các nạn nhân đã bị gài bom.",
    "group": "killer"
  },
  "cannibal": {
    "name": "Cannibal",
    "officialName": "Cannibal",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Ăn thịt nạn nhân và tích lũy lượt để tấn công nhiều người trong một đêm theo điều kiện.",
    "group": "killer"
  },
  "corruptor": {
    "name": "Corruptor",
    "officialName": "Corruptor",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Mỗi đêm gây lỗi một người: nạn nhân không thể nói, bỏ phiếu, dùng kỹ năng trong ngày và chết khi ngày kết thúc.",
    "group": "killer"
  },
  "deepSeaTerror": {
    "name": "Deep Sea Terror",
    "officialName": "Deep Sea Terror",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Đánh dấu người chơi khiến họ bị hạn chế tham gia bỏ phiếu; sau đó có thể giết đồng loạt những người đã bị đánh dấu.",
    "group": "killer"
  },
  "evilCupid": {
    "name": "Evil Cupid",
    "officialName": "Evil Cupid",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Ràng buộc sinh mạng hai người, khiến họ có thể cùng chết; có cách trực tiếp giết bằng chọn mục tiêu.",
    "group": "killer"
  },
  "evilDetective": {
    "name": "Evil Detective",
    "officialName": "Evil Detective",
    "icon": "eye",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Soi xem hai người có cùng phe: nếu khác phe, cả hai có thể bị giết; nếu cùng phe, biết thông tin phe.",
    "group": "killer"
  },
  "evilSanta": {
    "name": "Evil Santa",
    "officialName": "Evil Santa",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Đưa ra lựa chọn quà tặng mang tính sinh tử cho hai mục tiêu; kết quả có thể khiến ít nhất một người chết.",
    "group": "killer"
  },
  "headlessHorseman": {
    "name": "Headless Horseman",
    "officialName": "Headless Horseman",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Giết một người mỗi đêm; có thể tránh bị treo khi sói vẫn còn tồn tại, nhưng không miễn nhiễm mọi sát thương.",
    "group": "killer"
  },
  "illusionist": {
    "name": "Illusionist",
    "officialName": "Illusionist",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Đánh dấu người chơi bằng ảo ảnh rồi kích hoạt để loại bỏ các mục tiêu đã đánh dấu.",
    "group": "killer"
  },
  "instigator": {
    "name": "Instigator",
    "officialName": "Instigator",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Lôi kéo một người phe làng và một người phe khác thành đội bí mật; điều kiện sống chết liên kết giữa các thành viên.",
    "group": "killer"
  },
  "sectLeader": {
    "name": "Sect Leader",
    "officialName": "Sect Leader",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Chiêu mộ người chơi vào giáo phái nhằm tạo phe riêng, có thể chuyển hóa để cùng thắng.",
    "group": "killer"
  },
  "serialKiller": {
    "name": "Serial Killer",
    "officialName": "Serial Killer",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Sát nhân đơn độc tấn công người chơi vào ban đêm; phải loại các phe đối thủ để sống sót.",
    "group": "killer"
  },
  "shapeshifter": {
    "name": "Shapeshifter",
    "officialName": "Shapeshifter",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Giết một người mỗi đêm và mượn vai trò của nạn nhân làm lớp ngụy trang trước các kỹ năng soi.",
    "group": "killer"
  },
  "siren": {
    "name": "Siren",
    "officialName": "Siren",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Quyến rũ/chuyển hóa các mục tiêu bằng mê hoặc và có thể kết liễu người bị mê; thắng bằng điều kiện quyến rũ/sống sót riêng.",
    "group": "killer"
  },
  "wizard": {
    "name": "Wizard",
    "officialName": "Wizard",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Evil Wizard (sự kiện Emerald Village): ép mọi người bỏ phiếu theo lựa chọn; ai chống lệnh có thể bị khóa vai hoặc bị xử lý theo luật đặc biệt.",
    "group": "killer"
  },
  "zombie": {
    "name": "Zombie",
    "officialName": "Zombie",
    "icon": "home",
    "team": "killer",
    "side": "Phe độc lập",
    "description": "Lây nhiễm và chuyển người chơi sang nhóm zombie nhằm đạt điều kiện thống trị trận.",
    "group": "killer"
  },
  "anarchist": {
    "name": "Anarchist",
    "officialName": "Anarchist",
    "icon": "home",
    "team": "solo",
    "side": "Phe độc lập",
    "description": "Đạt thắng lợi riêng nếu làng liên tục không treo ai trong 3 hôm liên tiếp. Có khả năng không cho biểu quyết treo cổ ai 1 ngày (chỉ 1 lần duy nhất)",
    "group": "solo"
  },
  "fool": {
    "name": "Kẻ ngốc",
    "officialName": "Fool",
    "icon": "home",
    "team": "solo",
    "side": "Phe độc lập",
    "description": "Tìm cách khiến chính mình bị làng bỏ phiếu treo cổ để giành chiến thắng.",
    "group": "solo"
  },
  "headhunter": {
    "name": "Headhunter",
    "officialName": "Headhunter",
    "icon": "home",
    "team": "solo",
    "side": "Phe độc lập",
    "description": "Có người chơi mục tiêu, phải khiến người đó bị treo cổ qua biểu quyết để thắng. Nếu mục tiêu chết bằng cách khác, điều kiện thắng là phe dân thua",
    "group": "solo"
  },
  "admirer": {
    "name": "Admirer",
    "officialName": "Admirer",
    "icon": "shield",
    "team": "teamless",
    "side": "Chưa cố định phe",
    "description": "Cần mục tiêu được chỉ định còn sống khi ván kết thúc; có khả năng bảo vệ mục tiêu một lần và cùng hưởng chiến thắng.",
    "group": "teamless"
  },
  "lurker": {
    "name": "Lurker",
    "officialName": "Lurker",
    "icon": "home",
    "team": "teamless",
    "side": "Chưa cố định phe",
    "description": "Bắt đầu chưa gia nhập phe thắng cố định; khi bị một tác nhân thích hợp tấn công có thể nhập vào phe đã tấn công, không cần xác định trước.",
    "group": "teamless"
  }
};

export const ROLE_IDS_BY_NAME = Object.fromEntries(
  Object.entries(EXPANDED_ROLES).map(([id, role]) => [role.officialName, id]),
);
