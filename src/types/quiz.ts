export enum CategoryEnum {
  APOSTOLO = "apostolo",
  PROFETA = "profeta",
  EVANGELISTA = "evangelista",
  PASTOR = "pastor",
  MESTRE = "mestre",
}

export interface Statement {
  id: number;
  category: CategoryEnum;
  text: string;
}

export interface ComparisonQuestion {
  id: number;
  statement1: Statement;
  statement2: Statement;
}

export interface CategoryMetadata {
  id: CategoryEnum;
  name: string;
  icon: string;
  description: string;
}

export interface CategoryScore {
  categoryEnum: CategoryEnum;
  score: number;
}
