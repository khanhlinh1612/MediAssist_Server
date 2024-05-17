const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const app = express();
const route = require('./routes');
const db = require('./config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 4000;
const corsOptions = {
    origin: ['https://medi-assist-eight.vercel.app', 'http://localhost:3000'], // Thay đổi thành nguồn gốc của ứng dụng frontend của bạn
    credentials: true, // Cho phép sử dụng cookie và xác thực HTTP
};

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
app.use('/uploads', express.static(path.join(__dirname, '..', '/uploads')));

//HTTP logger
// app.use(morgan('combined'));

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
