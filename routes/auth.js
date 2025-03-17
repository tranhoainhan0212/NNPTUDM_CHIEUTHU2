var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication, check_admin } = require('../Utils/check_auth');

// Đăng ký tài khoản
router.post('/signup', async function(req, res) {
    try {
        let { username, password, email } = req.body;
        let result = await userController.createUser(username, password, email, 'user');
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi đăng ký', error: error.message });
    }
});

// Đăng nhập
router.post('/login', async function(req, res) {
    try {
        let { username, password } = req.body;
        let result = await userController.checkLogin(username, password);
        res.status(200).json({ success: true, token: result.token, user: result.user });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Đăng nhập thất bại', error: error.message });
    }
});

// Lấy thông tin user đăng nhập
router.get('/me', check_authentication, async function(req, res) {
    try {
        res.status(200).json({ success: true, data: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy thông tin', error: error.message });
    }
});

// Reset password (chỉ admin mới có thể thực hiện)
router.post('/resetPassword/:id', check_authentication, check_admin, async function(req, res) {
    try {
        let userId = req.params.id;
        let updatedUser = await userController.updatePassword(userId, '123456');
        res.status(200).json({ success: true, message: 'Mật khẩu đã được reset về 123456', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi reset mật khẩu', error: error.message });
    }
});

// Đổi mật khẩu (user đã đăng nhập mới có thể đổi mật khẩu)
router.post('/changePassword', check_authentication, async function(req, res) {
    try {
        let { currentPassword, newPassword } = req.body;
        let userId = req.user._id;
        
        let isMatch = await userController.verifyPassword(userId, currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
        }
        
        let updatedUser = await userController.updatePassword(userId, newPassword);
        res.status(200).json({ success: true, message: 'Mật khẩu đã được thay đổi thành công', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi đổi mật khẩu', error: error.message });
    }
});

module.exports = router;