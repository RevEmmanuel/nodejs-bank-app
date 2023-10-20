const {createNewUser, loginUser, sendResetPasswordEmail, checkIfUserExistsByEmail, saveNewPassword, registerAdmin} = require("../service/authService");
const Router = require("express");
const yup = require('yup');
const jwt = require('jsonwebtoken');
const {createUserRequest, loginRequest, resetPasswordRequest} = require("../utils/validation");

const authRouter = Router();

authRouter.post('', async (req, res, next) => {
    try {
        const requestBody = req.body;
        await createUserRequest.validate(requestBody);
        const createdUser = await createNewUser(requestBody);
        res.status(201).json({ message: 'User registered successfully', createdUser: createdUser[0], token: createdUser[1] });
    } catch (error) {
        next(error);
    }
});

authRouter.post('/login', async (req, res, next) => {
    try {
        const loginDto = req.body;
        await loginRequest.validate(loginDto);
        const token = await loginUser(loginDto);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
})

authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!await checkIfUserExistsByEmail(email)) {
        res.status(404).json({ message: "User not found!" })
    }
    await sendResetPasswordEmail(email);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
});

authRouter.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    await resetPasswordRequest.validate(password)
    await saveNewPassword({ token, password })
    res.json({ message: 'Password reset successful.' });
});

authRouter.get('/admin/register', async (req, res, next) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT secret key is missing in the .env file');
        throw new Error('JWT secret key is missing');
    }
    const { token } = req.query;
    try{
        const payload = jwt.verify(token, secretKey);
        const { email } = payload;
        if (!email) {
            return res.status(400).json({ message: 'Missing Email field' });
        }
        await registerAdmin(email);
        return res.status(200).json({ message: 'User granted admin privileges' });
    }
    catch (error) {
        next(error);
    }
});

module.exports = authRouter;
