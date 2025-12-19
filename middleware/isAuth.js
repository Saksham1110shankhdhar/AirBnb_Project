module.exports = (req, res, next) => {
    if (!req.session.isLoggedIN) {
      return res.redirect('/login?loginRequired=1');
    }
    next();
  };
  