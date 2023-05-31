require("dotenv").config({ path: "./config/homolog.env"});
const limit = parseInt(process.env.LIMIT_PAGE);

const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const Article = require("./Article");
const Category = require("../categories/Category");
const adminAuth = require("../middlewares/adminAuth");
const sessionFun = require("../services/sessionFun");

//Rota para criação de artigo
router.get("/admin/articles/new/:deExists?", adminAuth, (req, res) => {
    let deExists = req.params.deExists || false;

    if(deExists === "true"){
        deExists = deExists === "true";
    }

    Category.findAll({
        raw: true,
        order: [
            ['title','ASC']
        ]
    }).then(categories =>  {
        res.render("admin/articles/new",{
            categories,
            deExists
        });
    }).catch(msgError => {
        console.log("Failed to query categories to database: " + msgError);
        res.redirect("/");
    });
});

//Rota em que o artigo será salvo
router.post("/articles/save", adminAuth, (req, res) => {
    const { categoryId, title, body } = req.body;
    console.log("veio aqui 1")
    Article.findOne({
        where: { title: title}
    }).then(article => {
        if(!article){
            Article.create({
                categoryId: categoryId,
                title: title,
                slug: slugify(title),
                body: body
            }).then(() => {
                res.redirect("/");
            }).catch((msgError) => {
                console.log("Failed to create article to database: " + msgError);
                res.redirect("/admin/articles/new");
            });
        }else{
            console.log("Failed to create article to database: because article already exists");
            res.redirect("/admin/articles/new/true");
        }
    }).catch(msgError => {
        console.log("Failed to create article to database: " + msgError);
        res.redirect("/admin/articles/new");
    });
});

//Rota que listará os artigos
router.get("/admin/articles", adminAuth, (req, res) => {
    
    Article.findAll({
        order: [
            ['id','ASC']
        ],
        include: [{
            model: Category,
            required: true
        }]
    }).then(articles => {
        res.render("admin/articles/index",{
            articles
        });
    }).catch(msgError => {
        console.log("Failed to query articles to database: " + msgError);
        res.redirect("/");
    });
});

//Rota que irá deletar o artigo
router.post("/articles/delete", adminAuth, (req, res) => {
    const { id } = req.body;

    if(id && !isNaN(id)){
        Article.destroy({
            where: { id: id }
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch((msgError) => {
            console.log("Failed to delete article to database: " +  msgError);
            res.redirect("/admin/articles");
        })
    }else{
        console.log("Failed to delete article to database: because id is not valid");
        res.redirect("/admin/articles");
    }
});

//Rota para editar artigo
router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    const { id } = req.params;

    if(id && !isNaN(id)){
        Article.findOne({
            where: { id: id }
        }).then(article => {
            if(article){
                Category.findAll({
                    raw: true,
                    order: [
                        ['title','ASC']
                    ]
                }).then(categories => {
                    res.render("admin/articles/edit",{
                        article,
                        categories
                    });
                }).catch(msgError => {
                    console.log("Failed to query categories to database: " + msgError);
                    res.redirect("/");
                });
            }else{
                console.log("Failed to query article to database: because article does not exists");
                res.redirect("/");
            }
        }).catch(msgError => {
            console.log("Failed to query article to database: " + msgError);
            res.redirect("/");
        })
    }else{
        console.log("Failed to query article: because id is not valid");
        res.redirect("/");
    }
});

//Rota para atualizar o artigo
router.post("/articles/update", adminAuth, (req, res) => {
    const { categoryId, title, body, id } = req.body;

    Article.update({
        categoryId: categoryId,
        title: title,
        slug: slugify(title),
        body: body,
    },{
        where: { id: id}
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch((msgError) => {
        console.log("Failed to update articles to database: " + msgError);
        res.redirect("/admin/articles/edit/" + id);
    });
});

//Rota de paginação de artigos
router.get("/articles/page/:num", (req, res) => {
    const page = req.params.num;
    let offset = 0

    if(!isNaN(page) && page > 1){
        offset = (parseInt(page) - 1) * limit;
    }

    Article.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [
            ['id','DESC']
        ]
    }).then(articles => {
        let next = true;

        if(offset + limit >= articles.count){
            next = false
        }

        const result = {
            next,
            page: parseInt(page),
            articles
        }

        Category.findAll({
            raw: true,
            order: [
                ['title','ASC']
            ]
        }).then(categories => {
            res.render("admin/articles/page",{
                categories,
                result,
                hasSession: sessionFun(req, res)
            });
        }).catch(msgError => {

        });
    }).catch(msgError => {
        console.log("Failed to query articles to database: " + msgError);
        res.redirect("/");
    });
});

module.exports = router;