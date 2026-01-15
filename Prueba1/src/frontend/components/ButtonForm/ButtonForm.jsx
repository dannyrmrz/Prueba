import PropTypes from 'prop-types';
import styles from './ButtonForm.module.css';

const ButtonForm = ({
  text,
  onClick,
  disabled = false,
  type = 'button'
}) => (
  <button
    type={type}
    className={styles.divButtonForm}
    onClick={onClick}
    disabled={disabled}
  >
    {text}
  </button>
);

ButtonForm.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default ButtonForm;