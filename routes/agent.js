const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../utils/authMiddleware');
const Ticket = require('../models/Ticket');

// 🧮 Agent Dashboard - View All Tickets
router.get('/dashboard', ensureAuth, ensureRole('agent'), async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      .populate('createdBy')
      .populate('category')
      .sort({ updatedAt: -1 });

    res.render('agent/dashboard', {
      user: req.session.user,
      tickets
    });
  } catch (err) {
    console.error(err);
    res.render('agent/dashboard', {
      user: req.session.user,
      tickets: [],
      error: 'Unable to load tickets'
    });
  }
});

// 🔍 View a Single Ticket (Agent)
router.get('/view/:id', ensureAuth, ensureRole('agent'), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy')
      .populate('category')
      .populate('replies.sender');

    if (!ticket) return res.status(404).send('Ticket not found');

    res.render('agent/ticket_detail', {
      user: req.session.user,
      ticket
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading ticket');
  }
});

// 💬 Reply and/or Update Ticket Status
router.post('/reply/:id', ensureAuth, ensureRole('agent'), async (req, res) => {
  const { message, status } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).send('Ticket not found');

    ticket.replies.push({
      message,
      sender: req.session.user._id
    });

    if (status && status !== ticket.status) {
      ticket.status = status;
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    res.redirect(`/agent/view/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating ticket');
  }
});

module.exports = router;
