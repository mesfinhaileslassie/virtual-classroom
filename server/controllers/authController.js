const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('📝 Register attempt:', { name, email, role });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student' // Default to student if not specified
    });

    if (user) {
      console.log('✅ User created successfully:', user._id);

      // Generate token with role
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          bio: user.bio,
          token: token
        }
      });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📝 Login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', user._id);

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('✅ Password matched for user:', email);

    // Generate token with role
    const token = generateToken(user._id, user.role);

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        token: token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    console.log('📝 Fetching profile for user:', req.user._id);

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('❌ User not found:', req.user._id);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ Profile fetched successfully for:', user.email);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('📝 Updating profile for user:', req.user._id);
    console.log('Update data:', req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('❌ User not found:', req.user._id);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    
    if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    console.log('✅ Profile updated successfully for:', updatedUser.email);

    // Generate new token with updated info
    const token = generateToken(updatedUser._id, updatedUser.role);

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        token: token
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log('📝 Password change attempt for user:', req.user._id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      console.log('❌ User not found:', req.user._id);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      console.log('❌ Current password incorrect for user:', req.user._id);
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed successfully for user:', req.user._id);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📝 Forgot password request for:', email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found for password reset:', email);
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with that email, you will receive password reset instructions.'
      });
    }

    // Here you would generate a reset token and send email
    // For now, we'll just return success
    console.log('✅ Password reset email would be sent to:', email);

    res.json({
      success: true,
      message: 'If an account exists with that email, you will receive password reset instructions.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('📝 Reset password attempt with token');

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Here you would verify the token and update password
    // For now, we'll just return success
    console.log('✅ Password reset successful');

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Logout user (optional - client side only)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  console.log('📝 Logout for user:', req.user?._id);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutUser
};