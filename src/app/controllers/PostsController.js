const Post = require('../models/Post');
const fs = require('fs'); // import filesystem to rename files
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
const {
    multipleMongooseObjectHandlers,
    singleMongooseObjectHandlers,
} = require('../../util/mongoose');
class PostsController {
    // [GET] /posts : Get all posts
    index(req, res) {
        Post.find()
            .populate('author', ['first_name', 'last_name'])
            .sort({ createdAt: 'desc' })
            .limit(10)
            .then((posts) => {
                posts = multipleMongooseObjectHandlers(posts);
                res.json(posts);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    // [POST] /posts : create a new post
    create(req, res, next) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newpath = path + '.' + ext;
        fs.renameSync(path, newpath);

        // Get ID of author
        const { token } = req.cookies;
        var user_id = '';
        if (token !== undefined && token !== '') {
            jwt.verify(token, secret, {}, (err, info) => {
                if (err) {
                    console.error('Error verifying token:', err);
                    return res.status(401).json({ error: 'Unauthorized' });
                } else {
                    user_id = info.id;
                }
            });
        }

        const { title, summary, content } = req.body;

        Post.create({
            title,
            summary,
            cover: newpath,
            content,
            author: user_id,
        })
            .then((postDoc) => {
                res.json(postDoc);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //  [GET] /posts/:id :get a specific post
    show(req, res, next) {
        // Post.findOne({ slug: req.params.slug })
        Post.findOne({ id: req.params.id })
            .populate('author', ['first_name', 'last_name'])
            .then((post) => {
                res.json(post);
            })
            .catch(next);
    }

    // [PUT] /posts/:slug : update a specific post
    update(req, res, next) {
        return res.json('updated');
    }

    // [DELETE] /posts/:slug :delete a specific post
    delete(req, res, next) {
        return res.json('deleted');
    }
}

module.exports = new PostsController();
