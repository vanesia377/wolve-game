# Làng Sương Mù · Ma Sói
https://vanesia377.github.io/wolve-game/
Game Ma Sói bằng tiếng Việt: chọn **8–30 người trong làng**, gồm bạn và **7–29 người chơi máy**, với giao diện hỗ trợ điện thoại và máy tính. Không cần đăng nhập, API key, dịch vụ bên ngoài hay cài thư viện.

## Chơi

- Nhập **số nguyên từ 8 đến 30** vào ô quy mô. Ô trống, số ngoài khoảng, số thập phân, ký hiệu số mũ, dấu và chữ đều không thể bắt đầu ván. Cảnh báo hiển thị ngay dưới ô nhập.
- Chọn một trong **126 vai** ở năm nhóm, hoặc để chọn ngẫu nhiên. Bộ vai dự kiến tự điều chỉnh để chứa vai đã chọn; số người luôn giữ nguyên. Mục **Luật áp dụng trong bản chơi đơn** giải thích kỹ năng cụ thể, số mục tiêu và giới hạn lượt trước khi bắt đầu.
- Ban đêm: chọn kỹ năng, chọn đủ mục tiêu rồi xác nhận để sang bình minh. Mỗi người dùng tối đa một kỹ năng đêm; có thể bỏ qua. Sói có thể chọn đòn cắn hoặc dùng kỹ năng riêng và để đàn tự chọn nạn nhân.
- Ban ngày: có thể dùng kỹ năng riêng trong danh sách hành động rồi trở về nêu nghi vấn/bỏ phiếu. Kỹ năng có giới hạn lượt cả ván và tối đa một lần mỗi loại trong ngày. Một số vai tiếp tục có kỹ năng sau khi chết.
- Dân thắng khi loại hết phe thù địch. Sói thắng khi đạt ít nhất số người còn lại và không còn sát nhân/nhóm chuyển hóa đối địch. Phe độc lập có điều kiện riêng: treo Kẻ ngốc, săn mục tiêu, ba ngày không treo ai, mê hoặc, giáo phái/Zombie chiếm toàn bộ người sống hoặc trở thành phe cuối cùng. Admirer cùng thắng khi mục tiêu còn sống; cặp Cupid khác phe thắng nếu là hai người cuối cùng.
- Ván được tự lưu trong trình duyệt. Ván cũ phiên bản 1 và 2 vẫn tiếp tục bằng luật cũ; ván mới dùng dữ liệu phiên bản 3 với tài nguyên, liên kết, hiệu ứng và phe hiện tại.

Đây là **bản chơi đơn** cùng người chơi máy, không có phòng multiplayer. Máy dùng luật và thông tin trong ván, không dùng AI trực tuyến. Không cần đăng nhập, API key hay backend; không gửi dữ liệu ván lên máy chủ. Nếu trình duyệt chặn lưu trữ, vẫn chơi được nhưng không thể tiếp tục sau khi tải lại.

## Danh sách và luật vai trò

Danh sách triển khai đúng **126 dòng vai thực sự có trong tệp được cung cấp**:

| Nhóm | Số vai |
|---|---:|
| Làng | 64 |
| Sói | 35 |
| Sát nhân / chuyển hóa độc lập | 22 |
| Thắng riêng qua biểu quyết | 3 |
| Chưa cố định phe | 2 |

Tiêu đề tệp ghi 66 vai Làng nhưng chỉ có 64 dòng mô tả; không tự thêm hai vai còn thiếu. Các vai sự kiện chưa có kỹ năng xác minh như Dracula/Exorcist không nằm trong danh sách người dùng cung cấp cho bản này.

Mỗi vai có kỹ năng chủ động, nội tại hoặc điều kiện thắng tương ứng; không chỉ thêm tên vào danh sách. Bảng hành động là luật thực thi của bản chơi đơn. Mô tả nguồn vẫn được giữ trong danh mục tra cứu; một số cơ chế được chuyển thể rõ ràng:

- Trò chuyện với người chết, phòng giam và liên kết linh hồn dùng lời nhắn từ thông tin điều tra/nghi vấn mà người chơi máy thực sự đang giữ. Nhật ký riêng chỉ hiện cho đúng người nhận.
- Kỹ năng hai/ba mục tiêu yêu cầu các mục tiêu khác nhau. Thứ tự mục tiêu có ý nghĩa cho Flagger và Wolffluencer. Bàn điều tra hiện trường có năm cột, vị trí theo thứ tự thẻ.
- Ưu tiên đêm: khóa kỹ năng, bảo vệ, điều tra, tấn công, hiệu ứng khác, đòn cắn đàn Sói và hiệu ứng cuối đêm. Chuyển hóa bị chặn khi mục tiêu đang được bảo vệ. Số Sói khởi đầu bằng `floor(số người / 4)`; Alpha Werewolf có thêm đòn vào ghế liền sau mục tiêu.
- Time Traveler/Wolf Time Traveler quay lại đầu vòng trước một lần cả ván. Dữ liệu sống/chết, vai, phe và liên kết được khôi phục; các lượt kỹ năng đã tiêu hao vẫn được giữ để tránh dùng vô hạn.
- Evil Santa/Evil Detective được tấn công một mục tiêu khi chỉ còn một đối thủ, tránh bế tắc vì kỹ năng vốn cần hai mục tiêu.
- Pumpkin King/Santa Claus tặng quà và nhận hồi đáp từ người chết; đây là tương tác giao tiếp, không tạo sát thương. Những cơ chế sự kiện có lựa chọn trực tuyến được thay bằng kết quả máy và mô tả ngay trong kỹ năng.

Bộ vai tiêu chuẩn bổ sung Bác sĩ từ 10 người, Người bị nguyền từ 12, Witch từ 14, Thị trưởng từ 16, Kẻ ngốc từ 18, Medium/Sói lì đòn từ 20, Detective từ 24 và Cupid từ 28. Vai được chọn sẽ thay một vị trí phù hợp; chọn Accomplice luôn kèm Bandit. Danh sách vai ban đầu thực tế hiển thị trong ván. Vai mới được đưa vào trò chơi bằng lựa chọn vai hoặc chọn ngẫu nhiên; không cần đủ 30 người để dùng vai đặc biệt.

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

Kiểm thử giữ bộ hồi quy luật cũ (964 ván), bổ sung 378 ván hoàn chỉnh cho từng vai trong 126 vai ở quy mô 8/16/30. Mỗi bước mô phỏng kiểm tra khôi phục dữ liệu. Các ca riêng xác minh bảo vệ, giới hạn lượt, nhiều mục tiêu, chuyển phe, hồi sinh, liên kết sinh tử, phiếu đôi/phiếu kép, quay thời gian, điều kiện thắng riêng và quà sự kiện.

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

- `public/engine.js`: API chung, định tuyến ván cũ/mới.
- `public/classic-engine.js`: luật tương thích ván cũ.
- `public/expanded-engine.js`: ván mở rộng, phe, hiệu ứng, biểu quyết và lưu/khôi phục.
- `public/role-catalog.js`: đúng 126 vai và mô tả từ danh sách đã cung cấp.
- `public/night-abilities.js`, `public/day-abilities.js`: kỹ năng, nội tại và các luật chuyển thể.
- `public/app.js`: giao diện, điều khiển và lưu ván.
- `public/style.css`: giao diện responsive, không dùng CDN hoặc font bên ngoài.
- `test/engine.test.js`, `test/expanded.test.js`: kiểm thử bằng test runner tích hợp của Node.js.

Khi làm việc trong môi trường cloud đã có checkout, sử dụng checkout hiện tại; không cần tạo Git worktree mới.
