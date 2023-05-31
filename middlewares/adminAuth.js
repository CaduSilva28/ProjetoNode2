function adminAuth(req, res, next){
    if(req.session.user){
        next();
    }else{
        console.log("failed to authenticate: because session does not exist");
        res.redirect("/login");
    }
};

module.exports = adminAuth;