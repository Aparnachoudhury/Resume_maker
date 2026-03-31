import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ResumeUpload.css';

const ResumeUpload = ({ token }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [parsedData, setParsedData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/resumes/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setMessage('Resume uploaded successfully!');
      setMessageType('success');
      setParsedData(response.data.parsed_data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload">
      <h2>Upload Resume</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".pdf" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>
      {message && <p className={messageType}>{message}</p>}
      {parsedData && (
        <div className="parsed-data">
          <h3>Extracted Skills:</h3>
          <ul>
            {parsedData.skills?.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;