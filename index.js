// index.js
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const schoolsRouter = require('./routes/schools');
app.use('/', schoolsRouter);

// basic healthcheck
app.get('/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
