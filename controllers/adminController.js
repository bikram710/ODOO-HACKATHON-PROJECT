// controllers/adminController.js

const Category = require('../models/Category');

// 🖥️ Admin Dashboard
exports.adminDashboard = (req, res) => {
  res.render('admin/dashboard', {
    user: req.session.user
  });
};

// 🧾 View All Categories with Optional Search
exports.viewCategories = async (req, res) => {
  const search = req.query.search || '';
  const query = search ? { name: new RegExp(search, 'i') } : {};

  try {
    const categories = await Category.find(query);
    res.render('admin/manage_categories', {
      user: req.session.user,
      categories,
      search
    });
  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    res.render('admin/manage_categories', {
      user: req.session.user,
      categories: [],
      search,
      error: 'Failed to load categories'
    });
  }
};

// ➕ Add Category
exports.addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    await Category.create({ name });
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    const categories = await Category.find({});
    res.render('admin/manage_categories', {
      user: req.session.user,
      categories,
      error: 'Category already exists or invalid',
      search: ''
    });
  }
};

// ❌ Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/categories');
  }
};

// 👥 View All Users (Except Admins)
exports.viewUsers = async (req, res) => {
  const User = require('../models/User');
  try {
    const users = await User.find({ role: { $ne: 'admin' } }); // Exclude admins
    res.render('admin/manage_users', {
      user: req.session.user,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading users');
  }
};
