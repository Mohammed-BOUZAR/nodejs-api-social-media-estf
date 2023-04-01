const router = require('express').Router();
const { getConversations, getConversation, setConversation, deleteConversation, getMessages, setMessage, putMessage, deleteMessage, downloadMessageFile } = require('../controllers/ConversationControllers');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const uploadDir = `public/message_files/${year}/${month}/${day}/`;
  
      // Create the directory if it doesn't exist
      const dir = path.resolve(uploadDir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
  
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      cb(null, timestamp + extension); // set the filename to the current date and time with the original extension
    }
  });
  const upload = multer({
    storage,
    limits: { fileSize: 75 * 1024 * 1024 }, // set the maximum file size to 75 MB
  
  });

  
/**
 * Conversation
 */

router.get('/', getConversations);
router.get('/:conversationId', getConversation);
router.post('/', setConversation);
router.delete('/:conversationId', deleteConversation);

/**
 * Messages
 */

router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', upload.array('files'), setMessage);
router.put('/:conversationId/messages/:messageId', putMessage);
router.delete('/:conversationId/messages/:messageId', deleteMessage);

/**
 * Download Message Files
 */

router.get('/message_files/:year/:month/:day/:filename', downloadMessageFile);

module.exports = router;