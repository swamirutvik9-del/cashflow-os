const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('CashFlow OS API is running');
});

const authRoutes = require('./routes/auth');
const financialRoutes = require('./routes/financials');

app.use('/api/auth', authRoutes);
app.use('/api/financials', financialRoutes);

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);


// Routes will be added here


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
