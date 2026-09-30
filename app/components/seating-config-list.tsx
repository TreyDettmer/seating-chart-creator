import "../styles/seating-config-list.css";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { CustomOption, FloorCell, SeatingConfiguration } from "../app-state"
import { MouseEvent, useState } from "react"
import { v4 as uuid } from 'uuid'
import Modal from "./modal";
import Select, { ActionMeta, SingleValue } from "react-select";
import { useToast } from "./toast-context";
import { config } from "process";
import Toggle from "./toggle";



export default function SeatingConfigList(
) {

    interface ConfigCreationInfo {
        name: string;
        preset: 'Empty' | 'Rows' | 'Columns' | 'Tables';
        numberOfLanes: number;
        desksPerLane: number;
        numberOfTables: number;
        desksPerTable: number;
        numberOfRowsOfTables: number;
        numberOfColumnsOfTables: number;
        emptyFloorColumnCount: number;
        emptyFloorRowCount: number;
        gapBetweenLanes: boolean;
    }

    const activeClass = useActiveClass();
    const { seatingConfigurations: allSeatingConfigs } = useAppState();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [selectedConfigId, setSelectedConfigId] = useState("")
    const defaultConfigCreationInfo : ConfigCreationInfo = {
            name: '',
            preset: 'Empty',
            numberOfLanes: 5,
            desksPerLane: 6,
            numberOfTables: 7,
            desksPerTable: 4,
            numberOfRowsOfTables: 2,
            numberOfColumnsOfTables: 3,
            emptyFloorColumnCount: 10,
            emptyFloorRowCount: 10,
            gapBetweenLanes: true
        }
    const [configCreationInfo, setConfigCreationInfo] = useState<ConfigCreationInfo>(defaultConfigCreationInfo)
    const toast = useToast()
    const dispatch = useAppDispatch();
    if (activeClass === undefined) {
        return null;
    }

    const seatingConfigs: SeatingConfiguration[] = activeClass?.seatingConfigurationIds.map((id) => {
        const seatingConfig = allSeatingConfigs[id];
        return seatingConfig;
    });
    const activeConfigurationId = activeClass.activeConfigurationId


    function onConfigurationClicked(configId: string) {
        if (activeConfigurationId === configId) {
            return
        }
        if (activeClass === undefined) {
            return
        }
        dispatch({ type: 'SET_ACTIVE_CONFIG', payload: { classId: activeClass.id, configId: configId } });
    }

    function onCreateConfig() {
        if (activeClass == undefined) {
            return
        }

        if (configCreationInfo.name.trim() == '') {
            toast.open(
                toast.toastError("Error", "Empty config name.")
            )
            return
        }

        if (seatingConfigs.length >= 4) {
            toast.open(
                toast.toastError("Error", "Config limit reached.")
            )
            return
        }

        if (seatingConfigs.some(x => x.name.toLowerCase().trim() == configCreationInfo.name.toLowerCase().trim())) {
            toast.open(
                toast.toastError("Error", "Duplicate config name.")
            )
            return
        }

        var innerGridColCount = 0;
        var innerGridRowCount = 0;
        let innerGrid: FloorCell[][] = []

        if (configCreationInfo.preset == 'Columns' || configCreationInfo.preset == 'Rows') {
            var colCount = configCreationInfo.numberOfLanes;
            var deskPerCol = configCreationInfo.desksPerLane;
            var cellColCount = configCreationInfo.gapBetweenLanes ? colCount + (colCount - 1) : colCount
            innerGridColCount = cellColCount;
            innerGridRowCount = deskPerCol;
            for (let i = 0; i < deskPerCol; i++) {
                let row: FloorCell[] = [];
                for (let j = 0; j < cellColCount; j++) {
                    if (configCreationInfo.gapBetweenLanes) {
                        if (j % 2 == 0) {
                            // add desk since we do every row column
                            row.push({
                                id: `${uuid()}`,
                                index: 0,
                                row: 0,
                                column: 0,
                                hasDesk: true,
                                allowsStudents: true,
                                studentId: null,
                                tagIds: []
                            })
                        } else {
                            row.push({
                                id: `${uuid()}`,
                                index: 0,
                                row: 0,
                                column: 0,
                                hasDesk: false,
                                allowsStudents: true,
                                studentId: null,
                                tagIds: []
                            })
                        }
                    } else {
                        //add desk
                        row.push({
                            id: `${uuid()}`,
                            index: 0,
                            row: 0,
                            column: 0,
                            hasDesk: true,
                            allowsStudents: true,
                            studentId: null,
                            tagIds: []
                        })
                    }
                }
                innerGrid.push(row)
            }  
        }
        if (configCreationInfo.preset == 'Rows') {
            const transposeGrid = (grid: FloorCell[][]) => grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
            innerGrid = transposeGrid(innerGrid)
            var temp = innerGridColCount;
            innerGridColCount = innerGridRowCount;
            innerGridRowCount = temp;
        }
        if (configCreationInfo.preset == 'Tables') {
            innerGridRowCount = (configCreationInfo.numberOfRowsOfTables * 2) + (configCreationInfo.numberOfRowsOfTables - 1)
            innerGridColCount = (configCreationInfo.numberOfColumnsOfTables * 2) + (configCreationInfo.numberOfColumnsOfTables - 1)
            for (let i = 0; i < innerGridRowCount; i++) {
                let row: FloorCell[] = [];
                if ((i + 1) % 3 == 0)  {
                    // Row gap
                    for (let j = 0; j < innerGridColCount; j++) {
                        row.push({
                            id: `${uuid()}`,
                            index: 0,
                            row: 0,
                            column: 0,
                            hasDesk: false,
                            allowsStudents: true,
                            studentId: null,
                            tagIds: []
                        })
                    }
                    innerGrid.push(row);
                    continue
                }
                for (let j = 0; j < innerGridColCount; j++) {
                    if ((j + 1) % 3 == 0) {
                        // Column gap
                        row.push({
                            id: `${uuid()}`,
                            index: 0,
                            row: 0,
                            column: 0,
                            hasDesk: false,
                            allowsStudents: true,
                            studentId: null,
                            tagIds: []
                        })
                    } else {
                        if (configCreationInfo.desksPerTable == 3) {
                            if ((j - 1) % 3 == 0 && (i - 1) % 3 == 0) {
                                row.push({
                                    id: `${uuid()}`,
                                    index: 0,
                                    row: 0,
                                    column: 0,
                                    hasDesk: false,
                                    allowsStudents: true,
                                    studentId: null,
                                    tagIds: []
                                })
                            } else {
                                row.push({
                                    id: `${uuid()}`,
                                    index: 0,
                                    row: 0,
                                    column: 0,
                                    hasDesk: true,
                                    allowsStudents: true,
                                    studentId: null,
                                    tagIds: []
                                })
                            }
                        } else {
                            row.push({
                                id: `${uuid()}`,
                                index: 0,
                                row: 0,
                                column: 0,
                                hasDesk: true,
                                allowsStudents: true,
                                studentId: null,
                                tagIds: []
                            })
                        }
                    }
                }
                innerGrid.push(row);
            }
        }
        if (configCreationInfo.preset == 'Empty') {
            let grid: FloorCell[][] = []
            for (let i = 0; i < configCreationInfo.emptyFloorRowCount; i++) {
                let row: FloorCell[] = []
                for (let j = 0; j < configCreationInfo.emptyFloorColumnCount; j++) {
                    row.push({
                        id: `${uuid()}`,
                        index: i + j,
                        row: i,
                        column: j,
                        hasDesk: false,
                        allowsStudents: true,
                        studentId: null,
                        tagIds: []
                    })
                }
                grid.push(row)
            }
            var newConfigId = uuid();
            var newConfig: SeatingConfiguration = {
                id: newConfigId,
                classId: activeClass.id,
                name: configCreationInfo.name,
                rows: configCreationInfo.emptyFloorRowCount,
                cols: configCreationInfo.emptyFloorColumnCount,
                grid: grid,
                selectedCell: null,
                createdAt: Date.toString(),
                updatedAt: Date.toString()
            }


            dispatch({ type: 'ADD_SEATING_CONFIG', payload: { classId: activeClass.id, config: newConfig } });
            setConfigCreationInfo(defaultConfigCreationInfo);
            setIsCreationModalOpen(false);
            dispatch({ type: 'SET_ACTIVE_CONFIG', payload: { classId: activeClass.id, configId: newConfigId } });
            return
        }

        var outerGridSideLength = Math.max(innerGridRowCount, innerGridColCount) + 2;
        var innerGridStartColIndex = Math.floor((outerGridSideLength - innerGridColCount) / 2);
        var innerGridEndColIndex = Math.floor(outerGridSideLength - ((outerGridSideLength - innerGridColCount) / 2))

        var innerGridStartRowIndex = Math.floor((outerGridSideLength - innerGridRowCount) / 2);
        var innerGridEndRowIndex = Math.floor(outerGridSideLength - ((outerGridSideLength - innerGridRowCount) / 2))

        let grid: FloorCell[][] = []
        for (let i = 0; i < outerGridSideLength; i++) {
            let row: FloorCell[] = []
            for (let j = 0; j < outerGridSideLength; j++) {
                if (i >= innerGridStartRowIndex && i < innerGridEndRowIndex) {
                    if (j >= innerGridStartColIndex && j < innerGridEndColIndex) {
                        row.push({
                            ...innerGrid[i - innerGridStartRowIndex][j - innerGridStartColIndex],
                            index: i + j,
                            row: i,
                            column: j,
                            allowsStudents: true,
                            studentId: null,
                            tagIds: []
                        })

                    } else {
                        // First and last columns are empty
                        row.push({
                            id: `${uuid()}`,
                            index: i + j,
                            row: i,
                            column: j,
                            hasDesk: false,
                            allowsStudents: true,
                            studentId: null,
                            tagIds: []
                        })
                    }
                } else {
                    // First and last rows are empty
                    row.push({
                        id: `${uuid()}`,
                        index: i + j,
                        row: i,
                        column: j,
                        hasDesk: false,
                        allowsStudents: true,
                        studentId: null,
                        tagIds: []
                    })
                }
            }
            grid.push(row);
        }
        var newConfigId = uuid();
        var newConfig: SeatingConfiguration = {
            id: newConfigId,
            classId: activeClass.id,
            name: configCreationInfo.name,
            rows: outerGridSideLength,
            cols: outerGridSideLength,
            grid: grid,
            selectedCell: null,
            createdAt: Date.toString(),
            updatedAt: Date.toString()
        }


        dispatch({ type: 'ADD_SEATING_CONFIG', payload: { classId: activeClass.id, config: newConfig } });
        setConfigCreationInfo(defaultConfigCreationInfo);
        setIsCreationModalOpen(false);
        dispatch({ type: 'SET_ACTIVE_CONFIG', payload: { classId: activeClass.id, configId: newConfigId } });
        return
    }

    function onUpdateConfig(newName: string) {
        var name = newName.trim()
        dispatch({ type: 'UPDATE_SEATING_CONFIG', payload: { configId: selectedConfigId, newConfig: { ...allSeatingConfigs[selectedConfigId], name: name, updatedAt: Date.toString() } } });
    }

    function onDeleteConfig() {
        if (activeClass === undefined || selectedConfigId == "") {
            return
        }
        if (confirm(`Are you sure you want to delete config '${allSeatingConfigs[selectedConfigId]?.name}'?`) == true) {
            dispatch({ type: 'REMOVE_SEATING_CONFIG', payload: { classId: activeClass.id, configId: selectedConfigId } });
            onCloseConfigUpdateModal()
        }

    }

    function openConfigUpdateModal(event: MouseEvent<HTMLButtonElement>, id: string) {
        event.stopPropagation()
        setSelectedConfigId(id)
        setIsUpdateModalOpen(true)
    }

    function onCloseConfigUpdateModal() {
        setIsUpdateModalOpen(false)
        setSelectedConfigId("")
    }

    function openCreationModal() {
        setIsCreationModalOpen(true)
    }

    function onCloseCreationModal() {
        setConfigCreationInfo(defaultConfigCreationInfo);
        setIsCreationModalOpen(false)
    }

    return (
        <div>
            <ul className="seating-config-list">
                {seatingConfigs.map(x => {
                    return (
                        <div className={`seating-config-button ${x.id === activeConfigurationId ? "seating-config-button-current" : ""}`} onClick={() => onConfigurationClicked(x.id)} key={x.id}>

                            <div>
                                {x.name}
                            </div>
                            <button onClick={(e) => openConfigUpdateModal(e, x.id)} className="seating-config-button-option-button">
                                :
                            </button>
                        </div>
                    )
                })}
                <button onClick={openCreationModal} className={`seating-config-button`}>Add Seating Config</button>
            </ul>
            <Modal open={isUpdateModalOpen} onClose={onCloseConfigUpdateModal}>
                <div className="seating-config-edit-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Edit Config</p>
                    </div>
                    <div>
                        <p>Name</p>
                        {selectedConfigId != "" && <input className="modal-text-input" value={allSeatingConfigs[selectedConfigId]?.name} onChange={(e) => onUpdateConfig(e.target.value)}></input>}
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseConfigUpdateModal} className="default-button">Close</button>
                        <button onClick={onDeleteConfig} className="default-button destructive">Delete</button>
                    </div>
                </div>
            </Modal>
            <Modal open={isCreationModalOpen} onClose={onCloseCreationModal}>
                <div className="seating-config-edit-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Create Config</p>
                    </div>
                    <div className="seating-config-creation-modal-row">
                        <p>Name</p>
                        <input className="modal-text-input" value={configCreationInfo.name} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, name: e.target.value })} ></input>
                    </div>

                    <div className="seating-config-creation-modal-row">
                        <p>Preset</p>
                        <Select value={{ value: configCreationInfo.preset, label: configCreationInfo.preset }} options={[
                            { value: 'Empty', label: 'Empty' },
                            { value: 'Rows', label: 'Rows' },
                            { value: 'Columns', label: 'Columns' },
                            { value: 'Tables', label: 'Tables' },
                        ]} components={{ Option: CustomOption }} onChange={(newValue: SingleValue<{
                            value: 'Empty' | 'Rows' | 'Columns' | 'Tables';
                            label: string;
                        }>, actionMeta: ActionMeta<{
                            value: string;
                            label: string;
                        }>) => { setConfigCreationInfo({ ...configCreationInfo, preset: newValue?.value || 'Empty' }) }} />
                    </div>
                    {configCreationInfo.preset == 'Empty' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Room Width</p>
                            <input type="range" min="6" max="14" value={configCreationInfo.emptyFloorColumnCount} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, emptyFloorColumnCount: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.emptyFloorColumnCount}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Empty' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Room Height</p>
                            <input type="range" min="6" max="14" value={configCreationInfo.emptyFloorRowCount} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, emptyFloorRowCount: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.emptyFloorRowCount}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Rows' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Number Of Rows</p>
                            <input type="range" min="2" max="8" value={configCreationInfo.numberOfLanes} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, numberOfLanes: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.numberOfLanes}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Rows' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Desks Per Row</p>
                            <input type="range" min="2" max="10" value={configCreationInfo.desksPerLane} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, desksPerLane: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.desksPerLane}</p>
                        </div>
                    }

                    {configCreationInfo.preset == 'Rows' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Gap Between Rows?</p>
                            <Toggle isChecked={configCreationInfo.gapBetweenLanes} onChanged={(newValue) => {setConfigCreationInfo({ ...configCreationInfo, gapBetweenLanes: newValue })}}></Toggle>
                            <p>{configCreationInfo.gapBetweenLanes ? 'Yes' : 'No'}</p>
                        </div>
                    }

                    {configCreationInfo.preset == 'Columns' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Number Of Columns</p>
                            <input type="range" min="2" max="8" value={configCreationInfo.numberOfLanes} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, numberOfLanes: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.numberOfLanes}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Columns' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Desks Per Column</p>
                            <input type="range" min="2" max="10" value={configCreationInfo.desksPerLane} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, desksPerLane: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.desksPerLane}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Columns' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Gap Between Columns?</p>
                            <Toggle isChecked={configCreationInfo.gapBetweenLanes} onChanged={(newValue) => {setConfigCreationInfo({ ...configCreationInfo, gapBetweenLanes: newValue })}}></Toggle>
                            <p>{configCreationInfo.gapBetweenLanes ? 'Yes' : 'No'}</p>
                        </div>
                    }

                    {/* {configCreationInfo.preset == 'Tables' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Number Of Tables</p>
                            <input type="range" min="2" max="8" value={configCreationInfo.numberOfTables} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, numberOfTables: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.numberOfTables}</p>
                        </div>
                    } */}
                    {configCreationInfo.preset == 'Tables' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Desks Per Table</p>
                            <input type="range" min="3" max="4" value={configCreationInfo.desksPerTable} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, desksPerTable: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.desksPerTable}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Tables' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Table Rows</p>
                            <input type="range" min="2" max="4" value={configCreationInfo.numberOfRowsOfTables} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, numberOfRowsOfTables: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.numberOfRowsOfTables}</p>
                        </div>
                    }
                    {configCreationInfo.preset == 'Tables' && 
                        <div className="seating-config-creation-modal-row">
                            <p>Table Columns</p>
                            <input type="range" min="2" max="4" value={configCreationInfo.numberOfColumnsOfTables} onChange={(e) => setConfigCreationInfo({ ...configCreationInfo, numberOfColumnsOfTables: parseInt(e.target.value) })} />
                            <p>{configCreationInfo.numberOfColumnsOfTables}</p>
                        </div>
                    }

                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseCreationModal} className="default-button">Cancel</button>
                        <button onClick={onCreateConfig} className="default-button">Create</button>
                    </div>
                </div>
            </Modal>
        </div>

    )
}