const { client } = require('../databaseManipulations/db');

async function saveNewCurrency(currencyCode, description) {
    try {
        const queryText = 'INSERT INTO currency (currency_code, description) VALUES ($1, $2) RETURNING *';
        const queryValues = [currencyCode, description];

        const result = await client.query(queryText, queryValues);
        console.log('currency saved:', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error executing SQL script create currency:', err);
    } finally {
        console.log('Disconnected from the database');
    }
}

async function findByCurrencyCode(currencyCode) {
    try {
        const queryText = 'SELECT * FROM currency WHERE currency_code = $1';
        const queryValues = [currencyCode];

        const result = await client.query(queryText, queryValues);
        if (result.rows.length > 0) {
            return result.rows[0]; // Return the currencyCode if found
        } else {
            console.log('Currency not found');
            return null; // Return null if the currencyCode does not exist
        }
    } catch (err) {
        console.error('Error executing SQL script find by currencyCode:', err);
    } finally {
        console.log('Query finished!');
    }
}

module.exports = {
    saveNewCurrency,
    findByCurrencyCode
}