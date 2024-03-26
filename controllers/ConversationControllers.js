const { Conversation } = require('../models/conversation');

/**
 * Conversation
 */

module.exports.getConversations = async (req, res) => {
    try {
        const conversation = await Conversation.find({ 'participant': req.userId });
        if (!conversation) return res.json({ message: "Conversation not found" });
        res.json(conversation);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports.getConversation = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.json({ message: "Conversation not found" });
        res.json(conversation);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports.setConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        let participant = [req.userId, userId];
        let conversation = await Conversation.findOne({
            'participant._id': { $in: [userId, req.userId] }
        }).populate('participant messages.sender');
        if (conversation) return res.status(200).json(conversation);
        else {
            conversation = await Conversation({
                participant
            });
            await conversation.save().populate('participant');
            res.json(conversation);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
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
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


/**
 * Messages
 */

module.exports.getMessages = (req, res) => {
    const { conversationId } = req.params;

    Conversation.findById(conversationId)
        .populate('participant', 'first_name last_name profile') // populate participant user details
        .populate('messages.sender', '_id') // populate sender user details
        .populate('messages.unread', '_id') // populate unread user details
        .then(conversation => {
            // Return the messages as a response
            const messages = conversation.messages;
            res.json(messages);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

module.exports.setMessage = (req, res) => {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.userId;

    try {
        const files = [];
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Internal server error' });
    }

    Conversation.findById(conversationId)
        .then(conversation => {
            // Create a new message object and add it to the messages array
            const newUser = {
                sender: senderId,
                content,
                links: files,
                unread: conversationId
                // unread: conversation.participant.filter(participantId => participantId != senderId)
            }
            console.log(newUser);
            conversation.messages.push(newUser);

            // Save the updated conversation document
            return conversation.save();
        })
        .then(savedConversation => {
            // Return the updated conversation as a response
            console.log("conversations");
            res.json(savedConversation);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

module.exports.putMessage = (req, res) => {
    const { conversationId, messageId } = req.params;
    const { content } = req.body;

    Conversation.findById(conversationId)
        .then(conversation => {
            // Find the message to update in the messages array
            const message = conversation.messages.find(message => message._id == messageId);

            if (!message) return res.status(404).json({ error: 'Message not found' });
            // Update the content of the message
            message.content = content || message.content;
            // Remove the current user from the unread array of the message
            if (req.userId)
                message.unread = conversation.messages.filter(participantId => participantId != req.userId)

            // Save the updated conversation document
            return conversation.save();
        })
        .then(savedConversation => {
            // Return the updated conversation as a response
            res.json(savedConversation);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

module.exports.deleteMessage = (req, res) => {
    const { conversationId, messageId } = req.params;

    Conversation.findById(conversationId)
        .then(conversation => {
            // Find the index of the message to delete in the messages array
            const messageIndex = conversation.messages.findIndex(message => message._id == messageId);
            if (messageIndex === -1) return res.status(404).json({ error: 'Message not found' });
            // Remove the message from the messages array
            conversation.messages.splice(messageIndex, 1);
            // Save the updated conversation document
            return conversation.save();
        })
        .then(savedConversation => {
            // Return the updated conversation as a response
            res.json(savedConversation);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        });
};


/**
 * Download Message File
 */

module.exports.downloadMessageFile = async (req, res) => {
    const { filename, day, month, year } = req.params;
    const file = path.join(__dirname, `../public/message_files/${year}/${month}/${day}`, filename);
    const conversation = await Conversation.findOne({ _id: conversationId });
    if (!conversation) return res.status(400).json({ message: "Post Not exist" })
    const link = conversation.messages.links.find(element => element.path == `message_files/${year}/${month}/${day}/${filename}`);
    if (!link) return res.status(400).json({ message: "File not exist" });
    res.download(file, link.name, (err) => {
        if (err) {
            return console.log(err);
        }
    });
};