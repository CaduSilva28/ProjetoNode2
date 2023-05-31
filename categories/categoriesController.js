const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const Category = require("./Category");
const adminAuth = require("../middlewares/adminAuth");

//Rota para listar categorias
router.get("/admin/categories/new", (req, res) => {
    res.render("admin/categories/new");
});

//Rota para salvar categoria no banco de dados
router.post("/categories/save", adminAuth, (req, res) => {
    const { title } = req.body;

    Category.findOne({
        where: {title: title}
    }).then(category => {
        if(!category){
            Category.create({
                title: title,
                slug: slugify(title)
            }).then(() => {
                res.redirect("/");
            }).catch((msgError) => {
                console.log("Failed to save category to database: " + msgError);
                res.redirect("/admin/categories/new");
            });
        }else{
            console.log("Failed to create category to database: because category already esxists");
            res.render("admin/categories/new",{
                deExists: true
            });
        }
    }).catch(msgError => {
        console.log("Failed to query category to database: " + msgError);
        res.redirect("/admin/categories/new");
    });
});

//Rota que irá listar as categorias
router.get("/admin/categories", adminAuth, (req, res) => {
    
    Category.findAll({
        raw: true,
        order: [
            ['id','DESC']
        ]
    }).then(categories => {
        res.render("admin/categories/index",{
            categories
        })
    }).catch(msgError => {
        console.log("Failed to query categories to database: " + msgError);
    });
});

//Rota que irá deletar a categoria
router.post("/categories/delete", adminAuth, (req, res) => {
    const { id } = req.body;
    
    if(id && !isNaN(id)){
        Category.destroy({
            where: {id: id}
        }).then(() => {
            res.redirect("/admin/categories");
        }).catch(msgError => {
            console.log("Failed to delete category to database: " + msgError);
            res.redirect("/admin/categories");
        });
    }else{
        console.log("Failed to delete category to database: because id is not valid");
        res.redirect("/admin/categories");
    }
});

//Rota para editar categoria
router.get("/admin/categories/edit/:id", adminAuth, (req, res) => {
    const { id } = req.params;

    if(id && !isNaN(id)){
        Category.findOne({
            raw: true,
            where: {id: id}
        }).then(category => {
            if(category){
                res.render("admin/categories/edit",{
                    category
                })
            }else{
                console.log("Failed to query category to database: because category is not found");
                res.redirect("/");
            }
        }).catch(msgError => {
            console.log("Failed to query category: " + msgError);
            res.redirect("/");
        });
    }else{
        console.log("Failed to query category: because id is not valid");
        res.redirect("/");
    }
});

router.post("/categories/update", adminAuth, (req, res) => {
    const { id, title } = req.body;

    Category.update({
        title: title,
        slug: slugify(title)
    },
    {
        where: { id: id}
    }).then(() => {
        res.redirect("/admin/categories");
    }).catch((msgError) => {
        console.log("Failed to update category to database: " + msgError);
        res.redirect("/admin/categories/edit/" + id);
    });
});
module.exports = router;