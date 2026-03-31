const db = require('../models/db');

exports.applyForJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { job_id } = req.body;

    // Check if already applied
    const [existing] = await db.execute(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [userId, job_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    // Create application
    await db.execute(
      'INSERT INTO applications (user_id, job_id, status) VALUES (?, ?, ?)',
      [userId, job_id, 'applied']
    );

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, j.company, u.full_name as company_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.posted_by = u.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `, [userId]);

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, u.full_name as candidate_name, u.email as candidate_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE j.posted_by = ?
      ORDER BY a.applied_at DESC
    `, [recruiterId]);

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    await db.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    res.json({ message: 'Application status updated!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};