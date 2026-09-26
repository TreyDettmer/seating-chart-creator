import "../styles/groups-editor.css";
import { useDraggable, useDroppable } from "@dnd-kit/react"
import { useAppState } from "../app-context";
import { v4 as uuid } from 'uuid'


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
    const { students: allStudents, groupsConfigurations: allGroupsConfigurations } = useAppState();
    return (
        <div ref={ref} className="student-group-row-entry">
            {allStudents[studentId].firstName}
        </div>
    )
}