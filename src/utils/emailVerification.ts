import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export const generateVerificationToken = () => {
    return randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email: string, token: string, role: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Biashara Hub Email Verification',
        text: `Please verify your email by clicking on the following link: ${process.env.CLIENT_URL}/${role}/verify-email?token=${token}`,
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
