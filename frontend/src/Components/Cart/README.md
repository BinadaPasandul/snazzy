# Cart Component

This cart component provides a complete shopping cart functionality for the e-commerce application, designed with a Nike-style UI that matches the existing design system.

## Features

- **Add to Cart**: Products can be added to cart from the product detail page
- **Cart Management**: View, update quantities, and remove items from cart
- **Persistent Storage**: Cart data is stored in localStorage for persistence across sessions
- **Real-time Updates**: Cart count in navbar updates automatically when items are added/removed
- **Responsive Design**: Fully responsive design that works on all device sizes
- **Checkout Integration**: Seamlessly connects to the existing checkout functionality

## Usage

### Adding Items to Cart
Items are automatically added to cart when users click "Add to Cart" on product detail pages. The cart stores:
- Product information (name, code, price, images)
- Selected variant (size, color)
- Quantity
- Promotion information (if applicable)

### Cart Operations
- **Update Quantity**: Use +/- buttons to adjust item quantities
- **Remove Items**: Click the trash icon to remove individual items
- **Clear Cart**: Use "Clear Cart" button to remove all items
- **Proceed to Checkout**: Navigate to checkout with cart items

### Cart State Management
The cart uses localStorage for persistence and custom events for real-time updates:
- Cart data is automatically saved to localStorage
- Custom `cartUpdated` events are dispatched when cart changes
- Navbar cart count updates automatically

## File Structure

```
Cart/
├── Cart.js          # Main cart component
├── Cart.css         # Cart styling (Nike-style design)
└── README.md        # This documentation
```

## Integration

The cart component is integrated with:
- **ProductDetail.js**: Handles adding items to cart
- **Navbar**: Shows cart icon with item count
- **App.js**: Cart route configuration
- **Checkout**: Receives cart data for order processing

## Styling

The cart uses a modern, Nike-inspired design with:
- Clean, minimalist layout
- Smooth animations and transitions
- Responsive grid system
- Consistent color scheme matching the app theme
- Professional typography and spacing

## Browser Support

- Modern browsers with localStorage support
- Responsive design works on mobile, tablet, and desktop
- Graceful degradation for older browsers

