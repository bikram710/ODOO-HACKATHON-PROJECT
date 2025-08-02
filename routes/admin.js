const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../utils/authMiddleware');

const adminController = require('../controllers/adminController');
const ticketController = require('../controllers/ticketController');

// 🖥️ Admin Dashboard
router.get('/dashboard', ensureAuth, ensureRole('admin'), adminController.adminDashboard);

// 🧾 View All Categories
router.get('/categories', ensureAuth, ensureRole('admin'), adminController.viewCategories);

// ➕ Add New Category
router.post('/categories', ensureAuth, ensureRole('admin'), adminController.addCategory);

// ❌ Delete Category
router.post('/categories/delete/:id', ensureAuth, ensureRole('admin'), adminController.deleteCategory);

// 🎫 View All Tickets
router.get('/tickets', ensureAuth, ensureRole('admin'), ticketController.adminViewTickets);

// 🧑‍💼 Assign Ticket to Agent (POST)
router.post('/tickets/assign', ensureAuth, ensureRole('admin'), ticketController.assignTicket);

// 👥 View All Users
router.get('/users', ensureAuth, ensureRole('admin'), adminController.viewUsers);

module.exports = router;
