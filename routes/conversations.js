const router = require('express').Router();
const { Conversation } = require('../models/conversation');

/**
 * Conversation
 */

router.get('/', async (req, res) => {
  try {
    const conversation = await Conversation.find({ 'participant': req.userId });
    if (!conversation) return res.json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', async (req, res) => {
  try {
    const io = req.io;
    console.log('post')
    const { userId } = req.body;
    console.log("req.body: ");
    console.log(req.body);
    let participant = [req.userId, userId];
    const conversation = await Conversation({
      participant
    });
    await conversation.save();
    res.json(conversation);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


router.delete('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: 'Conversation not found' });
    // Remove the conversation from the database
    await conversation.remove();
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});




/**
 * Messages
 */

router.get('/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;

  Conversation.findById(conversationId)
    .populate('participant', 'firstName lastName') // populate participant user details
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
});

router.post('/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;
  const io = req.io;
  // const { senderId, content } = req.body;
  const { content } = req.body;
  const senderId = req.userId;
  Conversation.findById(conversationId)
    .then(conversation => {
      // Create a new message object and add it to the messages array
      const newUser = {
        sender: senderId,
        content: content,
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
});

router.put('/:conversationId/messages/:messageId', (req, res) => {
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
      // io.of("/chat").to(conversationId).emit('receive', content);
      res.json(savedConversation);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.delete('/:conversationId/messages/:messageId', (req, res) => {
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
});

module.exports = router;