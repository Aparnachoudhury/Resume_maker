import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Jobs.css';

const MatchedJobs = ({ token }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchedJobs();
  }, []);

  const fetchMatchedJobs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/matches/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setJobs(response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="jobs-container">
      <h2>Jobs Matched For You</h2>
      <div className="jobs-list">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.company_name}</p>
              <p>{job.description}</p>
              <div className="match-score">
                <span className="score">{job.match_score}% Match</span>
              </div>
              <div className="skills">
                <h4>Matched Skills:</h4>
                <ul>
                  {job.matched_skills?.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
                {job.missing_skills?.length > 0 && (
                  <>
                    <h4>Missing Skills:</h4>
                    <ul className="missing">
                      {job.missing_skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <button className="apply-btn">Apply Now</button>
            </div>
          ))
        ) : (
          <p>No matched jobs yet. Upload your resume to get started!</p>
        )}
      </div>
    </div>
  );
};

export default MatchedJobs;