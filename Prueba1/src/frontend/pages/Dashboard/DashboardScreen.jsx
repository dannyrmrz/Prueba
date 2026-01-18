import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useProjectsInsights } from '../../../backend/services/projectsDataService';
import './DashboardScreen.css';

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

const DashboardScreen = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { metrics, charts, isLoading, error } = useProjectsInsights();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const metricCards = [
    { label: 'Total Projects', value: metrics.totalProjects.toLocaleString() },
    { label: 'Total Revenue', value: metrics.totalRevenueLabel },
    { label: 'Avg Growth', value: metrics.averageGrowthLabel },
    { label: 'Active Projects', value: metrics.activeProjects.toLocaleString() }
  ];

  const hasRevenueData = charts.revenueByCategory.length > 0;
  const hasProjectsPie = charts.projectsByCategory.length > 0;

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
                      <BarChart data={charts.revenueByCategory}>
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
                    <span>Avg growth {metrics.averageGrowthLabel}</span>
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
                          data={charts.projectsByCategory}
                          dataKey="value"
                          nameKey="category"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={2}
                          stroke="#fefaf4"
                        >
                          {charts.projectsByCategory.map((entry) => (
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
                    <span>Tracking {metrics.totalProjects} total projects</span>
                  </div>
                  <p>Category distribution across the portfolio</p>
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
