require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./connection');
const logger = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Seeding database...');

    // Create demo users
    const demoUsers = [
      {
        email: 'admin@lexlens.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'admin'
      },
      {
        email: 'lawyer@lexlens.com',
        password: 'lawyer123',
        fullName: 'Jane Lawyer',
        role: 'lawyer'
      },
      {
        email: 'client@lexlens.com',
        password: 'client123',
        fullName: 'John Client',
        role: 'client'
      }
    ];

    for (const user of demoUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      await query(
        `INSERT INTO users (email, password_hash, full_name, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING`,
        [user.email, passwordHash, user.fullName, user.role]
      );

      logger.info(`Created user: ${user.email}`);
    }

    logger.info('✅ Database seeded successfully');
    logger.info('\nDemo accounts:');
    logger.info('Admin: admin@lexlens.com / admin123');
    logger.info('Lawyer: lawyer@lexlens.com / lawyer123');
    logger.info('Client: client@lexlens.com / client123');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();

