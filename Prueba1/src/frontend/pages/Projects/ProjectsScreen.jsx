import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faSort } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useProjectsInsights } from '../../../backend/services/projectsDataService';
import '../Dashboard/DashboardScreen.css';
import './ProjectsScreen.css';

const STATUS_VARIANTS = {
  active: 'status-pill status-pill--active',
  growing: 'status-pill status-pill--growing',
  inactive: 'status-pill status-pill--inactive'
};

const extractNumericValue = (input) => {
  if (input === null || input === undefined) {
    return Number.NaN;
  }
  const normalized = input.toString().trim();
  if (!normalized) {
    return Number.NaN;
  }
  const match = normalized.replace(/,/g, '').match(/(-?[\d.]+)/);
  if (!match) {
    return Number.NaN;
  }
  let value = parseFloat(match[1]);
  if (Number.isNaN(value)) {
    return Number.NaN;
  }
  if (/b/i.test(normalized)) {
    value *= 1000;
  } else if (/k/i.test(normalized)) {
    value /= 1000;
  }
  return value;
};

const getComparableValue = (row, key) => {
  switch (key) {
    case 'companyName':
      return row.companyName?.toString().toLowerCase() || '';
    case 'founded':
      return extractNumericValue(row.founded);
    case 'revenue':
      return extractNumericValue(row.revenue);
    case 'growth':
      return extractNumericValue(row.growth);
    default:
      return row[key];
  }
};

const pickFirstAvailable = (project, keys, fallback = 'N/A') => {
  for (const key of keys) {
    const value = project[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
};

const resolveCompanyName = (project) =>
  pickFirstAvailable(
    project,
    ['Company', 'Company Name', 'Client', 'Client Name'],
    'Sin nombre'
  );

const normalizeStatus = (status) => status?.toString().trim().toLowerCase() || 'unknown';

const ProjectsScreen = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, isLoading, error } = useProjectsInsights();
  const [sortConfig, setSortConfig] = useState({ key: 'companyName', direction: 'asc' });

  const projectRows = useMemo(
    () =>
      projects.map((project, index) => ({
        id: project.ID || project.Id || project.id || index,
        companyName: resolveCompanyName(project),
        category: pickFirstAvailable(project, ['Category', 'Sector', 'Industry'], 'General'),
        founded: pickFirstAvailable(
          project,
          ['Founded', 'Founded Year', 'Year Founded', 'Year'],
          'N/A'
        ),
        employees: pickFirstAvailable(
          project,
          ['Employees', 'Employees Count', 'Total Employees'],
          'N/A'
        ),
        revenue: pickFirstAvailable(project, ['Revenue', 'Annual Revenue'], 'N/A'),
        growth: pickFirstAvailable(project, ['Growth', 'YoY Growth'], '0%'),
        status: pickFirstAvailable(project, ['Status', 'State'], 'Unknown')
      })),
    [projects]
  );

  const sortedRows = useMemo(() => {
    if (!projectRows.length || !sortConfig.key) {
      return projectRows;
    }

    const copy = [...projectRows];
    copy.sort((a, b) => {
      const aValue = getComparableValue(a, sortConfig.key);
      const bValue = getComparableValue(b, sortConfig.key);

      const bothNumbers = typeof aValue === 'number' && typeof bValue === 'number';

      if (bothNumbers) {
        const aNaN = Number.isNaN(aValue);
        const bNaN = Number.isNaN(bValue);
        if (aNaN && bNaN) return 0;
        if (aNaN) return 1;
        if (bNaN) return -1;
        return aValue - bValue;
      }

      const aText = (aValue ?? '').toString();
      const bText = (bValue ?? '').toString();
      return aText.localeCompare(bText, 'es', { sensitivity: 'base' });
    });

    if (sortConfig.direction === 'desc') {
      copy.reverse();
    }

    return copy;
  }, [projectRows, sortConfig]);

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

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const getAriaSort = (key) =>
    sortConfig.key === key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none';

  const renderSortableHeader = (label, key) => {
    const isActive = sortConfig.key === key;
    const direction = isActive ? sortConfig.direction : undefined;

    return (
      <button
        type="button"
        className={`projects-table__sort-button ${isActive ? 'is-active' : ''}`}
        onClick={() => handleSort(key)}
        aria-label={`Ordenar por ${label}`}
        data-direction={direction || undefined}
      >
        <span>{label}</span>
        <FontAwesomeIcon icon={faSort} className="projects-table__sort-icon" />
      </button>
    );
  };

  const renderTableBody = () => {
    if (!sortedRows.length) {
      return (
        <tr>
          <td className="projects-table__empty" colSpan={8}>
            No se encontraron proyectos en el Excel.
          </td>
        </tr>
      );
    }

    return sortedRows.map((row) => {
      const statusKey = normalizeStatus(row.status);
      const statusClass = STATUS_VARIANTS[statusKey] || 'status-pill';

      return (
        <tr key={row.id}>
          <td className="projects-table__cell projects-table__cell--company">{row.companyName}</td>
          <td className="projects-table__cell">
            <span className="projects-table__category-pill">{row.category}</span>
          </td>
          <td className="projects-table__cell projects-table__cell--meta">{row.founded}</td>
          <td className="projects-table__cell projects-table__cell--meta">{row.employees}</td>
          <td className="projects-table__cell projects-table__cell--amount">{row.revenue}</td>
          <td className="projects-table__cell projects-table__cell--growth">{row.growth}</td>
          <td className="projects-table__cell">
            <span className={statusClass}>{row.status}</span>
          </td>
          <td className="projects-table__cell projects-table__cell--actions">
            <button type="button" className="projects-table__action">
              <FontAwesomeIcon icon={faPen} />
              <span>Edit</span>
            </button>
          </td>
        </tr>
      );
    });
  };

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
          <h1 className="dashboard-header__title">Projects Overview</h1>
          <p className="dashboard-header__subtitle">
            Manage and view all projects
          </p>
        </header>

        {isLoading ? (
          <div className="dashboard-state">Cargando proyectos...</div>
        ) : error ? (
          <div className="dashboard-state dashboard-state--error">{error}</div>
        ) : (
          <section className="projects-table-card" aria-label="Projects table">
            <div className="projects-table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th scope="col" aria-sort={getAriaSort('companyName')}>
                      {renderSortableHeader('Company Name', 'companyName')}
                    </th>
                    <th scope="col">Category</th>
                    <th scope="col" aria-sort={getAriaSort('founded')}>
                      {renderSortableHeader('Founded', 'founded')}
                    </th>
                    <th scope="col">Employees</th>
                    <th scope="col" aria-sort={getAriaSort('revenue')}>
                      {renderSortableHeader('Revenue', 'revenue')}
                    </th>
                    <th scope="col" aria-sort={getAriaSort('growth')}>
                      {renderSortableHeader('Growth', 'growth')}
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default ProjectsScreen;
