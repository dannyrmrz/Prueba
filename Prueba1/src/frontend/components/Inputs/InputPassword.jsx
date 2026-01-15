import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import styles from './InputIcono.module.css';


const InputPassword = ({
    showPassword,
    togglePasswordVisibility,
    icono,
    placeholder,
    value,
    onChange,
    error = false,
    name = '',
    id = '',
    autoComplete = 'current-password'
}) => {
    const containerClassName = `${styles.contenedorInput} ${error ? styles.errorInput : ''}`;

    return (
        <div className={containerClassName}>
            <span
                className={styles.iconoEye}
                onClick={togglePasswordVisibility}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        togglePasswordVisibility();
                    }
                }}
            >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} style={{ color: error ? '#d50c0c' : '#7f8c88' }} />
            </span>

            <input
                className={styles.inputStylePassword}
                type={showPassword ? 'text' : 'password'}
                value={value}
                name={name}
                id={id}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />

            <span className={styles.iconoStyle}>
                <FontAwesomeIcon icon={icono} style={{ color: error ? '#d50c0c' : '#7f8c88' }} />
            </span>
        </div>
    );
};

export default InputPassword;