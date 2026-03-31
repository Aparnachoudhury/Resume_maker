const db = require('../models/db');
const axios = require('axios');
const fs = require('fs');

exports.uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const filePath = req.file.path;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Send to Java microservice for parsing
    const fileStream = fs.createReadStream(filePath);
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileStream);

    const response = await axios.post(
      `${process.env.JAVA_MICROSERVICE_URL}/api/parse-resume`,
      formData,
      { headers: formData.getHeaders() }
    );

    const parsedData = response.data;

    // Delete old resume if exists
    await db.execute('DELETE FROM resumes WHERE user_id = ?', [userId]);

    // Save to database
    const [resumeResult] = await db.execute(
      'INSERT INTO resumes (user_id, file_path, parsed_data) VALUES (?, ?, ?)',
      [userId, filePath, JSON.stringify(parsedData)]
    );

    // Extract and save skills
    if (parsedData.skills && parsedData.skills.length > 0) {
      for (const skill of parsedData.skills) {
        // Get or create skill
        const [skillResult] = await db.execute(
          'INSERT INTO skills (skill_name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
          [skill]
        );

        let skillId = skillResult.insertId;
        if (!skillId) {
          const [existingSkill] = await db.execute(
            'SELECT id FROM skills WHERE skill_name = ?',
            [skill]
          );
          skillId = existingSkill[0].id;
        }

        // Link skill to user
        await db.execute(
          'INSERT INTO user_skills (user_id, skill_id, proficiency) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proficiency=?',
          [userId, skillId, 'intermediate', 'intermediate']
        );
      }
    }

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully!',
      resume_id: resumeResult.insertId,
      parsed_data: parsedData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const [resumes] = await db.execute(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
      [userId]
    );

    if (resumes.length === 0) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const resume = resumes[0];
    const [skills] = await db.execute(`
      SELECT s.skill_name, us.proficiency
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = ?
    `, [userId]);

    res.json({
      resume,
      parsed_data: JSON.parse(resume.parsed_data),
      extracted_skills: skills
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};