const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs'); // Import the file system module

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const upload = multer({ dest: '/tmp' });

app.post('/upload', upload.single('zipfile'), (req, res) => {
    console.log("Upload route hit!");

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log("File uploaded:", req.file);

    try {
        res.json({ message: "File uploaded successfully", file: req.file });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
                console.log("File deleted:", req.file.path); // Log successful deletion
            } catch (unlinkError) {
                console.error("Error deleting file:", unlinkError); // Log deletion errors
            }
        }
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});