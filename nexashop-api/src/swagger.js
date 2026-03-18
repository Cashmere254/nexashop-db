// src/swagger.js

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'NexaShop API',
      version:     '1.0.0',
      description: 'RESTful API for the NexaShop e-commerce platform',
      contact:     { name: 'NexaShop Dev Team' }
    },
    servers: [
      { url: 'http://localhost:3000',      description: 'Local development' },
      { url: 'http://YOUR_ORACLE_IP:3000', description: 'Oracle Cloud (production)' }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            product_id:  { type: 'integer' },
            name:        { type: 'string'  },
            description: { type: 'string'  },
            price:       { type: 'number'  },
            stock_qty:   { type: 'integer' },
            category_id: { type: 'integer' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
});

module.exports = { swaggerUi, swaggerSpec };