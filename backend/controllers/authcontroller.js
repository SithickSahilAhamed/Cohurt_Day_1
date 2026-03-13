const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const users = [];

// REGISTER USER
exports.register = async (req, res) => {

    const { username, email, password } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            username,
            email,
            password: hashedPassword
        };

        users.push(newUser);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "User registered successfully",
            token
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration failed"
        });

    }
};



// LOGIN USER
exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {

        res.status(500).json({
            message: "Login failed"
        });

    }
};



// USER PROFILE (Protected Route)
exports.profile = (req, res) => {

    res.json({
        message: "User profile",
        user: req.user
    });

};