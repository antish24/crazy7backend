const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
}).then(() => {
  console.log('Database connection successful');
}).catch((error) => {
  console.log('Database connection error:', error.message);
});

module.exports = mongoose.connection;