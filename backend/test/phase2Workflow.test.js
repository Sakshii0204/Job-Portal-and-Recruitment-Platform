/**
 * Phase 2 Automated Candidate Workflow Verification Test Suite
 */
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runCandidateWorkflowTests() {
  console.log('--- Starting Candidate Workflow Verification ---');

  // 1. Register candidate
  const email = `test_candidate_${Date.now()}@example.com`;
  const reg = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Workflow Tester',
    email,
    password: 'Password123!',
    role: 'CANDIDATE',
    phone: '9876543210'
  });
  if (reg.status !== 201) throw new Error('Registration failed');
  const token = reg.body.token;
  console.log('1. Candidate Registered & Authenticated');

  // 2. Update profile
  const profileRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, {
    location: 'Pune, Maharashtra',
    summary: 'Full Stack engineer specializing in React & Node.js',
    skills: 'React, Node, Express, MySQL',
    education: 'B.Tech CS 2024',
    experience: '1 year software development internship',
    resume_url: 'https://example.com/resume.pdf'
  });
  if (profileRes.status !== 200) throw new Error('Profile update failed');
  console.log('2. Candidate Profile Updated Successfully');

  // 3. Browse and Search jobs
  const jobsRes = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs?search=react&location=pune', method: 'GET' });
  if (jobsRes.status !== 200) throw new Error('Jobs search failed');
  console.log('3. Job Search & Filtering Passed');

  // 4. View Job Details
  const jobDetail = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs/1', method: 'GET' });
  if (jobDetail.status !== 200) throw new Error('Job details failed');
  console.log('4. Job Details Fetched Successfully');

  // 5. Apply for job
  const applyRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, {
    job_id: 1,
    cover_letter: 'Applying to test complete workflow',
    resume_url: 'https://example.com/resume.pdf'
  });
  if (applyRes.status !== 201) throw new Error('Apply failed');
  console.log('5. Application Submitted (Status: PENDING)');

  // 6. Duplicate apply prevention
  const dupRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, {
    job_id: 1,
    cover_letter: 'Duplicate'
  });
  if (dupRes.status !== 409) throw new Error('Duplicate application not blocked');
  console.log('6. Duplicate Application Blocked (409 Conflict)');

  // 7. Track my applications
  const myApps = await request({
    hostname: 'localhost', port: 5000, path: '/api/applications/my', method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (myApps.status !== 200 || myApps.body.count !== 1) throw new Error('My applications check failed');
  console.log('7. Application Tracking Verified (1 application found)');

  console.log('--- Candidate Workflow Verification Passed 100% ---');
}

runCandidateWorkflowTests().catch(err => {
  console.error('Workflow Test Error:', err);
  process.exit(1);
});
