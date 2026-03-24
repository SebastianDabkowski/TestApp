# Sample Web Application

An example e-commerce web application for browsing and purchasing products.

## Pages

### Home Page
- URL: `/`
- Displays a hero banner with a promotional message
- Shows a grid of featured products
- Has a navigation bar with links to Home, Products, Cart, and Login

### Products Page
- URL: `/products`
- Displays a list of all available products
- Each product card shows: image, name, price, and "Add to Cart" button
- Has a search bar at the top to filter products by name

### Product Detail Page
- URL: `/products/:id`
- Shows full product details: name, description, price, images
- Has an "Add to Cart" button
- Displays customer reviews section

### Cart Page
- URL: `/cart`
- Lists all items added to the cart
- Each item shows: name, quantity, price, and a "Remove" button
- Displays the total price
- Has a "Checkout" button

### Login Page
- URL: `/login`
- Contains email and password input fields
- Has a "Sign In" button
- Has a "Forgot Password?" link
- Shows error message for invalid credentials

## Features

### Product Search
1. User navigates to the Products page
2. User types a search query in the search bar
3. The product list filters in real-time to show matching products
4. If no products match, a "No products found" message is displayed

### Add to Cart
1. User clicks "Add to Cart" on any product
2. A notification appears confirming the item was added
3. The cart icon in the navigation bar updates to show the item count

### User Login
1. User navigates to the Login page
2. User enters their email address
3. User enters their password
4. User clicks "Sign In"
5. On success, user is redirected to the Home page
6. On failure, an error message "Invalid email or password" is displayed

## Expected Behaviors

### Navigation
- Clicking the logo redirects to the Home page
- All navigation links are accessible from every page
- The active page link is highlighted in the navigation bar

### Form Validation
- Login email field requires a valid email format
- Login password field is required
- Empty form submission shows validation errors

### Responsive Design
- The application works on desktop and mobile screen sizes
- The navigation collapses into a hamburger menu on mobile
