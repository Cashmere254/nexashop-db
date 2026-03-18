// src/index.js | NexaShop API entry point

const express                      = require('express');
const { swaggerUi, swaggerSpec }   = require('./swagger');
const productsRouter               = require('./routes/products');
const customersRouter              = require('./routes/customers');
const ordersRouter                 = require('./routes/orders');
const reportsRouter                = require('./routes/reports');

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/products',  productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders',    ordersRouter);
app.use('/api/reports',   reportsRouter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NexaShop API running on port ${PORT}`));