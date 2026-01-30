const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/jwt");

async function registerUser(data) {
  const {
    username,
    password,
    email,
    role,
    fullname,
    birth_date,
    gender,
    address,
    avatar,
    phone_number,
  } = data;

  // 1. Check trùng cả Username và Email
  // Dùng $or để tìm xem có user nào trùng username HOẶC email không
  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    if (existingUser.username === username)
      throw new Error("Tên đăng nhập đã tồn tại!");
    if (existingUser.email === email)
      throw new Error("Email này đã được sử dụng!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password: hashedPassword,
    email,
    role: role || "user", // Mặc định là user nếu không truyền
    fullname,
    birth_date,
    gender,
    address,
    avatar,
    phone_number,
    created_at: new Date(),
  });

  // 2. Chuyển sang Object thường và XÓA password trước khi trả về
  const userResponse = newUser.toObject();
  delete userResponse.password;

  return userResponse;
}

async function loginUser(username, password) {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác!");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác!");

  // 3. Tạo token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.SECRET_KEY,
    { expiresIn: "1h" }, // Nên cân nhắc đưa '1h' vào config luôn
  );

  // 4. Dùng toObject() thay vì _doc để an toàn hơn
  const userInfo = user.toObject();
  delete userInfo.password;

  return { user: userInfo, token };
}

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("PASSWORD_MISMATCH");
  }

  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return true;
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};
