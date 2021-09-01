const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const crypto = require("crypto");


// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res, next){
  const {data: {name, description, price, image_url} = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url
  }
  dishes.push(newDish);
  res.status(201).json({data: newDish })
}
function read(req, res, next){
  res.json( { data: res.locals.dish})
}

function update(req, res, next){
  const { data: {name, description, price, image_url } = {} } = req.body;
  
  res.locals.dish = {
    id: res.locals.dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  }
  
  res.json({ data: res.locals.dish })
} 

function list(req, res, next){
  res.json({ data: dishes})
}

//dishes can not be deleted


//validation

function checkId ( req, res, next){
  const dishId = req.params.dishId
  const foundDish = dishes.find((dish) => dish.id === dishId)
  
  if(foundDish){
    res.locals.dish = foundDish;
    return next()
  }
  
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}`,
  })
}

function checkBody (req, res, next){
  const {data: {name, description, price, image_url} = {} } = req.body;
  let error;
  
  if(!name || name === ""){
    error = "Dish must include a name"
  }
  else if(!description || description === ""){
    error = "Dish must include a description"
  }
  else if (!price){
    error = "Dish must include a price"
  }
  else if (price <=0 || !Number.isInteger(price)){
    error = "Dish must have a price that is an integer greater than 0"
  }
  else if (!image_url || image_url === ""){
    error = "Dish must include a image_url"
  }
  
  if(error){
    return next({
      status: 400,
      message: error,
      
    })
  }
                next()
}
  
function checkRouteMatch (req, res, next){
  const dishId = req.params.dishId
  const {data: {id} = {} } = req.body
  
  if(!id || id === dishId){
    res.locals.dishId = dishId
    return next()
  }
  next({
    status: 400, 
    message: `Dish id does not match route id. Dish ${id}, Route: ${dishId}`
  })
}
module.exports = {
  create: [checkBody, create],
  read: [checkId, read],
  update: [checkId, checkBody, checkRouteMatch, update],
  list,
}












