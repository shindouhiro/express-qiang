// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const db = require('./config/database');
const errorHandler = require('./middlewares/error');

const userRoutes = require('./routes/user.routes');
const shopRoutes = require('./routes/shop.routes');
const orderRoutes = require('./routes/order.routes');
const healthRoutes = require('./routes/health.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', healthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/shops', shopRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Only start the server if this file is run directly
if (require.main === module) {
  // Connect to database before starting server
  db.getConnection()
    .then(() => {
      console.log('Database connected successfully');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      });
    })
    .catch(err => {
      console.error('Error connecting to the database:', err);
      process.exit(1);
    });
}

module.exports = app;
