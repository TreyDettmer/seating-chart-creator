import "../styles/groups-editor.css";
import { useDraggable, useDroppable } from "@dnd-kit/react"
import { useActiveClass, useAppState } from "../app-context";
import { v4 as uuid } from 'uuid'
import { NameDisplay } from "../app-state";


interface StudentGroupRowProps {
    groupsConfigurationId: string,
    groupId: string,
    studentId: string | null,
    id: string,
}

interface StudentGroupRowEntryProps {
    groupsConfigurationId: string,
    groupId: string,
    studentId: string,
}

export default function StudentGroupRow(
    { groupsConfigurationId, groupId, studentId, id }: StudentGroupRowProps
) {

    const { ref, isDropTarget } = useDroppable({ id: id })
    const { students: allStudents, groupsConfigurations: allGroupsConfigurations } = useAppState();

    const className = (): string => {
        var name = 'student-group-row'
        if (isDropTarget) {
            name += ' student-group-row-drop-target'
        }
        return name
    }

    return (
        <li ref={ref} className={className()}>
            {studentId && <StudentGroupRowEntry groupsConfigurationId={groupsConfigurationId} groupId={groupId} studentId={studentId!}></StudentGroupRowEntry>}
        </li>
    )
}

export function StudentGroupRowEntry(
    { groupsConfigurationId, groupId, studentId }: StudentGroupRowEntryProps
) {
    const { ref, isDragging } = useDraggable({ id: `student-${studentId}` })
    const { students: allStudents, groupsConfigurations: allGroupsConfigurations, studentViewEnabled, tags: allTags } = useAppState();
    const activeClass = useActiveClass();
    const displayName = () : string => {
        if (activeClass == undefined) {
            return ""
        }
        if (activeClass.classPreferences.nameDisplay == NameDisplay.Abbreviated) {
            return allStudents[studentId].nameAbbr
        }
        if (activeClass.classPreferences.nameDisplay == NameDisplay.First) {
            return allStudents[studentId].firstName
        }
        if (activeClass.classPreferences.nameDisplay == NameDisplay.Last) {
            return allStudents[studentId].lastName
        }
        if (activeClass.classPreferences.nameDisplay == NameDisplay.FirstAndLast) {
            return `${allStudents[studentId].firstName} ${allStudents[studentId].lastName}`
        }
        return ""
    }
    return (
        <div ref={ref} className="student-group-row-entry">
            {displayName()}
            {!studentViewEnabled && <ul className="group-entry-tag-marker-container">
                                            {allStudents[studentId].tagIds.map((tagId) => {
                                                return <li
                                                    className="group-entry-tag-marker"
                                                    key={tagId}
                                                    style={{
                                                        backgroundColor: `${allTags[tagId].color}`
                                                    }}
                                                ></li>
                                            })}
                                        </ul>}
        </div>
    )
}