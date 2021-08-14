import nodemailer from 'nodemailer';

interface MailPayload {
    message: string;
    to: string;
    from: string | 'Slapjunky';
    subject: string;
}

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_NAME,
        pass: process.env.MAIL_PASS,
    },
});

const sendMail = async ({
    message,
    to,
    subject,
    from,
}: MailPayload): Promise<void> => {
    transporter.sendMail({
        from,
        to,
        subject,
        text: message,
    });
};

export { sendMail };
