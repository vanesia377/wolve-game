# Làng Sương Mù · Ma Sói

Game Ma Sói bằng tiếng Việt: bạn và **7 người chơi máy**, với giao diện hỗ trợ điện thoại và máy tính. Không cần đăng nhập, API key, dịch vụ bên ngoài hay cài thư viện.

## Chơi

- Chọn tên và vai trò (hoặc để ngẫu nhiên).
- Mỗi ván có **2 Ma Sói, 1 Tiên tri, 1 Bảo vệ, 4 Dân làng**.
- Ban đêm: Sói chọn người tấn công, Tiên tri soi vai, Bảo vệ cứu người. Bảo vệ có thể tự cứu nhưng không được lặp mục tiêu hai đêm liên tiếp.
- Ban ngày: đọc hội thoại, chọn người để nêu nghi vấn rồi bỏ phiếu. Nếu Tiên tri nêu nghi vấn một người đã soi ra Sói, kết quả sẽ được công bố. Các phiếu được công khai sau khi chốt; hòa phiếu thì không ai bị loại.
- Dân thắng khi hết Sói. Sói thắng khi số Sói ít nhất bằng số Dân còn sống.
- Khi bị loại, bạn có thể theo dõi đến hết ván. Ván được tự lưu bằng `localStorage` trên trình duyệt hiện tại.

Đây là **bản chơi đơn**. Người chơi máy dùng thuật toán suy luận và thông tin công khai, không dùng AI trực tuyến. Không có phòng multiplayer. Dữ liệu ván lưu cục bộ, không gửi lên máy chủ; nếu trình duyệt chặn lưu trữ, trò chơi vẫn hoạt động nhưng không thể tiếp tục sau khi tải lại.

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

Kiểm thử bao gồm hành động theo vai, bảo vệ, kết quả soi, phiếu hòa, điều kiện thắng, dữ liệu lưu và 400 ván hoàn chỉnh với seed cố định.

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
