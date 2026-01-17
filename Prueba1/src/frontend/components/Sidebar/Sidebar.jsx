import { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGrip,
  faSheetPlastic,
  faArrowLeft,
  faArrowRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import logoAsset from '../../../assets/logo.png';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: faGrip, path: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: faSheetPlastic, path: '/projects' }
];

const Sidebar = ({ user, currentPath, onNavigate, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const displayName = user?.name?.trim() || 'Guest User';
  const displayEmail = user?.email || 'guest@example.com';
  const userInitial = ((displayName || displayEmail).charAt(0) || '?').toUpperCase();

  const handleNavigate = (path) => {
    if (path !== currentPath) {
      onNavigate(path);
    }
  };

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__logo">
        <img src={logoAsset} alt="Tora" />
      </div>
      <div className="sidebar__profile-card">
        <div className="sidebar__avatar" aria-hidden="true">
          {userInitial}
        </div>
        <div className="sidebar__identity">
          <p className="sidebar__name">{displayName}</p>
          <p className="sidebar__email">{displayEmail}</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath.startsWith(item.path);
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar__nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => handleNavigate(item.path)}
              aria-label={item.label}
              title={item.label}
            >
              <FontAwesomeIcon icon={item.icon} className="sidebar__nav-icon" />
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__divider" aria-hidden="true" />
        <button
          type="button"
          className="sidebar__utility sidebar__utility--collapse"
          onClick={toggleCollapse}
          aria-pressed={isCollapsed}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Collapse</span>
        </button>
        <button type="button" className="sidebar__utility sidebar__utility--logout" onClick={onLogout}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  }),
  currentPath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};

Sidebar.defaultProps = {
  user: null
};

export default Sidebar;
