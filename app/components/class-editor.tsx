import { useActiveClass } from "../app-context";
import ClassStudentList from "./class-student-list";

export default function ClassEditor() {
    const activeClass = useActiveClass();
    return (
        <div>
            <ClassStudentList></ClassStudentList>
            <p>Viewing {activeClass?.name}</p>
        </div>
    )
}