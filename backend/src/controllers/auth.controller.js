const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const users = [];

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const exists = users.find(u => u.email === email.toLowerCase());
    if (exists) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashed,
      role: role || "user"
    };

    users.push(newUser);

    const { password: _, ...safe } = newUser;
    res.status(201).json({ message: "User created", user: safe });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.me = (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user });
};

exports.adminDashboard = (req, res) => {
  res.json({ message: "Welcome, admin", user: req.user });
};
