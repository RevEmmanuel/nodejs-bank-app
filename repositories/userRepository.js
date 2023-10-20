const { client } = require('../databaseManipulations/db');

async function existsByEmail(email) {
    try {
        const queryText = 'SELECT * FROM users WHERE email = $1';
        const queryValues = [email];

        const result = await client.query(queryText, queryValues);
        return result.rows.length > 0;
    } catch (err) {
        console.error('Error executing SQL script exists by email: ', err);
    } finally {
        console.log('Query finished!');
    }
}

async function existsByUsername(username) {
    try {
        const queryText = 'SELECT * FROM users WHERE username = $1';
        const queryValues = [username];

        const result = await client.query(queryText, queryValues);
        return result.rows.length > 0;
    } catch (err) {
        console.error('Error executing SQL script exists by username: ', err);
    } finally {
        console.log('Query finished!');
    }
}

async function saveUser(newUser) {
    const { email, password, username } = newUser;

    try {
        const queryText = 'INSERT INTO users (email, password, username, is_admin) VALUES ($1, $2, $3, $4) RETURNING *';
        const queryValues = [email, password, username, true];

        const result = await client.query(queryText, queryValues);

        console.log('User saved:', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error saving user: ', err);
    } finally {
        console.log('Query finished!');
    }
}

async function findUserByEmail(email) {
    try {
        const queryText = 'SELECT * FROM users WHERE email = $1';
        const queryValues = [email];

        const result = await client.query(queryText, queryValues);
        if (result.rows.length > 0) {
            return result.rows[0]; // Return the user if found
        } else {
            console.log('User not found');
            return null; // Return null if the user does not exist
        }
    } catch (err) {
        console.error('Error finding user by email: ', err);
        return null;
    } finally {
        console.log('Query finished!');
    }
}

async function updateUserPassword(updatedDetails) {
    const { userId, newPassword } = updatedDetails;
    try {
        const queryText = 'UPDATE users SET password = $1 WHERE id = $2';
        const queryValues = [newPassword, userId];

        await client.query(queryText, queryValues);
        console.log('User password updated');
    } catch (err) {
        console.error('Error updating user password: ', err);
    } finally {
        console.log('Query finished!');
    }
}

async function makeUserAnAdmin(userId) {
    try {
        const queryText = 'UPDATE users SET is_admin = $1 WHERE id = $2';
        const queryValues = [true, userId];

        await client.query(queryText, queryValues);
        console.log('User admin status updated');
    } catch (err) {
        console.error('Error updating user admin status: ', err);
    } finally {
        console.log('Query finished!');
    }
}

async function findUserById(userId) {

}

async function disableUserById(userId) {
    try {
        const queryText = 'UPDATE users SET is_disabled = $1 WHERE id = $2';
        const queryValues = [true, userId];

        await client.query(queryText, queryValues);
        console.log(`User with id ${userId} disabled`);
    } catch (err) {
        console.error('Error updating user status is_disabled: ', err);
    } finally {
        console.log('Query finished!');
    }
}

module.exports = {
    existsByEmail,
    existsByUsername,
    saveUser,
    findUserByEmail,
    updateUserPassword,
    makeUserAnAdmin,
    disableUserById,
    findUserById
}
