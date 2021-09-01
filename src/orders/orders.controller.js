const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req, res, next){
 const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body;
  
 const newOrder = {
   id: nextId(),
   deliverTo: deliverTo,
   mobileNumber: mobileNumber,
   status: status ? status : "pending",
   dishes: dishes,
 }
 
 orders.push(newOrder);
  
 res.status(201).json({data: newOrder })
}

function read(req, res, next){
  res.json({ data: res.locals.order})
}

function update(req, res, next){
  const {data: {deliverTo, mobileNumber, dishes, status} = {} } = req.body
  
  res.locals.order = {
    id: res.locals.order.id,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    status: status,
  }
  
  res.json({ data: res.locals.order })
}

function destroy(req, res, next){
  const index = orders.indexOf(res.locals.order)
  orders.splice(index, 1)
  
  res.sendStatus(204)
}

function list(req, res, next){
  res.json({data: orders})
}

///////////////////////Validation/////////////////////////////////////

function checkOrder(req, res, next){
  const {data: {deliverTo, mobileNumber, dishes} = {} } = req.body
  
  let error;
  
  if(!deliverTo || deliverTo === ""){
    error = "Order must include a deliverTo"
  }
  else if(!mobileNumber || mobileNumber === ""){
    error = "Order must include a mobileNumber"
  }
  else if(!dishes){
    error = "Order must include a dish"
  }
  else if(!Array.isArray(dishes) || dishes.length === 0){
    error = "Order must include at least one dish"
  }
  else {
    for (let index = 0; index < dishes.length; index++){
      if(!dishes[index].quantity || dishes[index].quantity <= 0 || !Number.isInteger(dishes[index].quantity))
        error = `Dish ${index} must have a quantity that is an integer greater than 0`
    }
  }
    if(error){
      return next({
        status: 400,
        message: error,
      })
    }
  
  next();
}

function checkId(req, res, next){
  const orderId = req.params.orderId
  const foundOrder = orders.find((order) => order.id === orderId)
  
  if(foundOrder){
    res.locals.order = foundOrder;
    return next();
  }
  
  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  })
}

function checkStatus(req, res, next){
  const {orderId} = req.params
  const {data: {id, status} = {} } = req.body
  
  let error;
  if(id && id !== orderId){
    error = `Order id does not match route id. Order: ${id}, Route: ${orderId}`
  }
  else if(!status || status === "" || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery")){
    error = "Order must have a status of pending, preparing, out-for-delivery, delivered"
  }
  else if( status === "delivered"){
    error: "A delivered order cannot be changed"
  }
  
  if(error){
    return next({
      status: 400,
      message: error,
    })
  }
  next();
}

function checkDelete(req, res, next){
  if(res.locals.order.status !== "pending"){
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
      
    })
  }
  next()
}

module.exports = {
  create: [checkOrder, create],
  read: [checkId, read],
  update: [checkOrder, checkId, checkStatus, update],
  delete: [checkId, checkDelete, destroy],
  list,
}