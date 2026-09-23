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
                        <button onClick={() => handleSwitchClass(x.id)} className={`h-full pl-3 pr-3 hover:bg-gray-100 hover:cursor-pointer ${x.id === activeClass?.id ? "font-bold text-black border-b-2" : "text-gray-400"}`} key={x.id}>{x.name}</button>
                    )
                })}
                <button className={`h-full pl-3 pr-3 hover:bg-gray-100 hover:cursor-pointer text-gray-400`} onClick={handleAddClass} >Add Class</button>
            </ul>
        </div>
    )
}