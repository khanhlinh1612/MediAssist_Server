const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        title: { type: String },
        summary: { type: String },
        cover: { type: String },
        content: { type: String },
        author: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        slug: { type: String },
    },
    { timestamps: true },
);

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
