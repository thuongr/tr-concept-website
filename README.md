# TR Concept website

Landing page and Netlify Function for the TR Concept course registration form.

## Deploy cơ bản lên Netlify

1. Đẩy thư mục này lên GitHub/GitLab, nhớ kiểm tra `.env` không được commit.
2. Trong Netlify, chọn **Add new site** rồi import repository.
3. Dùng các cài đặt:
   - **Build command:** để trống
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
4. Vào **Site configuration > Environment variables** và tạo:
   - `RESEND_API_KEY`: API key thật của Resend
   - `WEBSITE_API_URL`: `https://api.trconcept.co`
5. Deploy site, sau đó gửi thử form và kiểm tra cả email khách hàng lẫn email thông báo quản trị.

## Chạy local

```bash
npm install
npx netlify dev
```

Netlify Dev sẽ chạy website và function cùng lúc. Không mở `.env` trong trình duyệt và không đưa file này lên repository.

## Lưu ý bảo mật

- Chỉ dùng `RESEND_API_KEY` ở server/Netlify Function, không đặt API key trong HTML.
- API key đã từng xuất hiện trong source nên cần revoke và tạo key mới trên Resend trước khi deploy thật; cập nhật key mới vào `.env` local và Netlify.
- Sao lưu `brain.db` định kỳ và lưu bản sao ở nơi có quyền truy cập hạn chế.