import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs } from '../services/authService';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    totalJobs: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter form state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');

  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    setErrorMsg('');

    const params = {
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      jobType: searchParams.get('jobType') || undefined,
      workMode: searchParams.get('workMode') || undefined,
      minSalary: searchParams.get('minSalary') || undefined,
      maxSalary: searchParams.get('maxSalary') || undefined,
      page: searchParams.get('page') || 1,
      limit: 6
    };

    try {
      const res = await getJobs(params);
      if (res.success) {
        setJobs(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load jobs list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search.trim()) newParams.search = search.trim();
    if (location.trim()) newParams.location = location.trim();
    if (jobType) newParams.jobType = jobType;
    if (workMode) newParams.workMode = workMode;
    if (minSalary) newParams.minSalary = minSalary;
    if (maxSalary) newParams.maxSalary = maxSalary;
    newParams.page = 1;
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setWorkMode('');
    setMinSalary('');
    setMaxSalary('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const current = Object.fromEntries(searchParams.entries());
    current.page = newPage;
    setSearchParams(current);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary undisclosed';
    const formatLakhs = (val) => {
      const num = Number(val);
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1).replace('.0', '')} LPA`;
      }
      return `₹${num.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${formatLakhs(min)} - ${formatLakhs(max)}`;
    if (min) return `From ${formatLakhs(min)}`;
    return `Up to ${formatLakhs(max)}`;
  };

  return (
    <div className="page-container jobs-page-container">
      <div className="jobs-header">
        <h1>Explore Available Opportunities</h1>
        <p className="text-muted">Find your next career move from actively hiring companies</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card filter-card">
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <div className="search-bar-row">
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search jobs by title, company or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search Jobs
            </button>
          </div>

          <div className="filter-options-grid">
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g. Pune, Bangalore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Job Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Work Mode</label>
              <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                <option value="">All Modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Salary (₹/yr)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Max Salary (₹/yr)</label>
              <input
                type="number"
                placeholder="e.g. 1200000"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions-row">
            <span className="results-count-text">
              Showing {jobs.length} of {pagination.totalJobs} jobs
            </span>
            <div className="filter-buttons">
              <button type="button" onClick={handleClearFilters} className="btn btn-outline btn-sm">
                Clear Filters
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Jobs Listing */}
      {errorMsg && (
        <div className="alert alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading available jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-icon">🔍</div>
          <h3>No jobs found matching your criteria.</h3>
          <p className="text-muted">Try clearing some filters or searching with different keywords.</p>
          <button onClick={handleClearFilters} className="btn btn-outline mt-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="jobs-cards-grid">
          {jobs.map((job) => (
            <div key={job.id} className="card job-card">
              <div className="job-card-top">
                <div>
                  <span className="job-company">{job.company_name}</span>
                  <h3 className="job-title">{job.title}</h3>
                </div>
                <span className={`pill-badge badge-${job.work_mode.toLowerCase()}`}>
                  {job.work_mode}
                </span>
              </div>

              <div className="job-meta-row">
                <span className="meta-pill">📍 {job.location}</span>
                <span className="meta-pill">💼 {job.job_type.replace('_', ' ')}</span>
                {job.experience_required && (
                  <span className="meta-pill">⏳ {job.experience_required}</span>
                )}
              </div>

              <div className="job-salary-line">
                💰 {formatSalary(job.min_salary, job.max_salary)}
              </div>

              <p className="job-description-excerpt">
                {job.description.length > 130
                  ? `${job.description.substring(0, 130)}...`
                  : job.description}
              </p>

              {job.required_skills && (
                <div className="skills-tags-list">
                  {job.required_skills
                    .split(',')
                    .slice(0, 4)
                    .map((s, idx) => (
                      <span key={idx} className="skill-tag">
                        {s.trim()}
                      </span>
                    ))}
                  {job.required_skills.split(',').length > 4 && (
                    <span className="skill-tag-more">
                      +{job.required_skills.split(',').length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="job-card-bottom">
                <span className="posted-date">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
                <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="btn btn-outline btn-sm"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || loading}
            className="btn btn-outline btn-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
