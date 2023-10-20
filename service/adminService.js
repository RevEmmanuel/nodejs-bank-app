const { findUserByEmail } = require("../repositories/userRepository");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const transporter = require('../utils/emailConfig');

dotenv.config();
const hostUrl = process.env.EXTERNAL_URL;

async function inviteAdmin(email) {
    if (!email) {
        throw new Error('Missing email field');
    }

    const user = await findUserByEmail(email);
    console.log(user);
    if (!user) {
        throw new Error('Account does not exist');
    }
    if (user.is_admin) {
        throw new Error('User is already an admin');
    }

    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ email }, secretKey, { expiresIn: '24h' });
    const invitationLink = `${hostUrl}/admin/register?token=${token}`;

    const mailOptions = {
        from: '"Bank app Admin" <bank-app@gmail.com>',
        to: `${email}`,
        subject: 'You have been invited to become an Admin',
        html: `
        <h1>Hi!</h1>
        <h1>Welcome to Bank app Admin Block.</h1>
        <p>We're glad to have you on the team!</p>
        <p>Please click the link below to accept invitation!</p>
        
        <a href=${invitationLink} target="_blank">Accept invitation</a>
        <br />
        <p>If that doesn't work, copy and paste the link below in your browser.</p>
        <p>${invitationLink}</p>
        <p>Link is only valid for 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new Error(error.message);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = {
    inviteAdmin
}