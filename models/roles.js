const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            required: [true, "Role name is required"],
            unique: true,
            index: true,  // Tạo index giúp tăng tốc truy vấn
            trim: true,
            minlength: [3, "Role name must be at least 3 characters"],
            maxlength: [50, "Role name must be at most 50 characters"]
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: [255, "Description must be at most 255 characters"]
        }
    },
    {
        timestamps: true
    }
);

// Đăng ký model
const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;
