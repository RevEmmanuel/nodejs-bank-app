const {findByCurrencyCode, saveNewCurrency} = require("../repositories/currencyRepository");
const axios = require('axios');
const dotenv = require("dotenv");

dotenv.config();

async function createNewCurrency(currencyCode) {
    const foundCurrency = await findByCurrencyCode(currencyCode);
    if (foundCurrency) {
        throw new Error('Currency exists already!');
    }
    let description = currencyCode;
    const currencyList = await getCurrencyList();
    if (currencyList.hasOwnProperty(currencyCode)) {
        description = currencyList[currencyCode];
    } else {
        throw new Error('Cannot find currency with that code, Please check code and try again.');
    }
    return await saveNewCurrency(currencyCode, description);
}

async function getCurrencyList() {
    try {
        const apiKey = process.env.API_KEY;
        const response = await axios.get("https://api.apilayer.com/currency_data/list", {
            headers: {
                'apikey': apiKey,
            },
        });

        const data = response.data;
        const currencyList = data.currencies;
        console.log('Currency List \n', currencyList);
        return currencyList;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}


module.exports = {
    createNewCurrency
}