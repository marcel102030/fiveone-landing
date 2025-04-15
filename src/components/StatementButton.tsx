import React from "react";
import { CategoryEnum } from "../types/quiz";
import { Statement } from "../types/quiz";

interface StatementButtonProps {
  statement: Statement;
  onHandleChoice: (category: CategoryEnum) => void;
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
