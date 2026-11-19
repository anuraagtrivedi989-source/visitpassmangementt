// Minimal stub for Joi to avoid external dependency
// Provides only the methods used in this project and always validates successfully.

function createString() {
  // Return a proxy that accepts chaining methods (max, min, email, required, valid)
  const handler = {
    get(target, prop) {
      if (['max', 'min', 'email', 'required', 'valid'].includes(prop)) {
        // Each method returns the same proxy for further chaining
        return () => proxy;
      }
      // Any other property returns undefined (not used here)
      return undefined;
    },
  };
  const proxy = new Proxy({}, handler);
  return proxy;
}

const Joi = {
  // Accept any schema object (ignored) and provide a validate function that never errors.
  object: () => ({
    validate: () => ({ error: null, value: null }),
  }),
  string: createString,
};

export default Joi;

