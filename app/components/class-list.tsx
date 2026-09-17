import { useActiveClass } from "../app-context";
import { SchoolClass } from "../app-state"

export interface ClassListProps {
    classes: SchoolClass[],
    onAddClass: (name: string) => void
}

export default function ClassListComponent(
    props: ClassListProps
) {
    const classes = props.classes
    const activeClass = useActiveClass();

    return (
        <div className="flex flex-row">
            <ul className="flex flex-row">
                {props.classes.map(x => {
                    return (
                        <button onClick={() => {}} className={`h-full pl-3 pr-3 hover:bg-gray-100 hover:cursor-pointer ${x.id === activeClass?.id ? "font-bold text-black border-b-2" : "text-gray-400"}`} key={x.id}>{x.name}</button>
                    )
                })}
                <button className={`h-full pl-3 pr-3 hover:bg-gray-100 hover:cursor-pointer text-gray-400`} onClick={() => props.onAddClass(`Class ${classes.length + 1}`)} >Add Class</button>
            </ul>
        </div>
    )
}