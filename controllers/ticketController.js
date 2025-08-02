// controllers/ticketController.js

const Ticket = require('../models/Ticket');
const Category = require('../models/Category');

// 👤 User Dashboard - View Own Tickets
exports.userDashboard = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.session.user._id })
      .populate('category')
      .sort({ updatedAt: -1 });

    res.render('user/dashboard', {
      user: req.session.user,
      tickets
    });
  } catch (err) {
    console.error(err);
    res.render('user/dashboard', {
      user: req.session.user,
      tickets: [],
      error: 'Unable to load your tickets'
    });
  }
};

// 🧾 Render Ticket Create Form
exports.renderCreateTicket = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render('user/ticket_create', {
      user: req.session.user,
      categories
    });
  } catch (err) {
    console.error(err);
    res.render('user/ticket_create', {
      user: req.session.user,
      categories: [],
      error: 'Failed to load ticket form'
    });
  }
};

// 📨 Handle Ticket Submission
exports.createTicket = async (req, res) => {
  const { subject, description, category } = req.body;
  try {
    const newTicket = new Ticket({
      subject,
      description,
      category,
      createdBy: req.session.user._id,
      attachment: req.file ? req.file.filename : null
    });

    await newTicket.save();
    res.redirect('/tickets/user/dashboard');
  } catch (err) {
    console.error(err);
    res.render('user/ticket_create', {
      user: req.session.user,
      categories: await Category.find({}),
      error: 'Failed to create ticket'
    });
  }
};

// 🔍 View Single Ticket (User)
exports.viewTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      createdBy: req.session.user._id
    }).populate('category').populate('replies.sender');

    if (!ticket) return res.status(404).send('Ticket not found');

    res.render('user/ticket_detail', {
      user: req.session.user,
      ticket
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading ticket');
  }
};

// 💬 Reply to Ticket (User)
exports.replyToTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      createdBy: req.session.user._id
    });

    if (!ticket) return res.status(404).send('Ticket not found');

    ticket.replies.push({
      message: req.body.message,
      sender: req.session.user._id
    });

    ticket.updatedAt = new Date();
    await ticket.save();

    res.redirect(`/tickets/view/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error replying to ticket');
  }
};

// 📋 Admin - View All Tickets with Agents
exports.adminViewTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      .populate('category')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });

    const User = require('../models/User');
    const agents = await User.find({ role: 'agent' });

    res.render('admin/ticket_details', {
      user: req.session.user,
      tickets,
      agents
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load tickets');
  }
};

// 📌 Assign Ticket to Agent (Admin)
exports.assignTicket = async (req, res) => {
  try {
    const { ticketId, agentId } = req.body;

    await Ticket.findByIdAndUpdate(ticketId, {
      assignedTo: agentId,
      status: 'In Progress',
      updatedAt: new Date()
    });

    res.redirect('/admin/tickets');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to assign ticket');
  }
};
