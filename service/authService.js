const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const transporter = require('../utils/emailConfig');
const { existsByEmail, saveUser, findUserByEmail, existsByUsername, updateUserPassword, makeUserAnAdmin, findUserById, disableUserById } = require("../repositories/userRepository");
const { createNewVerificationOtp, findByVerificationOtp, deleteUsedOtp } = require("../repositories/otpRepository");

dotenv.config();
const hostUrl = process.env.EXTERNAL_URL;

async function createNewUser(signupRequest) {
    const email = signupRequest.email;
    const username = signupRequest.username;
    const password = signupRequest.password;

    const user = await existsByEmail(email);
    if (user) {
        throw new Error('This email is already registered!');
    }
    const usernameFound = await existsByUsername(username);
    if (usernameFound) {
        throw new Error('This username is already taken!');
    }

    const newUser = await saveUser({
        email: email,
        username: username,
        password: await bcrypt.hash(password, 10)
    });

    const mailOptions = {
        from: '"Bank App" <bank-app@gmail.com>',
        to: `${email}`,
        subject: 'Welcome to Bank App',
        html: `
        <h1>Hi, ${username}!</h1>
        <h1>Welcome to Bank App</h1>
        <p>Your one-stop solution to your banking needs</p>
        <p>We're glad to have you!</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

    const userToReturn = convertUserToDto(newUser);
    const secretKey = process.env.JWT_SECRET;
    userToReturn['token'] = jwt.sign({ user: newUser }, secretKey, {expiresIn: '24h'});
    return userToReturn;
}

async function loginUser(loginRequest) {
    const email = loginRequest.email;
    const password = loginRequest.password;

    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error('User not found!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Incorrect Password!');
    }

    if (user.is_disabled) {
        throw new Error('Account has been deleted by admin!');
    }

    const secretKey = process.env.JWT_SECRET;
    return jwt.sign(user, secretKey, { expiresIn: '24h' });
}

async function sendResetPasswordEmail(emailAddress) {
    const user = await existsByEmail(emailAddress);

    if (!user) {
        throw new Error('User not found!');
    }
    if (user.is_disabled) {
        throw new Error('Account has been deleted by admin!');
    }
    const token = otpGenerator.generate(6, { lowerCaseAlphabets: true, upperCaseAlphabets: true, specialChars: false, digits: false });

    await storeOTPInDatabase(emailAddress, token);

    const mailOptions = {
        from: '"Bank App" <bank-app@gmail.com>',
        to: `${emailAddress}`,
        subject: 'Forgot Password',
        html: `
        <h1>Hi, ${emailAddress}!</h1>
        <h1>It seems you forgotten your password. Nevermind, we got you covered!</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${hostUrl}/auth/users/reset-password/${token}" target="_blank">Reset Password</a>
        <br />
        <br />
        <p>If that doesn't work, copy the link below and paste in your browser:</p>
        <p>${hostUrl}/auth/users/reset-password/${token}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

async function saveNewPassword(newPasswordRequest) {
    const { token, password } = newPasswordRequest;
    const foundOtp = await findByVerificationOtp(token);
    const user = await findUserByEmail(foundOtp.ownerEmail);
    const newPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, newPassword);
    await deleteUsedOtp(foundOtp.id);
}

async function findAUserById(userId) {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
        throw new Error('User not found!');
    }
    return convertUserToDto(foundUser);
}

async function storeOTPInDatabase(ownerEmail, otp) {
    await createNewVerificationOtp({
        ownerEmail: ownerEmail,
        otp: otp,
    });
}

async function registerAdmin(email) {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not registered!');
    }
    if (user.is_disabled) {
        throw new Error('Account disabled!')
    }
    if (user.is_admin) {
        throw new Error('User is already an admin');
    }
    await makeUserAnAdmin(user.id);
}

async function checkIfUserExistsByEmail(email) {
    await existsByEmail(email)
        .then((userExists) => {
            return !!userExists;
        });
}


async function disableUserAccount(userId) {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
        throw new Error('User not found!');
    }
    await disableUserById(foundUser.id);
}


function convertUserToDto(rawUser) {
    return {
        id: rawUser.id,
        username: rawUser.username,
        email: rawUser.email,
        isAdmin: rawUser.is_admin,
        isDisabled: rawUser.is_disabled,
        createdAt: rawUser.created_at
    }
}

module.exports = {
    createNewUser,
    loginUser,
    saveNewPassword,
    sendResetPasswordEmail,
    registerAdmin,
    checkIfUserExistsByEmail,
    findAUserById,
    disableUserAccount
}