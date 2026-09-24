import "../styles/class-list.css";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { v4 as uuid } from 'uuid'


export default function ClassListComponent(

) {
    const { classes } = useAppState();
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();

    function handleAddClass() {
        if (Object.values(classes).length >= 9) {
            return
        }
        var name = `Class ${Object.values(classes).length + 1}`
        dispatch({ type: 'ADD_CLASS', payload: { id: uuid(), name } });
    };

    function handleSwitchClass(classId : string) {
        if (activeClass?.id == classId) {
            return
        }
        dispatch({ type: 'SET_ACTIVE_CLASS', payload: { classId: classId } });

    }

    return (
        <div className="flex flex-row">
            <ul className="flex flex-row">
                {Object.values(classes).map(x => {
                    return (
                        <button onClick={() => handleSwitchClass(x.id)} className={`class-list-button ${x.id === activeClass?.id ? "class-list-button-current" : ""}`} key={x.id}>{x.name}</button>
                    )
                })}
                <button className={`class-list-button`} onClick={handleAddClass} >Add Class</button>
            </ul>
        </div>
    )
}