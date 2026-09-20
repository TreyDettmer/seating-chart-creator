import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch } from "../app-context";

export interface DraggableDeskProps {
    id : string,
    cellId : string | null,
    cellRow : number,
    cellCol : number,
    isDropTarget : boolean,
}

export default function DraggableDeskComponent(
    props : DraggableDeskProps
) {
    const dispatch = useAppDispatch();
    const activeConfig = useActiveSeatingConfig();
    if (activeConfig === undefined) {
        return null;
    }
    const { ref, isDragging } = useDraggable({ id: props.id })

    function onClick(event : MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
    if (activeConfig === undefined) {
        return null;
    }
        dispatch({ type: 'TOGGLE_SELECTED_CELL', payload: { configId: activeConfig.id, cell: {row: props.cellRow, col: props.cellCol} } });
    }

    const className = () : string => {
        var name = 'desk'
        if (activeConfig === undefined) {
            return name;
        }
        if (isDragging) {
            name += ' desk-dragging'
        }
        if (props.isDropTarget && !isDragging) {
            name += ' desk-drop-target'
        }
        if (activeConfig.selectedCell != null && activeConfig.selectedCell.col == props.cellCol && activeConfig.selectedCell.row == props.cellRow) {
            name += ' desk-selected'
        }

        return name
    }

    return (
        <button onClick={onClick} ref={ref} className={className()}>
                
        </button>
    )
}