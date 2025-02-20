const express = require('express');
const multer = require('multer');
const cors = require('cors'); // Keep CORS for local development

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes (or configure more specifically)

const upload = multer({ dest: '/tmp' }); // Use /tmp for serverless functions

app.post('/upload', upload.single('zipfile'), (req, res) => {
    console.log("Upload route hit!"); // Check Vercel logs for this message

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log("File uploaded:", req.file); // Check file info in logs

    try {
      // For the minimal server, just send back the file information
      res.json({ message: "File uploaded successfully", file: req.file });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    } finally {
        if (req.file) {
          fs.unlinkSync(req.file.path); // Delete the file after processing
        }
    }

});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});