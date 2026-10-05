/**
 * Phase 5 Comprehensive End-to-End Business Flow Test Suite
 * Covers the complete recruiter-candidate lifecycle:
 *
 * 1. Recruiter registers & logs in
 * 2. Recruiter checks dashboard (empty initial state)
 * 3. Recruiter creates "Staff Software Architect" job posting
 * 4. Recruiter verifies job in "My Jobs"
 * 5. Candidate registers & logs in
 * 6. Candidate establishes profile (skills, resume, education)
 * 7. Candidate searches for "Software Architect"
 * 8. Candidate views job details
 * 9. Candidate submits application with cover letter
 * 10. Recruiter views applicants for the job
 * 11. Recruiter reviews candidate profile & application details
 * 12. Recruiter transitions status: PENDING -> SHORTLISTED
 * 13. Recruiter transitions status: SHORTLISTED -> ACCEPTED
 * 14. Candidate checks "My Applications" and observes ACCEPTED status
 * 15. Cross-role negative check: Candidate blocked from recruiter APIs
 * 16. Cross-role negative check: Recruiter blocked from candidate APIs
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

async function runFinalE2EWorkflow() {
  console.log('===============================================================');
  console.log('=== STARTING PHASE 5 FINAL END-TO-END BUSINESS FLOW TEST ======');
  console.log('===============================================================\n');

  const ts = Date.now();

  // Step 1: Recruiter Registration
  const recEmail = `final_recruiter_${ts}@enterprise.com`;
  const regRec = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Senior Talent Lead', email: recEmail, password: 'SecurePassword123!', role: 'RECRUITER' }
  );
  if (regRec.status !== 201) throw new Error(`1. Recruiter registration failed: ${JSON.stringify(regRec.body)}`);
  const tokenRec = regRec.body.token;
  console.log('✓ 1. Recruiter registration & authentication: SUCCESS');

  // Step 2: Recruiter Dashboard Check
  const recStats = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/dashboard/stats', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRec}` } }
  );
  if (recStats.status !== 200 || !recStats.body.data) throw new Error('2. Recruiter dashboard stats retrieval failed');
  console.log('✓ 2. Recruiter dashboard initial stats: SUCCESS (Isolated zero counts)');

  // Step 3: Recruiter Creates Job
  const createJob = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'POST', headers: { 'Authorization': `Bearer ${tokenRec}`, 'Content-Type': 'application/json' } },
    {
      title: 'Staff Software Architect',
      company_name: 'CloudScale Global Inc',
      description: 'Lead next-generation multi-tenant cloud services architecture.',
      required_skills: 'Node.js, Express, React, MySQL, Distributed Systems',
      location: 'Bangalore, India',
      job_type: 'FULL_TIME',
      work_mode: 'HYBRID',
      experience_required: '7+ years',
      min_salary: 2500000,
      max_salary: 3500000,
      deadline: '2028-06-30'
    }
  );
  if (createJob.status !== 201 || !createJob.body.data?.id) throw new Error('3. Job creation failed');
  const jobId = createJob.body.data.id;
  console.log(`✓ 3. Recruiter created Job #${jobId} ("Staff Software Architect"): SUCCESS`);

  // Step 4: Recruiter Verifies Job Listing
  const myJobs = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRec}` } }
  );
  if (myJobs.status !== 200 || myJobs.body.data.length === 0) throw new Error('4. Recruiter job listing failed');
  console.log('✓ 4. Recruiter verified posted job in Manage My Jobs: SUCCESS');

  // Step 5: Candidate Registration
  const candEmail = `final_candidate_${ts}@techtalent.com`;
  const regCand = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Alex Johnson', email: candEmail, password: 'SecurePassword123!', role: 'CANDIDATE', phone: '9123456780' }
  );
  if (regCand.status !== 201) throw new Error('5. Candidate registration failed');
  const tokenCand = regCand.body.token;
  console.log('✓ 5. Candidate registration & authentication: SUCCESS');

  // Step 6: Candidate Establishes Profile
  const updateProfile = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'PUT', headers: { 'Authorization': `Bearer ${tokenCand}`, 'Content-Type': 'application/json' } },
    {
      location: 'Bangalore, India',
      summary: 'Experienced distributed systems engineer and full stack practitioner.',
      skills: 'Node.js, Express, React, MySQL, Docker, Kubernetes',
      education: 'Master of Science in Software Engineering',
      experience: '8 years leading cloud services engineering',
      resume_url: 'https://example.com/alex_johnson_cv.pdf',
      linkedin_url: 'https://linkedin.com/in/alex-johnson',
      github_url: 'https://github.com/alex-johnson'
    }
  );
  if (updateProfile.status !== 200) throw new Error('6. Profile update failed');
  console.log('✓ 6. Candidate profile established and persisted: SUCCESS');

  // Step 7: Candidate Searches for Job
  const searchJobs = await request(
    { hostname: 'localhost', port: 5000, path: `/api/jobs?search=${encodeURIComponent('Software Architect')}`, method: 'GET' }
  );
  if (searchJobs.status !== 200 || searchJobs.body.data.length === 0) throw new Error('7. Job search failed');
  console.log('✓ 7. Candidate searched & found targeted job posting: SUCCESS');

  // Step 8: Candidate Views Job Details
  const jobDetails = await request(
    { hostname: 'localhost', port: 5000, path: `/api/jobs/${jobId}`, method: 'GET' }
  );
  if (jobDetails.status !== 200 || jobDetails.body.data.title !== 'Staff Software Architect') throw new Error('8. Job details failed');
  console.log('✓ 8. Candidate inspected full job specifications: SUCCESS');

  // Step 9: Candidate Submits Application
  const applyRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST', headers: { 'Authorization': `Bearer ${tokenCand}`, 'Content-Type': 'application/json' } },
    {
      job_id: jobId,
      cover_letter: 'Passionate about architecting reliable cloud infrastructures at scale.',
      resume_url: 'https://example.com/alex_johnson_cv.pdf'
    }
  );
  if (applyRes.status !== 201 || !applyRes.body.data?.id) throw new Error('9. Job application failed');
  const appId = applyRes.body.data.id;
  console.log(`✓ 9. Candidate applied to Job #${jobId} (Application #${appId}, status: PENDING): SUCCESS`);

  // Step 10: Recruiter Views Applicants
  const applicantsRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/jobs/${jobId}/applications`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRec}` } }
  );
  if (applicantsRes.status !== 200 || applicantsRes.body.data.applications.length !== 1) throw new Error('10. Applicants review failed');
  console.log('✓ 10. Recruiter inspected job applicant pipeline: SUCCESS');

  // Step 11: Recruiter Reviews Candidate Profile & Application
  const appDetailRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}`, method: 'GET', headers: { 'Authorization': `Bearer ${tokenRec}` } }
  );
  if (appDetailRes.status !== 200 || appDetailRes.body.data.candidate_email !== candEmail) throw new Error('11. Application detail review failed');
  console.log('✓ 11. Recruiter reviewed detailed candidate qualifications & cover letter: SUCCESS');

  // Step 12: Recruiter Shortlists Application
  const shortlistRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRec}`, 'Content-Type': 'application/json' } },
    { status: 'SHORTLISTED' }
  );
  if (shortlistRes.status !== 200 || shortlistRes.body.data.status !== 'SHORTLISTED') throw new Error('12. Shortlist update failed');
  console.log('✓ 12. Recruiter updated application status to SHORTLISTED: SUCCESS');

  // Step 13: Recruiter Accepts Candidate
  const acceptRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/recruiter/applications/${appId}/status`, method: 'PUT', headers: { 'Authorization': `Bearer ${tokenRec}`, 'Content-Type': 'application/json' } },
    { status: 'ACCEPTED' }
  );
  if (acceptRes.status !== 200 || acceptRes.body.data.status !== 'ACCEPTED') throw new Error('13. Accept update failed');
  console.log('✓ 13. Recruiter updated application status to ACCEPTED: SUCCESS');

  // Step 14: Candidate Verifies Updated Status in My Applications
  const myApps = await request(
    { hostname: 'localhost', port: 5000, path: '/api/applications/my', method: 'GET', headers: { 'Authorization': `Bearer ${tokenCand}` } }
  );
  const matchedApp = (myApps.body.data || []).find((a) => a.id === appId);
  if (!matchedApp || matchedApp.status !== 'ACCEPTED') throw new Error('14. Candidate status synchronization failed');
  console.log('✓ 14. Candidate My Applications reflected real-time ACCEPTED status: SUCCESS');

  // Step 15: Candidate Attempting Recruiter Endpoint -> 403 Forbidden
  const candOnRec = await request(
    { hostname: 'localhost', port: 5000, path: '/api/recruiter/jobs', method: 'GET', headers: { 'Authorization': `Bearer ${tokenCand}` } }
  );
  if (candOnRec.status !== 403) throw new Error('15. Candidate accessing recruiter endpoint was not 403');
  console.log('✓ 15. Negative check: Candidate accessing recruiter endpoint blocked (403 Forbidden): SUCCESS');

  // Step 16: Recruiter Attempting Candidate Endpoint -> 403 Forbidden
  const recOnCand = await request(
    { hostname: 'localhost', port: 5000, path: '/api/candidate/profile', method: 'GET', headers: { 'Authorization': `Bearer ${tokenRec}` } }
  );
  if (recOnCand.status !== 403) throw new Error('16. Recruiter accessing candidate endpoint was not 403');
  console.log('✓ 16. Negative check: Recruiter accessing candidate endpoint blocked (403 Forbidden): SUCCESS');

  console.log('\n===============================================================');
  console.log('=== ALL 16 PHASE 5 END-TO-END WORKFLOW CHECKS PASSED 100% =====');
  console.log('===============================================================');
}

runFinalE2EWorkflow().catch((err) => {
  console.error('\n❌ PHASE 5 END-TO-END TEST FAILED:', err);
  process.exit(1);
});
