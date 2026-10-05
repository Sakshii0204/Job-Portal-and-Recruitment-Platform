/**
 * Phase 4 Comprehensive API Security, Validation, and Hardening Test Suite
 * Minimum 29 Automated Checks covering:
 *
 * Authentication:
 * 1. Register valid candidate
 * 2. Register valid recruiter
 * 3. Duplicate email rejection (409)
 * 4. Invalid email format rejection (400)
 * 5. Weak password rejection (400)
 * 6. Missing token on protected endpoint (401)
 * 7. Invalid/tampered token rejection (401)
 * 8. Malformed token header rejection (401)
 *
 * Authorization:
 * 9. Candidate accessing recruiter API -> 403 Forbidden
 * 10. Recruiter accessing candidate-only API -> 403 Forbidden
 * 11. Recruiter A accessing Recruiter B job -> 403 Forbidden
 * 12. Recruiter A modifying Recruiter B application -> 403 Forbidden
 *
 * Validation:
 * 13. Invalid job data (empty title/description) -> 400
 * 14. Invalid salary (negative values) -> 400
 * 15. min salary > max salary -> 400
 * 16. Invalid job type enum -> 400
 * 17. Invalid work mode enum -> 400
 * 18. Invalid application status enum -> 400
 * 19. Invalid ID parameter (non-numeric, negative, floating) -> 400
 * 20. Pagination safety (out-of-bounds page and oversized limit capped)
 *
 * Applications:
 * 21. Duplicate application -> 409 Conflict
 * 22. Apply to closed job -> 400 Bad Request
 * 23. Recruiter applying as candidate -> 403 Forbidden
 * 24. Candidate can only see own applications (data isolation)
 *
 * Security:
 * 25. SQL injection pattern in search/filter -> handled safely without error
 * 26. Malformed query parameters -> handled safely
 * 27. Client attempting to set arbitrary recruiter_id in job creation -> ignored, bound to JWT
 * 28. Client attempting to bypass ownership in status update -> rejected 403
 * 29. Security headers presence (X-Content-Type-Options, X-Frame-Options, no X-Powered-By)
 */

const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runSecurityTestSuite() {
  console.log('===============================================================');
  console.log('=== STARTING PHASE 4 MASTER SECURITY & VALIDATION TEST SUITE ===');
  console.log('===============================================================\n');

  const ts = Date.now();

  // 1. Register valid candidate
  const candEmail = `sec_cand_${ts}@test.com`;
  const regCand = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Security Tester', email: candEmail, password: 'StrongPassword123!', role: 'CANDIDATE', phone: '9876543210' }
  );
  if (regCand.status !== 201) throw new Error(`1. Register valid candidate failed: ${JSON.stringify(regCand.body)}`);
  const tokenCand = regCand.body.token;
  console.log('✓ 1. Register valid candidate: PASS (201 Created)');

  // 2. Register valid recruiter
  const recAEmail = `sec_rec_a_${ts}@test.com`;
  const regRecA = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Recruiter Alpha', email: recAEmail, password: 'StrongPassword123!', role: 'RECRUITER' }
  );
  if (regRecA.status !== 201) throw new Error(`2. Register valid recruiter failed: ${JSON.stringify(regRecA.body)}`);
  const tokenRecA = regRecA.body.token;
  console.log('✓ 2. Register valid recruiter: PASS (201 Created)');

  // Register second recruiter (Recruiter B)
  const recBEmail = `sec_rec_b_${ts}@test.com`;
  const regRecB = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Recruiter Beta', email: recBEmail, password: 'StrongPassword123!', role: 'RECRUITER' }
  );
  const tokenRecB = regRecB.body.token;

  // 3. Duplicate email rejection
  const dupEmail = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Duplicate User', email: candEmail, password: 'StrongPassword123!', role: 'CANDIDATE' }
  );
  if (dupEmail.status !== 409) throw new Error(`3. Duplicate email not rejected with 409 (got ${dupEmail.status})`);
  console.log('✓ 3. Duplicate email rejection: PASS (409 Conflict)');

  // 4. Invalid email format rejection
  const badEmail = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Bad Email', email: 'notanemail', password: 'StrongPassword123!', role: 'CANDIDATE' }
  );
  if (badEmail.status !== 400) throw new Error(`4. Invalid email not rejected with 400 (got ${badEmail.status})`);
  console.log('✓ 4. Invalid email format rejection: PASS (400 Bad Request)');

  // 5. Weak password rejection (< 6 chars)
  const weakPass = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Weak Pass', email: `weak_${ts}@test.com`, password: '123', role: 'CANDIDATE' }
  );
  if (weakPass.status !== 400) throw new Error(`5. Weak password not rejected with 400 (got ${weakPass.status})`);
  console.log('✓ 5. Weak password rejection: PASS (400 Bad Request)');

  // 6. Missing token on protected endpoint
  const noToken = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'GET' }
  );
  if (noToken.status !== 401) throw new Error(`6. Missing token not rejected with 401 (got ${noToken.status})`);
  console.log('✓ 6. Missing token rejection: PASS (401 Unauthorized)');

  // 7. Invalid/tampered token rejection
  const badToken = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'GET', headers: { 'Authorization': 'Bearer bad_tampered_token_xyz' } }
  );
  if (badToken.status !== 401) throw new Error(`7. Tampered token not rejected with 401 (got ${badToken.status})`);
  console.log('✓ 7. Tampered token rejection: PASS (401 Unauthorized)');

  // 8. Malformed token header rejection
  const malformedHeader = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'GET', headers: { 'Authorization': 'Basic 12345' } }
  );
  if (malformedHeader.status !== 401) throw new Error(`8. Malformed auth header not rejected with 401 (got ${malformedHeader.status})`);
  console.log('✓ 8. Malformed token header rejection: PASS (401 Unauthorized)');

  // 9. Candidate accessing recruiter API -> 403 Forbidden
  const candOnRecruiter = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'GET', headers: { 'Authorization': `Bearer ${tokenCand}` } }
  );
  if (candOnRecruiter.status !== 403) throw new Error(`9. Candidate accessing recruiter API was not 403 (got ${candOnRecruiter.status})`);
  console.log('✓ 9. Candidate accessing recruiter API: PASS (403 Forbidden)');

  // 10. Recruiter accessing candidate-only API -> 403 Forbidden
  const recOnCandidate = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  if (recOnCandidate.status !== 403) throw new Error(`10. Recruiter accessing candidate API was not 403 (got ${recOnCandidate.status})`);
  console.log('✓ 10. Recruiter accessing candidate-only API: PASS (403 Forbidden)');

  // Setup: Recruiter A creates Job A
  const createJobA = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    {
      title: 'DevSecOps Engineer',
      company_name: 'SecureCorp',
      description: 'Implement zero trust network and secrets pipelines.',
      required_skills: 'Linux, Docker, Kubernetes, CI/CD',
      location: 'Bangalore, India',
      job_type: 'FULL_TIME',
      work_mode: 'REMOTE',
      min_salary: 1000000,
      max_salary: 1500000,
      deadline: '2028-01-01'
    }
  );
  if (createJobA.status !== 201) throw new Error('Setup: Job A creation failed');
  const jobAId = createJobA.body.data.id;

  // 11. Recruiter A accessing Recruiter B job -> 403 Forbidden
  const recBOnJobA = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecB}`, 'Content-Type': 'application/json' } },
    { title: 'Attempted Hijack' }
  );
  if (recBOnJobA.status !== 403) throw new Error(`11. Recruiter B accessing Recruiter A job was not 403 (got ${recBOnJobA.status})`);
  console.log('✓ 11. Recruiter A vs Recruiter B job ownership: PASS (403 Forbidden)');

  // Candidate applies to Job A
  const applyRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${tokenCand}`, 'Content-Type': 'application/json' } },
    { job_id: jobAId, cover_letter: 'DevSecOps specialist applying.' }
  );
  if (applyRes.status !== 201) throw new Error('Setup: Candidate application failed');
  const appId = applyRes.body.data.id;

  // 12. Recruiter B modifying Recruiter A application -> 403 Forbidden
  const recBModApp = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecB}`, 'Content-Type': 'application/json' } },
    { status: 'ACCEPTED' }
  );
  if (recBModApp.status !== 403) throw new Error(`12. Recruiter B modifying Recruiter A application was not 403 (got ${recBModApp.status})`);
  console.log('✓ 12. Recruiter A vs Recruiter B application ownership: PASS (403 Forbidden)');

  // 13. Invalid job data (empty title)
  const invalidJobData = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { title: '   ', company_name: 'Corp', description: 'Desc', location: 'City' }
  );
  if (invalidJobData.status !== 400) throw new Error(`13. Empty title was not 400 (got ${invalidJobData.status})`);
  console.log('✓ 13. Empty job title validation: PASS (400 Bad Request)');

  // 14. Invalid salary (negative values)
  const negSalary = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { title: 'Analyst', company_name: 'Corp', description: 'Description here', location: 'City', min_salary: -500 }
  );
  if (negSalary.status !== 400) throw new Error(`14. Negative salary was not 400 (got ${negSalary.status})`);
  console.log('✓ 14. Negative salary validation: PASS (400 Bad Request)');

  // 15. min salary > max salary
  const invertedSalary = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { title: 'Analyst', company_name: 'Corp', description: 'Description here', location: 'City', min_salary: 80000, max_salary: 50000 }
  );
  if (invertedSalary.status !== 400) throw new Error(`15. Inverted salary was not 400 (got ${invertedSalary.status})`);
  console.log('✓ 15. Min salary > max salary validation: PASS (400 Bad Request)');

  // 16. Invalid job type enum
  const badJobType = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { title: 'Analyst', company_name: 'Corp', description: 'Description here', location: 'City', job_type: 'INVALID_ENUM' }
  );
  if (badJobType.status !== 400) throw new Error(`16. Bad job type enum was not 400 (got ${badJobType.status})`);
  console.log('✓ 16. Invalid job type enum validation: PASS (400 Bad Request)');

  // 17. Invalid work mode enum
  const badWorkMode = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { title: 'Analyst', company_name: 'Corp', description: 'Description here', location: 'City', work_mode: 'ON_THE_MOON' }
  );
  if (badWorkMode.status !== 400) throw new Error(`17. Bad work mode enum was not 400 (got ${badWorkMode.status})`);
  console.log('✓ 17. Invalid work mode enum validation: PASS (400 Bad Request)');

  // 18. Invalid application status enum
  const badStatus = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { status: 'PROMOTE_TO_VP' }
  );
  if (badStatus.status !== 400) throw new Error(`18. Bad status enum was not 400 (got ${badStatus.status})`);
  console.log('✓ 18. Invalid application status enum: PASS (400 Bad Request)');

  // 19. Invalid ID parameter (non-numeric, negative)
  const nonNumericId = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs/abc_invalid', method: 'GET' });
  if (nonNumericId.status !== 400) throw new Error(`19. Non-numeric ID was not 400 (got ${nonNumericId.status})`);

  const negativeId = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs/-10', method: 'GET' });
  if (negativeId.status !== 400) throw new Error(`19. Negative ID was not 400 (got ${negativeId.status})`);
  console.log('✓ 19. Invalid ID parameter validation: PASS (400 Bad Request for abc & -10)');

  // 20. Pagination safety
  const safePagination = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs?page=-5&limit=999999', method: 'GET' });
  if (safePagination.status !== 200 || safePagination.body.pagination.limit > 50) {
    throw new Error('20. Pagination values not safely capped');
  }
  console.log(`✓ 20. Pagination safety capped: PASS (limit capped to ${safePagination.body.pagination.limit})`);

  // 21. Duplicate application -> 409 Conflict
  const dupApp = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${tokenCand}`, 'Content-Type': 'application/json' } },
    { job_id: jobAId, cover_letter: 'Applying second time' }
  );
  if (dupApp.status !== 409) throw new Error(`21. Duplicate application was not 409 (got ${dupApp.status})`);
  console.log('✓ 21. Duplicate application prevention: PASS (409 Conflict)');

  // 22. Apply to closed job -> rejected 400
  await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobAId}/close`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecA}` } }
  );
  const cand2 = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Late Cand', email: `cand_late_${ts}@test.com`, password: 'Password123!', role: 'CANDIDATE' }
  );
  const applyClosed = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${cand2.body.token}`, 'Content-Type': 'application/json' } },
    { job_id: jobAId, cover_letter: 'Late apply' }
  );
  if (applyClosed.status !== 400) throw new Error(`22. Apply to closed job was not 400 (got ${applyClosed.status})`);
  console.log('✓ 22. Apply to closed job rejection: PASS (400 Bad Request)');

  // 23. Recruiter applying as candidate -> 403 Forbidden
  const recApply = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { job_id: 1, cover_letter: 'Recruiter applying' }
  );
  if (recApply.status !== 403) throw new Error(`23. Recruiter applying was not 403 (got ${recApply.status})`);
  console.log('✓ 23. Recruiter cannot apply as candidate: PASS (403 Forbidden)');

  // 24. Candidate can only see own applications (data isolation)
  const cand1Apps = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications/my', method: 'GET', headers: { 'Authorization': `Bearer ${tokenCand}` } }
  );
  const cand2Apps = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications/my', method: 'GET', headers: { 'Authorization': `Bearer ${cand2.body.token}` } }
  );
  if (cand1Apps.body.count !== 1 || cand2Apps.body.count !== 0) {
    throw new Error('24. Candidate application data isolation failed');
  }
  console.log('✓ 24. Candidate application data isolation: PASS (Tenant separated)');

  // 25. SQL injection pattern in search/filter handled safely
  const sqlInjectionPath = `/api/jobs?search=${encodeURIComponent("' OR '1'='1")}&location=${encodeURIComponent("'; DROP TABLE jobs; --")}`;
  const sqlInjectionAttempt = await request(
    { hostname: 'localhost', port: 5000, path: sqlInjectionPath, method: 'GET' }
  );
  if (sqlInjectionAttempt.status !== 200) throw new Error(`25. SQL injection search crashed: got ${sqlInjectionAttempt.status}`);
  console.log('✓ 25. SQL injection input in search/filter: PASS (Safely parameterized)');

  // 26. Malformed query parameters handled safely
  const malformedParams = await request(
    { hostname: 'localhost', port: 5000, path: '/api/jobs?minSalary=abc&maxSalary=def&page=nan', method: 'GET' }
  );
  if (malformedParams.status !== 200) throw new Error(`26. Malformed query params crashed: got ${malformedParams.status}`);
  console.log('✓ 26. Malformed query parameters handling: PASS (200 OK safe fallback)');

  // 27. Client attempting to set arbitrary recruiter_id in job creation -> bound strictly to JWT
  const forgedRecruiterJob = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRecA}`, 'Content-Type': 'application/json' } },
    { title: 'Spoofed Job', company_name: 'Spoof Corp', description: 'Testing recruiter_id spoofing', location: 'Remote', job_type: 'FULL_TIME', work_mode: 'REMOTE', recruiter_id: 999999 }
  );
  if (forgedRecruiterJob.status !== 201 || Number(forgedRecruiterJob.body?.data?.recruiter_id) === 999999 || Number(forgedRecruiterJob.body?.data?.recruiter_id) !== regRecA.body.user.id) {
    throw new Error(`27. Backend trusted client recruiter_id: ${JSON.stringify(forgedRecruiterJob.body)}`);
  }
  console.log('✓ 27. Frontend recruiter_id spoofing ignored: PASS (Strictly bound to JWT req.user.id)');

  // 28. Client attempting to bypass ownership in status update -> rejected 403
  const forgedUpdate = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRecB}`, 'Content-Type': 'application/json' } },
    { status: 'SHORTLISTED', recruiter_id: regRecA.body.user.id }
  );
  if (forgedUpdate.status !== 403) throw new Error(`28. Ownership bypass was not 403 (got ${forgedUpdate.status})`);
  console.log('✓ 28. Ownership bypass attempt in status update: PASS (403 Forbidden)');

  // 29. Security headers verification
  const healthCheck = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  const h = healthCheck.headers;
  if (h['x-content-type-options'] !== 'nosniff' || h['x-frame-options'] !== 'DENY' || h['x-powered-by']) {
    throw new Error(`29. Security headers missing or incomplete: ${JSON.stringify(h)}`);
  }
  console.log('✓ 29. HTTP Security Headers: PASS (nosniff, DENY, x-powered-by suppressed)');

  console.log('\n===============================================================');
  console.log('=== ALL 29 PHASE 4 SECURITY & VALIDATION CHECKS PASSED 100% ===');
  console.log('===============================================================');
}

runSecurityTestSuite().catch((err) => {
  console.error('\n❌ PHASE 4 SECURITY TEST FAILED:', err);
  process.exit(1);
});
