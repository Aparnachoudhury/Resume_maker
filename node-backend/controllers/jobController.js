const db = require('../models/db');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const [jobs] = await db.execute(`
      SELECT j.*, u.full_name as company_name, u.email as company_email
      FROM jobs j
      JOIN users u ON j.posted_by = u.id
      ORDER BY j.created_at DESC
    `);

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get single job
exports.getJob = async (req, res) => {
  try {
    const [jobs] = await db.execute(`
      SELECT j.*, u.full_name as company_name
      FROM jobs j
      JOIN users u ON j.posted_by = u.id
      WHERE j.id = ?
    `, [req.params.id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get required skills
    const [skills] = await db.execute(`
      SELECT s.skill_name, js.required_level
      FROM job_skills js
      JOIN skills s ON js.skill_id = s.id
      WHERE js.job_id = ?
    `, [req.params.id]);

    res.json({ ...jobs[0], required_skills: skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Post a job (Recruiter only)
exports.postJob = async (req, res) => {
  const { title, description, company, required_skills } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is recruiter
    const [user] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
    if (user[0].role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can post jobs' });
    }

    // Insert job
    const [result] = await db.execute(
      'INSERT INTO jobs (title, description, company, posted_by) VALUES (?, ?, ?, ?)',
      [title, description, company, userId]
    );

    const jobId = result.insertId;

    // Insert required skills
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        // Get or create skill
        const [skillResult] = await db.execute(
          'INSERT INTO skills (skill_name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
          [skill.name]
        );

        let skillId = skillResult.insertId;
        if (!skillId) {
          const [existingSkill] = await db.execute(
            'SELECT id FROM skills WHERE skill_name = ?',
            [skill.name]
          );
          skillId = existingSkill[0].id;
        }

        // Link skill to job
        await db.execute(
          'INSERT INTO job_skills (job_id, skill_id, required_level) VALUES (?, ?, ?)',
          [jobId, skillId, skill.level || 'intermediate']
        );
      }
    }

    res.status(201).json({
      message: 'Job posted successfully!',
      job_id: jobId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Search jobs
exports.searchJobs = async (req, res) => {
  const { keyword } = req.query;

  try {
    const [jobs] = await db.execute(`
      SELECT j.*, u.full_name as company_name
      FROM jobs j
      JOIN users u ON j.posted_by = u.id
      WHERE j.title LIKE ? OR j.description LIKE ? OR j.company LIKE ?
      ORDER BY j.created_at DESC
    `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};