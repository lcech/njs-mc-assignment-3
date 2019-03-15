# NodeJS Master Class Homework Assignment #3
Third assignment for the NodeJS Master Class Course (https://pirple.thinkific.com/courses/take/the-nodejs-master-class/)

## Assignment #3

### How to Turn It In:

1. Create a public github repo for this assignment. 
2. Create a new post in the Facebook Group  and note "Homework Assignment #3" at the top.
3. In that thread, discuss what you have built, and include the link to your Github repo. 

### The Assignment:

It is time to build a simple frontend for the Pizza-Delivery API you created in Homework Assignment #2. Please create a web app that allows customers to:

1. Signup on the site
2. View all the items available to order
3. Fill up a shopping cart
4. Place an order (with fake credit card credentials), and receive an email receipt

This is an open-ended assignment. You can take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 

### Solution

Pizza Delivery API build without NPM

#### Usage

* **Setup**
  * cofigure your app with the particular credentials - you can rename `lib/config.sample.js` to `lib/config.js`
    * Stripe (`apiKey`)
    * Mailgun (`baseUrl`, `domain`, `apiKey`, `from`)

* **Production** mode
  * run `npm start` to start the server
  * run `npm run start:debug` to start the app in debug mode

#### UI Documentation

##### Homepage & Menu

* `/pizzas/all`

##### Account Pages

* Ability to Sign up: `/account/create`
* Ability to Sign in: `/session/create`
* Ability to Edit Account: `/account/edit`
* Logged out: `/session/deleted`
* Deleted Account: `/account/deleted`

##### Cart Page

* View cart and update amounts of items via + / - buttons, erase cart, make order: `/cart/view`

#### API Documentation (Assignment #2)

##### Users

* Create user: `POST /users`
* Read user: `GET /users` (`email` in request body and valid `token` in headers required)
* Update user: `PUT /users` (`email` and one of `firstName`, `lastName`, `password`, `streetAddress` in request body and valid `token` in headers required)
* Delete user: `DELETE /users` (`email` in request body and valid `token` in headers required)

##### Tokens

* Create user: `POST /tokens`
* Read user: `GET /tokens` (correct `email` and `password` combination in request body required)
* Update user: `PUT /tokens` (`id` in request body required, TODO: verification)
* Delete user: `DELETE /tokens` (`id` in request body required, TODO: verification)

##### Products

* Read products: `GET /products` (valid `token` in headers required)

##### Carts

* Add to cart: `POST /carts` (`productId` in request body required, `items` in request body optional - defaults to 1, and valid `token` in headers required)
* Read cart: `GET /carts` (valid `token` in headers required)
* Delete cart: `DELETE /carts` (valid `token` in headers required)

##### Orders

* Place an order, make Stripe payment, notify success via Mailgun: `POST /orders` (valid `token` in headers required, TODO: credit card validation)
