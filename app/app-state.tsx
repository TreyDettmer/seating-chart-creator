import { ReactNode } from "react";


export type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_CLASS'; payload: { id: string; name: string } }
  | { type: 'SET_ACTIVE_CLASS'; payload: { classId: string } }
  | { type: 'ADD_STUDENT'; payload: { classId: string; student: Student } }
  | { type: 'UPDATE_STUDENT'; payload: { classId: string; student: Student } }
  | { type: 'IMPORT_STUDENTS'; payload: { classId: string; students: Record<string, Student> } }
  | { type: 'REMOVE_STUDENT'; payload: { classId: string; studentId: string } }
  | {
      type: 'ADD_SEATING_CONFIG';
      payload: { classId: string; config: SeatingConfiguration };
    }
  | { type: 'REMOVE_SEATING_CONFIG'; payload: { classId: string; configId: string };}
  | { type: 'ADD_KEEP_APART_GROUP'; payload: { classId: string; group : KeepApartGroup}}
  | { type: 'REMOVE_KEEP_APART_GROUP'; payload: { classId: string; groupId : string}}
  | { type: 'EDIT_KEEP_APART_GROUP'; payload: { classId: string; groupId : string; group : KeepApartGroup}}
  | { type: 'ADD_KEEP_TOGETHER_GROUP'; payload: { classId: string; group : KeepTogetherGroup}}
  | { type: 'REMOVE_KEEP_TOGETHER_GROUP'; payload: { classId: string; groupId : string}}
  | { type: 'EDIT_KEEP_TOGETHER_GROUP'; payload: { classId: string; groupId : string; group : KeepTogetherGroup}}
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
    }
  | {
      type: 'SWAP_DESKS';
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

export interface StudentCsvRow {
    FirstName: string;
    LastName: string;
    Gender : number;
    LikeIds : string
    DislikeIds : string
}

export interface KeepApartGroup {
  id : string,
  studentIds : string[],
  useAnd : boolean
}

export interface KeepTogetherGroup {
  id : string,
  studentIds : string[],
  useAnd : boolean
}

export interface SchoolClass {
  id: string;
  name: string;
  studentIds: string[];
  seatingConfigurationIds: string[];
  activeConfigurationId: string | null;
  selectedStudentId: string | null;
  keepApartGroupIds: string[];
  keepTogetherGroupIds: string[];
}

export interface AppState {
  students: Record<string, Student>;
  classes: Record<string, SchoolClass>;
  seatingConfigurations: Record<string, SeatingConfiguration>;
  keepApartGroups: Record<string, KeepApartGroup>;
  keepTogetherGroups: Record<string, KeepTogetherGroup>;
  activeClassId: string | null;
}
export const initialAppState: AppState = {
  students: {},
  classes: {},
  seatingConfigurations: {},
  activeClassId: null,
  keepApartGroups: {},
  keepTogetherGroups: {}
};

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

export interface FloorCell {
    id: string,
    index: number,
    row: number,
    column: number,
    hasDesk: boolean,
    allowsStudents: boolean,
    studentId: string | null
}


export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE': {
      return action.payload
    }
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
            selectedStudentId: null,
            keepApartGroupIds: [],
            keepTogetherGroupIds: []
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

    case 'UPDATE_STUDENT': {
      const { classId, student } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      var updatedStudents = state.students
      updatedStudents[student.id] = student
      return {
        ...state,
        students: updatedStudents,
      };
    }

    case 'IMPORT_STUDENTS': {
      const { classId, students } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      return {
        ...state,
        students: { ...state.students, ...students},
        classes: {
          ...state.classes,
          [classId]: { ...cls, studentIds: Object.keys(students) },
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

    case 'REMOVE_SEATING_CONFIG': {
      const { classId, configId } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      var otherConfigIds = cls.seatingConfigurationIds.filter(x => x != configId)
      const { [configId]: _removedConfig, ...remainingSeatingConfigurations } = state.seatingConfigurations;
      return {
        ...state,
        seatingConfigurations: remainingSeatingConfigurations,
        classes: {
          ...state.classes,
          [classId]: { 
            ...cls,
            seatingConfigurationIds: otherConfigIds, 
            activeConfigurationId: otherConfigIds.length > 0 ? otherConfigIds[0] : null },
            
        },
      };
    }

    case 'ADD_KEEP_APART_GROUP': {
      const { classId, group } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      return {
        ...state,
        keepApartGroups: {
          ...state.keepApartGroups,
          [group.id]: group
        },
        classes: {
          ...state.classes,
          [classId]: { 
            ...cls,
            keepApartGroupIds: [
              ...cls.keepApartGroupIds,
              group.id
            ]
          }
        },
      };
    }

    case 'EDIT_KEEP_APART_GROUP': {
      const { classId, groupId, group } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      
      return {
        ...state,
        keepApartGroups: {
          ...state.keepApartGroups,
          [groupId]: group,
        },
      };
    }

    case 'REMOVE_KEEP_APART_GROUP': {
      const { classId, groupId } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      var otherGroupIds = cls.keepApartGroupIds.filter(x => x != groupId)
      const { [groupId]: _removedGroup, ...remainingKeepApartGroups } = state.keepApartGroups;
      return {
        ...state,
        keepApartGroups: remainingKeepApartGroups,
        classes: {
          ...state.classes,
          [classId]: { 
            ...cls,
            keepApartGroupIds: otherGroupIds
          }
        },
      };
    }

    case 'ADD_KEEP_TOGETHER_GROUP': {
      const { classId, group } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      return {
        ...state,
        keepTogetherGroups: {
          ...state.keepTogetherGroups,
          [group.id]: group
        },
        classes: {
          ...state.classes,
          [classId]: { 
            ...cls,
            keepTogetherGroupIds: [
              ...cls.keepTogetherGroupIds,
              group.id
            ]
          }
        },
      };
    }

    case 'EDIT_KEEP_TOGETHER_GROUP': {
      const { classId, groupId, group } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      
      return {
        ...state,
        keepTogetherGroups: {
          ...state.keepTogetherGroups,
          [groupId]: group,
        },
      };
    }

    case 'REMOVE_KEEP_TOGETHER_GROUP': {
      const { classId, groupId } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      var otherGroupIds = cls.keepTogetherGroupIds.filter(x => x != groupId)
      const { [groupId]: _removedGroup, ...remainingKeepTogetherGroups } = state.keepTogetherGroups;
      return {
        ...state,
        keepTogetherGroups: remainingKeepTogetherGroups,
        classes: {
          ...state.classes,
          [classId]: { 
            ...cls,
            keepTogetherGroupIds: otherGroupIds
          }
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

    case 'SWAP_DESKS': {
      const { configId, cellA, cellB } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;

      const newGrid = config.grid.map((r) => r.slice());
      const a = newGrid[cellA.row][cellA.col];
      const b = newGrid[cellB.row][cellB.col];
      newGrid[cellA.row][cellA.col] = { ...a, studentId: b.studentId, hasDesk: b.hasDesk, allowsStudents: b.allowsStudents};
      newGrid[cellB.row][cellB.col] = { ...b, studentId: a.studentId, hasDesk: a.hasDesk, allowsStudents: a.allowsStudents };

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
