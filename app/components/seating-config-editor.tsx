import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { FloorCell, SeatingConfiguration } from "../app-state";

import SeatingConfigList from "./seating-config-list";
import FloorCellComponent from "./floor-cell";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import DeskEditor from "./desk-editor";

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

    function onRandomlyAssignStudentsClicked() {
        if (activeConfig === undefined || activeClass === undefined) {
            return
        }
        // Get number of available desks
        var numberOfAvailableDesks = 0
        for (let rowIndex = 0; rowIndex < activeConfig.rows; rowIndex++) {
            for (let colIndex = 0; colIndex < activeConfig.cols; colIndex++) {
                if (activeConfig.grid[rowIndex][colIndex].hasDesk && activeConfig.grid[rowIndex][colIndex].allowsStudents) {
                    numberOfAvailableDesks++
                }
            }
        }
        if (activeClass.studentIds.length > numberOfAvailableDesks) {
            console.log("Not enough desks")
            return
        }
        

    }

    return (
        <div className="flex flex-col grow border-l">
            <div id="config-list-container" className="flex flex-row bg-blue-500 h-[40px]">
                <SeatingConfigList></SeatingConfigList>
            </div>

            <div id="configEditor" className="flex flex-row bg-green-300 grow h-full w-full">
                <div id="temp-container" className="h-full">
                    <DragDropProvider
                        onDragStart={() => { }}
                        onDragMove={() => { }}
                        onDragOver={() => { }}
                        onDragEnd={onDragEnd}>
                        <div id="grid-container" className="relative w-[800px] h-[800px] overflow-scroll">
                            {activeConfig ? (

                                <div id="grid" className="w-[800px] h-[800px] aspect-square grid absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
                    <div id="shuffle-options" className="bg-yellow-300 h-[150px]">
                        <button onClick={onRandomlyAssignStudentsClicked} className="default-button">Shuffle Students</button>
                        <button className="default-button">Trey</button>
                    </div>
                </div>
                <DeskEditor></DeskEditor>
            </div>
        </div>
    )
}