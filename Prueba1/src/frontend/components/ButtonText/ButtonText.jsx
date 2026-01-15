import PropTypes from 'prop-types';
import './ButtonText.css';

const ButtonText = ({ texto, textoButton, accion }) => (
  <button type="button" className="button-text" onClick={accion}>
    <span className="button-text__label">{texto}</span>
    <span className="button-text__cta">{textoButton}</span>
  </button>
);

ButtonText.propTypes = {
  texto: PropTypes.string.isRequired,
  textoButton: PropTypes.string.isRequired,
  accion: PropTypes.func
};

export default ButtonText;
