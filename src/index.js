const express = require('express');
const path = require('path');
const helmet = require('helmet');
const handlebars = require('express-handlebars');
const app = express();
const route = require('./routes');
const db = require('./config');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 4000;
const corsOptions = {
    origin: ['https://medi-assist-system.vercel.app', 'http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
};

// Trust the first proxy
app.set('trust proxy', 1);
app.enable('trust proxy');
// Connect to DB
db.connect();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
            scriptSrc: ["'self'", 'cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'https:', 'http:', 'data:'],
        },
    }),
);
//Config Static File
app.use(express.static(path.join(__dirname, 'public')));

//Process data from the submitted form
app.use(
    express.urlencoded({
        extended: true,
    }),
);
//Handle data from the JavaScript library sent up
app.use(express.json());

//template engine
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
    }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

//Routes init
route(app);

app.listen(port, () =>
    console.log(`Listening on port http://localhost:${port}`),
);
