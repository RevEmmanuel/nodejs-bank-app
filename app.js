const express = require('express');
const authRouter = require("./routes/auth");
const accountsRouter = require("./routes/accounts");
const adminRouter = require("./routes/admin");
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const port = process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, Express! Adeola to the world!!!');
});

app.use("/auth", authRouter);
app.use("/accounts", accountsRouter);
app.use("/admin", adminRouter);

app.listen(port, async () => {
    console.log(`Starting TypeORM + Express server on port ${port}...`);
    console.log(`Server is running on port ${port}...`);
});
