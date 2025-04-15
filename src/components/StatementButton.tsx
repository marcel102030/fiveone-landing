import React from "react";
import { Statement } from "../types/quiz";
import { CategoryEnum } from "../types/quiz";

interface StatementButtonProps {
  statement: Statement;
  onHandleChoice: (category: CategoryEnum | "nenhuma" | "ambas") => void;
  className?: string;
}

const StatementButton: React.FC<StatementButtonProps> = ({
  statement,
  onHandleChoice,
  className,
}) => {
  return (
    <button
      onClick={() => onHandleChoice(statement.category)}
      className={`statement-button ${className || ""}`}
      aria-label={`Selecionar: ${statement.text}`}
    >
      {statement.text}
    </button>
  );
};

export default StatementButton;
