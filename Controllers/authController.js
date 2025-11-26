exports.getLogin=(req, res, next) => {
    res.render( "auth/login", {pageTitle : 'Login',isLoggedIN:false});
}

exports.postLogin=(req, res, next) => {
  req.session.isLoggedIN=true;
  res.redirect("/");
}

exports.postLogout=(req, res, next) => {
  req.session.destroy();
  res.redirect("/login");
}