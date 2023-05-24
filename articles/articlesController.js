const express = require("express");
const router = express.Router();
const Article = require("./Article");
const Category = require("../categories/Category");
const slugify = require("slugify");
require("dotenv").config({path: "./config/homolog.env"});
const limit = parseInt(process.env.LIMIT);

//Rota para criar artigo
router.get("/admin/articles/new",(req,res) => {
    Category.findAll({
        raw: true,
        order: [
            ['title','ASC']
        ]
    }).then(categories => {
        res.render("admin/articles/new",{
            categories
        });
    }).catch(msgError => {
        console.log("Failed to query articles: " + msgError);
    });
});

//Rota que o artigo será salvo
router.post("/articles/save", (req,res) => {
    const { title, body, categoryId } = req.body;

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: categoryId
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch((msgError) => {
        console.log("Failed to create article to database: " + msgError);
        res.redirect("/admin/articles/new");
    });
});

//route to list the articles
router.get("/admin/articles", (req, res) => {
    
    Article.findAll({
        order: [
            ['id','ASC']
        ],
        include: [{
            model: Category, required: true
        }]
    }).then(articles => {
        res.render("admin/articles/index",{
            articles    
        });
    }).catch(msgError => {
        console.log("Failed to list articles: " + msgError);
        res.redirect("/");
    });
});

//Rota que irá deletar o artigo
router.post("/articles/delete",(req, res) => {
    const { id } = req.body;

    if(id && !isNaN(id)){
        Article.destroy({
            where: {id: id}
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch((msgError) => {
            console.log("Failed to delete article: " + msgError);
            res.redirect("/admin/articles");
        });
    }else{
        console.log("Failed to delete article: because id is not valid");
        res.redirect("/admin/articles");
    }
});

//Rota para editar o artigo
router.get("/admin/articles/edit/:id",(req, res) => {
    const { id } = req.params;

    if(id && !isNaN(id)){
        Article.findOne({
            where: {id: id},
            include: [{
                model: Category
            }]
        }).then(article => {
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
                res.redirect("/");
                console.log("Failed to query categories: " + msgError);
            })
        }).catch(msgError => {
            res.redirect("/");
            console.log("Failed to edit article: " + msgError);
        })
    }else{
        res.redirect("/");
        console.log("Failed to edit article: because id is not valid");
    }
});

//Rota para atualizar o artigo
router.post("/articles/update", (req, res) => {
    const { categoryId, title, body, id } = req.body;

    Article.update({
        categoryId: categoryId,
        title: title,
        slug: slugify(title),
        body: body
    },
    {
        where: {id :id}
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch((msgError) => {
        console.log("Failed to update article to database: " + msgError);
        res.redirect("/admin/articles/edit/" + id);
    });
});

//A partir daqui
router.get("/articles/page/:num", (req, res) => {
    const page = req.params.num;
    let offset = 0;

    if(!isNaN(page) && page > 1){
        offset = (parseInt(page) - 1) * limit;
    }

    Article.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [
            ['id','DESC']
        ]
    })
    .then(articles => {
        let next = true;

        if(offset + limit >=articles.count){
            next = false
        }

        const result = {
            page: parseInt(page),
            articles,
            next
        }
        Category.findAll({
            raw: true,
            order: [
                ['id','ASC']
            ]
        }).then(categories => {
            res.render("admin/articles/page",{
                categories,
                result
            })
        }).catch(msgError => {
            console.log("Failed to query categories to database: " + msgError);
            res.redirect("/");
        });
    });
});

module.exports = router;