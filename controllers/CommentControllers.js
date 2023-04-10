const { Post } = require('../models/post');

/**
 * Comments
 */

module.exports.getComments = async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comments = post.comments;
        if (!comments) {
            return res.status(404).json({ error: "Comment not found" });
        }
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.getComment = async (req, res) => {
    const { postId, commentId } = req.params;
    try {
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        return res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.setComment = async (req, res) => {
    const { content, userId } = req.body;
    const { postId } = req.params;
    try {
        let post = await Post.findByIdAndUpdate(
            postId,
            { $push: { 'comments': { content, user: userId } } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.status(201).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.putComment = async (req, res) => {
    const { content } = req.body;
    const { postId, commentId } = req.params;
    try {
        let updatedComment = await Post.findOneAndUpdate(
            {
                _id: postId,
                "comments._id": commentId
            },
            { $set: { "comments.$[comments].content": content } },
            { new: true, arrayFilters: [{ "comments._id": commentId }] }
        );

        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        return res.status(200).json(updatedComment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    try {
        let post = await Post.findOneAndUpdate(
            { "_id": postId },
            { $pull: { "comments": { "_id": commentId } } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * Reactions
 */

module.exports.setCommentReaction = async (req, res) => {
    const { type } = req.body;
    const { postId, commentId } = req.params;
    try {
        let post = await Post.findOne({ _id: postId });
        if (!post) return res.status(404).json({ error: "Post not found" });
        const comment = post.comments.find(element => element._id == commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (comment.reactions.find(reaction => reaction.user == req.userId)) {
            return res.status(400).json({ error: "User has already reacted to this Comment" });
        }
        comment.reactions.push({ type, user: req.userId });
        await post.save();
        return res.status(201).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports.deleteCommentReaction = async (req, res) => {
    const { postId, commentId, reactionId } = req.params;
    try {
        let post = await Post.findOneAndUpdate(
            {
                _id: postId,
                "comments._id": commentId,
                "comments.$[comments].reactions._id": { $eq: req.userId } // Check if "id" value doesn't exist in the reactions array
            },
            { $pull: { "comments.$[comment].reactions": { _id: reactionId } } },
            { new: true, arrayFilters: [{ "comment._id": commentId }] }
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