require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const MongoStore = require('connect-mongo');

const app = express();

// ⛓️ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// 🧠 Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'quickdesk_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// ✅ Modern Body Parsers (replace body-parser)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📁 Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 📜 View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🌐 Global user access in views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// 🚏 Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const agentRoutes = require('./routes/agent');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/tickets', ticketRoutes);
app.use('/agent', agentRoutes);
app.use('/admin', adminRoutes);

// 🏁 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
