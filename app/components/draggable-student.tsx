
import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";

export interface DraggableStudentProps {
    id: string,
    cellId: string | null,
    studentId: string,
}
export default function DraggableStudentComponent(
    props: DraggableStudentProps
) {
    const { ref, isDragging } = useDraggable({ id: props.id })

    function onClick(event : MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
    }

    return (
        <button onClick={onClick} ref={ref} className="bg-[rgb(238,238,238)] text-black box-border border border-[rgb(48,48,48)] rounded-sm absolute p-px w-[75%] h-[75%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 flex justify-center items-center">
            <p>{props.studentId.slice(0,4)}</p>
        </button>
    )
}