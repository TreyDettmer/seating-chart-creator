import "../styles/groups-editor.css";
import { useMemo, useState } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { GroupsConfiguration, Student, CustomOption, SelectNumberOption, StudentGroup } from "../app-state";
import { useToast } from "./toast-context";
import Select, { ActionMeta, SingleValue } from "react-select";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { v4 as uuid } from 'uuid'
import StudentGroupRow from "./student-group-row";



export default function GroupsEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, groupsConfigurations: allGroupsConfigurations } = useAppState();
    const toast = useToast();
    const [useAllStudents, setUseAllStudents] = useState(true);
    const [numberOfGroups, setNumberOfGroups] = useState(1);
    if (activeClass == undefined) {
        return null;
    }

    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const groupsConfigurations: GroupsConfiguration[] = Object.values(allGroupsConfigurations).filter(x => x.classId == activeClass.id);
    const groupsConfiguration: GroupsConfiguration | undefined = allGroupsConfigurations[activeClass.activeGroupsConfigurationId || ''];
    var numberOfGroupsOptions: SelectNumberOption[] = students.map((x, index) => {
        return { value: index + 1, label: `${index + 1} groups` }
    })

    function onGenerateGroups() {
        if (activeClass == undefined) {
            return null;
        }
        var studentGroups: StudentGroup[] = [];
        for (let i = 0; i < numberOfGroups; i++) {
            studentGroups.push(
                {
                    id: uuid(),
                    name: `Group ${i + 1}`,
                    studentIds: [],
                    deskTagIds: []
                }
            )
        }
        var filteredStudents = useAllStudents ? students : students;
        for (let i = 0; i < filteredStudents.length; i++) {
            studentGroups[i % numberOfGroups].studentIds.push(filteredStudents[i].id);
        }
        var newGroupId = uuid()
        var newGroupsConfiguration: GroupsConfiguration = {
            id: newGroupId,
            classId: activeClass.id,
            name: "Group Config",
            studentGroups: studentGroups,
            selectedGroupId: null
        }

        dispatch({ type: 'ADD_GROUPS_CONFIGURATION', payload: { classId: activeClass.id, groupsConfiguration: newGroupsConfiguration } });
    }

    function onExistingGroupsConfigurationSelected(groupsId: string) {
        if (activeClass == undefined) {
            return null;
        }
        dispatch({ type: 'SET_ACTIVE_GROUPS_CONFIGURATION', payload: { classId: activeClass.id, groupsId: groupsId } });
    }

    function onClearActiveGroupsConfigurationId() {
        if (activeClass == undefined) {
            return null;
        }
        dispatch({ type: 'SET_ACTIVE_GROUPS_CONFIGURATION', payload: { classId: activeClass.id, groupsId: null } });
    }

    function updateGroupsConfiguration(updatedGroupsConfiguration : GroupsConfiguration) {
        if (activeClass == undefined) {
            return;
        }
        dispatch({ type: 'EDIT_GROUPS_CONFIGURATION', payload: { updatedGroupsConfiguration: updatedGroupsConfiguration } });

        
    }

    function updateGroup(updatedGroup: StudentGroup) {
        if (activeClass == undefined) {
            return;
        }
        dispatch({ type: 'SET_ACTIVE_GROUPS_CONFIGURATION', payload: { classId: activeClass.id, groupsId: null } });
    }

    function onDragEnd(event: DragEndEvent) {
        if (event.canceled) {
            return;
        }
        if (groupsConfiguration == undefined) {
            return;
        }
        const sourceId = event.operation.source?.id as string;
        const targetId = event.operation.target?.id as string;

        if (sourceId == null || targetId == null) {
            return;
        }
        if (!sourceId.startsWith('student-') || !targetId.startsWith('slot-')) {
            return;
        }
        var draggedStudentId = sourceId.replace('student-', '');
        var draggedStudentGroupSource = groupsConfiguration.studentGroups.find(x => x.studentIds.includes(draggedStudentId))
        if (draggedStudentGroupSource == undefined) {
            return
        }
        var targetStudent: Student = allStudents[targetId.replace('slot-', '')];
        if (targetStudent === undefined) {
            // We are adding a student to a group
            let targetGroupSource = groupsConfiguration.studentGroups.find(x => x.id == targetId.replace('slot-', ''));
            if (targetGroupSource == undefined) {
                return
            }
            if (draggedStudentGroupSource.id == targetGroupSource.id) {
                return;
            }
            dispatch({ type: 'SWAP_STUDENTS_IN_GROUPS', payload: { groupsId: groupsConfiguration.id, sourceGroupId: draggedStudentGroupSource.id, targetGroupId: targetGroupSource.id, studentId1: draggedStudentId, studentId2: null } });


        } else {
            // We are swapping students
            let targetStudentGroupSource = groupsConfiguration.studentGroups.find(x => x.studentIds.includes(targetStudent.id))
            if (targetStudentGroupSource == undefined) {
                return
            }
            if (draggedStudentGroupSource.id == targetStudentGroupSource.id) {
                return;
            }
            dispatch({ type: 'SWAP_STUDENTS_IN_GROUPS', payload: { groupsId: groupsConfiguration.id, sourceGroupId: draggedStudentGroupSource.id, targetGroupId: targetStudentGroupSource!.id, studentId1: draggedStudentId, studentId2: targetStudent.id } });
        }
    }


    return (
        <div className="groups-editor">
            {groupsConfiguration == undefined &&
                <div className="groups-generation-page">
                    <h2 className="groups-generation-page-header">Generate Random Groups</h2>
                    <div className="groups-generation-options">
                        <p>Divide</p>
                        <Select components={{ Option: CustomOption }} classNamePrefix="select" value={{ value: useAllStudents, label: `${useAllStudents ? 'All Students' : 'Present Students'}` }} options={[
                            { value: true, label: 'All Students' },
                            { value: false, label: 'Present Students' },
                        ]} onChange={(newValue: SingleValue<{
                            value: boolean;
                            label: string;
                        }>, _: ActionMeta<{
                            value: boolean;
                            label: string;
                        }>) => { setUseAllStudents(newValue?.value ?? false) }} />
                        <p>Into</p>
                        <Select components={{ Option: CustomOption }}
                            classNamePrefix="select"
                            options={numberOfGroupsOptions}
                            value={{ value: numberOfGroups, label: `${numberOfGroups} groups` }}
                            onChange={(newValue: SingleValue<{
                                value: number;
                                label: string;
                            }>, _: ActionMeta<{
                                value: number;
                                label: string;
                            }>) => { setNumberOfGroups(newValue?.value || 2) }}
                        />
                        <button onClick={onGenerateGroups} className="default-button">Generate Groups</button>
                    </div>
                    <ul className="existing-groups-container">
                        {groupsConfigurations.map(x => {
                            return (
                                <li className="existing-groups-row" onClick={() => onExistingGroupsConfigurationSelected(x.id)} key={x.id}>
                                    {x.name}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            }
            {groupsConfiguration &&
                <div>
                    <div className="current-groups-config-header-container">
                        <input className="current-groups-config-header" value={groupsConfiguration.name} onChange={(e) => updateGroupsConfiguration({ ...groupsConfiguration, name: e.target.value })} />
                    </div>
                    <div className="current-group-options-container">
                        <button onClick={onClearActiveGroupsConfigurationId} className="default-button">Back</button>
                        <button onClick={onClearActiveGroupsConfigurationId} className="default-button">New Groups</button>
                    </div>
                    <div className="groups-grid">
                        <DragDropProvider
                            onDragStart={() => { }}
                            onDragMove={() => { }}
                            onDragOver={() => { }}
                            onDragEnd={onDragEnd}>
                            {groupsConfiguration.studentGroups.map(x => {
                                return (
                                    <div className="student-group" key={x.id}>
                                        <div className="student-group-header-container">
                                            <input className="student-group-header" value={x.name} onChange={(e) => updateGroup({ ...x, name: e.target.value })} />
                                        </div>


                                        <ul>

                                            {x.studentIds.map(y => {
                                                return (
                                                    <StudentGroupRow key={`slot-${y}`} groupsConfigurationId={groupsConfiguration.id} groupId={x.id} studentId={y} id={`slot-${y}`}></StudentGroupRow>
                                                )
                                            })}
                                            <StudentGroupRow key={`slot-${x.id}`} groupsConfigurationId={groupsConfiguration.id} groupId={x.id} studentId={null} id={`slot-${x.id}`}></StudentGroupRow>

                                        </ul>
                                    </div>
                                )
                            })}
                        </DragDropProvider>
                    </div>
                </div>
            }
        </div>
    )
}