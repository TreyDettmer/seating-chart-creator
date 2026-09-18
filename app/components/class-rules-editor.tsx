import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { KeepApartGroup, KeepTogetherGroup, Student } from "../app-state";
import Select, { ActionMeta, GroupBase, MultiValue, OptionsOrGroups } from 'react-select'
import { v4 as uuid } from 'uuid'

export default function ClassRulesEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, keepApartGroups: allKeepApartGroups, keepTogetherGroups: allKeepTogetherGroups } = useAppState();

    if (activeClass == undefined) {
        return null;
    }

    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });

    const keepApartGroups : KeepApartGroup[] = activeClass?.keepApartGroupIds.map((id) => {
        const group = allKeepApartGroups[id];
        return group;
    })

    const keepTogetherGroups : KeepTogetherGroup[] = activeClass?.keepTogetherGroupIds.map((id) => {
        const group = allKeepTogetherGroups[id];
        return group;
    })

    interface StudentOption {
        value: string;
        label: string;
    }
    const studentOptions : StudentOption[] = students.map((student, index) => {
        return { value: student.id, label: `${student.firstName} ${student.lastName}`}
    })



    function onAddKeepApartGroup() {
        if (activeClass === undefined) {
            return
        }
        var newGroup : KeepApartGroup = {
            id: uuid(),
            studentIds: [],
            useAnd: true
        }
        dispatch({ type: 'ADD_KEEP_APART_GROUP', payload: { classId: activeClass.id, group: newGroup } });
    }

    function onKeepApartGroupChanged(groupId : string, newValue: MultiValue<StudentOption>, actionMeta: ActionMeta<StudentOption>) {
        if (activeClass === undefined) {
            return
        }
        var newStudentIds = newValue.map(x => x.value)
        var existingGroup = allKeepApartGroups[groupId]
        var modifiedGroup = {
            ...existingGroup,
            studentIds: newStudentIds
        }
        dispatch({ type: 'EDIT_KEEP_APART_GROUP', payload: { classId: activeClass.id, groupId: groupId, group: modifiedGroup } });
    }

    function onRemoveKeepApartGroup(groupId : string) {
        if (activeClass === undefined) {
            return
        }

        dispatch({ type: 'REMOVE_KEEP_APART_GROUP', payload: { classId: activeClass.id, groupId: groupId } });
    }

    function onAddKeepTogetherGroup() {
        if (activeClass === undefined) {
            return
        }
        var newGroup : KeepTogetherGroup = {
            id: uuid(),
            studentIds: [],
            useAnd: true
        }
        dispatch({ type: 'ADD_KEEP_TOGETHER_GROUP', payload: { classId: activeClass.id, group: newGroup } });
    }

    function onKeepTogetherGroupChanged(groupId : string, newValue: MultiValue<StudentOption>, actionMeta: ActionMeta<StudentOption>) {
        if (activeClass === undefined) {
            return
        }
        var newStudentIds = newValue.map(x => x.value)
        var existingGroup = allKeepTogetherGroups[groupId]
        var modifiedGroup = {
            ...existingGroup,
            studentIds: newStudentIds
        }
        dispatch({ type: 'EDIT_KEEP_TOGETHER_GROUP', payload: { classId: activeClass.id, groupId: groupId, group: modifiedGroup } });
    }

    function onRemoveKeepTogetherGroup(groupId : string) {
        if (activeClass === undefined) {
            return
        }

        dispatch({ type: 'REMOVE_KEEP_TOGETHER_GROUP', payload: { classId: activeClass.id, groupId: groupId } });
    }

    return (
        <div className="class-rules-editor">

            <p className="class-rules-editor-header" >Keep Apart Rules</p>
            <p className="class-rules-editor-subheader" >Easily keep students away from each other.</p>
            <ul>
                {keepApartGroups.map(x => {
                    return <li key={x.id}>
                        <Select
                            isMulti
                            options={studentOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            value={
                                studentOptions.filter((studentOption) => {
        
                                    return x.studentIds.includes(studentOption.value)
                                })
                            }
                            onChange={(newValue, actionMeta) => {onKeepApartGroupChanged(x.id, newValue, actionMeta)}}
                        />
                        <button className="default-button" onClick={() => onRemoveKeepApartGroup(x.id)}>Remove Group</button>
                    </li>
                })}
                <button className="default-button" onClick={() => onAddKeepApartGroup()}>+ Keep Apart Rule</button>
            </ul>
            <p className="class-rules-editor-header" >Keep Together Rules</p>
            <p className="class-rules-editor-subheader" >Keep groups of students together</p>
            
            <ul>
                {keepTogetherGroups.map(x => {
                    return <li key={x.id}>
                        <Select
                            isMulti
                            options={studentOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            value={
                                studentOptions.filter((studentOption) => {
        
                                    return x.studentIds.includes(studentOption.value)
                                })
                            }
                            onChange={(newValue, actionMeta) => {onKeepTogetherGroupChanged(x.id, newValue, actionMeta)}}
                        />
                        <button className="default-button" onClick={() => onRemoveKeepTogetherGroup(x.id)}>Remove Group</button>
                    </li>
                })}
                <button className="default-button" onClick={() => onAddKeepTogetherGroup()}>+ Keep Together Rule</button>
            </ul>
        </div>
    )
}