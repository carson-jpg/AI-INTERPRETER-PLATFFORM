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

    // Validate data types and constraints
    if (updates.skill_level && !['Beginner', 'Intermediate', 'Advanced'].includes(updates.skill_level)) {
      return res.status(400).json({ error: 'Invalid skill level. Must be Beginner, Intermediate, or Advanced' });
    }

    if (updates.preferred_language && typeof updates.preferred_language !== 'string') {
      return res.status(400).json({ error: 'Preferred language must be a string' });
    }

    const db = getDB();
    const result = await db.collection('student_profiles').updateOne(
      { user_id: new ObjectId(userId) },
      { $set: { ...updates, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = await db.collection('student_profiles').findOne({ user_id: new ObjectId(userId) });
    if (profile) {
      res.json({ ...profile, id: profile._id.toString() });
    } else {
      res.status(500).json({ error: 'Failed to retrieve updated profile' });
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
      // Validate userId format
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }

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
          $lookup: {
            from: 'practice_sessions',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'recent_sessions',
            pipeline: [
              { $sort: { created_at: -1 } },
              { $limit: 10 },
              { $project: { accuracy: 1, duration: 1, created_at: 1 } }
            ]
          }
        },
        {
          $project: {
            id: { $toString: '$_id' },
            user_id: 1,
            signs_learned: { $ifNull: ['$signs_learned', 0] },
            total_practice_time: { $ifNull: ['$total_practice_time', 0] },
            accuracy_rate: { $ifNull: ['$accuracy_rate', 0.0] },
            total_sessions: { $ifNull: ['$total_sessions', 0] },
            weekly_progress: { $ifNull: ['$weekly_progress', 0] },
            monthly_goal: { $ifNull: ['$monthly_goal', 100] },
            streak_days: { $ifNull: ['$streak_days', 0] },
            last_session: 1,
            last_active: 1,
            created_at: 1,
            updated_at: 1,
            skill_level: { $ifNull: ['$profile.skill_level', ''] },
            preferred_language: { $ifNull: ['$profile.preferred_language', ''] },
            recent_sessions: 1,
            // Calculate average accuracy from recent sessions
            recent_avg_accuracy: {
              $cond: {
                if: { $gt: [{ $size: '$recent_sessions' }, 0] },
                then: { $avg: '$recent_sessions.accuracy' },
                else: 0
              }
            }
          }
        }
      ]).toArray();

      if (progress.length > 0) {
        // Ensure numeric fields are properly typed
        const result = progress[0];
        result.signs_learned = Number(result.signs_learned);
        result.total_practice_time = Number(result.total_practice_time);
        result.accuracy_rate = Number(result.accuracy_rate);
        result.total_sessions = Number(result.total_sessions);
        result.weekly_progress = Number(result.weekly_progress);
        result.monthly_goal = Number(result.monthly_goal);
        result.streak_days = Number(result.streak_days);
        result.recent_avg_accuracy = Number(result.recent_avg_accuracy);

        res.json(result);
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
            signs_learned: { $ifNull: ['$signs_learned', 0] },
            total_practice_time: { $ifNull: ['$total_practice_time', 0] },
            accuracy_rate: { $ifNull: ['$accuracy_rate', 0.0] },
            total_sessions: { $ifNull: ['$total_sessions', 0] },
            weekly_progress: { $ifNull: ['$weekly_progress', 0] },
            monthly_goal: { $ifNull: ['$monthly_goal', 100] },
            streak_days: { $ifNull: ['$streak_days', 0] },
            last_session: 1,
            last_active: 1,
            created_at: 1,
            updated_at: 1,
            email: '$user.email',
            user_full_name: '$user.full_name',
            skill_level: { $ifNull: ['$profile.skill_level', ''] },
            preferred_language: { $ifNull: ['$profile.preferred_language', ''] }
          }
        },
        {
          $sort: { last_active: -1 }
        }
      ]).toArray();

      // Ensure all numeric fields are properly typed
      const results = allProgress.map(progress => ({
        ...progress,
        signs_learned: Number(progress.signs_learned),
        total_practice_time: Number(progress.total_practice_time),
        accuracy_rate: Number(progress.accuracy_rate),
        total_sessions: Number(progress.total_sessions),
        weekly_progress: Number(progress.weekly_progress),
        monthly_goal: Number(progress.monthly_goal),
        streak_days: Number(progress.streak_days)
      }));

      res.json(results);
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


// Practice Session Functions
router.get('/practice-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const db = getDB();
    const sessions = await db.collection('practice_sessions')
      .find({ user_id: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .toArray();

    res.json(sessions.map(session => ({ ...session, id: session._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/practice-sessions', async (req, res) => {
  const sessionData = req.body;
  try {
    // Validate required fields
    if (!sessionData.user_id || !sessionData.sign_id) {
      return res.status(400).json({ error: 'user_id and sign_id are required' });
    }

    // Validate user_id format
    if (!ObjectId.isValid(sessionData.user_id)) {
      return res.status(400).json({ error: 'Invalid user_id format' });
    }

    // Validate numeric fields
    const validatedData = {
      user_id: new ObjectId(sessionData.user_id),
      sign_id: sessionData.sign_id,
      accuracy: Math.max(0, Math.min(100, Number(sessionData.accuracy) || 0)),
      duration: Math.max(0, Number(sessionData.duration) || 0),
      attempts: Math.max(0, Number(sessionData.attempts) || 1),
      correct_attempts: Math.max(0, Number(sessionData.correct_attempts) || 0),
      feedback: sessionData.feedback || '',
      created_at: new Date(),
      updated_at: new Date()
    };

    const db = getDB();
    const result = await db.collection('practice_sessions').insertOne(validatedData);

    // Update student progress with accurate calculations
    const progressUpdate = {
      $inc: {
        total_sessions: 1,
        total_practice_time: validatedData.duration,
        signs_learned: validatedData.correct_attempts > 0 ? 1 : 0
      },
      $set: {
        last_session: new Date(),
        last_active: new Date(),
        updated_at: new Date()
      }
    };

    // Calculate and update accuracy rate based on recent sessions
    const recentSessions = await db.collection('practice_sessions')
      .find({ user_id: validatedData.user_id })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    if (recentSessions.length > 0) {
      const avgAccuracy = recentSessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / recentSessions.length;
      progressUpdate.$set.accuracy_rate = Math.round(avgAccuracy * 100) / 100;
    }

    await db.collection('student_progress').updateOne(
      { user_id: validatedData.user_id },
      progressUpdate,
      { upsert: true }
    );

    const session = await db.collection('practice_sessions').findOne({ _id: result.insertedId });
    res.json({ ...session, id: session._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/practice-sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const updates = req.body;
  try {
    // Validate sessionId format
    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    // Validate allowed update fields
    const allowedKeys = ['accuracy', 'duration', 'attempts', 'correct_attempts', 'feedback'];
    const keys = Object.keys(updates);
    const invalidKeys = keys.filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Invalid update fields: ${invalidKeys.join(', ')}` });
    }

    // Validate numeric fields
    if (updates.accuracy !== undefined) {
      updates.accuracy = Math.max(0, Math.min(100, Number(updates.accuracy)));
    }
    if (updates.duration !== undefined) {
      updates.duration = Math.max(0, Number(updates.duration));
    }
    if (updates.attempts !== undefined) {
      updates.attempts = Math.max(0, Number(updates.attempts));
    }
    if (updates.correct_attempts !== undefined) {
      updates.correct_attempts = Math.max(0, Number(updates.correct_attempts));
    }

    const db = getDB();
    const result = await db.collection('practice_sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { ...updates, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Practice session not found' });
    }

    const session = await db.collection('practice_sessions').findOne({ _id: new ObjectId(sessionId) });
    res.json({ ...session, id: session._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gesture Attempt Functions
router.post('/gesture-attempts', async (req, res) => {
  const attemptData = req.body;
  try {
    // Validate required fields
    if (!attemptData.session_id || !attemptData.sign_attempted || !attemptData.detected_sign) {
      return res.status(400).json({ error: 'session_id, sign_attempted, and detected_sign are required' });
    }

    // Validate session_id format
    if (!ObjectId.isValid(attemptData.session_id)) {
      return res.status(400).json({ error: 'Invalid session_id format' });
    }

    const validatedData = {
      session_id: new ObjectId(attemptData.session_id),
      sign_attempted: attemptData.sign_attempted,
      detected_sign: attemptData.detected_sign,
      confidence: Math.max(0, Math.min(1, Number(attemptData.confidence) || 0)),
      is_correct: Boolean(attemptData.is_correct),
      landmarks: attemptData.landmarks || [],
      feedback: attemptData.feedback || '',
      created_at: new Date()
    };

    const db = getDB();
    const result = await db.collection('gesture_attempts').insertOne(validatedData);

    const attempt = await db.collection('gesture_attempts').findOne({ _id: result.insertedId });
    res.json({ ...attempt, id: attempt._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gesture-attempts/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Validate sessionId format
    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    const db = getDB();
    const attempts = await db.collection('gesture_attempts')
      .find({ session_id: new ObjectId(sessionId) })
      .sort({ created_at: 1 })
      .toArray();

    res.json(attempts.map(attempt => ({ ...attempt, id: attempt._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Practice Session Functions
router.get('/practice-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const db = getDB();
    const sessions = await db.collection('practice_sessions')
      .find({ user_id: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .toArray();

    res.json(sessions.map(session => ({ ...session, id: session._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/practice-sessions', async (req, res) => {
  const sessionData = req.body;
  try {
    // Validate required fields
    if (!sessionData.user_id || !sessionData.sign_id) {
      return res.status(400).json({ error: 'user_id and sign_id are required' });
    }

    // Validate user_id format
    if (!ObjectId.isValid(sessionData.user_id)) {
      return res.status(400).json({ error: 'Invalid user_id format' });
    }

    // Validate numeric fields
    const validatedData = {
      user_id: new ObjectId(sessionData.user_id),
      sign_id: sessionData.sign_id,
      accuracy: Math.max(0, Math.min(100, Number(sessionData.accuracy) || 0)),
      duration: Math.max(0, Number(sessionData.duration) || 0),
      attempts: Math.max(0, Number(sessionData.attempts) || 1),
      correct_attempts: Math.max(0, Number(sessionData.correct_attempts) || 0),
      feedback: sessionData.feedback || '',
      created_at: new Date(),
      updated_at: new Date()
    };

    const db = getDB();
    const result = await db.collection('practice_sessions').insertOne(validatedData);

    // Update student progress with accurate calculations
    const progressUpdate = {
      $inc: {
        total_sessions: 1,
        total_practice_time: validatedData.duration,
        signs_learned: validatedData.correct_attempts > 0 ? 1 : 0
      },
      $set: {
        last_session: new Date(),
        last_active: new Date(),
        updated_at: new Date()
      }
    };

    // Calculate and update accuracy rate based on recent sessions
    const recentSessions = await db.collection('practice_sessions')
      .find({ user_id: validatedData.user_id })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    if (recentSessions.length > 0) {
      const avgAccuracy = recentSessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / recentSessions.length;
      progressUpdate.$set.accuracy_rate = Math.round(avgAccuracy * 100) / 100;
    }

    await db.collection('student_progress').updateOne(
      { user_id: validatedData.user_id },
      progressUpdate,
      { upsert: true }
    );

    const session = await db.collection('practice_sessions').findOne({ _id: result.insertedId });
    res.json({ ...session, id: session._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/practice-sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const updates = req.body;
  try {
    // Validate sessionId format
    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    // Validate allowed update fields
    const allowedKeys = ['accuracy', 'duration', 'attempts', 'correct_attempts', 'feedback'];
    const keys = Object.keys(updates);
    const invalidKeys = keys.filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Invalid update fields: ${invalidKeys.join(', ')}` });
    }

    // Validate numeric fields
    if (updates.accuracy !== undefined) {
      updates.accuracy = Math.max(0, Math.min(100, Number(updates.accuracy)));
    }
    if (updates.duration !== undefined) {
      updates.duration = Math.max(0, Number(updates.duration));
    }
    if (updates.attempts !== undefined) {
      updates.attempts = Math.max(0, Number(updates.attempts));
    }
    if (updates.correct_attempts !== undefined) {
      updates.correct_attempts = Math.max(0, Number(updates.correct_attempts));
    }

    const db = getDB();
    const result = await db.collection('practice_sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { ...updates, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Practice session not found' });
    }

    const session = await db.collection('practice_sessions').findOne({ _id: new ObjectId(sessionId) });
    res.json({ ...session, id: session._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gesture Attempt Functions
router.post('/gesture-attempts', async (req, res) => {
  const attemptData = req.body;
  try {
    // Validate required fields
    if (!attemptData.session_id || !attemptData.sign_attempted || !attemptData.detected_sign) {
      return res.status(400).json({ error: 'session_id, sign_attempted, and detected_sign are required' });
    }

    // Validate session_id format
    if (!ObjectId.isValid(attemptData.session_id)) {
      return res.status(400).json({ error: 'Invalid session_id format' });
    }

    const validatedData = {
      session_id: new ObjectId(attemptData.session_id),
      sign_attempted: attemptData.sign_attempted,
      detected_sign: attemptData.detected_sign,
      confidence: Math.max(0, Math.min(1, Number(attemptData.confidence) || 0)),
      is_correct: Boolean(attemptData.is_correct),
      landmarks: attemptData.landmarks || [],
      feedback: attemptData.feedback || '',
      created_at: new Date()
    };

    const db = getDB();
    const result = await db.collection('gesture_attempts').insertOne(validatedData);

    const attempt = await db.collection('gesture_attempts').findOne({ _id: result.insertedId });
    res.json({ ...attempt, id: attempt._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gesture-attempts/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Validate sessionId format
    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    const db = getDB();
    const attempts = await db.collection('gesture_attempts')
      .find({ session_id: new ObjectId(sessionId) })
      .sort({ created_at: 1 })
      .toArray();

    res.json(attempts.map(attempt => ({ ...attempt, id: attempt._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
