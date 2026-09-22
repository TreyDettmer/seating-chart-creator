import { ReactNode } from "react";
import { components } from 'react-select';


export type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_CLASS'; payload: { id: string; name: string } }
  | { type: 'SET_ACTIVE_CLASS'; payload: { classId: string } }
  | { type: 'ADD_STUDENT'; payload: { classId: string; student: Student } }
  | { type: 'UPDATE_STUDENT'; payload: { classId: string; student: Student } }
  | { type: 'IMPORT_STUDENTS'; payload: { classId: string; students: Record<string, Student> } }
  | { type: 'REMOVE_STUDENT'; payload: { classId: string; studentId: string } }
  | { type: 'TOGGLE_SELECTED_CELL'; payload: { configId: string; cell: { row: number, col: number } | null } }
  | { type: 'ADD_SEATING_CONFIG'; payload: { classId: string; config: SeatingConfiguration }; }
  | { type: 'REMOVE_SEATING_CONFIG'; payload: { classId: string; configId: string }; }
  | { type: 'UPDATE_SEATING_CONFIG_GRID'; payload: { configId: string; newGrid : FloorCell[][] }; }
  | { type: 'ADD_KEEP_APART_GROUP'; payload: { classId: string; group: KeepApartGroup } }
  | { type: 'REMOVE_KEEP_APART_GROUP'; payload: { classId: string; groupId: string } }
  | { type: 'EDIT_KEEP_APART_GROUP'; payload: { classId: string; groupId: string; group: KeepApartGroup } }
  | { type: 'ADD_KEEP_TOGETHER_GROUP'; payload: { classId: string; group: KeepTogetherGroup } }
  | { type: 'REMOVE_KEEP_TOGETHER_GROUP'; payload: { classId: string; groupId: string } }
  | { type: 'EDIT_KEEP_TOGETHER_GROUP'; payload: { classId: string; groupId: string; group: KeepTogetherGroup } }
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
  }
  | { type: 'CREATE_DESK_TAG'; payload: { configId: string; row: number; col: number; deskTag: DeskTag } }
  | { type: 'DELETE_DESK_TAG'; payload: { tagId: string } }
  | { type: 'TOGGLE_CELL_ALLOWS_STUDENTS'; payload: { configId: string; row: number; col: number; allowsStudents: boolean } }
  | { type: 'ADD_DESK_TAG_TO_CELL'; payload: { tagId: string; configId: string; row: number; col: number; } }
  | { type: 'EDIT_CELL_ASSIGNED_DESK_TAGS'; payload: { tagIds: string[]; configId: string; row: number; col: number; } }
  | { type: 'EDIT_STUDENTS_ASSIGNED_TO_DESK_TAG'; payload: { tagId: string; studentIds: string[] } }
  | { type: 'REMOVE_DESK_TAG_FROM_CELL'; payload: { tagId: string; configId: string; row: number; col: number; } }
  | { type: 'ADD_DESK_TAG_TO_STUDENT'; payload: { tagId: string; classId: string; student: Student } }
  | { type: 'REMOVE_DESK_TAG_FROM_STUDENT'; payload: { tagId: string; classId: string; student: Student } }
  | { type: 'REMOVE_DESK'; payload: { configId: string; row: number; col: number; } }
  | { type: 'ADD_DESK'; payload: { configId: string; } }

export const CustomOption = (props: any) => {
  return (
    <components.Option
      {...props}
      className={`selectable-option`}
    >
      {props.children}
    </components.Option>
  );
};

export const deskTagColorDot = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 2,
    marginLeft: 2,
    height: 10,
    width: 10,
  },
});

export interface ShuffleResult {
  grid: FloorCell[][]
  score: number
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface DeskTagSelectOption {
  value: string;
  label: string;
  color: string;
}


export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: number;
  deskTagIds: string[];
}

export interface StudentCsvRow {
  FirstName: string;
  LastName: string;
  Gender: number;
}

export interface KeepApartGroup {
  id: string,
  studentIds: string[],
  useAnd: boolean
}

export interface KeepTogetherGroup {
  id: string,
  studentIds: string[],
  useAnd: boolean
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

export interface DeskTag {
  id: string;
  name: string;
  color: string;
}

export interface AppState {
  students: Record<string, Student>;
  classes: Record<string, SchoolClass>;
  seatingConfigurations: Record<string, SeatingConfiguration>;
  keepApartGroups: Record<string, KeepApartGroup>;
  keepTogetherGroups: Record<string, KeepTogetherGroup>;
  deskTags: Record<string, DeskTag>;
  activeClassId: string | null;
}
export const initialAppState: AppState = {
  students: {},
  classes: {},
  seatingConfigurations: {},
  keepApartGroups: {},
  keepTogetherGroups: {},
  deskTags: {},
  activeClassId: null
};

// A class can have multiple SeatingChartStates, each representing a different layout of desks
export interface SeatingConfiguration {
  id: string;
  classId: string;
  name: string;
  rows: number;
  cols: number;
  grid: FloorCell[][];
  selectedCell: { row: number, col: number } | null;
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
  deskTagIds: string[]
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
        students: { ...state.students, ...students },
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

    case 'TOGGLE_SELECTED_CELL': {
      const { configId, cell } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [config.id]: {
            ...config,
            selectedCell: cell
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
            activeConfigurationId: otherConfigIds.length > 0 ? otherConfigIds[0] : null
          },

        },
      };
    }

    case 'UPDATE_SEATING_CONFIG_GRID': {
      const { configId, newGrid} = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;

      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
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
      if (state.activeClassId == null) return state;
      const cls = state.classes[state.activeClassId];
      var selectedCell = config.selectedCell;
      if (selectedCell != null) {
        if (selectedCell.col === cellA.col && selectedCell.row === cellA.row) {
          selectedCell = { row: cellB.row, col: cellB.col }
        } else if (selectedCell.col === cellB.col && selectedCell.row === cellB.row) {
          selectedCell = { row: cellA.row, col: cellA.col }
        }
      }

      const newGrid = config.grid.map((r) => r.slice());
      const a = newGrid[cellA.row][cellA.col];
      const b = newGrid[cellB.row][cellB.col];
      newGrid[cellA.row][cellA.col] = { ...a, studentId: b.studentId, hasDesk: b.hasDesk, allowsStudents: b.allowsStudents, deskTagIds: b.deskTagIds };
      newGrid[cellB.row][cellB.col] = { ...b, studentId: a.studentId, hasDesk: a.hasDesk, allowsStudents: a.allowsStudents, deskTagIds: a.deskTagIds };

      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: {
            ...config,
            grid: newGrid,
            selectedCell: selectedCell
          },
        },
      };
    }

    case 'CREATE_DESK_TAG': {
      const { deskTag, configId, row, col } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;

      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        deskTagIds: [
          ...newRow[col].deskTagIds,
          deskTag.id
        ]
      };
      newGrid[row] = newRow;
      return {
        ...state,
        deskTags: {
          ...state.deskTags,
          [deskTag.id]: deskTag
        },
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
        },
      };
    }

    case 'DELETE_DESK_TAG': {
      const { tagId } = action.payload;
      const { [tagId]: _removedTag, ...remainingDeskTags } = state.deskTags;

      const updatedStudents = Object.fromEntries(
        Object.entries(state.students).map(([studentId, student]) => [
          studentId,
          {
            ...student,
            deskTagIds: student.deskTagIds.filter((id) => id !== tagId),
          },
        ])
      );

      const updatedSeatingConfigs = Object.fromEntries(
        Object.entries(state.seatingConfigurations).map(([configId, config]) => [
          configId,
          {
            ...config,
            grid: config.grid.map((row) =>
              row.map((cell) => ({
                ...cell,
                deskTagIds: cell.deskTagIds.filter((id) => id !== tagId),
              }))
            ),
          },
        ])
      );

      return {
        ...state,
        students: updatedStudents,
        deskTags: remainingDeskTags,
        seatingConfigurations: updatedSeatingConfigs,
      };
    }

    case 'TOGGLE_CELL_ALLOWS_STUDENTS': {
      const { configId, row, col, allowsStudents } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        allowsStudents: allowsStudents
      };
      newGrid[row] = newRow;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
        },
      };
    }

    case 'ADD_DESK_TAG_TO_CELL': {
      const { tagId, configId, row, col } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        deskTagIds: [
          ...newRow[col].deskTagIds,
          tagId
        ]
      };
      newGrid[row] = newRow;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
        },
      };
    }


    case 'EDIT_CELL_ASSIGNED_DESK_TAGS': {
      const { tagIds, configId, row, col } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        deskTagIds: tagIds
      };
      newGrid[row] = newRow;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
        },
      };
    }

    case 'REMOVE_DESK_TAG_FROM_CELL': {
      const { tagId, configId, row, col } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        deskTagIds: newRow[col].deskTagIds.filter(x => x != tagId)
      };
      newGrid[row] = newRow;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: { ...config, grid: newGrid },
        },
      };
    }
    case 'ADD_DESK_TAG_TO_STUDENT': {
      const { tagId, classId, student } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      var updatedStudents = state.students
      updatedStudents[student.id] = {
        ...student,
        deskTagIds: [
          ...student.deskTagIds,
          tagId
        ]
      }
      return {
        ...state,
        students: updatedStudents,
      };
    }
    case 'REMOVE_DESK_TAG_FROM_STUDENT': {
      const { tagId, classId, student } = action.payload;
      const cls = state.classes[classId];
      if (!cls) return state;
      var updatedStudents = state.students
      updatedStudents[student.id] = {
        ...student,
        deskTagIds: student.deskTagIds.filter(x => x != tagId)
      }
      return {
        ...state,
        students: updatedStudents,
      };
    }
    case 'EDIT_STUDENTS_ASSIGNED_TO_DESK_TAG': {
      const { tagId, studentIds } = action.payload;
      const selectedStudentIds = new Set(studentIds);

      const updatedStudents = Object.fromEntries(
        Object.entries(state.students).map(([studentId, student]) => {
          const hasTag = student.deskTagIds.includes(tagId);
          const shouldHaveTag = selectedStudentIds.has(studentId);

          return [
            studentId,
            {
              ...student,
              deskTagIds: shouldHaveTag
                ? hasTag
                  ? student.deskTagIds
                  : [...student.deskTagIds, tagId]
                : student.deskTagIds.filter((id) => id !== tagId),
            },
          ];
        })
      );

      return {
        ...state,
        students: updatedStudents,
      };
    }

    case 'REMOVE_DESK': {
      const { configId, row, col } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        allowsStudents: true,
        hasDesk: false,
        deskTagIds: []
      };
      newGrid[row] = newRow;
      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: {
            ...config,
            grid: newGrid,
            selectedCell: null
          },
        },
      };
    }
    case 'ADD_DESK': {
      const { configId } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.map(row => row.map(cell => ({ ...cell })));
      var hasAddedDesk: boolean = false
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          if (newGrid[row][col].hasDesk === false) {
            newGrid[row][col] = {
              ...newGrid[row][col],
              allowsStudents: true,
              hasDesk: true,
              deskTagIds: []
            }
            hasAddedDesk = true;
            break;

          }
        }
        if (hasAddedDesk == true) {
          break
        }
      }

      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: {
            ...config,
            grid: newGrid
          },
        },
      };
    }

    default:
      return state;
  }
}
