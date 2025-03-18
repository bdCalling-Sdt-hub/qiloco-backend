  ## Welcome! 👋

Thanks for exploring the **Bike Shop Management API**. This project is a feature-rich backend service for managing bikes, orders, and inventory in a bike shop.

This API ensures efficient product management, order placement, and revenue tracking with robust error handling and validation.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Validation and Error Handling](#validation-and-error-handling)
7. [Additional Resources](#additional-resources)

---

## Overview

### About the Project

The **Bike Shop Management API** provides a backend for managing bikes, orders, and inventory. It integrates inventory control and revenue tracking through the use of MongoDB aggregation pipelines.

### Key Highlights

- RESTful API design for managing bikes and orders.
- Validation using Zod for robust input checking.
- Detailed error handling with Express error middleware.
- MongoDB aggregation pipeline for real-time revenue calculation.

---

## Features

- **Bike Management**: Add, update, retrieve, and delete bikes from the inventory.
- **Order Management**: Place orders, update inventory, and calculate revenue.
- **Inventory Control**: Auto-update stock levels and availability.
- **Revenue Tracking**: Use MongoDB aggregation to calculate total revenue from orders.
- **Error Handling**: Comprehensive error handling with custom middleware.
- **Validation**: Zod-based validation for input data.

---

## Technologies Used

- **Node.js**: Runtime environment.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM library for MongoDB.
- **TypeScript**: For static typing and cleaner code.
- **Zod**: Schema validation for requests and inputs.

## API Endpoints

### Bike Management

- **POST** `/api/products`: Add a new bike.
- **GET** `/api/products`: Retrieve all bikes with query options.
- **GET** `/api/products/:productId`: Get details of a specific bike.
- **PUT** `/api/products/:productId`: Update bike details.
- **DELETE** `/api/products/:productId`: Delete a bike.

### Order Management

- **POST** `/api/orders`: Place an order.
- **GET** `/api/orders/revenue`: Get total revenue from all orders.

### **Setup Instructions**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rakiburrahman307/assignment-2-l2.git
   ```

---

- Install Dependencies
  npm install

## Validation and Error Handling

- **Validation**: Zod is used to validate request bodies for creating orders and bikes.
- **Error Handling**: Custom middleware ensures all errors are handled uniformly.

Example error response:

```json
{
  "message": "Validation error",
  "success": false,
  "error": {
    "path": ["email"],
    "message": "Invalid email address"
  }
}
```

## Future Enhancements

- Add user authentication and authorization.
- Implement additional analytics for orders and revenue.
- Integrate with a frontend for seamless UI interaction.

---

Thank you for using the **Bike Shop Management API**! 🚴‍♂️
