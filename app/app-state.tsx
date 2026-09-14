import { ReactNode } from "react";


export type AppAction =
  | { type: 'ADD_CLASS'; payload: { id: string; name: string } }
  | { type: 'SET_ACTIVE_CLASS'; payload: { classId: string } }
  | { type: 'ADD_STUDENT'; payload: { classId: string; student: Student } }
  | { type: 'REMOVE_STUDENT'; payload: { classId: string; studentId: string } }
  | {
      type: 'ADD_SEATING_CONFIG';
      payload: { classId: string; config: SeatingConfiguration };
    }
  | { type: 'SET_ACTIVE_CONFIG'; payload: { classId: string; configId: string } }
  | {
      type: 'ASSIGN_STUDENT_TO_CELL';
      payload: {
        configId: string;
        row: number;
        col: number;
        studentId: string | null;
      };
    }
  | {
      type: 'SET_CELL_TYPE';
      payload: { configId: string; row: number; col: number; cellType: string };
    }
  | {
      type: 'SWAP_STUDENTS';
      payload: {
        configId: string;
        cellA: { row: number; col: number };
        cellB: { row: number; col: number };
      };
    };


export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    gender : number;
    likeIds : string[]
    dislikeIds : string[]
}

export interface SchoolClass {
  id: string;
  name: string;
  studentIds: string[];
  seatingConfigurationIds: string[];
  activeConfigurationId: string | null;
}

export interface AppState {
  students: Record<string, Student>;
  classes: Record<string, SchoolClass>;
  seatingConfigurations: Record<string, SeatingConfiguration>;
  activeClassId: string | null;
}
export const initialAppState: AppState = {
  students: {},
  classes: {},
  seatingConfigurations: {},
  activeClassId: null,
};
// Each class has its own ClassState
export interface ClassState {
  students : Student[],
  floorRowCount : number,
  floorColCount : number,
  seatingCharts : SeatingConfiguration[],
  selectedSeatingChartIndex : number,
}

// A class can have multiple SeatingChartStates, each representing a different layout of desks
export interface SeatingConfiguration {
  id: string;
  classId: string;
  name: string;
  rows: number;
  cols: number;
  grid: FloorCell[][];
  createdAt: string;
  updatedAt: string;
}

export interface Desk {
  id: string;
  allowsStudent? : boolean
  isDropTarget? :boolean
}

export interface FloorCell {
    id: string,
    index: number,
    row: number,
    column: number,
    desk: Desk | null
    studentId: string | null
    children?: ReactNode
}


export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CLASS': {
      const { id, name } = action.payload;
      return {
        ...state,
        classes: {
          ...state.classes,
          [id]: {
            id,
            name,
            studentIds: [],
            seatingConfigurationIds: [],
            activeConfigurationId: null,
          },
        },
        activeClassId: state.activeClassId ?? id,
      };
    }

    case 'SET_ACTIVE_CLASS':
      return { ...state, activeClassId: action.payload.classId };

    case 'ADD_STUDENT': {
      const { classId, student } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      return {
        ...state,
        students: { ...state.students, [student.id]: student },
        classes: {
          ...state.classes,
          [classId]: { ...cls, studentIds: [...cls.studentIds, student.id] },
        },
      };
    }

    case 'REMOVE_STUDENT': {
      const { classId, studentId } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      const { [studentId]: _removed, ...remainingStudents } = state.students;
      return {
        ...state,
        students: remainingStudents,
        classes: {
          ...state.classes,
          [classId]: {
            ...cls,
            studentIds: cls.studentIds.filter((id) => id !== studentId),
          },
        },
      };
    }

    case 'ADD_SEATING_CONFIG': {
      const { classId, config } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [config.id]: config,
        },
        classes: {
          ...state.classes,
          [classId]: {
            ...cls,
            seatingConfigurationIds: [...cls.seatingConfigurationIds, config.id],
            activeConfigurationId: cls.activeConfigurationId ?? config.id,
          },
        },
      };
    }

    case 'SET_ACTIVE_CONFIG': {
      const { classId, configId } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      return {
        ...state,
        classes: {
          ...state.classes,
          [classId]: { ...cls, activeConfigurationId: configId },
        },
      };
    }

    case 'ASSIGN_STUDENT_TO_CELL': {
      const { configId, row, col, studentId } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;

      // Only clone the one row that changed, not the whole grid.
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = { ...newRow[col], studentId };
      newGrid[row] = newRow;

      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: {
            ...config,
            grid: newGrid,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    

    case 'SWAP_STUDENTS': {
      const { configId, cellA, cellB } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;

      const newGrid = config.grid.map((r) => r.slice());
      const a = newGrid[cellA.row][cellA.col];
      const b = newGrid[cellB.row][cellB.col];
      newGrid[cellA.row][cellA.col] = { ...a, studentId: b.studentId };
      newGrid[cellB.row][cellB.col] = { ...b, studentId: a.studentId };

      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
        },
      };
    }

    default:
      return state;
  }
}
