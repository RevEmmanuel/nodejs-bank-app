const {createNewUser, loginUser, registerAdmin, findAUserById, disableUserAccount } = require("../service/authService");
const { inviteAdmin } = require("../service/adminService");
const Router = require("express");
const yup = require('yup');


// validation schema
const createUserRequest = yup.object().shape({
    username: yup.string().required('Please enter a username').min(2, 'Please enter a valid username'),
    email: yup.string().email().required('Please enter an email').min(2, 'Please enter a valid email'),
    password: yup.string().required('Please enter a password').min(8, 'Password must be a minimum of 8 characters')
});

const loginRequest = yup.object().shape({
    email: yup.string().email().required('Please enter an email').min(2, 'Please enter a valid email'),
    password: yup.string().required('Please enter a password').min(8, 'Password must be a minimum of 8 characters')
});

const adminRouter = Router();

adminRouter.post('/invite', async (req, res, next) => {
    const { email } = req.body;
    try{
        await inviteAdmin(email);
        res.status(200).json({ message: 'Admin invited successfully' });
    } catch(error) {
        next(error);
    }
});

adminRouter.post('/create', async (req, res, next) => {
    try {
        const requestBody = req.body;
        await createUserRequest.validate(requestBody);
        const createdUser = await createNewUser(requestBody);
        await registerAdmin(createdUser.email);
        res.status(201).json({ message: 'Admin user creates successfully', createdUser });
    } catch (error) {
        next(error);
    }
});

adminRouter.post('', async (req, res, next) => {
    try {
        const loginDto = req.body;
        await loginRequest.validate(loginDto);
        const token = await loginUser(loginDto);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const foundUser = await findAUserById(userId);
        res.status(200).json({ foundUser });
    } catch (error) {
        next(error);
    }
});

adminRouter.delete('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        await disableUserAccount(userId);
        res.status(200).json({ message: "Account disabled successfully!" });
    } catch (error) {
        next(error);
    }
});



module.exports = adminRouter;