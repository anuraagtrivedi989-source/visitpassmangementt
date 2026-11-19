import Joi from './joi.js';

/**
 * Validation middleware using Joi schemas.
 * Usage: `router.post('/login', validate(schemas.login), handler)`
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
}

// Export commonly used schemas for convenience
export const schemas = {
  register: Joi.object({
    name: Joi.string().max(100).required(),
    organizationName: Joi.string().max(120).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(10).required(),
  }),
  login: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
    role: Joi.string().valid('admin', 'security', 'frontdesk', 'employee').required(),
  }),
  staffCreate: Joi.object({
    name: Joi.string().max(100).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(10).required(),
    role: Joi.string().valid('admin', 'security', 'frontdesk', 'employee').required(),
  }),
};

