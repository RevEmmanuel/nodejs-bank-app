// validation schema
const yup = require("yup");

const createUserRequest = yup.object().shape({
    username: yup.string().required('Please enter a username').min(2, 'Please enter a valid username'),
    email: yup.string().email().required('Please enter an email').min(2, 'Please enter a valid email'),
    password: yup.string().required('Please enter a password').min(8, 'Password must be a minimum of 8 characters')
});

const loginRequest = yup.object().shape({
    email: yup.string().email().required('Please enter an email').min(2, 'Please enter a valid email'),
    password: yup.string().required('Please enter a password').min(8, 'Password must be a minimum of 8 characters')
});

const resetPasswordRequest = yup.object().shape({
    password: yup.string().required('Please enter a password').min(8, 'Password must be a minimum of 8 characters')
});

module.exports = {
    createUserRequest,
    loginRequest,
    resetPasswordRequest
}