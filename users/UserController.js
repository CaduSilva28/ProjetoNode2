const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");

//Rota para criação de usuário
router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create");
});

//Rota para salvar o usuário no Banco de dados
router.post("/users/create", (req, res) => {
    const { email, password } = req.body;

    User.findOne({
        where: { email: email}
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
                console.log("Failed to create user to database: " + msgError);
                res.redirect("/admin/users/create");
            });
        }else{
            console.log("Failed to create user: because email already exists to database");
            res.redirect("/admin/users/create");
        }
    }).catch(msgError => {
        console.log("Failed to create user: " + msgError);
        res.redirect("/admin/users/create");
    });
});

//Rota para listagem de usuários
router.get("/admin/users", (req, res) => {

    User.findAll({
        raw: true,
        order: [
            ['id','ASC']
        ]
    }).then(users => {
        res.render("admin/users/index",{
            users
        });
    }).catch(msgError => {
        console.log("Failed to query users to database: " + msgError);
    });
});
module.exports = router;