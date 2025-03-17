let jwt = require('jsonwebtoken');
let constants = require('../Utils/constants');
let userController = require('../controllers/users');

module.exports = {
    check_authentication: async function(req, res, next) {
        try {
            let token_authorization = req.headers.authorization;
            if (!token_authorization || !token_authorization.startsWith("Bearer ")) {
                return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập hoặc token không hợp lệ" });
            }

            let token = token_authorization.split(" ")[1];
            let verifiedToken = jwt.verify(token, constants.SECRET_KEY);
            if (!verifiedToken) {
                return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
            }

            let user = await userController.getUserById(verifiedToken.id);
            if (!user) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Xác thực thất bại", error: error.message });
        }
    },

    check_admin: function(req, res, next) {
        if (req.user.role.roleName !== 'admin') {
            return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập" });
        }
        next();
    }
};