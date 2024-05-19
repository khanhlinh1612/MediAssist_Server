const Post = require('../models/Post');
const Doctor = require('../models/Doctor');
const fs = require('fs'); // import filesystem to rename files
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;
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
                res.json(posts);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    // [POST] /posts : create a new post
    async create(req, res, next) {
        try {
            // Rename the uploaded file
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            const newpath = `${path}.${ext}`;
            fs.renameSync(path, newpath);

            // Get ID of author from token
            const { token } = req.cookies;
            let user_id = '';

            console.log('This is token', token);
            if (token) {
                try {
                    const info = await jwt.verify(token, secret);
                    console.log('This is info', info);

                    const infoAuthor = await Doctor.findOne({
                        phone_number: info.phone_number,
                    });

                    if (!infoAuthor) {
                        return res.status(401).json({ error: 'Unauthorized' });
                    }

                    console.log('User', infoAuthor);
                    user_id = infoAuthor._id;
                } catch (err) {
                    console.error('Error verifying token:', err);
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            } else {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Ensure user_id is valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Create the post
            const { title, summary, content } = req.body;
            const postDoc = await Post.create({
                title,
                summary,
                cover: newpath,
                content,
                author: user_id,
            });

            res.json(postDoc);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    //  [GET] /posts/:id :get a specific post
    show(req, res, next) {
        // Post.findOne({ slug: req.params.slug }
        Post.findById(req.params.id)
            .populate('author', ['first_name', 'last_name'])
            .then((post) => {
                res.json(post);
            })
            .catch(next);
    }

    // [PUT] /posts/:slug : update a specific post
    update(req, res, next) {
        let newPath = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fs.renameSync(path, newPath);
        }

        // Get ID of author
        const { token } = req.cookies;
        if (token !== undefined && token !== '') {
            jwt.verify(token, secret, {}, async (err, userInfo) => {
                if (err) {
                    console.error('Error verifying token:', err);
                    return res.status(401).json({ error: 'Unauthorized' });
                } else {
                    const { id, title, summary, content } = req.body;
                    const postDoc = await Post.findById(id);
                    const doctorInfo = await Doctor.findOne({
                        phone_number: userInfo.phone_number,
                    });
                    const isAuthor =
                        JSON.stringify(doctorInfo._id) ==
                        JSON.stringify(postDoc.author);
                    console.log(userInfo);
                    if (!isAuthor) {
                        return res
                            .status(400)
                            .json('You are not the author of this');
                    }
                    await Post.findByIdAndUpdate(id, {
                        title,
                        summary,
                        content,
                        cover: newPath ? newPath : postDoc.cover,
                    });
                    res.json(postDoc);
                }
            });
        }
    }

    // [DELETE] /posts/:slug :delete a specific post
    delete(req, res, next) {
        const postId = req.params.id; // Extract the post ID from request parameters
        Post.findByIdAndDelete(postId) // Find and delete the post by its ID
            .then((deletedPost) => {
                if (!deletedPost) {
                    // If no post is found with the provided ID
                    return res.status(404).json({ error: 'Post not found' });
                }
                // If the post is successfully deleted
                res.json({ message: 'Post deleted successfully' });
            })
            .catch((error) => {
                console.error('Error deleting post:', error);
                res.status(500).json({ error: 'Internal Server Error' }); // Handle other errors
            });
    }
}

module.exports = new PostsController();
