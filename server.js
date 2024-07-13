const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailerDkim = require('nodemailer-dkim');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } 
});


// Configure the transporter
const transporter = nodemailer.createTransport({
    host: 'server35.hostingraja.org', 
    port: 587,
    secure: false, 
    auth: {
        user: 'azmal.s@b2yinfy.com', 
        pass: 'Welcome@2024'
    }
});


transporter.use('stream', nodemailerDkim.signer({
    domainName: 'b2yinfy.com',
    keySelector: 'default',
    privateKey: fs.readFileSync(path.join(__dirname, 'dkim-private.pem'), 'utf-8')
}));

// Endpoint to handle file upload and send email
app.post('/send-email', upload.single('image'), async (req, res) => {
    const { mails, cc, subject } = req.body;
    const file = req.file;

    if ( !subject || !file) {
        return res.status(400).json({ message: 'Invalid input: mails, subject, and content are required.' });
    }

    // Create email options
    const mailOptions = {
        from: 'azmal.s@b2yinfy.com', 
        to: Array.isArray(mails) ? mails.join(',') : mails, 
        cc: cc, 
        subject: subject,
        html: `<p>Get Connected with B2Y INFY SOLUTIONS</p><a href="https://b2yinfy.com">
        <img src="https://nodemailer-idp9.onrender.com/uploads/${req.file.filename}"/></a><p>https://nodemailer-idp9.onrender.com/uploads/${req.file.filename}</p>`,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);

        // Send response
        res.json({ status:"S", message: 'Email sent successfully', info: info.response });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error occurred while sending email', error: error.message });
    }
});

// Endpoint to test the server
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hi Azmal" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
