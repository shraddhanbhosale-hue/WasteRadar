const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// CREATE JWT TOKEN
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      villageId: user.villageId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// REGISTER
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      villageId,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || "CITIZEN",
      villageId: villageId || null,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        villageId: user.villageId,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// EMAIL + PASSWORD LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        villageId: user.villageId,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GOOGLE LOGIN (FIXED: Dynamic OAuth Client & Safe Execution)
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("GOOGLE_CLIENT_ID missing in process.env");
      return res.status(500).json({
        message: "Server configuration error: GOOGLE_CLIENT_ID missing",
      });
    }

    // Dynamic instantiation to prevent cold-start process.env undefined issues
    const googleClient = new OAuth2Client(clientId);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google credential",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: "Google email could not be verified",
      });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({
        email: email.toLowerCase(),
      });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }

      await user.save();
    } else {
      user = await User.create({
        name: name || "WasteRadar User",
        email: email.toLowerCase(),
        password: null,
        role: "CITIZEN",
        villageId: null,
        googleId,
        profilePicture: picture || null,
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        villageId: user.villageId,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      message: error.message || "Google authentication failed",
    });
  }
};

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate(
        "villageId",
        "name district state"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error(
      "Get me error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET USERS FOR ADMIN
const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "CITIZEN",
    })
      .select("_id name email phone villageId role")
      .populate(
        "villageId",
        "name district state"
      )
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get users error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to load users",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  getUsers,
};