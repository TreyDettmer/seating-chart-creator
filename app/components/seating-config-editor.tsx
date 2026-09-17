import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { FloorCell, SeatingConfiguration } from "../app-state";
import { v4 as uuid } from 'uuid'
import SeatingConfigList from "./seating-config-list";
import FloorCellComponent from "./floor-cell";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";

export default function SeatingConfigEditor() {
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
    const activeConfig = useActiveSeatingConfig()


    function onCreateSeatingConfig() {
        if (activeClass == undefined) {
            return
        }

        var grid: FloorCell[][] = []
        var rows = 10
        var cols = 10
        for (let y = 0; y < rows; y++) {
            var row: FloorCell[] = []
            for (let x = 0; x < cols; x++) {
                row.push({
                    id: `${uuid()}`,
                    index: y + x,
                    row: y,
                    column: x,
                    hasDesk: (x + y) % 2 == 0 ? false : true,
                    allowsStudents: true,
                    studentId: (x + y) % 2 == 0 ? null : uuid()
                })
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
            createdAt: Date.toString(),
            updatedAt: Date.toString()
        }

        dispatch({ type: 'ADD_SEATING_CONFIG', payload: { classId: activeClass.id, config: newConfig } });
    }

    function onSwitchSeatingConfig(configId: string) {
        if (configId === activeConfigurationId) {
            return
        }
        if (activeClass == undefined) {
            return
        }
        dispatch({ type: 'SET_ACTIVE_CONFIG', payload: { classId: activeClass.id, configId: configId } });
    }

    function onDragEnd(event: DragEndEvent) {
        if (event.canceled) {
            return;
        }

        if (activeConfig === undefined) {
            return
        }

        if (activeConfigurationId === null) {
            return
        }

        const sourceId = event.operation.source?.id as string;
        const targetId = event.operation.target?.id as string;

        if (sourceId == null || targetId == null) {
            return;
        }
        if (sourceId.startsWith('student-')) {
            // Get the floor cell that has this studentId
            var sourceCell: { row: number; col: number } | undefined;
            var targetCell: { row: number; col: number } | undefined;
            for (let y = 0; y < activeConfig.rows; y++) {
                for (let x = 0; x < activeConfig.cols; x++) {
                    if (activeConfig.grid[y][x].id === sourceId.replace('student-', '')) {
                        sourceCell = { row: y, col: x }
                    }
                    if (activeConfig.grid[y][x].id === targetId) {
                        targetCell = { row: y, col: x }
                    }
                }
            }

            if (targetCell === undefined || sourceCell === undefined) {
                return;
            }

            dispatch({ type: 'SWAP_STUDENTS', payload: { configId: activeConfigurationId, cellA: sourceCell, cellB: targetCell } });
        }
        else if (sourceId.startsWith('desk-')) {
            // Get the floor cell that has this desk
            var sourceCell: { row: number; col: number } | undefined;
            var targetCell: { row: number; col: number } | undefined;
            for (let y = 0; y < activeConfig.rows; y++) {
                for (let x = 0; x < activeConfig.cols; x++) {
                    if (activeConfig.grid[y][x].id === sourceId.replace('desk-', '')) {
                        sourceCell = { row: y, col: x }
                    }
                    if (activeConfig.grid[y][x].id === targetId) {
                        targetCell = { row: y, col: x }
                    }
                }
            }
            if (targetCell === undefined || sourceCell === undefined) {
                return;
            }
            dispatch({ type: 'SWAP_DESKS', payload: { configId: activeConfigurationId, cellA: sourceCell, cellB: targetCell } });
        }
    }

    return (
        <div className="flex flex-col grow border-l">
            <div id="config-list-container" className="flex flex-row bg-blue-500 h-8">
                <SeatingConfigList seatingConfigs={seatingConfigs} activeConfigurationId={activeConfigurationId} onCreateSeatingConfig={onCreateSeatingConfig} onSwitchSeatingConfig={onSwitchSeatingConfig}></SeatingConfigList>
            </div>
            <div id="configEditor" className="flex flex-row bg-green-300">
                <DragDropProvider
                    onDragStart={() => { }}
                    onDragMove={() => { }}
                    onDragOver={() => { }}
                    onDragEnd={onDragEnd}>
                    <div id="grid-container" className="bg-white flex justify-center items-center w-[min(50dvw,1000px)]">
                        {activeConfig ? (

                            <div id="grid" className={`w-[90%] aspect-square grid`}
                                style={{
                                    gridTemplateColumns: `repeat(${activeConfig.cols}, minmax(0, 1fr))`,
                                    gridTemplateRows: `repeat(${activeConfig.rows}, minmax(0, 1fr))`,
                                }}
                            >
                                {activeConfig.grid.map(row => {
                                    return row.map(cell => {
                                        return <FloorCellComponent key={cell.id} {...cell}></FloorCellComponent>
                                    })
                                })}
                            </div>) : (null)}

                    </div>

                </DragDropProvider>
                <div id="cell-editor" className="bg-purple-400">

                </div>
            </div>
        </div>
    )
}