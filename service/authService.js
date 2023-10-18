const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const {sq} = require("../database");

dotenv.config();

async function createNewUser(signupRequest) {
    const email = signupRequest.email;
    const username = signupRequest.username;
    const password = signupRequest.password;

    const user = await sq.models.Users.findOne( { where: { email: email } } );
    if (user) {
        throw new Error('This email is already registered!');
    }
    const usernameFound = await sq.models.Users.findOne( { where: { username: username } });
    if (usernameFound) {
        throw new Error('This username is already taken!');
    }

    return await sq.models.Users.create(
        {
            email: email,
            password: await bcrypt.hash(password, 10),
            username: username
        }
    );
}


async function loginUser(loginRequest) {
    const email = loginRequest.email;
    const password = loginRequest.password;

    const user = await sq.models.Users.findOne( { where: { email: email } } );

    if (!user) {
        throw new Error('User not found!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Incorrect Password!');
    }

    return 'User login successful';
}