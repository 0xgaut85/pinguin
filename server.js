require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRouter = require('./packages/api/server.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Mount API routes at /api
app.use('/api', apiRouter);

// Serve inner-site at /os/
app.use('/os', express.static(path.join(__dirname, 'packages/inner-site/build'), {
    index: 'index.html',
}));

// SPA fallback for inner-site (React Router)
app.get('/os/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'packages/inner-site/build', 'index.html'));
});

// Serve 3d-site at / (main entry)
app.use(express.static(path.join(__dirname, 'packages/3d-site/public'), {
    index: 'index.html',
}));

// SPA fallback for 3d-site
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'packages/3d-site/public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`pinion unified server running on port ${PORT}`);
    console.log(`  3d-site:    http://localhost:${PORT}/`);
    console.log(`  inner-site: http://localhost:${PORT}/os/`);
    console.log(`  api:        http://localhost:${PORT}/api/`);
});
