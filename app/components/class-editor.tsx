import { useActiveClass } from "../app-context";
import ClassStudentList from "./class-student-list";
import SeatingConfigEditor from "./seating-config-editor";

export default function ClassEditor() {
    const activeClass = useActiveClass();
    return (
        <div className="flex flex-row grow bg-gray-50">
            <ClassStudentList></ClassStudentList>
            <SeatingConfigEditor></SeatingConfigEditor>
        </div>
    )
}