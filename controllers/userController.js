const User = require('../models/User');

// Register A New User
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'Registration Successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a User Profile
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
