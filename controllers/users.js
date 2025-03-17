let userSchema = require('../models/users');
let roleSchema = require('../models/roles');
let Role = require('../models/roles'); // Sửa lại đúng file model role
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let constants = require('../Utils/constants');

module.exports = {
    getUserById: async function(id) {
        return await userSchema.findById(id).populate('role');
    },
    
    createUser: async function(username, password, email, role) {
        let roleCheck = await roleSchema.findOne({ roleName: role });
        if (!roleCheck) {
            throw new Error("Role không tồn tại");
        }
        
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = new userSchema({
            username: username,
            password: hashedPassword,
            email: email,
            role: roleCheck._id,
        });
        
        await newUser.save();    
        return newUser;  
    },
    
    checkLogin: async function(username, password) {
        if (!username || !password) {
            throw new Error("Username và password không được để trống");
        }
        
        let user = await userSchema.findOne({ username: username }).populate('role');
        if (!user) {
            throw new Error("Username hoặc password không chính xác");
        }
        
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Username hoặc password không chính xác");
        }
        
        let token = jwt.sign(
            { id: user._id, role: user.role.roleName },
            constants.SECRET_KEY,
            { expiresIn: '30m' }
        );
        
        return { token, user };
    },

    updatePassword: async function(id, newPassword) {
        let user = await userSchema.findById(id);
        if (!user) throw new Error("User không tồn tại");
        
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return user;
    },

    verifyPassword: async function(id, currentPassword) {
        let user = await userSchema.findById(id);
        if (!user) throw new Error("User không tồn tại");
        
        return await bcrypt.compare(currentPassword, user.password);
    }
};