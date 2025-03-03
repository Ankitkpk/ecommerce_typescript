import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';

type MailOptions={
    to:string,
    subject:string,
    text:string
}

export const sendMail = async ({ to, subject, text }: MailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL as string,
                clientId: process.env.CLIENT_ID as string,
                clientSecret: process.env.CLIENT_SECRET as string,
                refreshToken: process.env.REFRESH_TOKEN as string,
                accessToken: process.env.ACCESS_TOKEN as string,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL as string,
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
