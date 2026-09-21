
import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context"
import { DeskTag, Student } from "../app-state";

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
    const { students: allStudents, deskTags: allDeskTags  } = useAppState();

    if (activeClass == undefined) {
        return null;
    }
    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const student : Student = allStudents[props.studentId]
    
    const deskTags : DeskTag[] = student.deskTagIds.map(x => {
        return allDeskTags[x]
    })

    function onClick(event : MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
        console.log(student)
    }

    const className = () : string => {
        var name = 'draggable-student'

        if (isDragging) {
            
        }


        return name
    }

    return (
        <button onClick={onClick} ref={ref} className={className()}>
            <p>{student.firstName}</p>
            <ul className="student-desk-tag-marker-container">
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