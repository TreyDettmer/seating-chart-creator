import { FloorCell } from "../app-state"
import { useDroppable } from "@dnd-kit/react"
import DraggableDeskComponent from "./draggable-desk"
import DraggableStudentComponent from "./draggable-student"


export default function FloorCellComponent(
    props: FloorCell
) {
    const isDraggable: boolean = props.studentId != null
    const { ref, isDropTarget } = useDroppable({ id: props.id })
    return (
        <div ref={ref} className="relative box-border">
            {props.hasDesk && <DraggableDeskComponent id={`desk-${props.id}`} cellId={`${props.id}`} isDropTarget={isDropTarget}></DraggableDeskComponent>}
            {props.studentId && <DraggableStudentComponent id={`student-${props.id}`} cellId={`${props.id}`} studentId={props.studentId}></DraggableStudentComponent>}
        </div>
    )
}