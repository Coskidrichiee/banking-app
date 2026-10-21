const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail,
    findUserById
} = require("../models/userModel");

const generateAccountNumber = require(
    "../utils/generateAccountNumber"
);


const createToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            accountNumber: user.account_number
        },
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || "7d"
        }
    );
};


const register = async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            phone,
            password
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, email, phone and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingEmail =
            await findUserByEmail(normalizedEmail);

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this email"
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 12);

        let accountNumber =
            generateAccountNumber();

        const userId = await createUser({
            fullName: fullName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            accountNumber,
            passwordHash
        });

        const user =
            await findUserById(userId);

        const token = createToken(user);

        return res.status(201).json({
            success: true,
            message:
                "Account created successfully",
            token,
            user
        });
    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const user =
            await findUserByEmail(
                email.trim().toLowerCase()
            );

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const token = createToken(user);

        const safeUser =
            await findUserById(user.id);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: safeUser
        });
    } catch (error) {
        next(error);
    }
};


const getMe = async (req, res, next) => {
    try {
        const user =
            await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    getMe
};