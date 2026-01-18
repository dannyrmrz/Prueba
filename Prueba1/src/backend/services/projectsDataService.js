import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import projectsWorkbookUrl from '../data/Projects_Database.xlsx?url';

const CATEGORY_COLORS = ['#f5a31f', '#ffcf73', '#5fbeab', '#b097f6', '#ef476f', '#118ab2'];

const normalizeCategory = (value = 'Other') => {
  const safe = value?.toString().trim();
  if (!safe) return 'Other';
  return safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase();
};

const parseRevenueToMillions = (value) => {
  if (!value) return 0;
  const stringValue = value.toString();
  const match = stringValue.replace(/,/g, '').match(/([\d.]+)/);
  if (!match) return 0;
  const amount = parseFloat(match[1]);
  if (Number.isNaN(amount)) return 0;
  if (/b/i.test(stringValue)) {
    return amount * 1000; // convert billions to millions
  }
  if (/k/i.test(stringValue)) {
    return amount / 1000; // convert thousands to millions
  }
  return amount; // already in millions
};

const formatRevenueLabel = (millions) => {
  if (!millions) return '$0M';
  if (millions >= 1000) {
    return `$${(millions / 1000).toFixed(1)}B`;
  }
  return `$${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)}M`;
};

const parseGrowthValue = (value) => {
  if (!value) return 0;
  const match = value.toString().match(/(-?[\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
};

const getDashboardMetrics = (projects) => {
  if (!projects.length) {
    return {
      totalProjects: 0,
      totalRevenueLabel: '$0M',
      averageGrowthLabel: '0%',
      activeProjects: 0
    };
  }

  const totalProjects = projects.length;
  const totalRevenueMillions = projects.reduce(
    (sum, project) => sum + parseRevenueToMillions(project.Revenue),
    0
  );
  const averageGrowthValue =
    projects.reduce((sum, project) => sum + parseGrowthValue(project.Growth), 0) / totalProjects || 0;
  const activeProjects = projects.filter(
    (project) => project.Status?.toString().toLowerCase() === 'active'
  ).length;

  return {
    totalProjects,
    totalRevenueLabel: formatRevenueLabel(totalRevenueMillions),
    averageGrowthLabel: `${averageGrowthValue >= 0 ? '+' : ''}${averageGrowthValue.toFixed(1)}%`,
    activeProjects
  };
};

const buildRevenueByCategory = (projects) => {
  const map = {};

  projects.forEach((project) => {
    const key = project.Category?.toString().toLowerCase() || 'other';
    if (!map[key]) {
      map[key] = { category: normalizeCategory(key), revenue: 0 };
    }
    map[key].revenue += parseRevenueToMillions(project.Revenue);
  });

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .map((entry) => ({
      ...entry,
      revenue: Number(entry.revenue.toFixed(2))
    }));
};

const buildProjectsByCategory = (projects) => {
  const map = {};
  projects.forEach((project) => {
    const key = project.Category?.toString().toLowerCase() || 'other';
    if (!map[key]) {
      map[key] = { category: normalizeCategory(key), value: 0 };
    }
    map[key].value += 1;
  });

  return Object.values(map)
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));
};

const resolveCompanyName = (project) => {
  const raw =
    project.Company ||
    project['Company Name'] ||
    project.Client ||
    project['Client Name'] ||
    'Sin nombre';
  const normalized = raw.toString().trim();
  return normalized || 'Sin nombre';
};

const buildTopCompaniesSeries = (projects, limit = 6) => {
  return projects
    .map((project) => ({
      company: resolveCompanyName(project),
      revenue: Number(parseRevenueToMillions(project.Revenue).toFixed(2)),
      growth: Number(parseGrowthValue(project.Growth).toFixed(1))
    }))
    .filter((entry) => entry.company && (entry.revenue > 0 || entry.growth !== 0))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

export const useProjectsInsights = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const response = await fetch(projectsWorkbookUrl);
        if (!response.ok) {
          throw new Error('No se pudo cargar la base de datos de proyectos.');
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const raw = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
        if (isMounted) {
          setProjects(raw);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error desconocido al cargar proyectos.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => getDashboardMetrics(projects), [projects]);
  const charts = useMemo(
    () => ({
      revenueByCategory: buildRevenueByCategory(projects),
      projectsByCategory: buildProjectsByCategory(projects),
      topCompanies: buildTopCompaniesSeries(projects)
    }),
    [projects]
  );

  return { projects, metrics, charts, isLoading, error };
};
