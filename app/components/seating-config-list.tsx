import "../styles/seating-config-list.css";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { FloorCell, SeatingConfiguration } from "../app-state"
import { MouseEvent } from "react"
import { v4 as uuid } from 'uuid'



export default function SeatingConfigList(
) {

    const activeClass = useActiveClass();
    const { seatingConfigurations: allSeatingConfigs } = useAppState();
    const dispatch = useAppDispatch();
    if (activeClass === undefined) {
        return null;
    }

    const seatingConfigs: SeatingConfiguration[] = activeClass?.seatingConfigurationIds.map((id) => {
        const seatingConfig = allSeatingConfigs[id];
        return seatingConfig;
    });
    const activeConfigurationId = activeClass.activeConfigurationId


    function onConfigurationClicked(configId : string) {
        if (activeConfigurationId === configId) {
            return
        }
        if (activeClass === undefined) {
            return
        }
        dispatch({ type: 'SET_ACTIVE_CONFIG', payload: { classId: activeClass.id, configId: configId } });
    }

    function onAddConfigClicked() {
        if (activeClass == undefined) {
            return
        }

        var grid: FloorCell[][] = []
        var rows = 10
        var cols = 10
        var i = 0;
        for (let y = 0; y < rows; y++) {
            var row: FloorCell[] = []
            for (let x = 0; x < cols; x++) {
                row.push({
                    id: `${uuid()}`,
                    index: y + x,
                    row: y,
                    column: x,
                    hasDesk: i < activeClass.studentIds.length ? true : false,
                    allowsStudents: true,
                    studentId: i < activeClass.studentIds.length ? activeClass.studentIds[i] : null,
                    deskTagIds: []
                })
                i++;
            }
            grid.push(row)
        }
        var newConfig: SeatingConfiguration = {
            id: `${seatingConfigs.length + 1}`,
            classId: activeClass.id,
            name: `Config ${seatingConfigs.length + 1}`,
            rows: rows,
            cols: cols,
            grid: grid,
            selectedCell: null,
            createdAt: Date.toString(),
            updatedAt: Date.toString()
        }

        dispatch({ type: 'ADD_SEATING_CONFIG', payload: { classId: activeClass.id, config: newConfig } });
    }

    function onOptionsButtonClicked(event : MouseEvent<HTMLButtonElement>, configId : string) {
        event.stopPropagation()
        if (activeClass === undefined) {
            return
        }
        dispatch({ type: 'REMOVE_SEATING_CONFIG', payload: { classId: activeClass.id, configId: configId } });
        
        // For now instead of showing options, we delete this configuration
    }


    return (
        
        <ul className="seating-config-list">
            {seatingConfigs.map(x => {
                return (
                    <div className={`seating-config-button ${x.id === activeConfigurationId ? "seating-config-button-current" : ""}`} onClick={() => onConfigurationClicked(x.id)} key={x.id}>
                        
                        <div>
                            {x.name}
                        </div>
                        <button onClick={(e) => onOptionsButtonClicked(e, x.id)} className="seating-config-button-option-button">
                            :
                        </button>
                    </div>
                )
            })}
            <button onClick={() => onAddConfigClicked()} className={`seating-config-button`}>Add Seating Configuration</button>
        </ul>
        
    )
}