import nodemailer from 'nodemailer';

interface MailPayload {
    message: string;
    to: string;
    from: string | 'neumusic@fastmail.com';
    subject: string;
}

const transporter = nodemailer.createTransport({
    service: 'FastMail',
    auth: {
        user: 'neumusic@fastmail.com',
        pass: process.env.MAIL_PASS,
    },
});

const sendMail = async ({
    message,
    to,
    subject,
    from,
}: MailPayload): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
        try {
            console.log('SENDING MAIL');
            transporter.sendMail(
                {
                    from,
                    to,
                    subject,
                    text: message,
                },
                (err, info) => {
                    console.log(err);
                    if (err) reject(err);
                    console.log(info);
                    resolve();
                }
            );
            console.log('MAIL SENT');
            resolve();
        } catch (ex) {
            console.log(ex);
            reject(new Error('Mail Failed to Send'));
        }
    });
};

export { sendMail };
