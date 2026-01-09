const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const { detectTags, detectPriority, suggestAssignment } = require('../services/tagging');
const { v4: uuidv4 } = require('uuid');


router.get('/', (req, res) => {
  const db = getDatabase();
  const { status, priority, tag, channel, assigned_to, search, sort = 'created_at', order = 'DESC' } = req.query;
  
  let query = 'SELECT * FROM queries WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  if (channel) {
    query += ' AND channel = ?';
    params.push(channel);
  }
  
  if (assigned_to) {
    query += ' AND assigned_to = ?';
    params.push(assigned_to);
  }
  
  if (search) {
    query += ' AND (content LIKE ? OR subject LIKE ? OR sender_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }
  
 
  const validSortColumns = ['created_at', 'updated_at', 'priority', 'status', 'sender_name'];
  const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    

    const queries = rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
    
    res.json(queries);
  });
});


router.get('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.get('SELECT * FROM queries WHERE id = ?', [id], (err, query) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
   
    db.all('SELECT * FROM assignments WHERE query_id = ? ORDER BY assigned_at DESC', [id], (err, assignments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
    
      db.all('SELECT * FROM status_history WHERE query_id = ? ORDER BY changed_at DESC', [id], (err, statusHistory) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          ...query,
          tags: JSON.parse(query.tags || '[]'),
          assignments,
          statusHistory
        });
      });
    });
  });
});


router.post('/', (req, res) => {
  const db = getDatabase();
  const { channel, sender_name, sender_email, subject, content } = req.body;
  
  if (!channel || !sender_name || !content) {
    return res.status(400).json({ error: 'Missing required fields: channel, sender_name, content' });
  }
  

  const tags = detectTags(content, subject);
  const priority = detectPriority(content, subject, tags);
  const suggestedAssignment = suggestAssignment(tags, priority);
  
  const id = uuidv4();
  const tagsJson = JSON.stringify(tags);
  
  db.run(
    `INSERT INTO queries (id, channel, sender_name, sender_email, subject, content, tags, priority, assigned_to, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, channel, sender_name, sender_email || null, subject || null, content, tagsJson, priority, suggestedAssignment, 'new'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
     
      if (suggestedAssignment) {
        const assignmentId = uuidv4();
        db.run(
          'INSERT INTO assignments (id, query_id, assigned_to, assigned_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [assignmentId, id, suggestedAssignment]
        );
      }
      
  
      const statusHistoryId = uuidv4();
      db.run(
        'INSERT INTO status_history (id, query_id, old_status, new_status, changed_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [statusHistoryId, id, null, 'new']
      );
      
      res.status(201).json({
        id,
        channel,
        sender_name,
        sender_email,
        subject,
        content,
        tags,
        priority,
        assigned_to: suggestedAssignment,
        status: 'new'
      });
    }
  );
});


router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status, priority, assigned_to, tags } = req.body;
  

  db.get('SELECT status, assigned_to FROM queries WHERE id = ?', [id], (err, currentQuery) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!currentQuery) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    const updates = [];
    const params = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      
     
      if (status !== currentQuery.status) {
        const statusHistoryId = uuidv4();
        db.run(
          'INSERT INTO status_history (id, query_id, old_status, new_status, changed_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [statusHistoryId, id, currentQuery.status, status]
        );
        
       
        if (status === 'resolved') {
          db.get('SELECT created_at FROM queries WHERE id = ?', [id], (err, query) => {
            if (!err && query) {
              const created = new Date(query.created_at);
              const resolved = new Date();
              const responseTime = Math.floor((resolved - created) / 1000 / 60); // minutes
              db.run('UPDATE queries SET resolved_at = CURRENT_TIMESTAMP, response_time = ? WHERE id = ?', [responseTime, id]);
            }
          });
        }
      }
    }
    
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
      
      
      if (assigned_to !== currentQuery.assigned_to) {
        const assignmentId = uuidv4();
        db.run(
          'INSERT INTO assignments (id, query_id, assigned_to, assigned_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [assignmentId, id, assigned_to]
        );
      }
    }
    
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.run(
      `UPDATE queries SET ${updates.join(', ')} WHERE id = ?`,
      params,
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
      
        db.get('SELECT * FROM queries WHERE id = ?', [id], (err, query) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({
            ...query,
            tags: JSON.parse(query.tags || '[]')
          });
        });
      }
    );
  });
});


router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.run('DELETE FROM queries WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
   
    db.run('DELETE FROM assignments WHERE query_id = ?', [id]);
    db.run('DELETE FROM status_history WHERE query_id = ?', [id]);
    
    res.json({ message: 'Query deleted successfully' });
  });
});


router.post('/bulk', (req, res) => {
  const db = getDatabase();
  const { action, query_ids } = req.body;
  
  if (!action || !query_ids || !Array.isArray(query_ids)) {
    return res.status(400).json({ error: 'Invalid bulk operation request' });
  }
  
  const placeholders = query_ids.map(() => '?').join(',');
  
  if (action === 'assign') {
    const { assigned_to } = req.body;
    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required for assign action' });
    }
    
    db.run(
      `UPDATE queries SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [assigned_to, ...query_ids],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: `${this.changes} queries assigned` });
      }
    );
  } else if (action === 'update_status') {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required for update_status action' });
    }
    
    db.run(
      `UPDATE queries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [status, ...query_ids],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: `${this.changes} queries updated` });
      }
    );
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

module.exports = router;



