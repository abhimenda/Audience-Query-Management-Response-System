

const TAGS = {
  QUESTION: 'question',
  REQUEST: 'request',
  COMPLAINT: 'complaint',
  COMPLIMENT: 'compliment',
  FEEDBACK: 'feedback',
  BUG_REPORT: 'bug_report',
  FEATURE_REQUEST: 'feature_request',
  REFUND: 'refund',
  TECHNICAL: 'technical'
};

const TAG_KEYWORDS = {
  [TAGS.QUESTION]: ['question', 'how', 'what', 'why', 'when', 'where', 'can you', 'do you', '?'],
  [TAGS.REQUEST]: ['request', 'please', 'can i', 'would like', 'need', 'want', 'order'],
  [TAGS.COMPLAINT]: ['complaint', 'unhappy', 'disappointed', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'angry', 'frustrated', 'upset'],
  [TAGS.COMPLIMENT]: ['great', 'excellent', 'amazing', 'love', 'thank you', 'thanks', 'wonderful', 'fantastic', 'awesome'],
  [TAGS.FEEDBACK]: ['feedback', 'suggestion', 'opinion', 'think', 'feel'],
  [TAGS.BUG_REPORT]: ['bug', 'error', 'broken', 'not working', 'issue', 'problem', 'crash', 'glitch'],
  [TAGS.FEATURE_REQUEST]: ['feature', 'add', 'implement', 'would be nice', 'could you add'],
  [TAGS.REFUND]: ['refund', 'return', 'money back', 'cancel', 'reimbursement'],
  [TAGS.TECHNICAL]: ['technical', 'api', 'integration', 'code', 'developer', 'technical support']
};

function detectTags(content, subject = '') {
  const text = (content + ' ' + subject).toLowerCase();
  const detectedTags = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    if (matches.length > 0) {
      detectedTags.push(tag);
    }
  }


  if (detectedTags.length === 0) {
    detectedTags.push(TAGS.QUESTION);
  }

  return detectedTags;
}

function detectPriority(content, subject = '', tags = []) {
  const text = (content + ' ' + subject).toLowerCase();
  

  const highPriorityKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'broken', 'down', 'not working'];
  const hasHighPriorityKeyword = highPriorityKeywords.some(keyword => text.includes(keyword));
  

  const isHighPriorityTag = tags.includes(TAGS.COMPLAINT) || tags.includes(TAGS.BUG_REPORT);
  
 
  const hasUrgencyMarkers = (text.match(/!!+/g) || []).length > 0 || /[A-Z]{5,}/.test(content);
  
  if (hasHighPriorityKeyword || isHighPriorityTag || hasUrgencyMarkers) {
    return 'high';
  }
  

  const lowPriorityKeywords = ['whenever', 'no rush', 'someday', 'maybe'];
  const hasLowPriorityKeyword = lowPriorityKeywords.some(keyword => text.includes(keyword));
  const isLowPriorityTag = tags.includes(TAGS.COMPLIMENT) || tags.includes(TAGS.FEEDBACK);
  
  if (hasLowPriorityKeyword || isLowPriorityTag) {
    return 'low';
  }
  
  return 'medium';
}

function suggestAssignment(tags, priority) {

  if (tags.includes('technical') || tags.includes('bug_report')) {
    return 'team-3'; // Technical Team
  }
  
  if (tags.includes('request') || tags.includes('refund')) {
    return 'team-2';
  }
  
  if (priority === 'high' || tags.includes('complaint')) {
    return 'team-1'; 
  }
  
  return 'team-1'; 
}

module.exports = {
  detectTags,
  detectPriority,
  suggestAssignment,
  TAGS
};



