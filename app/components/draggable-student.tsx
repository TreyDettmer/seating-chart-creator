
import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context"
import { Student } from "../app-state";

export interface DraggableStudentProps {
    id: string,
    cellId: string | null,
    studentId: string,
}
export default function DraggableStudentComponent(
    props: DraggableStudentProps
) {
    const { ref, isDragging } = useDraggable({ id: props.id })
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents } = useAppState();

    if (activeClass == undefined) {
        return null;
    }
    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const student : Student = allStudents[props.studentId]

    function onClick(event : MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
        console.log(student)
    }

    return (
        <button onClick={onClick} ref={ref} className="bg-[rgb(238,238,238)] text-black box-border border border-[rgb(48,48,48)] rounded-sm absolute p-px w-[75%] h-[75%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 flex justify-center items-center">
            <p>{student.firstName}</p>
        </button>
    )
}