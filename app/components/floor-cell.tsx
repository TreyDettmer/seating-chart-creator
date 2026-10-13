import { FloorCell } from "../app-state"
import { useDroppable } from "@dnd-kit/react"
import DraggableDeskComponent from "./draggable-desk"
import DraggableStudentComponent from "./draggable-student"
import { useActiveSeatingConfig, useAppDispatch } from "../app-context"


export default function FloorCellComponent(
    props: FloorCell
) {
    const dispatch = useAppDispatch();
    const activeConfig = useActiveSeatingConfig()
    const { ref, isDropTarget } = useDroppable({ id: props.id })

    function onClick() {
        if (activeConfig === undefined) {
            return
        }
        if (props.hasDesk == false && props.studentId == null && activeConfig.selectedCell != null) {
            dispatch({ type: 'TOGGLE_SELECTED_CELL', payload: { configId: activeConfig.id, cell: null } });
        }
    }

    return (
        <div onClick={onClick} ref={ref} className="relative box-border">
            {props.hasDesk && <DraggableDeskComponent id={`desk-${props.id}`} cellId={`${props.id}`} cellRow={props.row} cellCol={props.column} isDropTarget={isDropTarget}></DraggableDeskComponent>}
            {props.studentId && <DraggableStudentComponent id={`student-${props.id}`} cellId={`${props.id}`} studentId={props.studentId}></DraggableStudentComponent>}
        </div>
    )
}