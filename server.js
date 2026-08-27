const express = require('express');
const { run } = require('./vote');

const app = express();
app.use(express.json({ limit: '1mb' }));

const SECRET = process.env.VOTE_SERVICE_SECRET;

app.get('/', (_req, res) => {
    res.type('text/plain').send('OK - vote service is running');
});

app.post('/vote', async (req, res) => {
    if (!SECRET || req.headers['x-vote-secret'] !== SECRET) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { token, botId, captchalyApiKey } = req.body || {};
    if (!token || !botId) {
        return res.status(400).json({ success: false, message: 'Missing token or botId' });
    }

    try {
        const result = await run({ token, botId, captchalyApiKey });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error && error.message ? error.message : String(error) });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Vote service listening on port ${port}`);
});
