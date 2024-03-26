const router = require('express').Router();
const { Admin, validateAdmin } = require('../models/admin');
const { Conversation } = require('../models/conversation');
const { Post } = require('../models/post');
const { User } = require('../models/user');
const { post } = require('../routes/admin');

/**
 * Admin
 */

module.exports.addUserAdmin = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const result = validateAdmin({ first_name, last_name, email, password });
        if (result.error) {
            // If there are validation errors, send an error response
            res.status(400).json({ error: result.error.details.map((d) => d.message) });
        } else {
            // If there are no validation errors, create the admin object
            const admin = await Admin.create({ first_name, last_name, email, password });
            res.status(201).json(admin);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

};

module.exports.authAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // If there are no validation errors, create the admin object
        // const admin = await Admin.create({ first_name, last_name, email, password });
        res.status(201).json(admin);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.getUsers = async (req, res) => {
    try {
        const users = await User
            .find()
            .select('_id first_name last_name profile departement');
        if (!users) return res.status(200).send({ message: "No User Found!" });
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports.getUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const users = await User
            .find({ _id: userId })
            .populate('posts');
        if (!users) return res.status(200).send({ message: "No User Found!" });
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// module.exports.getPosts = async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const posts = await Post.find({ user: userId });
//         console.log(posts);
//         if (!posts) return res.status(200).send({ message: "No Post Found!" });
//         res.status(200).json(posts);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
module.exports.getPost = async (req, res) => {
    const { userId, postId } = req.params;
    try {
        const post = await Post.findOne({ _id: postId, user: userId });
        if (!post) return res.status(200).send({ message: "This Post Not Found!" });
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports.getConversations = async (req, res) => {
    const { userId } = req.params;
    try {
        const conversations = await Conversation.find({ user: userId });
        if (!conversations) return res.status(200).send({ message: "No Conversation Found!" });
        res.status(200).json(conversations);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports.getConversation = async (req, res) => {
    const { userId, conversationId } = req.params;
    try {
        const conversation = await Conversation.find({ _id: conversationId, 'user._id': userId });
        if (!conversation) return res.status(200).send({ message: "This Conversation Not Found!" });
        res.status(200).json(conversation);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports.putUser = (req, res) => {
    const { userId } = req.params;
    const { first_name, last_name, email, date_birth, state, cin, cne, password } = req.body;

    const updates = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;
    if (date_birth) updates.date_birth = date_birth;
    if (state) updates.state = state;
    if (cin) updates.cin = cin;
    if (cne) updates.cne = cne;
    if (password) updates.password = password;

    User.findOneAndUpdate(
        { _id: userId },
        { $set: updates },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error updating user' });
            }
            if (!updatedUser) {
                return res.status(404).send({ message: 'User not found' });
            }
            // Populate 'posts' field in the updatedUser object
            updatedUser.populate('posts', (err, populatedUser) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ message: 'Error populating posts' });
                }
                // Send the response with the populated 'posts' field
                res.status(200).json(populatedUser);
            });
        }
    );
};

module.exports.putPost = async (req, res) => {
    const { userId, postId } = req.params;
    const { state } = req.body;
    try {
        let updatedPost = await Post.findByIdAndUpdate(
            { _id: postId, user: userId },
            { state },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports.deleteUser = (req, res) => {
    const { userId } = req.params;
    try {
        User.findOneAndDelete({ _id: userId }, (err, deletedUser) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error deleting user' });
            }
            if (!deletedUser) return res.status(404).send({ message: 'User not found' });

            try {
                Post.deleteMany({ user: userId });
                Conversation.deleteMany({ user: userId });
            } catch (error) {
                console.log(error);
                res.status(500).json({ error: 'Internal server error' });
            }
            res.send({ message: "User deleted succesfully!" });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports.deletePost = async (req, res) => {
    const { userId, postId } = req.params;
    try {
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
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports.deleteConversation = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
            return res.status(404).json({ message: 'Conversation not found' });
        // Remove the conversation from the database
        await conversation.remove();
        res.json({ message: 'Conversation deleted succesfully!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
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
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports.deleteSubComment = async (req, res) => {
    const { postId, commentId, subCommentId } = req.params;
    try {
        const post = await Post.findByIdAndUpdate(
            { '_id': postId },
            { $pull: { 'comments.$[comment].subComments': { _id: subCommentId } } },
            {
                arrayFilters: [
                    { 'comment._id': commentId }
                ],
                new: true
            }
        );

        return res.status(200).json({ message: "SubComment deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
