import { SeatingConfiguration } from "../app-state"

export interface SeatingConfigListProps {
    seatingConfigs: SeatingConfiguration[],
    activeConfigurationId: string | null,
    onCreateSeatingConfig: () => void,
    onSwitchSeatingConfig: (configId : string) => void
}




export default function SeatingConfigList(
    props : SeatingConfigListProps
) {
    return (
        <div>
            <ul className="flex flex-row h-full bg-white">
                {props.seatingConfigs.map(x => {
                    return (
                        <button onClick={() => props.onSwitchSeatingConfig(x.id)} className={`h-full pl-3 pr-3 hover:bg-gray-100 hover:cursor-pointer ${x.id === props.activeConfigurationId ? "font-bold text-black border-b-2" : "text-gray-400"}`} key={x.id}>{x.name}</button>
                    )
                })}
                <button onClick={() => props.onCreateSeatingConfig()} className={`h-full pl-3 pr-3 text-black hover:bg-gray-100 hover:cursor-pointer `}>Add Seating Configuration</button>
            </ul>
        </div>
    )
}