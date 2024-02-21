const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const app = express();
const route = require('./routes');
const port = 3000;

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
            scriptSrc: ["'self'", 'cdn.jsdelivr.net'],
        },
    }),
);
//Config Static File
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

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
app.set('views', path.join(__dirname, 'resources\\views'));
console.log('PATH:', path.join(__dirname, 'resources\\views'));

route(app);
app.get('/', (req, res) => {
    return res.render('home');
});
app.get('/news', (req, res) => {
    return res.render('news');
});
app.get('/search', (req, res) => {
    return res.render('search');
});
app.post('/search', (req, res) => {
    console.log(req.body);
    res.send('');
});

app.listen(port, () =>
    console.log(`Listening on port http://localhost: ${port}`),
);
