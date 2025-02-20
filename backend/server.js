const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000; // Use process.env.PORT for Vercel

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to upload a ZIP file and process its hierarchy
app.post('/upload', upload.single('zipfile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const zip = new AdmZip(req.file.path);
        const zipEntries = zip.getEntries();

        // Generate hierarchy
        const hierarchy = zipEntries.map(entry => ({
            name: entry.entryName,
            isFolder: entry.isDirectory
        }));

        // Delete uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.json({ hierarchy });
    } catch (error) {
        console.error("ZIP processing error:", error); // Log the actual error for debugging
        res.status(500).json({ error: 'Error processing ZIP file' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`); // Correct console log
});