import "../styles/draggable-desk.css";
import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { Tag } from "../app-state";

export interface DraggableDeskProps {
    id: string,
    cellId: string | null,
    cellRow: number,
    cellCol: number,
    isDropTarget: boolean,
}

export default function DraggableDeskComponent(
    props: DraggableDeskProps
) {
    const dispatch = useAppDispatch();
    const { tags: allTags, studentViewEnabled } = useAppState()
    const activeConfig = useActiveSeatingConfig();
    if (activeConfig === undefined) {
        return null;
    }
    const { ref, isDragging } = useDraggable({ id: props.id })
    const tagIds = activeConfig.grid[props.cellRow][props.cellCol].tagIds;
    const tags: Tag[] = tagIds.map(x => {
        return allTags[x]
    })

    function onClick(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
        if (activeConfig === undefined) {
            return null;
        }
        dispatch({ type: 'TOGGLE_SELECTED_CELL', payload: { configId: activeConfig.id, cell: { row: props.cellRow, col: props.cellCol } } });
    }

    const className = (): string => {
        var name = 'desk'
        if (activeConfig === undefined) {
            return name;
        }
        if (studentViewEnabled) {
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
        if (activeConfig.grid[props.cellRow][props.cellCol].allowsStudents == false) {
            name += ' desk-restricted'
        }
        return name
    }

    return (
        <button onClick={onClick} ref={ref} className={className()}>
            {!studentViewEnabled && <ul className="desk-tag-marker-container">
                {tags.map((tag) => {
                    return <li
                        className="desk-tag-marker"
                        key={tag.id}
                        style={{
                            backgroundColor: `${tag.color}`
                        }}
                    ></li>
                })}
            </ul>}
        </button>
    )
}