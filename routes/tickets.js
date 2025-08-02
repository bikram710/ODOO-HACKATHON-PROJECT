// routes/tickets.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuth, ensureRole } = require('../utils/authMiddleware');
const ticketController = require('../controllers/ticketController');

// 📎 Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 👤 User Dashboard
router.get('/user/dashboard', ensureAuth, ensureRole('user'), ticketController.userDashboard);

// 🧾 Create Ticket Form
router.get('/create', ensureAuth, ensureRole('user'), ticketController.renderCreateTicket);

// 📨 Handle Ticket Submission
router.post('/create', ensureAuth, ensureRole('user'), upload.single('attachment'), ticketController.createTicket);

// 🔍 View Single Ticket
router.get('/view/:id', ensureAuth, ensureRole('user'), ticketController.viewTicket);

// 💬 Reply to Ticket
router.post('/reply/:id', ensureAuth, ensureRole('user'), ticketController.replyToTicket);

module.exports = router;
