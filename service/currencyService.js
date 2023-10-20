const {findByCurrencyCode, saveNewCurrency} = require("../repositories/currencyRepository");

async function createNewCurrency(currencyCode) {
    const foundCurrency = await findByCurrencyCode(currencyCode);
    if (foundCurrency) {
        throw new Error('Currency exists already!');
    }
    return await saveNewCurrency(currencyCode);
}

module.exports = {
    createNewCurrency
}