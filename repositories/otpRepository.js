const { client } = require('../databaseManipulations/db');

async function createNewVerificationOtp(otpRequest) {
    const { otp, ownerEmail } = otpRequest;
    try {
        await client.connect();
        console.log('Connected to the database');

        const queryText = 'INSERT INTO otp_verification (owner_email, otp) VALUES ($1, $2) RETURNING *';
        const queryValues = [ownerEmail, otp];

        const result = await client.query(queryText, queryValues);
        console.log('Otp saved:', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error executing SQL script exists by email:', err);
    } finally {
        client.end();
        console.log('Disconnected from the database');
    }
}

async function findByVerificationOtp(otp) {
    try {
        const queryText = 'SELECT * FROM otp_verification WHERE otp = $1';
        const queryValues = [otp];

        const result = await client.query(queryText, queryValues);
        if (result.rows.length > 0) {
            return result.rows[0]; // Return the otp if found
        } else {
            console.log('User not found');
            return null; // Return null if the otp does not exist
        }
    } catch (err) {
        console.error('Error executing SQL script find by otp:', err);
    } finally {
        console.log('Query finished!');
    }
}

async function deleteUsedOtp(otpId) {
    try {
        const queryText = 'DELETE FROM otp_verification WHERE id = $1';
        const queryValues = [otpId];

        await client.query(queryText, queryValues);
        console.log('Otp deleted');
    } catch (err) {
        console.error('Error deleting otp:', err);
    } finally {
        console.log('Query finished!');
    }
}

module.exports = {
    createNewVerificationOtp,
    findByVerificationOtp,
    deleteUsedOtp
}
