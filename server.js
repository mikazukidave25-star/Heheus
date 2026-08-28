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

    const { cookie, botId, captchalyApiKey } = req.body || {};
    if (!cookie || !botId) {
        return res.status(400).json({ success: false, message: 'Missing cookie or botId' });
    }

    // Safety net: always respond within 170s (comfortably under the Python
    // side's 200s client timeout) even if something inside run() hangs
    // unexpectedly, instead of leaving the request to time out silently on
    // the caller's end with no useful error message.
    const timeout = new Promise((resolve) => {
        setTimeout(() => resolve({ success: false, message: 'vote-service: run() did not finish within 170s (internal timeout)' }), 170000);
    });

    try {
        const result = await Promise.race([run({ cookie, botId, captchalyApiKey }), timeout]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error && error.message ? error.message : String(error) });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Vote service listening on port ${port}`);
});
