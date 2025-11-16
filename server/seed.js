// Sample data seeder for testing
const { initDatabase, getDatabase } = require('./database');
const { detectTags, detectPriority, suggestAssignment } = require('./services/tagging');
const { v4: uuidv4 } = require('uuid');

const sampleQueries = [
  {
    channel: 'email',
    sender_name: 'John Doe',
    sender_email: 'john@example.com',
    subject: 'Product not working properly',
    content: 'I purchased your product last week and it\'s not working. This is urgent! I need a refund immediately.',
  },
  {
    channel: 'twitter',
    sender_name: 'Jane Smith',
    sender_email: null,
    subject: 'Question about features',
    content: 'How do I use the new feature? Can you help me understand how it works?',
  },
  {
    channel: 'facebook',
    sender_name: 'Mike Johnson',
    sender_email: 'mike@example.com',
    subject: 'Great service!',
    content: 'Just wanted to say thank you for the excellent customer service. You guys are amazing!',
  },
  {
    channel: 'chat',
    sender_name: 'Sarah Williams',
    sender_email: 'sarah@example.com',
    subject: 'Technical issue',
    content: 'I\'m experiencing a bug in the dashboard. The page crashes when I click on the settings button. This is a critical issue.',
  },
  {
    channel: 'email',
    sender_name: 'David Brown',
    sender_email: 'david@example.com',
    subject: 'Feature request',
    content: 'Would it be possible to add dark mode? I think many users would appreciate this feature.',
  },
  {
    channel: 'community',
    sender_name: 'Emily Davis',
    sender_email: 'emily@example.com',
    subject: 'Integration question',
    content: 'How can I integrate your API with my application? Do you have any documentation?',
  },
  {
    channel: 'instagram',
    sender_name: 'Chris Wilson',
    sender_email: null,
    subject: 'Complaint',
    content: 'Very disappointed with the service. The product arrived damaged and customer support was unhelpful.',
  },
  {
    channel: 'email',
    sender_name: 'Lisa Anderson',
    sender_email: 'lisa@example.com',
    subject: 'Order inquiry',
    content: 'I placed an order 3 days ago but haven\'t received a confirmation. Can you please check the status?',
  },
];

function seedDatabase() {
  initDatabase();
  const db = getDatabase();

  // Wait for database to be ready
  setTimeout(() => {
    console.log('Seeding database with sample data...');

    sampleQueries.forEach((queryData, index) => {
      const tags = detectTags(queryData.content, queryData.subject);
      const priority = detectPriority(queryData.content, queryData.subject, tags);
      const suggestedAssignment = suggestAssignment(tags, priority);

      const id = uuidv4();
      const tagsJson = JSON.stringify(tags);

      // Randomly set some queries as resolved for better demo
      const statuses = ['new', 'new', 'in_progress', 'in_progress', 'resolved'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const daysAgo = Math.floor(Math.random() * 7);
      let resolvedAt = null;
      let responseTime = null;
      if (status === 'resolved') {
        const hoursAgo = Math.floor(Math.random() * 48);
        const resolvedDate = new Date();
        resolvedDate.setHours(resolvedDate.getHours() - hoursAgo);
        resolvedAt = resolvedDate.toISOString();
        responseTime = Math.floor(Math.random() * 1440) + 60; // Random between 1 hour and 24 hours in minutes
      }

      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      const createdAt = createdDate.toISOString();

      db.run(
        `INSERT INTO queries (id, channel, sender_name, sender_email, subject, content, tags, priority, assigned_to, status, created_at, resolved_at, response_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, queryData.channel, queryData.sender_name, queryData.sender_email, queryData.subject, queryData.content, tagsJson, priority, suggestedAssignment, status, createdAt, resolvedAt, responseTime],
        function(err) {
          if (err) {
            console.error('Error seeding query:', err);
          } else {
            // Create initial assignment record
            if (suggestedAssignment) {
              const assignmentId = uuidv4();
              db.run(
                'INSERT INTO assignments (id, query_id, assigned_to, assigned_at) VALUES (?, ?, ?, ?)',
                [assignmentId, id, suggestedAssignment, createdAt]
              );
            }
            
            // Create initial status history
            const statusHistoryId = uuidv4();
            db.run(
              'INSERT INTO status_history (id, query_id, old_status, new_status, changed_at) VALUES (?, ?, ?, ?, ?)',
              [statusHistoryId, id, null, status, createdAt]
            );
            
            // If resolved, add resolved status history
            if (status === 'resolved' && resolvedAt) {
              const resolvedHistoryId = uuidv4();
              db.run(
                'INSERT INTO status_history (id, query_id, old_status, new_status, changed_at) VALUES (?, ?, ?, ?, ?)',
                [resolvedHistoryId, id, 'in_progress', 'resolved', resolvedAt]
              );
            }
            
            console.log(`Seeded query ${index + 1}/${sampleQueries.length}`);
          }
        }
      );
    });

    console.log('Seeding complete!');
  }, 1000);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

