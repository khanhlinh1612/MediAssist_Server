const express = require('express');
const helmet = require('helmet');

const app = express();
const port = 3000;
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "https://apis.google.com"],
      objectSrc: ["'none'"],
      styleSrc: ["'self'"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"]
    }
  }));

app.get('/trang-chu', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return res.send('Hello World');
}  );
app.listen(port, () => console.log(`Listening on port http://localhost: ${port}`));
