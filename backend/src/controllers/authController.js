const verifyUser = (req, res) => {
  // req.user already attached by authMiddleware
  res.status(200).json({ message: 'Verified', user: req.user });
};

module.exports = { verifyUser };
