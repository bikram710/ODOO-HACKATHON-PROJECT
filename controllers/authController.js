// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');

// Render login form
exports.renderLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

// Render registration form
exports.renderRegister = (req, res) => {
  res.render('auth/register', { error: null });
};

// Handle user registration
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', { error: 'Email already in use' });
    }

    // ❌ DO NOT HASH — let Mongoose pre-save hook do it
    const user = new User({ name, email, password, role });
    await user.save();

    req.session.user = user;

    // Redirect based on role
    if (role === 'user') {
      return res.redirect('/tickets/user/dashboard');
    } else if (role === 'agent') {
      return res.redirect('/agent/dashboard');
    } else if (role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/');
    }
  } catch (err) {
    console.error('Registration Error:', err);
    res.render('auth/register', { error: 'Registration failed. Try again.' });
  }
};

// Handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔐 Trying login for:', email);

    const user = await User.findOne({ email });
    console.log('👤 User found:', user);

    if (!user) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    req.session.user = user;
    console.log('✅ Login success for role:', user.role);

    // Redirect based on role
    if (user.role === 'user') {
      return res.redirect('/tickets/user/dashboard');
    } else if (user.role === 'agent') {
      return res.redirect('/agent/dashboard');
    } else if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/');
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.render('auth/login', { error: 'Login failed. Try again.' });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
