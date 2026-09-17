import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import ClassEditor from "./class-editor";
import ClassListComponent from "./class-list";
import { v4 as uuid } from 'uuid'

export default function Dashboard() {
    const { classes } = useAppState();
    const dispatch = useAppDispatch();
    const activeClass = useActiveClass();
    const handleAddClass = (name: string) => {
        dispatch({ type: 'ADD_CLASS', payload: { id: uuid(), name } });
    };
    return (
        <div className="grow flex flex-col">
            <ClassListComponent classes={Object.values(classes)} onAddClass={handleAddClass} />
            {activeClass && <ClassEditor />}
        </div>
    )
}