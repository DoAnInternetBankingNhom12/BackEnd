# Nhóm chức năng API user
## Lấy danh sách thông tin tất cả User:
  - URL: **https://api.rokia.top/api/users**.
  - METHOR: **GET**
  - BODY: 
    - **inActive**: boolean. Nếu **true** lấy về danh sách các tài khoản đã bị xóa không còn hoạt động **(Có thể bỏ trống)**.
    - **isAll**: boolean. Nếu **true** lấy về danh sách các tài khoản cả đang hoạt đọng hay bị xóa không còn hoạt động **(Có thể bỏ trống)**.
  - HEADER: 
    - **Authorization**: string. Điền accesstoken user có quyền employee trở lên để dùng chức năng này.
  - RES:
  ````
    {
        "data": [
          {
            "id": "user0",
            "userName": "rokiaAdmin",
            "email": "hahoanglong7@gmail.com",
            "refreshToken": "$2a$04$i/Hivl0RIJU6htrrKUUmP.w51RuAdNXGU/Uju78mGZK6GqLqfcseW",
            "createTime": 1670045306,
            "updateTime": 1670994884,
            "employee": {
                "id": "employee0",
                "userId": "user0",
                "name": "Hà Hoàng Long 100",
                "phoneNumbers": [
                    "0354845588"
                ],
                "accountType": "employee",
                "createTime": 1670045306,
                "updateTime": 1670045306
            },
            "role": "employee"
          }
        ],
      "success": true
    }
  ````