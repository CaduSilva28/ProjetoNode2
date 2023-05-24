const express = require("express");
const app = express();
require("dotenv").config({path: "./config/homolog.env"});
const port = process.env.PORT;
const categoriesController = require("./categories/categoriesController");
const articlesController = require("./articles/articlesController");

const bodyParser = require("body-parser");

//================= Conexão BD =====================//
const connection = require("./database/database");
connection
    .authenticate()
    .then(() => {
        console.log("Successful database connection");
    })
    .catch((msgError) => {
        console.log("Failed to connect to database: " + msgError);
    });

const Article = require("./articles/Article");
const Category = require("./categories/Category");

//================= Renderizador =====================//
app.set('view engine','ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//================= Rotas =====================//
app.use("/", categoriesController);
app.use("/", articlesController);

//Rota inicial
app.get("/", (req,res) => {
    Article.findAll({
        raw: true,
        order: [
            ['id','DESC']
        ],
        limit: 5
    }).then(articles => {
        Category.findAll({
            raw: true,
            order: [
                ['id','ASC']
            ]
        }).then(categories => {
            res.render("index",{
                articles,
                categories
            });
        }).catch(msgError => {
            console.log("Failed to query categories to database: " + msgError);
            res.redirect("/");
        });
    }).catch(msgError => {
        console.log("Failed to query articles to database: " + msgError);
        res.redirect("/");
    });
});

//Rota para ler os artigos
app.get("/:slug", (req, res) => {
    const { slug } = req.params;

    if(slug){
        Article.findOne({
            where: { slug: slug }
        }).then(article => {
            if(article){
                res.render("article",{
                    article
                });
            }else{
                console.log("Failed to query to database: because slug is not found");
                res.redirect("/");
            }
        }).catch(msgError => {
            console.log("Failed to query to database: " + msgError);
            res.redirect("/");
        });
    }else{
        console.log("Failed to query article to database: because id is not valid");
        res.redirect("/");
    }
});

//Rota que listará os artigos relacionados com a categoria
app.get("/category/:slug",(req, res) => {
    const { slug } = req.params;

    if(slug){
        Category.findOne({
            where: { slug: slug},
            include: [{
                model: Article
            }]
        }).then(category => {
            if(category){
                Category.findAll({
                    raw: true,
                    order: [
                        ['id','ASC']
                    ]
                }).then(categories => {
                    res.render("index",{
                        category,
                        articles: category.articles,
                        categories
                    })
                }).catch(msgError => {
                    console.log("Failed to query categorIES to database: " + msgError);
                    res.redirect("/"); 
                });
            }else{
                console.log("Failed to query category to database: because category is not found");
                res.redirect("/"); 
            }
        }).catch(msgError => {
            console.log("Failed to query category to database: " + msgError);
            res.redirect("/"); 
        });
    }else{
        console.log("Failed to query category to database: because slug is not valid");
        res.redirect("/");
    }
});

//================= Servidor =====================//
app.listen(port, (msgError) => {
    if(msgError){
        console.log("Failed to run server: " + msgError);
    }else{
        console.log("Server running on port: " + port);
    }
});