import "../styles/groups-editor.css";
import { useMemo, useState, MouseEvent } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { GroupsConfiguration, Student, CustomOption, SelectNumberOption, StudentGroup, TagWithStudents, KeepApartGroup, KeepTogetherGroup } from "../app-state";
import { useToast } from "./toast-context";
import Select, { ActionMeta, SingleValue } from "react-select";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { v4 as uuid } from 'uuid'
import StudentGroupRow from "./student-group-row";
import GroupEditor from "./group-editor";
import { FiEdit2 } from "react-icons/fi";
import ShufflePreferencesModal from "./shuffle-preferences-modal";



export default function GroupsEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, groupsConfigurations: allGroupsConfigurations, tags: allTags, shufflePreferences, keepApartGroups: allKeepApartGroups, keepTogetherGroups: allKeepTogetherGroups, studentViewEnabled } = useAppState();
    const toast = useToast();
    const [isShufflePreferencesModalOpen, setIsShufflePreferencesModalOpen] = useState(false)
    const [useAllStudents, setUseAllStudents] = useState(true);
    const [numberOfGroups, setNumberOfGroups] = useState(1);
    if (activeClass == undefined) {
        return null;
    }

    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const keepApartGroups: KeepApartGroup[] = activeClass.keepApartGroupIds.map(x => allKeepApartGroups[x])
    const keepTogetherGroups: KeepTogetherGroup[] = activeClass.keepTogetherGroupIds.map(x => allKeepTogetherGroups[x])
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
                    tagIds: []
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

    function updateGroupsConfiguration(updatedGroupsConfiguration: GroupsConfiguration) {
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


    function onGroupSelected(event: MouseEvent<HTMLButtonElement>, groupdId: string) {
        event.stopPropagation()
        if (groupsConfiguration == undefined) {
            return;
        }
        dispatch({ type: 'SET_ACTIVE_GROUP', payload: { groupsConfigId: groupsConfiguration.id, selectedGroupId: groupdId } });
    }

    function clearSelectedGroup() {
        if (groupsConfiguration == undefined) {
            return
        }
        if (groupsConfiguration.selectedGroupId == null) {
            return;
        }
        dispatch({ type: 'SET_ACTIVE_GROUP', payload: { groupsConfigId: groupsConfiguration.id, selectedGroupId: null } });
    }

    function shuffleStudents() {
        if (activeClass === undefined || groupsConfiguration === undefined) {
            return
        }



        var groupSetTagsMap: Map<string, TagWithStudents[]> = new Map();
        var studentGroups: StudentGroup[] = [...groupsConfiguration.studentGroups]

        for (const group of studentGroups) {
            var existingTagsWithStudents: TagWithStudents[] = []
            for (const tagId of group.tagIds) {
                const tag = allTags[tagId];
                const newTagWithStudents: TagWithStudents = { tagId: tagId, priority: tag.priority, studentIds: students.filter(s => s.tagIds.includes(tagId)).map(s => s.id) }
                existingTagsWithStudents.push(newTagWithStudents)
            }
            groupSetTagsMap.set(group.id, existingTagsWithStudents);
        }




        // Start from a random assignment: shuffle desks, take the first N for students,
        // the rest start out (and may remain) empty.
        const shuffledGroupIds = [...studentGroups.map(x => x.id)].sort(() => Math.random() - 0.5);
        const studentToGroup: Map<string, string> = new Map();
        students.forEach((student, i) => {
            studentToGroup.set(student.id, shuffledGroupIds[i % shuffledGroupIds.length]);
        });



        let currentScore = scoreAssignment(
            studentToGroup,
            groupSetTagsMap
        );

        let bestAssignment = new Map(studentToGroup);
        let bestGroupSetTagsMap = new Map(groupSetTagsMap);
        let bestScore = currentScore;

        for (let iter = 0; iter < shufflePreferences.iterations; iter++) {
            // Exponential cooling schedule
            const t = shufflePreferences.explorationStrengthStart * Math.pow(shufflePreferences.explorationStrengthEnd / shufflePreferences.explorationStrengthStart, iter / shufflePreferences.iterations);




            let undoMove;


            const idxA = Math.floor(Math.random() * students.length);
            let idxB = Math.floor(Math.random() * students.length);
            while (idxB === idxA) idxB = Math.floor(Math.random() * students.length);

            const studentA = students[idxA].id;
            const studentB = students[idxB].id;
            const groupdId1 = studentToGroup.get(studentA);
            const groupdId2 = studentToGroup.get(studentB);

            studentToGroup.set(studentA, groupdId2!);
            studentToGroup.set(studentB, groupdId1!);

            undoMove = () => {
                studentToGroup.set(studentA, groupdId1!);
                studentToGroup.set(studentB, groupdId2!);
            };


            const newScore = scoreAssignment(
                studentToGroup,
                groupSetTagsMap
            );
            const delta = newScore - currentScore;

            if (delta >= 0 || Math.random() < Math.exp(delta / t)) {
                // accept (better, or accepted anyway per annealing schedule)
                currentScore = newScore;
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestAssignment = new Map(studentToGroup);
                    bestGroupSetTagsMap = new Map(groupSetTagsMap);
                }
            } else {
                // reject: undo the move
                undoMove();
            }
        }

        const newStudentGroups: StudentGroup[] = studentGroups.map(group => ({
        ...group,
        studentIds: []
        }));

        const studentIds = Array.from(bestAssignment.keys());
        for (let i = 0; i < studentIds.length; i++) {
            newStudentGroups.find(x => x.id == bestAssignment.get(studentIds[i]))?.studentIds.push(studentIds[i]);
        }


        var issues: string[] = getIssuesWithShuffle(bestAssignment, bestGroupSetTagsMap)
        for (let i = 0; i < issues.length; i++) {
            toast.open(
                toast.toastWarning("Shuffle Issue", issues[i])
            )
        }

        dispatch({ type: 'EDIT_GROUPS_CONFIGURATION', payload: { updatedGroupsConfiguration: { ...groupsConfiguration, studentGroups: newStudentGroups } } });



    }

    function scoreAssignment(
        studentToGroup: Map<string, string>,
        groupSetTagsMap: Map<string, TagWithStudents[]>,
    ) {
        let score = 0;

        // 1. Desk-tag preference
        if (!shufflePreferences.ignoreTags) {
            for (const [studentId, groupId] of studentToGroup.entries()) {
                const deskTags: TagWithStudents[] | undefined = groupSetTagsMap.get(groupId)
                if (deskTags == undefined) {
                    continue;
                }
                let bestPriority: number = 1000.0;
                for (const tag of deskTags) {
                    if (tag.studentIds.includes(studentId)) {
                        if (tag.priority < bestPriority) {
                            bestPriority = tag.priority
                        }
                    }
                }
                if (bestPriority != 1000.0) {
                    if (!shufflePreferences.ignoreTagPriorities) {
                        score += Object.entries(allTags).length / bestPriority * shufflePreferences.tagsInfluence;
                    } else {
                        score += shufflePreferences.tagsInfluence;
                    }
                }
            }
        }

        if (!shufflePreferences.ignoreKeepTogetherGroups) {
            // 2. Keep-together groups
            for (const group of keepTogetherGroups) {
                if (group.studentIds.length < 2) {
                    continue
                }
                if (group.useAnd) {
                    let areAllTogether = true;
                    let pairCount = (group.studentIds.length * (group.studentIds.length - 1)) / 2;
                    for (let i = 0; i < group.studentIds.length; i++) {
                        for (let j = i + 1; j < group.studentIds.length; j++) {
                            const groupId1 = studentToGroup.get(group.studentIds[i]);
                            const groupId2 = studentToGroup.get(group.studentIds[j]);

                            if (groupId1 && groupId2 && groupId1 != groupId2) {
                                areAllTogether = false
                            }
                        }
                    }
                    if (areAllTogether) {
                        score += shufflePreferences.keepTogetherInfluence * pairCount;
                    }
                } else {
                    for (let i = 0; i < group.studentIds.length; i++) {
                        for (let j = i + 1; j < group.studentIds.length; j++) {
                            const groupId1 = studentToGroup.get(group.studentIds[i]);
                            const groupId2 = studentToGroup.get(group.studentIds[j]);

                            if (groupId1 && groupId2 && groupId1 == groupId2) {
                                score += shufflePreferences.keepTogetherInfluence;
                            }
                        }
                    }
                }
            }
        }

        if (!shufflePreferences.ignoreKeepApartGroups) {
            // 3. Keep-apart groups
            for (const group of keepApartGroups) {
                if (group.studentIds.length < 2) {
                    continue
                }
                if (group.useAnd) {
                    let areAllSeparate = true
                    let pairCount = (group.studentIds.length * (group.studentIds.length - 1)) / 2;
                    for (let i = 0; i < group.studentIds.length; i++) {
                        for (let j = i + 1; j < group.studentIds.length; j++) {
                            const groupId1 = studentToGroup.get(group.studentIds[i]);
                            const groupId2 = studentToGroup.get(group.studentIds[j]);
                            if (groupId1 && groupId2 && groupId1 == groupId2) {
                                areAllSeparate = false
                            }
                        }
                    }
                    if (areAllSeparate == false) {
                        score -= shufflePreferences.keepApartInfluence * pairCount;
                    }
                } else {
                    for (let i = 0; i < group.studentIds.length; i++) {
                        for (let j = i + 1; j < group.studentIds.length; j++) {
                            const groupId1 = studentToGroup.get(group.studentIds[i]);
                            const groupId2 = studentToGroup.get(group.studentIds[j]);
                            if (groupId1 && groupId2 && groupId1 == groupId2) {
                                score -= shufflePreferences.keepApartInfluence;
                            }
                        }
                    }
                }
            }
        }
        return score;
    }

    function getIssuesWithShuffle(
        studentToGroup: Map<string, string>,
        groupSetTagsMap: Map<string, TagWithStudents[]>,
    ): string[] {

        var issues: string[] = [];
        if (!shufflePreferences.ignoreKeepApartGroups) {
            // 3. Keep-apart groups
            for (const group of keepApartGroups) {
                if (group.studentIds.length < 2) {
                    continue
                }
                if (group.useAnd) {
                    let areAllSeparate = true
                    let pairCount = (group.studentIds.length * (group.studentIds.length - 1)) / 2;
                    for (let i = 0; i < group.studentIds.length; i++) {
                        for (let j = i + 1; j < group.studentIds.length; j++) {
                            const groupId1 = studentToGroup.get(group.studentIds[i]);
                            const groupId2 = studentToGroup.get(group.studentIds[j]);
                            if (groupId1 && groupId2 && groupId1 == groupId2) {
                                areAllSeparate = false
                            }
                        }
                    }
                    if (areAllSeparate == false) {
                        issues.push(`Students ${group.studentIds.map(x => allStudents[x].firstName).join(' and ')} are together.`);
                    }
                } else {
                    for (let i = 0; i < group.studentIds.length; i++) {
                        for (let j = i + 1; j < group.studentIds.length; j++) {
                            const groupId1 = studentToGroup.get(group.studentIds[i]);
                            const groupId2 = studentToGroup.get(group.studentIds[j]);
                            if (groupId1 && groupId2 && groupId1 == groupId2) {
                                issues.push(`Students ${[group.studentIds[i], group.studentIds[j]].map(x => allStudents[x].firstName).join(' and ')} are together.`)

                            }
                        }
                    }
                }
            }
        }
        return issues
    }

    function openShufflePreferencesModal() {
        setIsShufflePreferencesModalOpen(true);
    }

    function onCloseShufflePreferencesModal() {
        setIsShufflePreferencesModalOpen(false);
    }

    function onDeleteGroup(groupsConfigId : string) {
        dispatch({ type: 'REMOVE_GROUPS_CONFIGURATION', payload: { groupsConfigId: groupsConfigId } });

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
                                <li className="existing-groups-row" key={x.id}>
                                    <button className="existing-group-button" onClick={() => onExistingGroupsConfigurationSelected(x.id)}>{x.name}</button>
                                    <button className="existing-group-remove-button" onClick={() => onDeleteGroup(x.id)}>X</button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            }
            {groupsConfiguration &&
                <div onClick={clearSelectedGroup}>
                    <div className="current-groups-config-header-container">
                        <input className="current-groups-config-header" value={groupsConfiguration.name} onChange={(e) => updateGroupsConfiguration({ ...groupsConfiguration, name: e.target.value })} />
                    </div>
                    <div className="current-group-options-container">
                        <button onClick={onClearActiveGroupsConfigurationId} className="default-button">Back</button>
                        <button onClick={() => setIsShufflePreferencesModalOpen(true)} className="default-button">Shuffle Preferences</button>
                        <button onClick={shuffleStudents} className="default-button">Shuffle</button>
                    </div>
                    <div className={ studentViewEnabled ? 'groups-grid-student-view' : 'groups-grid'}>
                        <DragDropProvider
                            onDragStart={() => { }}
                            onDragMove={() => { }}
                            onDragOver={() => { }}
                            onDragEnd={onDragEnd}>
                            {groupsConfiguration.studentGroups.map(x => {
                                return (
                                    <div className={studentViewEnabled ? 'student-group-student-view' : 'student-group'} key={x.id}>
                                        <div className="student-group-header-container">
                                            <p className="student-group-header">{x.name}</p>
                                            {!studentViewEnabled && <button className="student-group-select-button" onClick={(e) => onGroupSelected(e, x.id)}>
                                                <FiEdit2></FiEdit2>
                                            </button>}
                                        </div>
                                        <ul className="w-full">
                                            {x.studentIds.map(y => {
                                                return (
                                                    <StudentGroupRow key={`slot-${y}`} groupsConfigurationId={groupsConfiguration.id} groupId={x.id} studentId={y} id={`slot-${y}`}></StudentGroupRow>
                                                )
                                            })}
                                            <StudentGroupRow key={`slot-${x.id}`} groupsConfigurationId={groupsConfiguration.id} groupId={x.id} studentId={null} id={`slot-${x.id}`}></StudentGroupRow>
                                        </ul>
                                        {!studentViewEnabled && <ul className="group-tag-marker-container">
                                            {x.tagIds.map((tagId) => {
                                                return <li
                                                    className="group-tag-marker"
                                                    key={tagId}
                                                    style={{
                                                        backgroundColor: `${allTags[tagId].color}`
                                                    }}
                                                ></li>
                                            })}
                                        </ul>}
                                    </div>

                                )
                            })}
                        </DragDropProvider>
                    </div>
                    <ShufflePreferencesModal open={isShufflePreferencesModalOpen} onClose={onCloseShufflePreferencesModal}></ShufflePreferencesModal>
                </div>

            }
            <GroupEditor></GroupEditor>
        </div>
    )
}