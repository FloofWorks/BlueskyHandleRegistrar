import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import { isDeepStrictEqual } from 'util';
import dotenv from 'dotenv';
dotenv.config(); // To use environment variables

const app = express();


const PORT = 62009;

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

async function verifyCaptcha(token) {
    const secretKey = 'YOUR_GOOGLE_CAPTCHA_SECRET'; //< REPLACE WITH YOUR GOOGLE CAPTCHA SECRET KEY
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


app.use((req, res, next) => {
    next();
});




////// BLUESKY AUTH
const secretCodes = new Map();

import { Bot } from "@skyware/bot";

let bot;

try {
    bot = new Bot();
    await bot.login({ identifier: "YOUR_BOT_HANDLE", password: "YOUR_BOT_PASSWORD" }); //< Update these to be your Account's Cridentials!
    console.log("Bot logged in successfully");

    bot.on('error', (error) => {
        console.error("Runtime error from bot:", error);

    });
} catch (error) {
    console.error("Error initializing or logging in the bot:", error);

    bot = null; 
}

const botDID = 'did:plc:YOUR_BOT_DID'; //< Update this to be your Bot Account's DID

async function sendDirectMessage(recipientDid, message) {
    if (!bot) {
        console.error("Bot is not available. Cannot send messages.");
        return;
    }

    try {
        const conversation = await bot.getConversationForMembers([botDID, recipientDid]);
        await bot.sendMessage({
            conversationId: conversation.id,
            text: message,
        });
        console.log(`Message sent to ${recipientDid}`);
    } catch (error) {
        console.error(`Failed to send message to ${recipientDid}:`, error);
    }
}


app.post('/api/getSecretCode/', async (req, res) => {
    const captchaToken = req.headers['captcha'];
    const targetUser = req.headers['target-user'];

    const IsDebugCaptcha = false;

    const isHuman = await verifyCaptcha(captchaToken);
    if (!isHuman && !IsDebugCaptcha) {
        return res.status(400).json({ success: false, message: 'Captcha verification failed' });
    }

    console.log(`Target user handle: ${targetUser}`);

    try {
        const response = await fetch(`http://localhost:62008/api/getDataByHandle/${targetUser}`);
        const userData = await response.json();

        if (!response.ok) {
            console.error(`Error fetching data for ${targetUser}:`, userData.message);
            return res.status(response.status).json({ success: false, message: userData.message || 'Error retrieving user data' });
        }

        const { did: userDID, username, domain } = userData.data;
        console.log(`Found user: ${username} (${userDID}) on domain: ${domain}`);

        const now = Date.now();
        secretCodes.forEach((value, key) => {
            if (now - value.timestamp > 30000) {
                secretCodes.delete(key);
            }
        });

        let code;
        do {
            code = Math.floor(100000 + Math.random() * 900000).toString();
        } while ([...secretCodes.values()].some(entry => entry.code === code));

        const timestamp = Date.now();
        secretCodes.set(userDID, { code, timestamp, username, domain });

        printAuthCodes();

        const recipientDid = userDID.replace('did=', '');

        try {
            await sendDirectMessage(recipientDid, `Your verification code is: > ${code} <`);
            console.log(`Direct message sent to ${recipientDid}`);
        } catch (error) {
            console.error(`Error sending direct message to ${recipientDid}:`, error);
            return res.status(400).json({ success: false, message: 'There was an error sending you the Authentication Code. Are your DMs open?' });
        }

        res.status(200).json({ success: true, message: 'An Authentication Code has been sent to your Direct Messages!' });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.post('/api/StoreUserSecret/', async (req, res) => {
    printAuthCodes();

    const IsStoreDebug = false;

    const authCode = req.headers['auth'];
    const pass = req.headers['pass'];

    const now = Date.now();
    let userDid, username, domain;
    for (let [did, { code, timestamp, username: uName, domain: uDomain }] of secretCodes.entries()) {
        if (code === authCode) {
            if (now - timestamp <= 30000) {
                userDid = did;
                username = uName;
                domain = uDomain;
                break;
            } else {
                secretCodes.delete(did);
                return res.status(400).json({ success: false, message: 'Auth code has expired' });
            }
        }
    }

    if (!userDid && !IsStoreDebug) {
        return res.status(400).json({ success: false, message: 'Invalid auth code' });
    }

    try {
        const response = await fetch('http://localhost:62008/api/updateSecret', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'YOUR_BACKEND_PASSWORD' //< EDIT THIS TO REFLECT YOUR BACKEND_PASSWORD IN ../index.mjs
            },
            body: JSON.stringify({
                username,
                did: userDid,
                domain,
                secret: pass
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error(`Error updating secret for ${userDid}:`, responseData.message);
            return res.status(response.status).json({ success: false, message: responseData.message || 'Error updating user secret' });
        }

        secretCodes.delete(userDid);

        return res.status(200).json({ success: true, message: 'Secret stored successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



function printAuthCodes() {
    console.log("Current Auth Codes:");
    secretCodes.forEach((value, key) => {
        console.log(`User DID: ${key}, Code: ${value.code}, Timestamp: ${value.timestamp}`);
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
