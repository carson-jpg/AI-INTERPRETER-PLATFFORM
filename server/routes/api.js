const express = require('express');
const router = express.Router();
const { getDB } = require('../lib/mongo');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

// User Authentication Functions
router.post('/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 12);
    const userResult = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      full_name: fullName,
      role: 'student',
      created_at: new Date(),
      updated_at: new Date()
    });
    const userId = userResult.insertedId;
    await db.collection('student_profiles').insertOne({
      user_id: userId,
      full_name: fullName,
      skill_level: '',
      preferred_language: '',
      created_at: new Date(),
      updated_at: new Date()
    });
    await db.collection('student_progress').insertOne({
      user_id: userId,
      signs_learned: 0,
      total_practice_time: 0,
      accuracy_rate: 0.00,
      total_sessions: 0,
      weekly_progress: 0,
      monthly_goal: 100,
      streak_days: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    const user = await db.collection('users').findOne({ _id: userId });
    res.json({ ...user, id: user._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ ...user, id: user._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const db = getDB();
    const profile = await db.collection('student_profiles').findOne({ user_id: new ObjectId(userId) });
    if (profile) {
      res.json({ ...profile, id: profile._id.toString() });
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  try {
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    // Validate allowed keys
    const allowedKeys = ['full_name', 'bio', 'learning_goals', 'skill_level', 'preferred_language', 'avatar_url'];
    const keys = Object.keys(updates);
    const invalidKeys = keys.filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Invalid update fields: ${invalidKeys.join(', ')}` });
    }

    const db = getDB();
    await db.collection('student_profiles').updateOne(
      { user_id: new ObjectId(userId) },
      { $set: { ...updates, updated_at: new Date() } }
    );

    const profile = await db.collection('student_profiles').findOne({ user_id: new ObjectId(userId) });
    if (profile) {
      res.json({ ...profile, id: profile._id.toString() });
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/progress/:userId?', async (req, res) => {
  const { userId } = req.params;
  try {
    const db = getDB();
    if (userId) {
      const progress = await db.collection('student_progress').aggregate([
        {
          $match: { user_id: new ObjectId(userId) }
        },
        {
          $lookup: {
            from: 'student_profiles',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'profile'
          }
        },
        {
          $unwind: { path: '$profile', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            id: { $toString: '$_id' },
            user_id: 1,
            signs_learned: 1,
            total_practice_time: 1,
            accuracy_rate: 1,
            total_sessions: 1,
            weekly_progress: 1,
            monthly_goal: 1,
            streak_days: 1,
            last_session: 1,
            last_active: 1,
            created_at: 1,
            updated_at: 1,
            skill_level: '$profile.skill_level',
            preferred_language: '$profile.preferred_language'
          }
        }
      ]).toArray();
      if (progress.length > 0) {
        res.json(progress[0]);
      } else {
        res.json(null);
      }
    } else {
      const allProgress = await db.collection('student_progress').aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $lookup: {
            from: 'student_profiles',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'profile'
          }
        },
        {
          $unwind: { path: '$profile', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            id: { $toString: '$_id' },
            user_id: 1,
            signs_learned: 1,
            total_practice_time: 1,
            accuracy_rate: 1,
            total_sessions: 1,
            weekly_progress: 1,
            monthly_goal: 1,
            streak_days: 1,
            last_session: 1,
            last_active: 1,
            created_at: 1,
            updated_at: 1,
            email: '$user.email',
            user_full_name: '$user.full_name',
            skill_level: '$profile.skill_level',
            preferred_language: '$profile.preferred_language'
          }
        },
        {
          $sort: { last_active: -1 }
        }
      ]).toArray();
      res.json(allProgress);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/materials', async (req, res) => {
  const { category, difficulty } = req.query;
  try {
    const db = getDB();
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty_level = difficulty;
    }
    const materials = await db.collection('learning_materials')
      .find(query)
      .sort({ order_index: 1 })
      .toArray();
    res.json(materials.map(material => ({ ...material, id: material._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    const stats = await db.collection('student_progress').aggregate([
      {
        $group: {
          _id: null,
          totalSignsLearned: { $sum: '$signs_learned' },
          totalSessions: { $sum: '$total_sessions' },
          avgAccuracyRate: { $avg: '$accuracy_rate' },
          totalUsers: { $sum: 1 }
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return res.json({
        recognitionAccuracy: 0,
        wordsInterpreted: 0,
        signsLearned: 0,
        totalUsers: 0
      });
    }

    const result = stats[0];
    res.json({
      recognitionAccuracy: Math.round(result.avgAccuracyRate * 10000) / 100, // Convert to percentage with 2 decimal places
      wordsInterpreted: result.totalSessions,
      signsLearned: result.totalSignsLearned,
      totalUsers: result.totalUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/lessons', async (req, res) => {
  try {
    const db = getDB();
    const lessons = await db.collection('learning_materials')
      .find({})
      .sort({ order_index: 1 })
      .toArray();
    res.json(lessons.map(lesson => ({ ...lesson, id: lesson._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/signs', async (req, res) => {
  try {
    const db = getDB();
    const signs = await db.collection('signs')
      .find({})
      .toArray();
    res.json(signs.map(sign => ({ ...sign, id: sign._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Functions
router.get('/admin/check/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ isAdmin: user.role === 'admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/create', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 12);
    const userResult = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      full_name: fullName,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    });
    const userId = userResult.insertedId;
    await db.collection('student_profiles').insertOne({
      user_id: userId,
      full_name: fullName,
      skill_level: '',
      preferred_language: '',
      created_at: new Date(),
      updated_at: new Date()
    });
    await db.collection('student_progress').insertOne({
      user_id: userId,
      signs_learned: 0,
      total_practice_time: 0,
      accuracy_rate: 0.00,
      total_sessions: 0,
      weekly_progress: 0,
      monthly_goal: 100,
      streak_days: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    const user = await db.collection('users').findOne({ _id: userId });
    res.json({ ...user, id: user._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
