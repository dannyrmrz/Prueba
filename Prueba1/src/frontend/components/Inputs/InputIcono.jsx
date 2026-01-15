import React from 'react';
import styles from './InputIcono.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const IconoInput = ({
    icono,
    placeholder,
    value,
    onChange,
    type,
    error = false,
    name = "",
    disabled=false,
    onFocus,
    formatoAa = false,
}) => {

    // Handler que filtra si está activo formatoAa
    const handleChange = (e) => {
        let inputValue = e.target.value;

        // Si el formatoAa está activo, filtramos antes de mandarlo
        if (formatoAa) {
            inputValue = inputValue.replace(/[^A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]/g, "");
        }

        // Siempre usamos el onChange del padre, pero modificando el value si corresponde
        onChange({
            ...e,
            target: {
                ...e.target,
                value: inputValue,
                name: name

            }
        });
  

        
    };
    

    return (

        
        <div className={`${styles.contenedorInput} ${error ? styles.errorInput : ''}`}>

            <input
                className={styles.inputStyle}
                type= {type}
                value= {value}
                name = {name}
                onChange={handleChange}
                placeholder= {placeholder}
                disabled = {disabled}
                onFocus={onFocus}
            />

            <span className={styles.iconoStyle} >
                <FontAwesomeIcon icon={icono} style={{ color: error ? '#d50c0c' : '#f5a31f' }} />
            </span>
    
        </div>
    );
};

export default IconoInput;