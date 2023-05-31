const express = require("express");
const app = express();
require("dotenv").config({ path: "./config/homolog.env"});
const port = process.env.PORT;
const limit = parseInt(process.env.LIMIT_PAGE);
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionFun = require("./services/sessionFun");

const CategoriesController = require("./categories/CategoriesController");
const ArticlesController = require("./articles/ArticlesController");
const UsersController = require("./users/UsersController");
//============= DATABASE =================//
const connection = require("./database/database");
connection
    .authenticate()
    .then(() => {
        console.log("Connection database successful");
    })
    .catch((msgError) => {
        console.log("Failed to connect to database: " + msgError);
    });
    
const Article = require("./articles/Article");
const Category = require("./categories/Category");

//============= RENDER =================//
app.set('view engine','ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({exteded: false}));
app.use(bodyParser.json());

//============= SESSION =================//
app.use(session({
    secret: "ec82n3ifnc9donwspwd0w3d",
    cookie: { maxAge: 3000000 }
}));

//============= ROUTER =================//
app.use("/", CategoriesController);
app.use("/", ArticlesController);
app.use("/", UsersController);


//Rota inicial
app.get("/", (req, res) => {
    
    Article.findAll({
        raw: true,
        order: [
            ['id','DESC']
        ],
        limit: limit
    }).then(articles => {
        Category.findAll({
            raw: true,
            order: [
                ['title','ASC']
            ]
        }).then(categories => {
            res.render("index",{
                articles,
                categories,
                hasSession: sessionFun(req,res)
            });
        }).catch(msgError => {
            console.log("Failed to query categories to database: " + msgError);
        });
    }).catch(msgError => {
        console.log("Failed to query articles to database: " + msgError);
    });
});

//Rota para ler artigos
app.get("/:slug",(req, res) => {
    slug = req.params.slug;

    if(slug){   
        Article.findOne({
            where: { slug: slug }
        }).then(article => {
            if(article){
                Category.findAll({
                    raw: true,
                    order: [
                        ['title','ASC']
                    ]
                }).then(categories => {
                    res.render("article",{
                        article,
                        categories,
                        hasSession: sessionFun(req, res)
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
        });
    }else{
        console.log("Failed to query article to database: because slug is not valid");
        res.redirect("/");
    }
});

//Rota para filtrar artigos por categoria
app.get("/category/:slug", (req, res) => {
    const slug = req.params.slug;

    Category.findOne({
        where: { slug: slug },
        include: [{
            model: Article,
            required: true
        }]
    }).then(category => {
        if(category){
            Category.findAll({
                raw: true,
                order: [
                    ['title','ASC']
                ]
            }).then(categories => {
                res.render("index",{
                    category,
                    articles: category.articles,
                    categories,
                    hasSession: sessionFun(req, res)
                });
            }).catch(msgError => {

            });   
        }else{
            console.log("Failed to query category to database: because category does not exists");
            res.redirect("/");
        }
    }).catch(msgError => {
        console.log("Failed to query category to database: " + msgError);
        res.redirect("/");
    });
});

app.listen(port, (msgError) => {
    if(msgError){
        console.log("Failed to create server: " + msgError);
    }else{
        console.log("Server running on port " + port);
    }
});