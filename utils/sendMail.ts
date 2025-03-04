import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';

type MailOptions={
    from:string,
    to:string,
    subject:string,
    text:string
}

export const sendMail = async ({ from, to, subject, text }: MailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL!,  // Using '!'
                clientId: process.env.CLIENT_ID!,
                clientSecret: process.env.CLIENT_SECRET!,
                refreshToken: process.env.REFRESH_TOKEN!,
                accessToken: process.env.ACCESS_TOKEN!,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL!,
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, message: 'Email sent: ' + info.response };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error sending email' };
    }
};
