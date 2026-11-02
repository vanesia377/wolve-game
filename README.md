# Làng Sương Mù · Ma Sói
https://vanesia377.github.io/wolve-game/
Game Ma Sói bằng tiếng Việt: chọn **8–30 người trong làng**, gồm bạn và **7–29 người chơi máy**, với giao diện hỗ trợ điện thoại và máy tính. Không cần đăng nhập, API key, dịch vụ bên ngoài hay cài thư viện.

## Chơi

- Chọn tên, số người từ **8 đến 30**, rồi chọn vai trò trong bộ vai của ván (hoặc để ngẫu nhiên). Bộ vai và kỹ năng được hiển thị ngay trên màn hình bắt đầu.
- Ván 8 người giữ bộ vai gốc: **2 Ma Sói, 1 Tiên tri, 1 Bảo vệ, 4 Dân làng**. Các ván lớn hơn có thêm vai theo bảng bên dưới.
- Ban đêm: Sói chọn người tấn công, Tiên tri soi vai, Bảo vệ và Bác sĩ cứu người. Bảo vệ có thể tự cứu nhưng không được lặp mục tiêu hai đêm liên tiếp.
- Ban ngày: đọc hội thoại, chọn người để nêu nghi vấn rồi bỏ phiếu. Nếu Tiên tri nêu nghi vấn một người đã soi ra Sói, kết quả sẽ được công bố. Các phiếu được công khai sau khi chốt; hòa phiếu thì không ai bị loại.
- Dân thắng khi hết Sói. Sói thắng khi số Sói ít nhất bằng tất cả người không phải Sói còn sống (kể cả Kẻ ngốc). **Kẻ ngốc thắng riêng ngay khi bị bỏ phiếu loại**, ưu tiên trước hai điều kiện thắng trên; bị Sói giết không tính.
- Khi bị loại, bạn có thể theo dõi đến hết ván. Ván 8 người đã lưu ở phiên bản cũ vẫn có thể tiếp tục. Ván được tự lưu bằng `localStorage` trên trình duyệt hiện tại.

Đây là **bản chơi đơn**. Người chơi máy dùng thuật toán suy luận và thông tin công khai, không dùng AI trực tuyến. Không có phòng multiplayer. Dữ liệu ván lưu cục bộ, không gửi lên máy chủ; nếu trình duyệt chặn lưu trữ, trò chơi vẫn hoạt động nhưng không thể tiếp tục sau khi tải lại.

## Bộ vai và quy mô ván

Số Sói khởi đầu bằng `floor(số người / 4)` (2–7 Sói). Mỗi ván có 1 Tiên tri, 1 Bảo vệ; các chỗ còn lại là Dân làng sau khi thêm các vai sau:

| Từ số người | Vai bổ sung | Kỹ năng trong bản này |
|---|---|---|
| 10 | Bác sĩ (Doctor) | Mỗi đêm cứu 1 người khác; không tự cứu, được chọn lại cùng người. |
| 12 | Người bị nguyền (Cursed) | Bị Sói cắn mà không được bảo vệ sẽ sống sót và thành Ma Sói, đổi phe thắng. Kết quả soi cũ về người này được xóa vì không còn phản ánh phe hiện tại. |
| 14 | Học việc Tiên tri (Seer Apprentice) | Khi Tiên tri chết (đêm hoặc bỏ phiếu), trở thành Tiên tri và soi từ đêm sau; không nhận kết quả soi của người cũ. |
| 16 | Thị trưởng (Mayor) | Tự công khai vào ban ngày để phiếu có trọng số 2 đến hết ván; máy công khai vào sáng đầu tiên còn sống. |
| 18 | Kẻ ngốc (Fool) | Phe độc lập, thắng riêng nếu bị làng bỏ phiếu loại. |
| 20 | Sói lì đòn (Stubborn Werewolf) | Thay 1 Sói thường, không tăng tổng số Sói; sống sót ở lần đầu bị bỏ phiếu loại và lộ vai, lần sau mới chết. |

Ví dụ ván **30 người**: 6 Ma Sói + 1 Sói lì đòn, 1 Tiên tri, 1 Bảo vệ, 1 Bác sĩ, 1 Người bị nguyền, 1 Học việc Tiên tri, 1 Thị trưởng, 1 Kẻ ngốc và 16 Dân làng. Cả đàn chỉ có **một đòn tấn công mỗi đêm**; Bảo vệ và Bác sĩ hành động trước khi xử lý đòn cắn. Người bị nguyền được bảo vệ sẽ không biến đổi. Tiên tri chết trong đêm vẫn thực hiện lượt soi đêm đó, nhưng không thể công khai kết quả vào sáng hôm sau.

Các vai bổ sung tham khảo [wolvesville_roles_official_2026.md](wolvesville_roles_official_2026.md), điều chỉnh cho bản chơi đơn với 10 vai hoạt động. Đây không phải bản sao đầy đủ luật Wolvesville hoặc toàn bộ 130 vai trong dữ liệu. Vai được công khai khi chết, khi Thị trưởng tự công khai, hoặc khi Sói lì đòn sống sót sau bỏ phiếu. Thành viên phe Sói biết nhau, kể cả Sói mới biến đổi.

## Chạy trên máy

Cần Python 3 để phục vụ trang web. Node.js 20+ chỉ dùng cho kiểm thử. Không cần `npm install`.

```sh
cd /workspace/wolve-game
npm start
```

Mở `http://localhost:4173` trong trình duyệt. Hoặc chỉ cần chạy `python3 -m http.server 4173 --directory public` từ thư mục repository.

```sh
npm run check
npm test
```

Kiểm thử bao gồm hành động theo vai, bảo vệ, kết quả soi, phiếu hòa, điều kiện thắng, dữ liệu lưu và 400 ván gốc với seed cố định, cộng mô phỏng ván hoàn chỉnh ở mọi quy mô 8–30 và mọi vai có thể chọn. Mỗi bước mô phỏng kiểm tra khôi phục dữ liệu; kiểm thử riêng xác minh kỹ năng mới, trọng số phiếu, điều kiện thắng độc lập và chuyển đổi dữ liệu cũ.

## Đưa lên GitHub Pages

Repository chứa website tĩnh trong **`docs/`**, được tạo từ `public/` bằng `npm run build`. Kiểm tra và tạo lại thư mục này trước khi cập nhật:

```sh
npm run check
npm test
npm run build
```

Trong **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh **main**, thư mục **/docs**, rồi **Save**. Sau khi GitHub triển khai thành công, địa chỉ dự kiến là `https://vanesia377.github.io/wolve-game/`.

Không cần khóa bí mật hoặc backend. Các đường dẫn tài nguyên là tương đối để hoạt động dưới đường dẫn repository của Pages. `public/` là mã nguồn, không chỉnh trực tiếp bản tạo ra trong `docs/`.

## Cấu trúc

- `public/engine.js`: trạng thái, vai trò, lượt đêm/ngày và thuật toán máy.
- `public/app.js`: giao diện, điều khiển và lưu ván.
- `public/style.css`: giao diện responsive, không dùng CDN hoặc font bên ngoài.
- `test/engine.test.js`: kiểm thử bằng test runner tích hợp của Node.js.

Khi làm việc trong môi trường cloud đã có checkout, sử dụng checkout hiện tại; không cần tạo Git worktree mới.
