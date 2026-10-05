
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { env } from '../config/env.js';

const auth = Router();

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128)
});

function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'customer'
  };
}

auth.post('/signup', wrap(async (req, res) => {
  const data = signupSchema.parse(req.body);
  const email = data.email.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({
      error: 'An account with this email already exists.'
    });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    name: data.name,
    email,
    passwordHash
  });

  res.status(201).json({
    message: 'Account created successfully.',
    user: publicUser(user),
    token: createToken(user)
  });
}));

auth.post('/login', wrap(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const email = data.email.toLowerCase();

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    return res.status(401).json({
      error: 'Invalid email or password.'
    });
  }

  res.json({
    message: 'Login successful.',
    user: publicUser(user),
    token: createToken(user)
  });
}));

auth.get('/me', wrap(async (req, res) => {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in.' });
  }

  let payload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      error: 'Your session has expired. Please log in again.'
    });
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    return res.status(401).json({ error: 'Account not found.' });
  }

  res.json({ user: publicUser(user) });
}));

auth.post('/forgot-password', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      error: 'Email is required.'
    });
  }

  const user = await User.findOne({ email }).select(
    '+resetPasswordToken +resetPasswordExpires'
  );

  // Always return the same message so users cannot discover
  // whether an email is registered.
  if (!user) {
    return res.json({
      message: 'If an account exists with this email, a password reset can be requested.'
    });
  }

  const token = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  res.json({
    message: 'Password reset token created.',
    resetToken: token
  });
}));
auth.post('/reset-password', wrap(async (req, res) => {
  const token = String(req.body.token || '').trim();
  const newPassword = String(req.body.password || '');

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Reset token and new password are required.'
    });
  }

  if (newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({
      error: 'Password must be between 8 and 128 characters.'
    });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  }).select('+resetPasswordToken +resetPasswordExpires +passwordHash');

  if (!user) {
    return res.status(400).json({
      error: 'Invalid or expired password reset token.'
    });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);

  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.json({
    message: 'Password reset successfully. You can now log in.'
  });
}));
export default auth;