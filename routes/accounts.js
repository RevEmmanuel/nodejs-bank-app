const Router = require("express");
const accountsRouter = Router();

/**
accountsRouter.post('', async (req, res, next) => {
    try {
        const body = req.body;
        const createdAccount = await createNewAccount(body);
        res.status(201).json({ message: 'Account Created successfully', createdAccount });
    } catch (error) {
        next(error);
    }
});

accountsRouter.get('', async (req, res, next) => {
    try {
        const createdAccount = await getAccountsForUser(req.user.id);
        res.status(201).json({ message: 'Account Created successfully', createdAccount });
    } catch (error) {
        next(error);
    }
});
 */

module.exports = accountsRouter;