const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// Get overall analytics
router.get('/overview', (req, res) => {
  const db = getDatabase();
  
  // Total queries
  db.get('SELECT COUNT(*) as total FROM queries', (err, totalResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Queries by status
    db.all('SELECT status, COUNT(*) as count FROM queries GROUP BY status', (err, statusCounts) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Queries by priority
      db.all('SELECT priority, COUNT(*) as count FROM queries GROUP BY priority', (err, priorityCounts) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Queries by channel
        db.all('SELECT channel, COUNT(*) as count FROM queries GROUP BY channel', (err, channelCounts) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Average response time
          db.get('SELECT AVG(response_time) as avg_response_time FROM queries WHERE response_time IS NOT NULL', (err, avgResponse) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.json({
              total: totalResult.total,
              byStatus: statusCounts,
              byPriority: priorityCounts,
              byChannel: channelCounts,
              avgResponseTime: avgResponse.avg_response_time || 0
            });
          });
        });
      });
    });
  });
});

// Get tag distribution
router.get('/tags', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT tags FROM queries', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const tagCounts = {};
    
    rows.forEach(row => {
      try {
        const tags = JSON.parse(row.tags || '[]');
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });
    
    res.json(tagCounts);
  });
});

// Get response time analytics
router.get('/response-times', (req, res) => {
  const db = getDatabase();
  const { period = '7' } = req.query; // days
  
  const dateFilter = `datetime('now', '-${period} days')`;
  
  db.all(
    `SELECT 
      DATE(created_at) as date,
      AVG(response_time) as avg_response_time,
      MIN(response_time) as min_response_time,
      MAX(response_time) as max_response_time,
      COUNT(*) as resolved_count
    FROM queries 
    WHERE resolved_at >= ${dateFilter} AND response_time IS NOT NULL
    GROUP BY DATE(created_at)
    ORDER BY date DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(rows);
    }
  );
});

// Get query trends over time
router.get('/trends', (req, res) => {
  const db = getDatabase();
  const { period = '30' } = req.query; // days
  
  const dateFilter = `datetime('now', '-${period} days')`;
  
  db.all(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as count,
      channel,
      priority
    FROM queries 
    WHERE created_at >= ${dateFilter}
    GROUP BY DATE(created_at), channel, priority
    ORDER BY date DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(rows);
    }
  );
});

// Get team performance
router.get('/teams', (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT 
      q.assigned_to as team_id,
      t.name as team_name,
      COUNT(*) as total_queries,
      SUM(CASE WHEN q.status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
      AVG(q.response_time) as avg_response_time
    FROM queries q
    LEFT JOIN teams t ON q.assigned_to = t.id
    WHERE q.assigned_to IS NOT NULL
    GROUP BY q.assigned_to, t.name`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(rows);
    }
  );
});

module.exports = router;

