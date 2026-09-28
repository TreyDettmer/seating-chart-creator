import { act, ReactNode } from "react";
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
  | { type: 'UPDATE_SEATING_CONFIG'; payload: { configId: string; newConfig: SeatingConfiguration }; }
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
  | { type: 'CREATE_TAG'; payload: { tag: Tag; } }
  | { type: 'EDIT_TAG'; payload: { tagId: string; tag: Tag } }
  | { type: 'DELETE_TAG'; payload: { tagId: string } }
  | { type: 'TOGGLE_CELL_ALLOWS_STUDENTS'; payload: { configId: string; row: number; col: number; allowsStudents: boolean } }
  | { type: 'EDIT_CELL_ASSIGNED_TAGS'; payload: { tagIds: string[]; configId: string; row: number; col: number; } }
  | { type: 'EDIT_GROUP'; payload: { groupsConfigId: string; updatedGroup: StudentGroup; } }
  | { type: 'EDIT_STUDENTS_ASSIGNED_TO_TAG'; payload: { tagId: string; studentIds: string[] } }
  | { type: 'REMOVE_DESK'; payload: { configId: string; row: number; col: number; } }
  | { type: 'ADD_DESK'; payload: { configId: string; } }
  | { type: 'EDIT_SHUFFLE_PREFERENCES'; payload: { updatedPreferences: ShufflePreferences; } }
  | { type: 'ADD_GROUPS_CONFIGURATION'; payload: { classId: string, groupsConfiguration: GroupsConfiguration; } }
  | { type: 'SET_ACTIVE_GROUPS_CONFIGURATION'; payload: { classId: string, groupsId: string | null; } }
  | { type: 'SET_ACTIVE_GROUP'; payload: { groupsConfigId: string; selectedGroupId: string | null } }
  | { type: 'EDIT_GROUPS_CONFIGURATION'; payload: { updatedGroupsConfiguration: GroupsConfiguration; } }
  | { type: 'SWAP_STUDENTS_IN_GROUPS'; payload: { groupsId: string; sourceGroupId: string; targetGroupId: string; studentId1: string; studentId2: string | null } }
  | { type: 'UPDATE_TAGS'; payload: { newTags: Record<string, Tag> } }

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



export const tagColorDot = (color = 'transparent') => ({
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

export interface ShufflePreferences {
  iterations: number;
  explorationStrengthStart: number;
  explorationStrengthEnd: number;
  ignoreKeepApartGroups: boolean;
  ignoreKeepTogetherGroups: boolean;
  ignoreTags: boolean;
  ignoreTagPriorities: boolean;
  keepTogetherInfluence: number;
  keepApartInfluence: number;
  tagsInfluence: number;
}

export const initialShufflePreferences: ShufflePreferences = {
  iterations: 8000,
  explorationStrengthStart: 10.0,
  explorationStrengthEnd: 0.01,
  ignoreKeepApartGroups: false,
  ignoreKeepTogetherGroups: false,
  ignoreTags: false,
  ignoreTagPriorities: false,
  keepTogetherInfluence: 0.4,
  keepApartInfluence: 0.9,
  tagsInfluence: 0.7,
};

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectNumberOption {
  value: number;
  label: string;
}

export interface TagSelectOption {
  value: string;
  label: string;
  color: string;
}


export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  isEsl: boolean;
  iepDesc: string;
  tagIds: string[];
  nameAbbr: string;
  isPresent: boolean;
}

export enum Gender {
  Boy = "Boy",
  Girl = "Girl",
  Other = "Other"
}

export interface StudentCsvRow {
  FirstName: string;
  LastName: string;
  Gender: Gender;
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
  activeGroupsConfigurationId: string | null;
  selectedStudentId: string | null;
  keepApartGroupIds: string[];
  keepTogetherGroupIds: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  priority: number;
}

export interface TagWithStudents {
  tagId: string;
  priority: number;
  studentIds: string[]
}

export interface AppState {
  students: Record<string, Student>;
  classes: Record<string, SchoolClass>;
  seatingConfigurations: Record<string, SeatingConfiguration>;
  groupsConfigurations: Record<string, GroupsConfiguration>;
  keepApartGroups: Record<string, KeepApartGroup>;
  keepTogetherGroups: Record<string, KeepTogetherGroup>;
  tags: Record<string, Tag>;
  activeClassId: string | null;
  shufflePreferences: ShufflePreferences;
}
export const initialAppState: AppState = {
  students: {},
  classes: {},
  seatingConfigurations: {},
  groupsConfigurations: {},
  keepApartGroups: {},
  keepTogetherGroups: {},
  tags: {},
  activeClassId: null,
  shufflePreferences: initialShufflePreferences
};

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

export interface GroupsConfiguration {
  id: string;
  classId: string;
  name: string;
  selectedGroupId: string | null;
  studentGroups: StudentGroup[];
}

export interface StudentGroup {
  id: string;
  name: string;
  studentIds: string[];
  tagIds: string[];
}

export interface FloorCell {
  id: string,
  index: number,
  row: number,
  column: number,
  hasDesk: boolean,
  allowsStudents: boolean,
  studentId: string | null
  tagIds: string[]
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
            activeGroupsConfigurationId: null,
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

      // Abbreviate student names
      //const studentsWithAbbreviatedNames = populateAbbrNames(students)


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

    case 'UPDATE_SEATING_CONFIG': {
      const { configId, newConfig } = action.payload;

      return {
        ...state,
        seatingConfigurations: {
          ...state.seatingConfigurations,
          [configId]: newConfig,
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

      newGrid[cellA.row][cellA.col] = { ...a, studentId: b.studentId, hasDesk: b.hasDesk, allowsStudents: b.allowsStudents, tagIds: b.tagIds };
      newGrid[cellB.row][cellB.col] = { ...b, studentId: a.studentId, hasDesk: a.hasDesk, allowsStudents: a.allowsStudents, tagIds: a.tagIds };
      if (a.hasDesk && a.studentId == null && b.hasDesk == false && b.studentId != null && a.allowsStudents) {
        newGrid[cellA.row][cellA.col] = { ...a, studentId: null, hasDesk: b.hasDesk, allowsStudents: b.allowsStudents, tagIds: b.tagIds };
        newGrid[cellB.row][cellB.col] = { ...b, studentId: b.studentId, hasDesk: a.hasDesk, allowsStudents: a.allowsStudents, tagIds: a.tagIds };
      }

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

    case 'CREATE_TAG': {
      const { tag } = action.payload;
      return {
        ...state,
        tags: {
          ...state.tags,
          [tag.id]: tag
        }
      };
    }

    case 'EDIT_TAG': {
      const { tagId, tag } = action.payload;
      return {
        ...state,
        tags: {
          ...state.tags,
          [tagId]: {
            ...state.tags[tagId],
            color: tag.color,
            name: tag.name
          }
        }
      };
    }

    case 'DELETE_TAG': {
      const { tagId } = action.payload;
      const { [tagId]: _removedTag, ...remainingTags } = state.tags;

      const updatedStudents = Object.fromEntries(
        Object.entries(state.students).map(([studentId, student]) => [
          studentId,
          {
            ...student,
            tagIds: student.tagIds.filter((id) => id !== tagId),
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
                tagIds: cell.tagIds.filter((id) => id !== tagId),
              }))
            ),
          },
        ])
      );

      return {
        ...state,
        students: updatedStudents,
        tags: remainingTags,
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


    case 'EDIT_CELL_ASSIGNED_TAGS': {
      const { tagIds, configId, row, col } = action.payload;
      const config = state.seatingConfigurations[configId];
      if (!config) return state;
      const newGrid = config.grid.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = {
        ...newRow[col],
        tagIds: tagIds
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

    case 'EDIT_GROUP': {
      const { groupsConfigId, updatedGroup } = action.payload;
      const groupsConfig: GroupsConfiguration = state.groupsConfigurations[groupsConfigId];
      if (groupsConfig == undefined) {
        return state;
      }
      const modifiedStudentGroups = groupsConfig.studentGroups.map(x => {
        if (x.id == updatedGroup.id) {
          return updatedGroup
        }
        return x;
      })
      return {
        ...state,
        groupsConfigurations: {
          ...state.groupsConfigurations,
          [groupsConfigId]: {
            ...groupsConfig,
            studentGroups: modifiedStudentGroups
          }
        }
      };
    }

    case 'EDIT_STUDENTS_ASSIGNED_TO_TAG': {
      const { tagId, studentIds } = action.payload;
      const selectedStudentIds = new Set(studentIds);

      const updatedStudents = Object.fromEntries(
        Object.entries(state.students).map(([studentId, student]) => {
          const hasTag = student.tagIds.includes(tagId);
          const shouldHaveTag = selectedStudentIds.has(studentId);

          return [
            studentId,
            {
              ...student,
              tagIds: shouldHaveTag
                ? hasTag
                  ? student.tagIds
                  : [...student.tagIds, tagId]
                : student.tagIds.filter((id) => id !== tagId),
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
        tagIds: []
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
              tagIds: []
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

    case 'EDIT_SHUFFLE_PREFERENCES': {
      const { updatedPreferences } = action.payload;
      return {
        ...state,
        shufflePreferences: updatedPreferences
      };
    }

    case 'ADD_GROUPS_CONFIGURATION': {
      const { classId, groupsConfiguration } = action.payload;
      return {
        ...state,
        groupsConfigurations: {
          ...state.groupsConfigurations,
          [groupsConfiguration.id]: groupsConfiguration,
        },
        classes: {
          ...state.classes,
          [classId]: {
            ...state.classes[classId],
            activeGroupsConfigurationId: groupsConfiguration.id
          }
        }
      }
    }

    case 'SET_ACTIVE_GROUPS_CONFIGURATION': {
      const { classId, groupsId } = action.payload;
      if (groupsId != null) {
        return {
          ...state,
          groupsConfigurations: {
            ...state.groupsConfigurations,
            [groupsId]: {
              ...state.groupsConfigurations[groupsId],
              selectedGroupId: null
            }
          },
          classes: {
            ...state.classes,
            [classId]: {
              ...state.classes[classId],
              activeGroupsConfigurationId: groupsId
            }
          }
        }
      }
      return {
        ...state,
        classes: {
          ...state.classes,
          [classId]: {
            ...state.classes[classId],
            activeGroupsConfigurationId: groupsId
          }
        }
      }
    }

    case 'SWAP_STUDENTS_IN_GROUPS': {
      const { groupsId, sourceGroupId, targetGroupId, studentId1, studentId2 } = action.payload
      const groupConfig = state.groupsConfigurations[groupsId];
      if (groupConfig == undefined) {
        return state;
      }
      var studentGroups = [...groupConfig.studentGroups]
      studentGroups = studentGroups.map(x => {
        if (x.id === sourceGroupId) {
          return {
            ...x,
            studentIds: studentId2 != null ? [
              ...x.studentIds.filter(y => y != studentId1),
              studentId2
            ] : [
              ...x.studentIds.filter(y => y != studentId1)
            ]
          }
        } else if (x.id === targetGroupId) {
          return {
            ...x,
            studentIds: studentId2 != null ? [
              ...x.studentIds.filter(y => y != studentId2),
              studentId1
            ] : [
              ...x.studentIds,
              studentId1
            ]
          }
        }
        return x;
      })
      return {
        ...state,
        groupsConfigurations: {
          ...state.groupsConfigurations,
          [groupsId]: {
            ...groupConfig,
            studentGroups: studentGroups
          }
        }
      }
    }

    case 'EDIT_GROUPS_CONFIGURATION': {
      const { updatedGroupsConfiguration } = action.payload
      return {
        ...state,
        groupsConfigurations: {
          ...state.groupsConfigurations,
          [updatedGroupsConfiguration.id]: updatedGroupsConfiguration
        }
      }
    }

    case 'SET_ACTIVE_GROUP': {
      const { groupsConfigId, selectedGroupId } = action.payload;
      return {
        ...state,
        groupsConfigurations: {
          ...state.groupsConfigurations,
          [groupsConfigId]: {
            ...state.groupsConfigurations[groupsConfigId],
            selectedGroupId: selectedGroupId
          }
        }
      }
    }

    case 'UPDATE_TAGS': {
      const { newTags } = action.payload;
      return {
        ...state,
        tags: newTags
      }
    }

    default:
      return state;
  }
}




function populateAbbrNames(
  students: Record<string, Student>
): Record<string, Student> {
  // Group student IDs by first name
  const groups = new Map<string, string[]>();
  for (const [id, student] of Object.entries(students)) {
    const group = groups.get(student.firstName);
    if (group) {
      group.push(id);
    } else {
      groups.set(student.firstName, [id]);
    }
  }

  const result: Record<string, Student> = {};

  for (const [firstName, ids] of groups) {
    if (ids.length === 1) {
      // First name alone is already unique
      const id = ids[0];
      result[id] = { ...students[id], nameAbbr: firstName };
      continue;
    }

    const lastNames = ids.map(id => students[id].lastName);
    const maxLen = Math.max(...lastNames.map(l => l.length));

    // Find smallest prefix length that makes all last names distinct
    let k = 1;
    while (k < maxLen) {
      const prefixes = lastNames.map(l => l.slice(0, k));
      if (new Set(prefixes).size === prefixes.length) break;
      k++;
    }

    for (const id of ids) {
      const shortLast = students[id].lastName.slice(0, k);
      const nameAbbr = shortLast ? `${firstName} ${shortLast}` : firstName;
      result[id] = { ...students[id], nameAbbr };
    }
  }

  return result;
}
