const express = require('express');
const path = require('path');
const helmet = require('helmet');
const handlebars = require('express-handlebars');
const app = express();
const route = require('./routes');
const db = require('./config');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 4000;
const corsOptions = {
    origin: ['https://medi-assist-eight.vercel.app', 'http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
};

// Trust the first proxy
app.set('trust proxy', 1);
app.enable('trust proxy');
// Connect to DB
db.connect();

// Configure session middleware
app.use(
    session({
        secret: 'your_secret_key', // Replace with your actual secret key
        //   store: new SequelizeStore({
        //     db: db.sequelize,
        //     checkExpirationInterval: 15 * 60 * 1000,
        //     expiration: 15 * 24 * 60 * 60 * 1000,
        //   }),
        resave: false,
        proxy: true,
        saveUninitialized: true,
        cookie: { secure: true, sameSite: 'none' }, // Secure cookie settings
    }),
);

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
app.use('/uploads', express.static(path.join(__dirname, '..', '/uploads')));

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
