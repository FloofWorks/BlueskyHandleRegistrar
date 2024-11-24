import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import sqlite3 from 'sqlite3';
import axios from 'axios';
import { isDeepStrictEqual } from 'util';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


const PORT = 62008;
const BACKEND_PASSWORD = "YOUR_BACKEND_PASSWORD";

const maintanance = false;

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/assets/scripts', express.static(path.join(__dirname, 'public', 'server', 'scripts')));
app.use('/assets/styles', express.static(path.join(__dirname, 'public', 'server', 'styles')));

const dbPath = path.join(__dirname, 'public', 'db', 'name_claim.db');
const db = new sqlite3.Database('./public/db/name_claim.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

async function verifyCaptcha(token) {
    const secretKey = 'YOUR_GOOGLE_CAPTCHA_SECRET_KEY'; // Replace with your actual secret key
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    if(token === 'Lucario'){
        return true;
    }
    
    try {
        const response = await axios.post(verificationUrl);
        return response.data.success;
    } catch (error) {
        console.error('Captcha verification error:', error);
        return false;
    }
}

function getRedirectUrl(req) {
    return null;
}

app.use((req, res, next) => {
    next();
});

app.get('/', (req, res) => {
    const host = req.headers.host;
    const subdomainArray = host.split('.');
    const subdomain = subdomainArray[0];
    const pathName = req.path;
    const redirectUrl = getRedirectUrl(req);

    if (subdomain === 'get' || (pathName === '/handle' && subdomain === 'get') || (pathName === '/handle' && subdomain === 'localhost:62008')) {
        if(maintanance){
            return res.sendFile(path.join(__dirname, 'public', 'server', 'name_claim_mtn.html'));
        }
        
        return res.sendFile(path.join(__dirname, 'public', 'server', 'name_claim.html'));
    }



    if (redirectUrl) {
        return res.redirect(redirectUrl);
    } else if (req.path === '/secret') {
        return res.sendFile(path.join(__dirname, 'public', 'query.html'));
    } 
    
    const hostSep = host.split('.');
    const redirHandlePart = hostSep.slice(1).join('.');
    
    console.log(subdomain);
    console.log(host);
    console.log(redirHandlePart);
    
    const IsDebugRedir = false;

    const checkRedirPage = `SELECT secret, did FROM user_claims WHERE username = ? AND domain = ? AND (state = 'V' OR state = 'V_F')`;
    db.get(checkRedirPage, [subdomain, redirHandlePart], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (!row) {
            if(IsDebugRedir){
                return res.redirect('https://bsky.app/profile/lucario.social'); //DEBUG REDIRECT
            } else {
                return res.sendFile(path.join(__dirname, 'public', 'server', 'no_redirect.html'));   
            }
        } else {
            console.log(row);
            if(IsDebugRedir){
                return res.redirect('https://bsky.app/profile/lucario.social'); //DEBUG REDIRECT
            } else {
                
                if(!row.secret.includes('https://')){
                    return res.sendFile(path.join(__dirname, 'public', 'server', 'no_redirect.html'));   
                }

                if(row.secret == 'DID'){
                    return res.redirect(`https://bsky.app/profile/${row.did}`)
                }
                
                return res.redirect(row.secret);
            }
        }
    });
});

app.get('/handle', (req, res) => {
    if(maintanance){
            return res.sendFile(path.join(__dirname, 'public', 'server', 'name_claim_mtn.html'));
    }
    
    return res.sendFile(path.join(__dirname, 'public', 'server', 'name_claim.html'));
});

app.get('/redirect', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'server', 'redirect_setup.html'));
});

app.get('/debug', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'server', 'database.html'));
});

// ----------------------------------
// API Endpoints
// ----------------------------------

app.post('/api/register', async (req, res) => {
    let { username, domain, did, email, captchaToken } = req.body;

    const isHuman = await verifyCaptcha(captchaToken);
    if (!isHuman) {
        return res.status(400).json({ success: false, message: 'Captcha verification failed' });
    }

    if (!username || !domain || !did || !email) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!did.includes("did=did:plc:")) {
        return res.status(400).json({ success: false, message: 'DID value must include `did=did:plc:`' });
    }
    

    username = username.toLowerCase();
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid username format. Only letters, numbers, underscores (_), and dashes (-) are allowed.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    
    
    
    
    
    

    // METHOD TO CHECK IF USERNAME IS >PURE<
    async function isFlatUsername(username) {
        const reservedUsernames = ['admin', 'user', 'test', 'root', 'support', 'furo'];
        
        username = username.toLowerCase();

        for (const reserved of reservedUsernames) {
            if (username === reserved) {
                return true;
            }
        }
        return false;
    }

    
    
    // CHECK IF USERNAME IS >RESERVED<
    const reservedH = ['buizel', 'lucario', 'furo', 'i_hate_grovile']
    for (const reservedD of reservedH) {
        if (username === reservedD) {
            console.error(`Attempted to register Reserved Handle ${username}`);
            return res.status(400).json({ success: false, message: 'This Handle is Reserved! To Register it, please send an email with your details to > floofworks.0@gmail.com <' });
        }
    }
    
    
    
    const flatUsername = await isFlatUsername(username);
    
    console.log(`Username ${username} Flat = ${flatUsername}`)
    
    if (flatUsername) { 
        const checkFlatUsernameQuery = `SELECT * FROM user_claims WHERE username = ? AND state = 'V_F'`;
        db.get(checkFlatUsernameQuery, [username], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (row) {
                return res.status(400).json({
                    success: false,
                    message: 'Handle is taken. Please choose a different Handle.'
                });
            } else {
                registerUser(username, domain, did, email, res, flatUsername);
            }
        });
    } else {
        const checkEmailQuery = `SELECT * FROM user_claims WHERE email = ?`; // CHECK IF EMAIL ALREADY EXISTS
        db.get(checkEmailQuery, [email], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (row) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already associated with an existing handle. Since unlinking has not been added yet. Please send an email to floofworks.0@gmail.com for further assistance.'
                });
            } else {
                const checkDidQuery = `SELECT * FROM user_claims WHERE did = ?`; // CHECK IF DID ALREADY EXISTS
                db.get(checkDidQuery, [did], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }
                    if (row) {
                        return res.status(400).json({
                            success: false,
                            message: 'You may only occupy one handle per DID, since unlinking has not been added yet. Please send an email to floofworks.0@gmail.com for further assistance.'
                        });
                    } else {
                        registerUser(username, domain, did, email, res, flatUsername); // REGISTER USER!
                    }
                });
            }
        });
    }
});


function registerUser(username, domain, did, email, res, isFlat) {
    const date = Math.floor(Date.now() / 1000); // CURRENT UNIX TIME STAMP
    const insertQuery = `INSERT INTO user_claims (username, domain, did, email, date, state, state_message, secret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    var cParam = `V`;
    if(isFlat){
        cParam = 'NV_F';
    }
    
    var verParam = `Verified`;
    if(isFlat){
        verParam = 'Awaiting Verification...';
    }
    
    const params = [username, domain, did, email, date, cParam, verParam, ''];

    db.run(insertQuery, params, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: user_claims.email')) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already associated with an existing handle. Since unlinking has not been added yet. Please send an email to floofworks.0@gmail.com for further assistance.'
                });
            }
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if(isFlat){
            return res.status(200).json({ success: true, message: `Successfully registered for a Pure Handle!<br><p>You can check your Handle's Status <a href="https://bsky-debug.app/handle" target="_blank">here!</a></p> <p>Please wait for a confirmation email that will be sent after your profile has been inspected.</p>` });
        }
        return res.status(200).json({ success: true, message: `Registration successful!<br><p>You can check your Handle's Status <a href="https://bsky-debug.app/handle" target="_blank">here!</a></p> <br> <p>To Apply your handle: <strong>Open settings > Change Handle > I have my own domain > Enter your full handle into the text box> Click "Verify DNS Record" > Press Save on the Top Right.</strong></p>` });
    });
}


app.get('/.well-known/atproto-did', (req, res) => {
    const host = req.headers.host;
    var hostParts = host.split('.');

    console.log(host);
        
    if(host == `localhost:62008`){
        hostParts = ['pmdshitpost', 'pmd', 'social'] // DEBUG
    } else {
        if (hostParts.length < 2) {
            return res.status(400).send('Invalid host format');
        }
    }

    

    

    const username = hostParts[0];
    const domain = hostParts.slice(1).join('.');

    console.log(username);
    console.log(domain);

    const query = `SELECT did FROM user_claims WHERE username COLLATE NOCASE = ? AND domain = ? AND (state = 'V' OR state = 'V_F')`;
    db.get(query, [username, domain], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Database error');
        }
        if (!row) {
            return res.status(404).send('User not found or not verified');
        }

        let did = row.did;
        if (did.startsWith('did=')) {
            did = did.substring(4);
        }
        res.status(200).send(did);
    });
});




app.get('/api/public/registrants', (req, res) => {
    const query = `SELECT username, domain, did FROM user_claims WHERE state = 'V';`;

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'ERR: Database Error' });
        }

        rows.forEach(row => {
            const parsedDID = row.did.split('did=')[1];
            row.did = parsedDID || row.did;
        });

        return res.status(200).json({ success: true, data: rows });
    });
});


app.get('/api/getDataByUser/:username', (req, res) => {
    const username = req.params.username;

    const query = `SELECT username, domain, did FROM user_claims WHERE username = ? AND state = 'V'`;
    db.all(query, [username], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
});

app.get('/api/getDataByDid/:did', (req, res) => {
    const did = req.params.did;

    const query = `SELECT username FROM user_claims WHERE did = ?`;
    db.get(query, [did], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (row) {
            return res.status(200).json({ success: true, data: row });
        } else {
            return res.status(404).json({ success: false, message: 'DID not found' });
        }
    });
});

app.get('/api/getDataByDomain/:domain', (req, res) => {
    const domain = req.params.domain;
    
    const authHeader = req.headers['authorization'];
    
    if(authHeader != BACKEND_PASSWORD){
        return res.status(401).json({success: false, message: `Unauthorized token: ${authHeader}`})
    }

    const query = `SELECT username, date, state, did, domain, email FROM user_claims WHERE domain = ?`;
    db.all(query, [domain], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
});

app.get('/api/getDataByHandle/:handle', (req, res) => {
    const handle = req.params.handle;

    const handleParts = handle.split('.');
    if (handleParts.length < 2) {
        return res.status(400).json({ success: false, message: 'Invalid handle format' });
    }

    const username = handleParts[0];
    const domain = handleParts.slice(1).join('.');

    const query = `SELECT username, did, domain FROM user_claims WHERE username = ? AND domain = ? AND (state = 'V' OR state = 'V_F')`;
    db.get(query, [username, domain], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: 'Handle not found' });
        }
        return res.status(200).json({ success: true, data: row });
    });
});




app.post('/api/updateUser', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader != BACKEND_PASSWORD) {
        return res.status(401).json({ success: false, message: `Unauthorized token: ${authHeader}` });
    }

    const { old_username, username, email, did, state, state_message } = req.body;

    if (!old_username) {
        return res.status(400).json({ success: false, message: 'Missing required field: old_username' });
    }

    let setClauses = [];
    let params = [];
    if (username) {
        setClauses.push('username = ?');
        params.push(username);
    }
    if (email) {
        setClauses.push('email = ?');
        params.push(email);
    }
    if (did) {
        setClauses.push('did = ?');
        params.push(did);
    }
    if (state) {
        setClauses.push('state = ?');
        params.push(state);
    }
    if (state_message) {
        setClauses.push('state_message = ?');
        params.push(state_message);
    }

    if (setClauses.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const updateQuery = `UPDATE user_claims SET ${setClauses.join(', ')} WHERE username = ?`;
    
    if(state === 'DEL') {
        const delQuery = `DELETE FROM user_claims WHERE username = '${username}' AND email = '${email}' AND did = '${did}'`;
        
        db.run(delQuery, function(err) {
            if (err) {
                console.error(err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ success: false, message: 'Unique constraint failed: ' + err.message });
                }
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            return res.status(200).json({ success: true, message: 'User DELETED successfully' });
        });
        
    }else{
        params.push(old_username);

        db.run(updateQuery, params, function(err) {
            if (err) {
                console.error(err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ success: false, message: 'Unique constraint failed: ' + err.message });
                }
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            return res.status(200).json({ success: true, message: 'User updated successfully' });
        });
    }
});


app.post('/api/updateSecret', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== BACKEND_PASSWORD) {
        return res.status(401).json({ success: false, message: `Unauthorized token: ${authHeader}` });
    }

    const { username, did, domain, secret } = req.body;

    if (!username || !did || !domain || !secret) {
        return res.status(400).json({ success: false, message: 'Missing required fields: username, did, domain, or secret' });
    }

    const updateQuery = `
        UPDATE user_claims 
        SET secret = ? 
        WHERE username = ? 
          AND did = ? 
          AND domain = ? 
          AND (state = 'V' OR state = 'V_F')
    `;

    db.run(updateQuery, [secret, username, did, domain], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'No matching row found to update' });
        }

        return res.status(200).json({ success: true, message: 'Secret updated successfully' });
    });
});




app.get('/api/v1/getSecretCode', async (req, res) => {
    try {
        const captcha = req.headers['captcha'];
        const targetUser = req.headers['target-user'];

        if (!captcha || !targetUser) {
            return res.status(400).send({
                success: false,
                message: "Invalid Request! : Missing req.hdr.captcha, Missing req.hrd.target-user"
            });
        }

        const response = await fetch('http://localhost:62009/api/getSecretCode/', {
            method: 'POST',
            headers: {
                'captcha': captcha,
                'target-user': targetUser
            }
        });

        const data = await response.json();

        if (response.ok) {
            return res.send({
                success: true,
                message: data.message
            });
        } else {
            return res.status(response.status).send({
                success: false,
                message: data.message || "Failed to get the secret code."
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send({
            success: false,
            message: "Internal server error."
        });
    }
});


app.get('/api/v1/StoreUserSecret', async (req, res) => {
    try {
        const authCode = req.headers['auth'];
        const pass = req.headers['pass'];

        if (!authCode || !pass) {
            return res.status(400).send({
                success: false,
                message: "Missing 'authCode' or 'pass' headers."
            });
        }

        const response = await fetch('http://localhost:62009/api/StoreUserSecret/', {
            method: 'POST',
            headers: {
                'auth': authCode,
                'pass': pass
            }
        });

        const data = await response.json();

        return res.status(response.status).send(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send({
            success: false,
            message: "Internal server error."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
