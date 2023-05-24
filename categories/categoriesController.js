const express = require("express");
const router = express.Router();
const Category = require("./Category");
const slugify = require("slugify");

//Rota para criar categoria
router.get("/admin/categories/new", (req,res) => {
    res.render("admin/categories/new");
});

//Rota em que a categoria será salva
router.post("/categories/save",(req,res) => {
    const { title } = req.body;

    Category.create({
        title: title,
        slug: slugify(title)
    }).then(() => {
        res.redirect("/admin/categories");
    }).catch((msgError) => {
        console.log("Failed to save category to database: " + msgError);
        res.redirect("/admin/categories/new");
    });
});

//Rota que listará as categorias
router.get("/admin/categories", (req, res) => {
    
    Category.findAll({
        raw: true,
        order: [
            ['id','ASC']
        ]
    }).then(categories => {
        res.render("admin/categories/index",{
            categories
        });
    }).catch(msgError => {
        console.log("Failed to view category to database: " + msgError);
        res.redirect("/");
    })
});

//Rota que irá deletar a categoria
router.post("/categories/delete", (req, res) => {
    const { id } = req.body;

    if(id && !isNaN(id)){
        Category.destroy({
            where: {id: id}
        }).then(() => {
            res.redirect("/admin/categories");
        }).catch((msgError) => {
            console.log("Failed to delete category to database: " + msgError);
            res.redirect("/admin/categories");
        });
    }else{
        console.log("Failed to delete category to database: because id is not valid");
    }
});

//Rota para editar categoria
router.get("/admin/categories/edit/:id", (req,res) => {
    const { id } = req.params;

    if(id && !isNaN(id)){
        Category.findByPk(
                id
            ).then(category => {
            if(category){
                res.render("admin/categories/edit",{
                    category
                });
            }else{
                console.log("Failed to edit category: because id is not found");
                res.redirect("/");
            }
        }).catch(msgError => {
            console.log("Failed to edit category: " + msgError);
            res.redirect("/");
        })
    }else{
        console.log("Failed to edit category: because id is not valid");
        res.redirect("/");
    }
});

//Rota para atualizar a categoria
router.post("/categories/update",(req,res) => {
    const { id, title } = req.body;

    if(id && !isNaN(id)){
        Category.update({
            title: title,
            slug: slugify(title)
        }, 
        {
            where: { id: id }
        }).then(() => {
            res.redirect("/admin/categories");
        }).catch((msgError) => {
            console.log("Failed to update category: " + msgError);
            res.redirect("/categories/update");
        });
    }else{
        console.log("Failed to update category: because id is not valid");
        res.redirect("/categories/update");
    }
});

module.exports = router;