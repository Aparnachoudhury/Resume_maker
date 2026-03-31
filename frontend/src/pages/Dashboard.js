import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard">
      <h2>Welcome, {user?.full_name}! 👋</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>📄 Upload Resume</h3>
          <p>Upload your resume to get AI-powered job matches based on your skills</p>
          <a href="/upload-resume">Go to Upload</a>
        </div>
        <div className="card">
          <h3>🎯 Find Matched Jobs</h3>
          <p>View jobs that match your skills and experience with match percentage</p>
          <a href="/matched-jobs">View Matches</a>
        </div>
        <div className="card">
          <h3>💼 Browse All Jobs</h3>
          <p>Explore all available job opportunities in the platform</p>
          <a href="/jobs">Browse Jobs</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;