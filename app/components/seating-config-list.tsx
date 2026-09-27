import "../styles/seating-config-list.css";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { FloorCell, SeatingConfiguration } from "../app-state"
import { MouseEvent, useState } from "react"
import { v4 as uuid } from 'uuid'
import Modal from "./modal";
import { useToast } from "./toast-context";



export default function SeatingConfigList(
) {

    const activeClass = useActiveClass();
    const { seatingConfigurations: allSeatingConfigs } = useAppState();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [selectedConfigId, setSelectedConfigId] = useState("")
    const [createdConfigName, setCreatedConfigName] = useState("")
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

        if (createdConfigName.trim() == '') {
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

        if (seatingConfigs.some(x => x.name.toLowerCase().trim() == createdConfigName.toLowerCase().trim())) {
            toast.open(
                toast.toastError("Error", "Duplicate config name.")
            )
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
                    tagIds: []
                })
                i++;
            }
            grid.push(row)
        }
        var newConfig: SeatingConfiguration = {
            id: `${seatingConfigs.length + 1}`,
            classId: activeClass.id,
            name: createdConfigName,
            rows: rows,
            cols: cols,
            grid: grid,
            selectedCell: null,
            createdAt: Date.toString(),
            updatedAt: Date.toString()
        }

        dispatch({ type: 'ADD_SEATING_CONFIG', payload: { classId: activeClass.id, config: newConfig } });
        setCreatedConfigName("")
        setIsCreationModalOpen(false)
    }

    function onUpdateConfig(newName: string) {
        var name = newName.trim()
        dispatch({ type: 'UPDATE_SEATING_CONFIG', payload: { configId: selectedConfigId, newConfig: {...allSeatingConfigs[selectedConfigId], name: name, updatedAt: Date.toString()} } });
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

    function openConfigUpdateModal(event: MouseEvent<HTMLButtonElement>, id : string) {
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
        setCreatedConfigName("")
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
                    <div>
                        <p>Name</p>
                        <input className="modal-text-input" value={createdConfigName} onChange={(e) => setCreatedConfigName(e.target.value)}></input>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseCreationModal} className="default-button">Cancel</button>
                        <button onClick={onCreateConfig} className="default-button">Create</button>
                    </div>
                </div>
            </Modal>
        </div>

    )
}