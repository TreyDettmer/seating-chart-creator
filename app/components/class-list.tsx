import { SchoolClass } from "../app-state"

export interface ClassListProps {
    classes: SchoolClass[],
    onAddClass: (name: string) => void
}

export default function ClassListComponent(
    props: ClassListProps
) {
    const classes = props.classes
    const listItems = props.classes.map(x => <li key={x.id}>{x.name}</li>);
    return (
        <div>
            <ul>
                {listItems}
            </ul>
            <button onClick={() => props.onAddClass(`Class ${classes.length + 1}`)} >Add Class</button>
        </div>
    )
}