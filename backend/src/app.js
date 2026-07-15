require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
// --- YE NAYI LINES ADD KARNI HAIN (imports ke saath, upar) ---
const locationRoutes = require('./routes/location');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/reports');
const sosRoutes = require('./routes/sos');

const riskRoutes = require('./routes/risk');
const routeRoutes = require('./routes/route');
const safePlacesRoutes = require('./routes/safePlaces');
const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
// --- YE NAYI LINES ADD KARNI HAIN (routes register karne wali jagah) ---
app.use('/api/location', locationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sos', sosRoutes);

app.use('/api/risk', riskRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/safe-places', safePlacesRoutes);
app.get('/', (req, res) => res.send('RAKSHA AI Backend is running'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));