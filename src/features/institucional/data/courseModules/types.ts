export interface Lesson {
  title: string;
}

export interface Submodule {
  code: string;
  title: string;
  type: "T" | "M";
  instructor: string;
  lessons: Lesson[];
}

export interface Module {
  title: string;
  submodules: Submodule[];
}

export interface Track {
  id: string;
  title: string;
  modules: Module[];
}
