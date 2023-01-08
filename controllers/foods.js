const express = require('express')
const db = require('../models')
const router = express.Router()
const axios = require('axios');

router.get('/', async (req, res)=>{
    let foods = []
    res.render('foods/home.ejs', {foods})
})

// router.get('/search', async (req, res)=>{
//     res.redirect("/foods/search")
// })

router.get('/recipes', async (req, res)=>{

    try {
        // const allFoods = await db.food.findAll()
        let allFoods = await res.locals.user.getFood()
        res.render('foods/recipes.ejs', {allFoods: allFoods})
      } catch(err) {
        res.send(err)
      }

    // try {
    //     const user = await db.user.findOne({
    //         where: {
    //             id: res.locals.user.id
    //         },
    //         include: [db.food]
    //     })
    //     console.log("This is user output: " + user)
    //     res.render('foods/recipes.ejs')
    // }
    // catch(err) {
    //     res.send(err)
    // }

    // res.render('foods/recipes.ejs')
})

router.get('/search', async (req, res)=>{
    console.log(req.params)

    axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.query.q}&app_id=10f33fbc&app_key=43f9be24513291624d49476ed4d0dd73`)
    // APICall(req.query.q)
    .then(apiResponse=>{
        let foods = apiResponse.data.hits
        // console.log(foods)
        // res.render('foods/recipes.ejs', {foods})
        res.render('foods/home.ejs', {foods})
        // res.json(foods[0].recipe.label)
    })
    .catch(err => {
        res.send(err)
    })
})

router.post('/recipes', async (req, res)=>{
    let user = res.locals.user
    // let user = await db.user.findByPk(res.locals.user.id)

    // let [food, created] = await db.food.findOrCreate({
    //     where: {name:'test'}
    // })
    // console.log(food)
    // res.json(food)

    try {

        const apiResponse = await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.body.name}&app_id=10f33fbc&app_key=43f9be24513291624d49476ed4d0dd73`)
        // APICall(req.body.name)
        // res.json(apiResponse.data.hits[0].recipe)
        let foodData = apiResponse.data.hits[0]
        let [newFood, created] = await db.food.findOrCreate({
            where: {
                // name: req.body.name
                name: foodData.recipe.label,
                recipe: foodData.recipe.ingredientLines.toString(),
                calories: foodData.recipe.calories,
                image: foodData.recipe.image
            }
            })
        await user.addFood(newFood)
        let food = await db.food.findByPk(newFood.id)
        res.redirect('/foods/recipes')
    } catch(err) {
        console.log(err)
        res.send(err)
    }

})

router.delete("/recipes/:name", (req, res)=>{
    console.log("This is my req params object: ", req.params.name)

    try {
        const foodDeleted = db.food.destroy({
            where: {
                name: req.params.name
            }
        })
        console.log("Rows deleted num: ", foodDeleted)
    } catch (err) {
        console.log(err)
    }


    res.redirect("/foods/recipes")
})

router.get('/:name', async (req, res)=>{
    console.log(req.params)

    axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.params.name}&app_id=10f33fbc&app_key=43f9be24513291624d49476ed4d0dd73`)
    // APICall(req.params.name)
    .then(apiResponse=>{
        let food = apiResponse.data.hits[0]
        // console.log(food)
        res.render('foods/index.ejs', {food})
        // res.render('home.ejs', {foods: [foods]})
        // res.json(foods[0].recipe.label)
    })
    .catch(err => {
        res.send(err)
    })
})

// const APICall = (query) => {
//     axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=10f33fbc&app_key=43f9be24513291624d49476ed4d0dd73`)
// }

module.exports = router