const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Server Crashed...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Server Crashed...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
