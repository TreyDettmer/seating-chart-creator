import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { DeskTag } from "../app-state";

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
    const { deskTags: allDeskTags } = useAppState()
    const activeConfig = useActiveSeatingConfig();
    if (activeConfig === undefined) {
        return null;
    }
    const { ref, isDragging } = useDraggable({ id: props.id })
    const deskTagIds = activeConfig.grid[props.cellRow][props.cellCol].deskTagIds;
    const deskTags : DeskTag[] = deskTagIds.map(x => {
        return allDeskTags[x]
    })

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
            <ul className="desk-desk-tag-marker-container">
                {deskTags.map((deskTag) => {
                    return <li 
                    className="desk-desk-tag-marker"
                    key={deskTag.id}
                    style={{
                        backgroundColor: `${deskTag.color}`
                    }}
                    ></li>
                })}
            </ul>
                
        </button>
    )
}