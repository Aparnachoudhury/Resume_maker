const db = require('../models/db');

exports.getMatchedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user skills
    const [userSkills] = await db.execute(`
      SELECT s.id, s.skill_name FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = ?
    `, [userId]);

    const userSkillNames = userSkills.map(s => s.skill_name.toLowerCase());

    // Get all jobs
    const [allJobs] = await db.execute(`
      SELECT j.*, u.full_name as company_name FROM jobs j
      JOIN users u ON j.posted_by = u.id
    `);

    const matchedJobs = [];

    for (const job of allJobs) {
      // Get job required skills
      const [jobSkills] = await db.execute(`
        SELECT s.skill_name FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = ?
      `, [job.id]);

      const jobSkillNames = jobSkills.map(s => s.skill_name.toLowerCase());

      // Calculate match
      const matchedSkills = userSkillNames.filter(skill =>
        jobSkillNames.includes(skill)
      );

      const matchScore = jobSkillNames.length > 0
        ? Math.round((matchedSkills.length / jobSkillNames.length) * 100)
        : 0;

      const missingSkills = jobSkillNames.filter(skill =>
        !userSkillNames.includes(skill)
      );

      // Save match to database
      await db.execute(`
        INSERT INTO job_matches (user_id, job_id, match_score, matched_skills, missing_skills)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE match_score=?, matched_skills=?, missing_skills=?
      `, [
        userId, job.id, matchScore,
        JSON.stringify(matchedSkills), JSON.stringify(missingSkills),
        matchScore, JSON.stringify(matchedSkills), JSON.stringify(missingSkills)
      ]);

      matchedJobs.push({
        ...job,
        match_score: matchScore,
        matched_skills: matchedSkills,
        missing_skills: missingSkills
      });
    }

    // Sort by match score
    matchedJobs.sort((a, b) => b.match_score - a.match_score);

    res.json(matchedJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSkillGap = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;

    const [matches] = await db.execute(
      'SELECT matched_skills, missing_skills FROM job_matches WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );

    if (matches.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const missingSkills = JSON.parse(matches[0].missing_skills);

    res.json({
      missing_skills: missingSkills,
      recommendation: `You need to learn: ${missingSkills.join(', ')}`,
      estimated_time: `${missingSkills.length * 4} weeks`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};