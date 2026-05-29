require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const crypto = require('crypto');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameClients = [];

app.use(compression());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets'), { maxAge: '7d', immutable: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

// ========== OAUTH ==========
const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID;
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const REDIRECT_URI = process.env.KICK_REDIRECT_URI || 'http://localhost:3000/auth/kick/callback';

const pendingLogins = new Map();

function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
}

app.get('/auth/kick', (req, res) => {
    console.log("🔑 OAuth login started");
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = crypto.randomBytes(16).toString('hex');
    pendingLogins.set(state, { verifier });

    // Use only 'user:read' – works without extra app configuration
    const params = new URLSearchParams({
        client_id: KICK_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'user:read',   // minimal scope that actually works
        state: state,
        code_challenge: challenge,
        code_challenge_method: 'S256'
    });

    res.redirect(`https://id.kick.com/oauth/authorize?${params.toString()}`);
});

app.get('/auth/kick/callback', async (req, res) => {
    console.log("🔄 OAuth callback received");
    const { code, state, error, error_description } = req.query;

    if (error) {
        console.error(`OAuth error: ${error} - ${error_description}`);
        return res.status(400).send(`<h3>Login failed</h3><p>${error_description || error}</p><button onclick="window.close()">Close</button>`);
    }

    if (!code) {
        return res.status(400).send('<h3>Missing code</h3><button onclick="window.close()">Close</button>');
    }

    const pending = pendingLogins.get(state);
    if (!pending) {
        return res.status(400).send('<h3>Invalid state</h3><button onclick="window.close()">Close</button>');
    }
    pendingLogins.delete(state);

    try {
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: KICK_CLIENT_ID,
            client_secret: KICK_CLIENT_SECRET,
            code_verifier: pending.verifier
        });

        const tokenRes = await fetch('https://id.kick.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams
        });

        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            console.error(`Token exchange error: ${errorText}`);
            throw new Error('Token exchange failed');
        }

        const tokenData = await tokenRes.json();
        console.log("✅ Login successful");

        // Send success page – no channel detection, user will type manually
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Login Successful</title>
            <style>
                body { margin:0; min-height:100vh; background: radial-gradient(circle at 20% 30%, #0f172a, #1e1b4b); font-family: system-ui; display: flex; align-items: center; justify-content: center; color: #e2e8f0; }
                .card { background: rgba(15,23,42,0.8); backdrop-filter: blur(12px); border-radius: 32px; padding: 2rem; text-align: center; border: 1px solid rgba(25,198,253,0.4); }
                h1 { color: #19C6FD; }
                button { margin-top: 1.5rem; background: linear-gradient(135deg, #19C6FD, #3b82f6); border: none; padding: 8px 24px; border-radius: 60px; font-weight: bold; cursor: pointer; }
            </style>
            </head>
            <body>
                <div class="card">
                    <h1>✅ Login Successful!</h1>
                    <p>You can now close this window and enter your channel name manually.</p>
                    <button onclick="window.close()">Close Window</button>
                </div>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({ type: 'KICK_TOKEN', token: '${tokenData.access_token}', channel: '' }, '*');
                    }
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('Callback error:', err);
        res.status(500).send('<h3>Login failed</h3><button onclick="window.close()">Close</button>');
    }
});

app.get('/chat-status', (req, res) => {
    res.json({ connected: true, channel: 'manual' });
});

wss.on('connection', (ws) => {
    console.log("🎮 Game client connected");
    gameClients.push(ws);
    ws.on('close', () => gameClients = gameClients.filter(c => c !== ws));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ace Race server running on http://localhost:${PORT}`);
});