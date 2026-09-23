
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


    const displayedStudentName = () : string => {
        // let alwaysShowLastInitial = false;
        // var currentName = student.firstName
        // var numberOfCharactersToInclude = student.firstName.length
        // var myFlattenedName = `${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}`
        // var charactersToAppend = 0;
        // for (let i = 0; i < students.length; i++) {
        //     if (students[i].id == student.id) {
        //         continue
        //     }
        //     var flattenedName = `${students[i].firstName.toLowerCase()}${students[i].lastName.toLowerCase()}`
        //     var j = 0;
        //     while (j < flattenedName.length && j < myFlattenedName.length && flattenedName[j] == myFlattenedName[j]) {
        //         if (j > numberOfCharactersToInclude)
        //         j += 1
        //     }
        // }
        return student.firstName
    }

    return (
        <button onClick={onClick} ref={ref} className={className()}>
            <p>{displayedStudentName()}</p>
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