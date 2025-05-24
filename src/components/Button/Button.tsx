import React from "react";
import styles from "./Button.module.scss";

type ButtonProps = {
  onClick: () => void;
  buttonName: string;
};

const Button: React.FC<ButtonProps> = ({ onClick, buttonName }) => {

  return (
    <div className={styles.overlay}>
      <div className={styles.Button}>
        <button className={styles.closeButton} onClick={onClick}>
          {buttonName}
        </button>
      </div>
    </div>
  );
};

export default Button;
