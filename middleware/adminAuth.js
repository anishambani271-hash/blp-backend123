// Protects admin-only routes (viewing raw submissions) with a shared secret key.
// The frontend never needs this — only internal/admin tools should call these routes.
function adminAuth(req, res, next) {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = adminAuth;
