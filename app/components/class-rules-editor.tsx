import "../styles/class-rules-editor.css";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { CustomOption, tagColorDot, KeepApartGroup, KeepTogetherGroup, SelectOption, Student } from "../app-state";
import Select, { ActionMeta, MultiValue, SingleValue } from 'react-select'
import { v4 as uuid } from 'uuid'



export default function ClassRulesEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, tags, keepApartGroups: allKeepApartGroups, keepTogetherGroups: allKeepTogetherGroups } = useAppState();



    if (activeClass == undefined) {
        return null;
    }

    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });

    const keepApartGroups: KeepApartGroup[] = activeClass?.keepApartGroupIds.map((id) => {
        const group = allKeepApartGroups[id];
        return group;
    })

    const keepTogetherGroups: KeepTogetherGroup[] = activeClass?.keepTogetherGroupIds.map((id) => {
        const group = allKeepTogetherGroups[id];
        return group;
    })


    const studentSelectOptions: SelectOption[] = students.map((student, index) => {
        return { value: student.id, label: `${student.firstName} ${student.lastName}` }
    })

    const groupOperationSelectOptions: SelectOption[] = [{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }]



    function onAddKeepApartGroup() {
        if (activeClass === undefined) {
            return
        }
        var newGroup: KeepApartGroup = {
            id: uuid(),
            studentIds: [],
            useAnd: true
        }
        dispatch({ type: 'ADD_KEEP_APART_GROUP', payload: { classId: activeClass.id, group: newGroup } });
    }

    function onKeepApartGroupChanged(groupId: string, newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) {
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

    function onKeepApartGroupOperationChanged(groupId: string, newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) {
        if (activeClass === undefined) {
            return
        }
        var useAnd = newValue?.value == 'AND'
        var existingGroup = allKeepApartGroups[groupId]
        if (useAnd === existingGroup.useAnd) {
            return
        }
        var modifiedGroup = {
            ...existingGroup,
            useAnd: useAnd
        }
        dispatch({ type: 'EDIT_KEEP_APART_GROUP', payload: { classId: activeClass.id, groupId: groupId, group: modifiedGroup } });
    }

    function onRemoveKeepApartGroup(groupId: string) {
        if (activeClass === undefined) {
            return
        }

        dispatch({ type: 'REMOVE_KEEP_APART_GROUP', payload: { classId: activeClass.id, groupId: groupId } });
    }

    function onAddKeepTogetherGroup() {
        if (activeClass === undefined) {
            return
        }
        var newGroup: KeepTogetherGroup = {
            id: uuid(),
            studentIds: [],
            useAnd: true
        }
        dispatch({ type: 'ADD_KEEP_TOGETHER_GROUP', payload: { classId: activeClass.id, group: newGroup } });
    }

    function onKeepTogetherGroupChanged(groupId: string, newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) {
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

    function onKeepTogetherGroupOperationChanged(groupId: string, newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) {
        if (activeClass === undefined) {
            return
        }
        var useAnd = newValue?.value == 'AND'
        var existingGroup = allKeepTogetherGroups[groupId]
        if (useAnd === existingGroup.useAnd) {
            return
        }
        var modifiedGroup = {
            ...existingGroup,
            useAnd: useAnd
        }
        dispatch({ type: 'EDIT_KEEP_TOGETHER_GROUP', payload: { classId: activeClass.id, groupId: groupId, group: modifiedGroup } });
    }

    function onRemoveKeepTogetherGroup(groupId: string) {
        if (activeClass === undefined) {
            return
        }

        dispatch({ type: 'REMOVE_KEEP_TOGETHER_GROUP', payload: { classId: activeClass.id, groupId: groupId } });
    }

    function onStudentAssignTagsChanged(tagId: string, newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) {
        if (activeClass === undefined) {
            return
        }
        var newStudentIds = newValue.map(x => x.value)

        dispatch({ type: 'EDIT_STUDENTS_ASSIGNED_TO_TAG', payload: { tagId: tagId, studentIds: newStudentIds } });
    }



    return (
        <div className="class-rules-editor">

            <p className="class-rules-editor-header" >Keep Apart Rules</p>
            <p className="class-rules-editor-subheader" >Keep students away from each other.</p>
            <ul>
                {keepApartGroups.map(x => {
                    return <li className="class-rules-group-container" key={x.id}>
                        <Select
                            isMulti
                            options={studentSelectOptions}
                            className="class-rules-editor-select"
                            classNamePrefix="select"
                            components={{ Option: CustomOption }}
                            value={
                                studentSelectOptions.filter((studentOption) => {

                                    return x.studentIds.includes(studentOption.value)
                                })
                            }
                            onChange={(newValue, actionMeta) => { onKeepApartGroupChanged(x.id, newValue, actionMeta) }}
                        />
                        <div className="class-rules-editor-select-operation-container">
                            <Select
                                options={groupOperationSelectOptions}
                                className="class-rules-editor-select-operation"
                                classNamePrefix="select"
                                components={{ Option: CustomOption }}
                                value={
                                    groupOperationSelectOptions.filter((groupOperationSelectOption) => {

                                        return (x.useAnd && groupOperationSelectOption.label == 'AND') || (!x.useAnd && groupOperationSelectOption.label == 'OR')
                                    })
                                }
                                onChange={(newValue, actionMeta) => { onKeepApartGroupOperationChanged(x.id, newValue, actionMeta) }}
                            />
                        </div>

                        <button className="class-rules-editor-remove-group-button" onClick={() => onRemoveKeepApartGroup(x.id)}>X</button>
                    </li>
                })}
                <button className="default-button" onClick={() => onAddKeepApartGroup()}>+ Keep Apart Rule</button>
            </ul>
            <p className="class-rules-editor-header" >Keep Together Rules</p>
            <p className="class-rules-editor-subheader" >Keep groups of students together</p>
            <ul>
                {keepTogetherGroups.map(x => {
                    return <li className="class-rules-group-container" key={x.id}>
                        <Select
                            isMulti
                            options={studentSelectOptions}
                            className="class-rules-editor-select"
                            classNamePrefix="select"
                            components={{ Option: CustomOption }}
                            value={
                                studentSelectOptions.filter((studentOption) => {

                                    return x.studentIds.includes(studentOption.value)
                                })
                            }
                            onChange={(newValue, actionMeta) => { onKeepTogetherGroupChanged(x.id, newValue, actionMeta) }}
                        />
                        <div className="class-rules-editor-select-operation-container">
                            <Select
                                options={groupOperationSelectOptions}
                                className="class-rules-editor-select-operation"
                                classNamePrefix="select"
                                components={{ Option: CustomOption }}
                                value={
                                    groupOperationSelectOptions.filter((groupOperationSelectOption) => {

                                        return (x.useAnd && groupOperationSelectOption.label == 'AND') || (!x.useAnd && groupOperationSelectOption.label == 'OR')
                                    })
                                }
                                onChange={(newValue, actionMeta) => { onKeepTogetherGroupOperationChanged(x.id, newValue, actionMeta) }}
                            />
                        </div>
                        <button className="class-rules-editor-remove-group-button" onClick={() => onRemoveKeepTogetherGroup(x.id)}>X</button>
                    </li>
                })}
                <button className="default-button" onClick={() => onAddKeepTogetherGroup()}>+ Keep Together Rule</button>
            </ul>
            <p className="class-rules-editor-header">Tag Rules</p>
            <p className="class-rules-editor-subheader">Restrict students to desks and groups with a certain tag</p>
            <ul>
                <div className="tag-students-header">
                    <p className="flex-1 text-center">Tag</p>
                    <p className="flex-1 text-center">Students</p>
                </div>
                {Object.entries(tags).map(([tagId, tag]) => {
                    return <li className="tag-students-row" key={tagId}>
                        <p className="flex-1" style={{ display: 'flex', alignItems: 'center' }}>
                            <span
                                aria-hidden="true"
                                style={{
                                    backgroundColor: tag.color,
                                    borderRadius: 10,
                                    display: 'block',
                                    width: 10,
                                    height: 10,
                                    marginRight: 2,
                                    marginLeft: 2,
                                }}
                            />
                            {tag.name}
                        </p>
                        <Select
                            isMulti
                            options={studentSelectOptions}
                            className="class-rules-editor-select flex-1"
                            classNamePrefix="select"
                            components={{ Option: CustomOption }}
                            value={
                                studentSelectOptions.filter((studentOption) => {
                                    return allStudents[studentOption.value].tagIds.includes(tagId)
                                })
                            }
                            onChange={(newValue, actionMeta) => { onStudentAssignTagsChanged(tagId, newValue, actionMeta) }}
                        />
                    </li>
                })}

            </ul>
        </div>
    )
}