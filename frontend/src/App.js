import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const Icon = ({ type }) => (
  <svg className="icon" viewBox="0 0 24 24">
    {type === 'folder' ? (
      <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
    ) : (
      <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
    )}
  </svg>
);

function DarkModeDropdown({ darkMode, setDarkMode }) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);
  const selectMode = (mode) => {
    setDarkMode(mode === "dark");
    setOpen(false);
  };

  return (
    <div className="dark-mode-dropdown">
      <button className="dark-mode-toggle" onClick={toggleDropdown}>
        {darkMode ? "Dark Mode" : "Light Mode"} ▼
      </button>
      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={() => selectMode("light")}>
            Light Mode
          </div>
          <div className="dropdown-item" onClick={() => selectMode("dark")}>
            Dark Mode
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [zipHierarchy, setZipHierarchy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('zipfile', file);
    try {
      const response = await axios.post('https://zip-explorer.vercel.app/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setZipHierarchy(response.data.hierarchy);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const copyStructure = () => {
    const structure = zipHierarchy
      .map((item) => (item.isFolder ? `[Folder] ${item.name}` : `[File] ${item.name}`))
      .join('\n');
    navigator.clipboard.writeText(structure);
    alert('Structure copied to clipboard!');
  };

  const downloadTxtFile = () => {
    const structure = zipHierarchy
      .map((item) => (item.isFolder ? `[Folder] ${item.name}` : `[File] ${item.name}`))
      .join('\n');
    const blob = new Blob([structure], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZIPExplorer - ${fileNameWithoutExtension}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const resetApp = () => {
    setFile(null);
    setZipHierarchy([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">ZIP Explorer</div>
        <div className="header-actions">
          <a href="https://github.com/korybantes" target="_blank" rel="noopener noreferrer" className="github-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.08 3.293 9.387 7.861 10.911.575.106.785-.25.785-.557 0-.275-.01-1.006-.015-1.977-3.203.695-3.878-1.544-3.878-1.544-.523-1.332-1.277-1.688-1.277-1.688-1.044-.713.08-.698.08-.698 1.155.081 1.762 1.188 1.762 1.188 1.027 1.762 2.696 1.252 3.354.958.104-.745.401-1.252.728-1.538-2.555-.291-5.238-1.278-5.238-5.695 0-1.257.45-2.283 1.187-3.089-.12-.292-.516-1.47.112-3.066 0 0 .966-.31 3.162 1.179.917-.255 1.9-.382 2.878-.386.977.004 1.96.131 2.879.386 2.194-1.489 3.159-1.179 3.159-1.179.63 1.597.234 2.774.115 3.066.739.806 1.186 1.832 1.186 3.089 0 4.428-2.688 5.4-5.248 5.686.414.356.783 1.055.783 2.128 0 1.536-.015 2.776-.015 3.153 0 .308.208.667.79.554C20.71 21.384 24 17.08 24 12c0-6.352-5.148-11.5-11.5-11.5z" />
            </svg>
          </a>
          <DarkModeDropdown darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </header>
      <div className="container">
        {zipHierarchy.length === 0 ? (
          <div className="card upload-card">
            <div className="card-inner">
              <label 
                className={`upload-area ${isDragActive ? "drag-active" : ""}`}
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" onChange={handleFileChange} />
                <div className="upload-visual">
                  <div className="shimmer"></div>
                  <svg className="upload-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm4 11H7v-2h10v2zm0-4H7v-2h10v2z"/>
                  </svg>
                  <p>Drag & Drop or Click to Browse</p>
                </div>
              </label>
              {file && (
                <div className="file-info">
                  <p>Selected File: <strong>{file.name}</strong></p>
                </div>
              )}
              {loading && (
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${uploadProgress}%` }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}
              <button onClick={handleUpload} className="upload-button" disabled={loading}>
                {loading ? <div className="spinner"></div> : 'Analyze Structure'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card result-card">
            <div className="result-header">
              <h3>Directory Structure</h3>
              <div className="button-group">
                <button onClick={copyStructure} className="icon-button">
                  <Icon type="file" /> Copy
                </button>
                <button onClick={downloadTxtFile} className="icon-button">
                  <Icon type="file" /> Download
                </button>
              </div>
            </div>
            <div className="hierarchy-box">
              {zipHierarchy.map((item, index) => (
                <div key={index} className="hierarchy-item">
                  <Icon type={item.isFolder ? 'folder' : 'file'} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            <div className="reset-section">
              <button onClick={resetApp} className="reset-button">
                Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="footer">
        <div className="gradient-bar"></div>
        Crafted with <span className="pulse">❤️</span> by{' '}
        <a href="https://github.com/korybantes" target="_blank" rel="noopener noreferrer">
          korybantes
        </a>
      </footer>
    </div>
  );
}

export default App;
