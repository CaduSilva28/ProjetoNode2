const express = require("express");
const router = express.Router();
const User = require("./User");
const Category = require("../categories/Category");
const bcrypt = require("bcryptjs");
const sessionFun = require("../services/sessionFun");

//Rota para renderizar tela que criará usuário no BD
router.get("/admin/users/create", (req, res) => {
    
    Category.findAll({
        raw: true,
        order: [
            ['title','ASC']
        ]
    }).then(categories => {
        res.render("admin/users/new",{
            categories,
            hasSession: sessionFun(req, res)
        });
    }).catch(msgError => {
        console.log("Failed to query categories to database: " + msgError);
        res.redirect("/");
    });
});

//
router.post("/users/create", (req, res) => {
    const { email, password } = req.body;

    User.findOne({
        where: { email: email }
    }).then(user => {
        if(!user){
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/");
            }).catch((msgError) => {
                console.log("Failed to query user to database: " + msgError);
                res.redirect("/admin/users/create");
            });
        }else{
            console.log("Failed to query user to database: because user already exists");
            res.redirect("/admin/users/create");
        }
    }).catch(msgError => {
        console.log("Failed to query user to database: " + msgError);
        res.redirect("/admin/users/create");
    });
});

//Rota que listará os usuários
router.get("/admin/users", (req, res) => {
    User.findAll({
        raw: true,
        order: [
            ['id','ASC']
        ]
    }).then(users => {
        res.render("admin/users/index",{
            users,
            hasSession: sessionFun(req, res)
        });
    }).catch(msgError => {
        console.log("Failed to query users to database: " + msgError);
    });
});

//Rota para renderizar tela de login
router.get("/login", (req, res) => {
    
    Category.findAll({
        raw: true,
        order: [
            ['title','ASC']
        ]
    }).then(categories => {
        res.render("admin/users/login",{
            categories,
            hasSession: sessionFun(req, res)
        });
    }).catch(msgError => {
        console.log("Failed to query categories to database: " + msgError);
        res.redirect("/");
    });
});

router.post("/autheticate", (req, res) => {
    const { email, password } = req.body;

    User.findOne({
        where: { email: email }
    }).then(user => {
        if(user){
            //validator password
            const correct = bcrypt.compareSync(password, user.password);
            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("admin/articles");
            }else{
                console.log("Failed to query email to database: because password is not correct");
                res.redirect("/login");
            }
        }else{
            console.log("Failed to query email to database: because user does not exists");
            res.redirect("/login");
        }
    }).catch(msgError => {
        console.log("Failed to query email to database: " + msgError);
        res.redirect("/login");
    });
});


//Rota para fazer logout
router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/");
});

module.exports = router;
