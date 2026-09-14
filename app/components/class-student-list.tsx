import { useActiveClass, useStudent } from "../app-context";

export default function ClassStudentList() {
    const activeClass = useActiveClass();
    const students = activeClass?.studentIds.map(x => {
        return <li>useStudent(x)?.firstName</li>
    })
    return (
        <div>
            <ul>{students}</ul>
            <button>Add Student</button>
            <button>Import Students</button>
            <p>List of students</p>
        </div>
    )
}