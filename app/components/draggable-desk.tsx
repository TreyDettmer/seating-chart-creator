import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";

export interface DraggableDeskProps {
    id : string,
    cellId : string | null,
    isDropTarget : boolean,
}

export default function DraggableDeskComponent(
    props : DraggableDeskProps
) {

    const { ref, isDragging } = useDraggable({ id: props.id })

    function onClick(event : MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
    }
    return (
        <button ref={ref} className={`${props.isDropTarget ? " bg-orange-400" : "bg-orange-300"} box-border border border-[rgb(94,93,93)] rounded-sm absolute p-px w-[95%] h-[95%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
                
        </button>
    )
}