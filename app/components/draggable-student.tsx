import "../styles/draggable-student.css";
import { useDraggable } from "@dnd-kit/react"
import { MouseEvent } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context"
import { Tag, Student } from "../app-state";

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
    const { students: allStudents, tags: allTags, studentViewEnabled  } = useAppState();

    if (activeClass == undefined) {
        return null;
    }
    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const student : Student = allStudents[props.studentId]
    
    const tags : Tag[] = student.tagIds.map(x => {
        return allTags[x]
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
            <p className={`draggable-student-name ${studentViewEnabled ? 'draggable-student-name-student-view' : ''}`}>{student.firstName}</p>
            {!studentViewEnabled && <ul className="student-tag-marker-container">
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