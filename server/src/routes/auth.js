import { Router } from 'express';
import { createHash,randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import rateLimit from 'express-rate-limit';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import Admin from '../models/Admin.js';
import Organization from '../models/Organization.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

// Layer 1: Generous IP-based protection
const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many login requests from this network. Please try again later.',
  },
});

// Layer 2: Individual account + IP protection
const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,

  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : 'unknown';

    const ip = ipKeyGenerator(req.ip || 'unknown');

    return createHash('sha256')
      .update(`${email}|${ip}`)
      .digest('hex');
  },

  // Successful requests do not consume the failed-attempt limit
  skipSuccessfulRequests: true,

  standardHeaders: 'draft-7',
  legacyHeaders: false,

  message: {
    message: 'Too many failed login attempts for this account from this network. Please try again after 15 minutes.',
  },
});


const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Try again later.' },
});

// registration route
router.post('/register', registrationLimiter, validate(schemas.register), async (req, res, next) => {
  try {
    const { name, organizationName, email, password } = req.body;
    const baseSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'organization';
    const organization = await Organization.create({
      name: organizationName,
      slug: `${baseSlug}-${randomBytes(3).toString('hex')}`,
    });
    const user = await Admin.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'admin',
      organizationId: organization._id,
    });
    const token = jwt.sign(
      { sub: user._id.toString(), org: organization._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );
    // Set http‑only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(201).json({
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        organization: organization.name,
      },
    });
  } catch (e) {
    next(e);
  }
});

// login route
router.post('/login',  loginIpLimiter,
  loginAccountLimiter,
  validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password, role: requestedRole } = req.body;
    const user = await Admin.findOne({ email }).select('+passwordHash');
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    if (user.role !== requestedRole) {
      return res.status(403).json({
        message: `This account is assigned the ${user.role} role, not ${requestedRole}. Select the role assigned to your account.`,
      });
    }
    const token = jwt.sign(
      { sub: user._id.toString(), org: user.organizationId.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );
    const org = await Organization.findById(user.organizationId).select('name slug');
    // Set http‑only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.json({
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organization: org?.name || 'Organization',
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const org = await Organization.findById(req.admin.organizationId).select('name slug');
  res.json({ admin: req.admin, organization: org });
});

router.get('/staff', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const staff = await Admin.find({ organizationId: req.admin.organizationId })
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 });
    res.json({ staff });
  } catch (e) {
    next(e);
  }
});

router.post('/staff', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || password.length < 10) {
      return res.status(400).json({ message: 'Name, email and password (10+ characters) are required.' });
    }
    if (!['security', 'frontdesk', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const user = await Admin.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      organizationId: req.admin.organizationId,
    });
    res.status(201).json({
      staff: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/staff/:id/status', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be true or false.' });
    }
    if (String(req.params.id) === String(req.admin._id) && req.body.isActive === false) {
      return res.status(400).json({ message: 'You cannot disable your own account.' });
    }
    const user = await Admin.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.admin.organizationId },
      { $set: { isActive: req.body.isActive } },
      { new: true, runValidators: true },
    ).select('name email role isActive');
    if (!user) {
      return res.status(404).json({ message: 'Staff account not found in this organization.' });
    }
    res.json({ staff: user, message: `Staff account ${user.isActive ? 'enabled' : 'disabled'}.` });
  } catch (e) {
    next(e);
  }
});

export default router;
