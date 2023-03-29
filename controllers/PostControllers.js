const { Post } = require('../models/post');
const { User } = require('../models/user');
const path = require('path');

/**
 * Posts
 */

module.exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.userId });

        if (!posts || posts.length === 0) {
            return res.status(200).json({ message: "No posts found" });
        }

        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.getPost = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).send({ message: 'Authentication required' });
        }

        const post = await Post.findOne({ _id: req.params.postId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports.setPost = async (req, res) => {
    const { content } = req.body;
    const files = [];
    try {
        if (req.files) {
            req.files.forEach(element => {
                const str = element.path;
                const arr = str.split("\\");
                const result = arr.slice(1).join("/");

                files.push({
                    extname: path.extname(element.originalname), name: element.originalname, path: result
                });
            });
        }

        let post = new Post({ content, links: files, user: req.userId });
        post = await post.save();
        await User.findByIdAndUpdate(req.userId, { $push: { 'posts': post._id } }, { new: true });
        res.json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.putPost = async (req, res) => {
    const { content } = req.body;
    const { postId } = req.params;
    try {
        let updatedPost = await Post.findByIdAndUpdate(
            { _id: postId, user: req.userId },
            { content },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    try {
        const userId = req.userId;

        const deletedPost = await Post.findByIdAndDelete({ _id: postId, user: req.userId });

        if (!deletedPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: {
                'posts': deletedPost._id
            }
        }, { new: true });

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};


/**
 * Reactions
 */

module.exports.setPostReaction = async (req, res) => {
    const { type } = req.body;
    const { postId } = req.params;
    try {
        let post = await Post.findOne({ _id: postId });
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.reactions.find(reaction => reaction.user == req.userId)) {
            return res.status(400).json({ error: "User has already reacted to this post" });
        }
        post.reactions.push({ type, user: req.userId });
        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.deletePostReaction = async (req, res) => {
    const { postId, reactionId } = req.params;
    try {
        let post = await Post.findOneAndUpdate(
            { _id: postId, "reactions.user": { $eq: req.userId } },
            { $pull: { "reactions": { _id: reactionId } } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.status(200).json({ message: "Reaction deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * Download Post Files
 */

module.exports.downloadPostFile = async (req, res) => {
    const { postId, day, filename, month, year } = req.params;
    const file = path.join(__dirname, `../uploads/${year}/${month}/${day}`, filename);
    const post = await Post.findOne({ _id: postId });
    if (!post) return res.status(400).json({ message: "Post Not exist" })
    const link = post.links.find(element => element.path == `${year}/${month}/${day}/${filename}`);
    if (!link) return res.status(400).json({ message: "File not exist" });
    res.download(file, link.name, (err) => {
        if (err) {
            return console.log(err);
        }
    });
};