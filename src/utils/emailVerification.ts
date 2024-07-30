import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export const generateVerificationToken = () => {
    return randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email: string, token: string, role: string) => {
    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        host: 'live.smtp.mailtrap.io',
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Biashara Hub Email Verification',
        text: `Please verify your email by clicking on the following link: ${process.env.CLIENT_URL}/api/auth/provider/${role}/verify-email?token=${token}`,
    };

    await transporter
        .sendMail(mailOptions,
            function (err, data) {
                if (err) {
                    console.log('Error Occurs: ', err);
                } else {
                    console.log('Email sent successfully');
                }
            });;
};


const { MailtrapClient } = require("mailtrap");

export const sendEmail = async (email: string, token: string, role: string) => {
    const TOKEN = "98fe099c6d1048d8da718cb9c62db6f7";
    const ENDPOINT = "https://send.api.mailtrap.io/";

    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

    const sender = {
    email: "mailtrap@demomailtrap.com",
    name: "Mailtrap Test",
    };
    const recipients = [
    {
        email: email,
    }
    ];

    client
    .send({
        from: sender,
        to: recipients,
        subject: "Biashara Hub Account Verification",
        text: `Please verify your email by clicking on the following link: ${process.env.CLIENT_URL}/api/auth/provider/${role}/verify-email?token=${token}`,
        category: "Integration Test",
    })
    .then(console.log, console.error);

}