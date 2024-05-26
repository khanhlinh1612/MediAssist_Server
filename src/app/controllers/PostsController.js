const Post = require('../models/Post');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const secret = process.env.JWT_SECRET;

class PostsController {
    // [GET] /posts : Get all posts
    async index(req, res) {
        try {
            const posts = await Post.find()
                .populate('author', ['first_name', 'last_name'])
                .sort({ createdAt: 'desc' })
                .limit(10);
            res.json(posts);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // [POST] /posts : create a new post
    async create(req, res) {
        try {
            const { token } = req.cookies;
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            let user_id = '';
            try {
                const info = await jwt.verify(token, secret);
                const infoAuthor = await Doctor.findOne({
                    phone_number: info.phone_number,
                });

                if (!infoAuthor) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }

                user_id = infoAuthor._id;
            } catch (err) {
                console.error('Error verifying token:', err);
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            const { title, summary, content } = req.body;
            const cover = req.file.path; // Lấy URL của ảnh từ Cloudinary

            const postDoc = await Post.create({
                title,
                summary,
                cover,
                content,
                author: user_id,
            });

            res.json(postDoc);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // [GET] /posts/:id : get a specific post
    async show(req, res) {
        try {
            const post = await Post.findById(req.params.id).populate('author', [
                'first_name',
                'last_name',
            ]);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // [PUT] /posts/:id : update a specific post
    async update(req, res) {
        try {
            let newPath = null;
            if (req.file) {
                newPath = req.file.path; // Lấy URL của ảnh từ Cloudinary
            }

            const { token } = req.cookies;
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            let userInfo;
            try {
                userInfo = await jwt.verify(token, secret);
            } catch (err) {
                console.error('Error verifying token:', err);
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const postDoc = await Post.findById(req.params.id);
            if (!postDoc) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const doctorInfo = await Doctor.findOne({
                phone_number: userInfo.phone_number,
            });
            const isAuthor =
                JSON.stringify(doctorInfo._id) ===
                JSON.stringify(postDoc.author);

            if (!isAuthor) {
                return res
                    .status(403)
                    .json({ error: 'You are not the author of this post' });
            }

            const { title, summary, content } = req.body;
            postDoc.title = title;
            postDoc.summary = summary;
            postDoc.content = content;
            if (newPath) {
                postDoc.cover = newPath;
            }

            await postDoc.save();
            res.json(postDoc);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // [DELETE] /posts/:id : delete a specific post
    async delete(req, res) {
        try {
            const postId = req.params.id;
            const deletedPost = await Post.findByIdAndDelete(postId);
            if (!deletedPost) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ message: 'Post deleted successfully' });
        } catch (err) {
            console.error('Error deleting post:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new PostsController();
