# Project Pizzeria

Project Pizzeria is a web application that simulates a pizza ordering and reservation system. It is built using JavaScript, HTML, and CSS.

## Classes

The application is structured around several key classes:

### Product

Represents a product, such as a pizza, with properties for id, name, price, and ingredients. It also has methods for rendering the product in the UI and handling user actions like adding to the cart.

### Cart

Represents a shopping cart, with properties for the DOM element and the array of CartProduct instances. It has methods for adding products, updating the total price, and submitting the order.

### Booking

Represents a booking, with properties for the DOM element, the booking details, and the array of Booking instances. It has methods for making a reservation, rendering it in the UI, and handling user actions like selecting a table.

### HomePage

Represents the home page, with properties for the DOM element and methods for rendering the page in the UI.

## Endpoints

The application communicates with a server to retrieve and update data. Here are the key endpoints:

- **GET /api/db**: Retrieves the entire database, including the list of products and bookings.
- **POST /api/:subpage**: Sends a new order or booking to the server. The `:subpage` parameter can be either `order` or `booking`.

Please refer to the [Project Pizzeria API Documentation](#project-pizzeria-api-documentation) for more details on the endpoints and how to use them.

## Project Pizzeria API Documentation

### app.js

#### Methods

- `activatePage(pageId: string)`: Activates the page with the given `pageId`. It adds the "active" class to the matching page and link, and removes it from all others.

### Product.js

#### Properties

- `id: string`: The unique identifier for the product.
- `name: string`: The name of the product.
- `price: number`: The price of the product.
- `ingredients: array`: The ingredients of the product.

#### Methods

- `renderInUI()`: Renders the product in the user interface.

### Cart.js

#### Properties

- `domElement: object`: The DOM element representing the cart.
- `products: array`: An array of CartProduct instances representing the products in the cart.

#### Methods

- `addProduct(product: object)`: Adds a product to the cart.
- `updateTotalPrice()`: Updates the total price of the cart.
- `submitOrder()`: Submits the order.

### Booking.js

#### Properties

- `domElement: object`: The DOM element representing the booking.
- `bookingDetails: object`: The details of the booking.
- `bookings: array`: An array of Booking instances representing all bookings.

#### Methods

- `makeReservation()`: Makes a reservation.
- `renderInUI()`: Renders the booking in the user interface.

### HomePage.js

#### Properties

- `domElement: object`: The DOM element representing the home page.

#### Methods

- `renderInUI()`: Renders the home page in the user interface.

[Link to Project Pizzeria](https://project-pizzeria-CezaryJan.replit.app)

**Version 2.4**