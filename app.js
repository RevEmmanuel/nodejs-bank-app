// -------------------------
// In-memory token blacklist
const tokenBlackList = new Set();
module.exports = { tokenBlackList };
// -------------------------

const express = require('express');
const app = express();
const globalExceptionHandler = require("./utils/globalExceptionHandler")
const { authVerification, adminVerification } = require("./middleware/authVerification");
const authRouter = require("./routes/auth");
const accountsRouter = require("./routes/accounts");
const adminRouter = require("./routes/admin");
const dotenv = require('dotenv');
const { client } = require("./databaseManipulations/db");
const {loginRequest} = require("./utils/validation");
const {loginAdminUser} = require("./service/adminService");
dotenv.config();
const port = process.env.PORT;

app.use(express.json());

function onExit() {
    console.log('Application is shutting down');
    client.end();
    console.log('Closed db connection');
    console.log('App has shut down!');
}
process.on('exit', onExit);


app.get('/', (req, res) => {
    res.send('Hello, Express! Adeola to the world!!!');
});

app.use("/auth/users", authRouter);
app.use("/accounts", authVerification, accountsRouter);

app.post('/admin', async (req, res, next) => {
    try {
        const loginDto = req.body;
        await loginRequest.validate(loginDto);
        const token = await loginAdminUser(loginDto);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
});

app.use("/admin", adminVerification, adminRouter);

app.use(globalExceptionHandler);

app.listen(port, async () => {
    console.log(`Starting Express server on port ${port}...`);
    console.log(`Server is running on port ${port}...`);
});

