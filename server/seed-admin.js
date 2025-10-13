const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://isavameshack_db_user:UkQ6NjiPu4u8z6cX@aiint.zkpnynz.mongodb.net/ai_interpreter?retryWrites=true&w=majority&appName=AIINT';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@signlearn.com' });
    if (existingAdmin) {
      console.log('Sample admin already exists!');
      console.log('Email: admin@signlearn.com');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminResult = await db.collection('users').insertOne({
      email: 'admin@signlearn.com',
      password: hashedPassword,
      full_name: 'System Administrator',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    });

    const adminId = adminResult.insertedId;

    // Create admin profile
    await db.collection('student_profiles').insertOne({
      user_id: adminId,
      full_name: 'System Administrator',
      skill_level: 'expert',
      preferred_language: 'English',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create admin progress
    await db.collection('student_progress').insertOne({
      user_id: adminId,
      signs_learned: 100,
      total_practice_time: 3600, // 1 hour
      accuracy_rate: 95.50,
      total_sessions: 50,
      weekly_progress: 10,
      monthly_goal: 200,
      streak_days: 30,
      last_session: new Date(),
      last_active: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Sample admin created successfully!');
    console.log('📧 Email: admin@signlearn.com');
    console.log('🔒 Password: admin123');
    console.log('👤 Role: admin');
    console.log('🔑 User ID:', adminId.toString());

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await client.close();
  }
}

// Run the seed function
seedAdmin();
