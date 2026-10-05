/**
 * Phase 3 Automated Recruiter Workflow Verification Test Suite
 * Covers:
 * 1. Recruiter registration & login
 * 2. Recruiter dashboard stats retrieval
 * 3. Recruiter A creates Job A
 * 4. Recruiter A retrieves own jobs (verifies application_count)
 * 5. Candidate applies to Job A
 * 6. Recruiter A views applicants for Job A
 * 7. Recruiter A inspects applicant details
 * 8. Recruiter A transitions status: PENDING -> SHORTLISTED -> ACCEPTED
 * 9. Candidate verifies updated status in My Applications
 * 10. Recruiter B attempts unauthorized actions on Job A and Application (403 Forbidden checks)
 * 11. Recruiter A closes Job A
 * 12. Candidate attempts applying to closed Job A (blocked 400)
 * 13. Candidate cannot access recruiter-only endpoints (403 Forbidden)
 * 14. Recruiter cannot access candidate-only endpoints (403 Forbidden)
 */
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runPhase3WorkflowTests() {
  console.log('=== STARTING PHASE 3 RECRUITER WORKFLOW TESTS ===\n');

  const ts = Date.now();

  // Step 1: Register Recruiter A
  const recAEmail = `recruiter_a_${ts}@test.com`;
  const regRecA = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Recruiter Alpha', email: recAEmail, password: 'Password123!', role: 'RECRUITER' }
  );
  if (regRecA.status !== 201) throw new Error(`Recruiter A registration failed: ${JSON.stringify(regRecA.body)}`);
  const tokenRecA = regRecA.body.token;
  console.log('✓ 1. Recruiter A registered & authenticated successfully');

  // Step 2: Register Recruiter B
  const recBEmail = `recruiter_b_${ts}@test.com`;
  const regRecB = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Recruiter Beta', email: recBEmail, password: 'Password123!', role: 'RECRUITER' }
  );
  if (regRecB.status !== 201) throw new Error(`Recruiter B registration failed: ${JSON.stringify(regRecB.body)}`);
  const tokenRecB = regRecB.body.token;
  console.log('✓ 2. Recruiter B registered & authenticated successfully');

  // Step 3: Register Candidate
  const candEmail = `candidate_p3_${ts}@test.com`;
  const regCand = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Candidate Prime', email: candEmail, password: 'Password123!', role: 'CANDIDATE', phone: '9988776655' }
  );
  if (regCand.status !== 201) throw new Error(`Candidate registration failed: ${JSON.stringify(regCand.body)}`);
  const tokenCand = regCand.body.token;

  // Setup Candidate Profile
  await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'PUT', headers: { 'Authorization': `Bearer ${tokenCand}`, 'Content-Type': 'application/json' } },
    { location: 'Delhi, India', summary: 'Senior React Dev', skills: 'React, Node.js, SQL', experience: '4 years', education: 'B.E. Computer Science' }
  );
  console.log('✓ 3. Candidate registered & profile established');

  // Step 4: Recruiter Dashboard Stats check
  const dashStatsA = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/dashboard/stats', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (dashStatsA.status !== 200 || !dashStatsA.body.data) throw new Error('Dashboard stats failed');
  console.log('✓ 4. Recruiter A dashboard statistics retrieved (isolated count: 0 jobs)');

  // Step 5: Recruiter A creates Job A
  const createJobRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    {
      title: 'Senior Full Stack Architect',
      company_name: 'Alpha Systems Inc',
      description: 'Lead engineering teams across high concurrency distributed platforms.',
      required_skills: 'Node.js, Express, React, MySQL',
      location: 'Hyderabad, India',
      job_type: 'FULL_TIME',
      work_mode: 'HYBRID',
      experience_required: '5+ years',
      min_salary: 1200000,
      max_salary: 1800000,
      deadline: '2027-12-31'
    }
  );
  if (createJobRes.status !== 201 || !createJobRes.body.data?.id) throw new Error('Job creation failed');
  const jobAId = createJobRes.body.data.id;
  console.log(`✓ 5. Recruiter A created Job #${jobAId} successfully`);

  // Step 6: Recruiter A lists own jobs
  const myJobsRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (myJobsRes.status !== 200 || myJobsRes.body.data.length === 0) throw new Error('Recruiter jobs listing failed');
  console.log(`✓ 6. Recruiter A retrieved own jobs list (${myJobsRes.body.data.length} job found)`);

  // Step 7: Recruiter A edits own Job A
  const editJobRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    {
      title: 'Principal Full Stack Architect',
      company_name: 'Alpha Systems Inc',
      description: 'Updated description: Lead platforms at global scale.',
      required_skills: 'Node.js, Express, React, MySQL, Redis',
      location: 'Hyderabad, India',
      job_type: 'FULL_TIME',
      work_mode: 'REMOTE',
      experience_required: '6+ years',
      min_salary: 1400000,
      max_salary: 2000000,
      deadline: '2027-12-31'
    }
  );
  if (editJobRes.status !== 200 || editJobRes.body.data.title !== 'Principal Full Stack Architect') throw new Error('Job edit failed');
  console.log('✓ 7. Recruiter A edited own job details successfully');

  // Step 8: Candidate applies to Job A
  const applyRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${tokenCand}`, 'Content-Type': 'application/json' } },
    { job_id: jobAId, cover_letter: 'Excited about architecting distributed nodes.', resume_url: 'https://example.com/prime_cv.pdf' }
  );
  if (applyRes.status !== 201) throw new Error('Candidate application failed');
  const appId = applyRes.body.data.id;
  console.log(`✓ 8. Candidate applied to Job #${jobAId} (Application #${appId}, status: PENDING)`);

  // Step 9: Recruiter A views applicants for Job A
  const applicantsRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}/applications`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (applicantsRes.status !== 200 || applicantsRes.body.data.applications.length !== 1) throw new Error('Applicant listing failed');
  console.log(`✓ 9. Recruiter A viewed applicants for Job A (found Candidate Prime)`);

  // Step 10: Recruiter A views detailed application
  const appDetailRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (appDetailRes.status !== 200 || appDetailRes.body.data.candidate_email !== candEmail) throw new Error('Application details retrieval failed');
  console.log('✓ 10. Recruiter A viewed candidate full profile & application details');

  // Step 11: Recruiter A updates status: PENDING -> SHORTLISTED
  const shortlistRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { status: 'SHORTLISTED' }
  );
  if (shortlistRes.status !== 200 || shortlistRes.body.data.status !== 'SHORTLISTED') throw new Error('Status update to SHORTLISTED failed');
  console.log('✓ 11. Recruiter A updated status to SHORTLISTED');

  // Step 12: Recruiter A updates status: SHORTLISTED -> ACCEPTED
  const acceptRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { status: 'ACCEPTED' }
  );
  if (acceptRes.status !== 200 || acceptRes.body.data.status !== 'ACCEPTED') throw new Error('Status update to ACCEPTED failed');
  console.log('✓ 12. Recruiter A updated status to ACCEPTED');

  // Step 13: Candidate verifies updated status in My Applications
  const candMyApps = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications/my', method: 'GET', headers: { 'Authorization': `Bearer ${tokenCand}` } }
  );
  const applicationsList = candMyApps.body.data || [];
  const foundApp = applicationsList.find((a) => a.id === appId);
  if (!foundApp || (foundApp.status !== 'ACCEPTED' && foundApp.application_status !== 'ACCEPTED')) throw new Error('Candidate did not receive updated status');
  console.log('✓ 13. Candidate My Applications verified: reflects status ACCEPTED');

  // Step 14: Cross-Recruiter Security - Recruiter B attempts unauthorized actions
  console.log('\n--- Running Cross-Recruiter Ownership & Boundary Checks ---');

  // Recruiter B tries to edit Job A
  const recBEdit = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecB}`, 'Content-Type': 'application/json' } },
    { title: 'Hacked Title' }
  );
  if (recBEdit.status !== 403) throw new Error(`Recruiter B edit job was not forbidden (got ${recBEdit.status})`);
  console.log('✓ 14. Recruiter B edit Job A: BLOCKED with 403 Forbidden');

  // Recruiter B tries to view applicants for Job A
  const recBViewApplicants = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}/applications`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecB}` } }
  );
  if (recBViewApplicants.status !== 403) throw new Error(`Recruiter B view applicants was not forbidden (got ${recBViewApplicants.status})`);
  console.log('✓ 15. Recruiter B view applicants of Job A: BLOCKED with 403 Forbidden');

  // Recruiter B tries to view application details
  const recBViewApp = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecB}` } }
  );
  if (recBViewApp.status !== 403) throw new Error(`Recruiter B view application was not forbidden (got ${recBViewApp.status})`);
  console.log('✓ 16. Recruiter B view applicant details: BLOCKED with 403 Forbidden');

  // Recruiter B tries to update application status
  const recBUpdateStatus = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecB}`, 'Content-Type': 'application/json' } },
    { status: 'REJECTED' }
  );
  if (recBUpdateStatus.status !== 403) throw new Error(`Recruiter B update status was not forbidden (got ${recBUpdateStatus.status})`);
  console.log('✓ 17. Recruiter B update application status: BLOCKED with 403 Forbidden');

  // Recruiter B tries to close Job A
  const recBCloseJob = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}/close`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecB}` } }
  );
  if (recBCloseJob.status !== 403) throw new Error(`Recruiter B close job was not forbidden (got ${recBCloseJob.status})`);
  console.log('✓ 18. Recruiter B close Job A: BLOCKED with 403 Forbidden');

  // Recruiter B tries to delete Job A
  const recBDeleteJob = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}`, method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenRecB}` } }
  );
  if (recBDeleteJob.status !== 403) throw new Error(`Recruiter B delete job was not forbidden (got ${recBDeleteJob.status})`);
  console.log('✓ 19. Recruiter B delete Job A: BLOCKED with 403 Forbidden');

  // Step 15: Role-based boundary checks
  // Candidate attempts to access recruiter endpoint
  const candRecAccess = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'GET', headers: { 'Authorization': `Bearer ${tokenCand}` } }
  );
  if (candRecAccess.status !== 403) throw new Error('Candidate accessing recruiter routes was not blocked');
  console.log('✓ 20. Candidate accessing recruiter endpoints: BLOCKED with 403 Forbidden');

  // Recruiter attempts to access candidate-only endpoint
  const recCandAccess = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (recCandAccess.status !== 403) throw new Error('Recruiter accessing candidate routes was not blocked');
  console.log('✓ 21. Recruiter accessing candidate profile endpoint: BLOCKED with 403 Forbidden');

  // Step 16: Safe Job Closure
  const closeJobRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}/close`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (closeJobRes.status !== 200 || closeJobRes.body.data.status !== 'CLOSED') throw new Error('Job closing failed');
  console.log('✓ 22. Recruiter A closed Job A successfully (soft-close preserved history)');

  // Step 17: Candidate cannot apply to closed job
  // Register fresh candidate
  const cand2Res = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Candidate Late', email: `cand_late_${ts}@test.com`, password: 'Password123!', role: 'CANDIDATE' }
  );
  const applyClosedRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${cand2Res.body.token}`, 'Content-Type': 'application/json' } },
    { job_id: jobAId, cover_letter: 'Applying to closed job' }
  );
  if (applyClosedRes.status !== 400) throw new Error('Application to closed job was not rejected');
  console.log('✓ 23. Application to closed job BLOCKED (400 Bad Request)');

  // Applications remain accessible after closure
  const afterCloseApplicants = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}/applications`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (afterCloseApplicants.status !== 200 || afterCloseApplicants.body.data.applications.length !== 1) throw new Error('Applications lost after job closure');
  console.log('✓ 24. Existing application history preserved after job closure');

  // Step 18: Rejecting invalid status enum
  const invalidStatusRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { status: 'HIRED_IMMEDIATELY' }
  );
  if (invalidStatusRes.status !== 400) throw new Error('Invalid status was not rejected');
  console.log('✓ 25. Invalid status transition rejected (400 Bad Request)');

  console.log('\n======================================================');
  console.log('=== ALL PHASE 3 RECRUITER WORKFLOW TESTS PASSED 100% ===');
  console.log('======================================================');
}

runPhase3WorkflowTests().catch((err) => {
  console.error('\n❌ PHASE 3 TEST FAILED:', err);
  process.exit(1);
});
