const User = require("../models/UserModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const newUser = new User({ firstname, lastname, email, password: hashPass, balance: 0 });
    await newUser.save();

    return res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (!exist) {
      return res.json({ message: "User not found" });
    }

    const validPass = await bcrypt.compare(password, exist.password);
    if (!validPass) {
      return res.json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: exist._id }, "dhairya", { expiresIn: "1h" });

    return res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.json({ message: "Server error", error: err.message });
  }
};

module.exports = { signup, login };
