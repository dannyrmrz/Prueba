import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  YAxis
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  useProjectsInsights,
  getDashboardMetrics,
  buildRevenueByCategory,
  buildProjectsByCategory,
  buildTopCompaniesSeries
} from '../../../backend/services/projectsDataService';
import './DashboardScreen.css';

const pickProjectField = (project, keys) => {
  for (const key of keys) {
    const value = project[key];
    if (value !== undefined && value !== null && value !== '') {
      return value.toString();
    }
  }
  return '';
};

const parseRevenueToMillions = (value) => {
  if (!value) return Number.NaN;
  const stringValue = value.toString();
  const match = stringValue.replace(/,/g, '').match(/(-?[\d.]+)/);
  if (!match) return Number.NaN;
  const amount = parseFloat(match[1]);
  if (Number.isNaN(amount)) return Number.NaN;
  if (/b/i.test(stringValue)) {
    return amount * 1000;
  }
  if (/k/i.test(stringValue)) {
    return amount / 1000;
  }
  return amount;
};

const parseRevenueRange = (input) => {
  if (!input?.trim()) {
    return null;
  }
  const matches = input.match(/[\d.]+/g);
  if (!matches || matches.length === 0) {
    return null;
  }
  const min = parseFloat(matches[0]);
  const max = matches[1] ? parseFloat(matches[1]) : null;
  return {
    min: Number.isNaN(min) ? null : min,
    max: max !== null && Number.isNaN(max) ? null : max
  };
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const value = payload[0].value;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__value">${value.toFixed(2)}M</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const { name, value } = payload[0];

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{name}</p>
      <p className="chart-tooltip__value">{value} projects</p>
    </div>
  );
};

const CompanyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const revenuePoint = payload.find((item) => item.dataKey === 'revenue');
  const growthPoint = payload.find((item) => item.dataKey === 'growth');

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {revenuePoint && (
        <p className="chart-tooltip__value">
          Revenue: ${revenuePoint.value.toFixed(2)}M
        </p>
      )}
      {growthPoint && (
        <p className="chart-tooltip__value">Growth: {growthPoint.value.toFixed(1)}%</p>
      )}
    </div>
  );
};

const DashboardScreen = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, projects } = useProjectsInsights();
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    revenueRange: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const totalProjects = projects.length;

  const filteredProjects = useMemo(() => {
    if (!totalProjects) {
      return [];
    }

    const revenueRange = parseRevenueRange(filters.revenueRange.trim());
    const normalizedCategory = filters.category.trim().toLowerCase();
    const normalizedStatus = filters.status.trim().toLowerCase();

    return projects.filter((project) => {
      const projectCategory = pickProjectField(project, ['Category', 'Sector', 'Industry']);
      const projectStatus = pickProjectField(project, ['Status', 'State']);
      const projectRevenue = pickProjectField(project, ['Revenue', 'Annual Revenue']);

      const matchesCategory = !normalizedCategory
        || projectCategory.toLowerCase().includes(normalizedCategory);
      const matchesStatus = !normalizedStatus
        || projectStatus.toLowerCase().includes(normalizedStatus);

      let matchesRevenue = true;
      if (revenueRange) {
        const revenueValue = parseRevenueToMillions(projectRevenue);
        if (Number.isNaN(revenueValue)) {
          matchesRevenue = false;
        } else {
          if (revenueRange.min !== null && revenueValue < revenueRange.min) {
            matchesRevenue = false;
          }
          if (matchesRevenue && revenueRange.max !== null && revenueValue > revenueRange.max) {
            matchesRevenue = false;
          }
        }
      }

      return matchesCategory && matchesStatus && matchesRevenue;
    });
  }, [filters, projects, totalProjects]);

  const filteredMetrics = useMemo(() => getDashboardMetrics(filteredProjects), [filteredProjects]);

  const filteredCharts = useMemo(
    () => ({
      revenueByCategory: buildRevenueByCategory(filteredProjects),
      projectsByCategory: buildProjectsByCategory(filteredProjects),
      topCompanies: buildTopCompaniesSeries(filteredProjects)
    }),
    [filteredProjects]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const metricCards = [
    { label: 'Total Projects', value: filteredMetrics.totalProjects.toLocaleString() },
    { label: 'Total Revenue', value: filteredMetrics.totalRevenueLabel },
    { label: 'Avg Growth', value: filteredMetrics.averageGrowthLabel },
    { label: 'Active Projects', value: filteredMetrics.activeProjects.toLocaleString() }
  ];

  const hasRevenueData = filteredCharts.revenueByCategory.length > 0;
  const hasProjectsPie = filteredCharts.projectsByCategory.length > 0;
  const hasTopCompanies = filteredCharts.topCompanies?.length > 0;

  return (
    <main className="dashboard-layout">
      <Sidebar
        user={user}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header__title">Dashboard</h1>
          <p className="dashboard-header__subtitle">
            Analytics and insights for your portfolio
          </p>
        </header>

        {isLoading ? (
          <div className="dashboard-state">Cargando datos del Excel...</div>
        ) : error ? (
          <div className="dashboard-state dashboard-state--error">{error}</div>
        ) : (
          <>
            <section className="dashboard-filters-card" aria-label="Filters">
              <div className="dashboard-filters-card__header">
                <FontAwesomeIcon icon={faFilter} />
                <h2>Filters</h2>
              </div>
              <div className="dashboard-filters-card__grid">
                <label className="dashboard-filters-card__field">
                  <span>Category</span>
                  <input
                    type="text"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    placeholder=""
                  />
                </label>
                <label className="dashboard-filters-card__field">
                  <span>Status</span>
                  <input
                    type="text"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    placeholder=""
                  />
                </label>
                <label className="dashboard-filters-card__field">
                  <span>Revenue Range</span>
                  <input
                    type="text"
                    name="revenueRange"
                    value={filters.revenueRange}
                    onChange={handleFilterChange}
                    placeholder="$10-50"
                  />
                </label>
              </div>
              <div className="dashboard-filters-card__divider" />
              <p className="dashboard-filters-card__meta">
                Showing {filteredProjects.length} of {totalProjects} projects
              </p>
            </section>

            <section className="dashboard-metrics" aria-label="KPI overview">
              {metricCards.map((card) => (
                <article key={card.label} className="metric-card">
                  <p className="metric-card__label">{card.label}</p>
                  <p className="metric-card__value">{card.value}</p>
                </article>
              ))}
            </section>

            <section className="dashboard-charts" aria-label="Charts">
              <article className="chart-card">
                <div className="chart-card__header">
                  <h2>Revenue by Category</h2>
                  <p>Sum based on Excel revenue column</p>
                </div>
                <div className="chart-card__body chart-card__body--bars">
                  {hasRevenueData ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={filteredCharts.revenueByCategory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e7da" />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: '#7d8078' }} />
                        <Tooltip cursor={{ fill: 'rgba(245, 163, 31, 0.15)' }} content={<RevenueTooltip />} />
                        <Bar dataKey="revenue" fill="#f5a31f" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="chart-card__empty">No revenue data available.</p>
                  )}
                </div>
                <div className="chart-card__footer">
                  <div className="chart-card__trend">
                    <TrendingUp size={18} />
                    <span>Avg growth {filteredMetrics.averageGrowthLabel}</span>
                  </div>
                  <p>Breakdown of total revenue per category</p>
                </div>
              </article>

              <article className="chart-card">
                <div className="chart-card__header">
                  <h2>Projects by Category</h2>
                  <p>Active initiatives grouped by sector</p>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  {hasProjectsPie ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Tooltip content={<PieTooltip />} />
                        <Pie
                          data={filteredCharts.projectsByCategory}
                          dataKey="value"
                          nameKey="category"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={2}
                          stroke="#fefaf4"
                        >
                          {filteredCharts.projectsByCategory.map((entry) => (
                            <Cell key={entry.category} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="chart-card__empty">No projects grouped yet.</p>
                  )}
                </div>
                <div className="chart-card__footer">
                  <div className="chart-card__trend">
                    <TrendingUp size={18} />
                    <span>Tracking {filteredMetrics.totalProjects} total projects</span>
                  </div>
                  <p>Category distribution across the portfolio</p>
                </div>
              </article>

              <article className="chart-card chart-card--wide">
                <div className="chart-card__header">
                  <h2>Top Companies - Growth vs Revenue</h2>
                  <p>Comparing portfolio leaders by revenue (left axis) and growth (right axis)</p>
                </div>
                <div className="chart-card__body chart-card__body--line">
                  {hasTopCompanies ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={filteredCharts.topCompanies} margin={{ left: 20, right: 20 }}>
                        <CartesianGrid vertical={false} stroke="#f0e7da" />
                        <XAxis
                          dataKey="company"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#7d8078' }}
                        />
                        <YAxis
                          yAxisId="left"
                          tickFormatter={(value) => `$${value}M`}
                          tick={{ fill: '#7d8078' }}
                          axisLine={false}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => `${value}%`}
                          tick={{ fill: '#7d8078' }}
                          axisLine={false}
                        />
                        <Tooltip content={<CompanyTooltip />} cursor={{ stroke: '#f5a31f' }} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          yAxisId="left"
                          stroke="#f5a31f"
                          strokeWidth={3}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="growth"
                          yAxisId="right"
                          stroke="#118ab2"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="chart-card__empty">Sin datos suficientes para comparar compañías.</p>
                  )}
                </div>
                <div className="chart-card__footer">
                  <div className="chart-card__trend">
                    <TrendingUp size={18} />
                    <span>Monthly monitoring of revenue leaders</span>
                  </div>
                  <p>Visualize how growth accompanies top revenues.</p>
                </div>
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardScreen;
