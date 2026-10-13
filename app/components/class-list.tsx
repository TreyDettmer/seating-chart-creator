import "../styles/class-list.css";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { v4 as uuid } from 'uuid'
import { MouseEvent, useState } from "react";
import Modal from "./modal";
import { useToast } from "./toast-context";
import Toggle from "./toggle";
import { AppState, SchoolClass, SeatingConfiguration } from "../app-state";


export default function ClassListComponent(

) {
    const { classes, seatingConfigurations: allSeatingConfigurations, studentViewEnabled } = useAppState();
    const appState = useAppState();
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const toast = useToast()



    function handleSwitchClass(classId: string) {
        if (activeClass?.id == classId) {
            return
        }
        dispatch({ type: 'SET_ACTIVE_CLASS', payload: { classId: classId } });
    }

    function openEditClassModal(event: MouseEvent<HTMLButtonElement>, id: string) {
        event.stopPropagation()
        setSelectedClassId(id)
        setIsEditClassModalOpen(true);
    }

    function onCloseEditClassModal() {
        setIsEditClassModalOpen(false);
    }

    function openCloseClassCreationModal() {
        setIsModalOpen(true);
    }

    function onCloseClassCreationModal() {
        setIsModalOpen(false)
    }

    function toggleStudentView(newValue: boolean) {
        dispatch({ type: 'TOGGLE_STUDENT_VIEW', payload: { newValue: newValue } });
    }

    function onCreateClass() {
        if (Object.values(classes).length >= 9) {
            toast.open(
                toast.toastError("Error", "Class limit reached.")
            )
            return
        }
        if (Object.values(classes).some(x => x.name.toLowerCase().trim() == newClassName.toLowerCase().trim())) {
            toast.open(
                toast.toastError("Error", "Duplicate class name.")
            )
            return
        }
        if (newClassName.toLowerCase().trim() == '') {
            toast.open(
                toast.toastError("Error", "Empty class name.")
            )
            return
        }
        var newClassId = uuid()
        setIsModalOpen(false)
        dispatch({ type: 'ADD_CLASS', payload: { id: newClassId, name: newClassName.trim() } });
        setNewClassName("");
        dispatch({ type: 'SET_ACTIVE_CLASS', payload: { classId: newClassId } });
    };

    function onUpdateClassName(newName: string) {
        var name = newName
        var selectedClass = classes[selectedClassId]
        if (selectedClass == undefined) {
            return
        }
        dispatch({ type: 'EDIT_CLASS', payload: { newClass: {...selectedClass, name: name}}});
    }

    function onDuplicateClass() {
        var selectedClass = classes[selectedClassId]
        if (selectedClass == undefined) {
            return
        }
        const existingSeatingConfigs = selectedClass.seatingConfigurationIds.map(x => allSeatingConfigurations[x])
        const newSeatingConfigs : SeatingConfiguration[] = [];
        const newClassId = uuid();
        for (let i = 0; i < existingSeatingConfigs.length; i++) {
            let duplicatedGrid = existingSeatingConfigs[i].grid.map(row => row.map(cell => ({ ...cell })));
            for (let row = 0; row < existingSeatingConfigs[i].rows; row++) {
                for (let col = 0; col < existingSeatingConfigs[i].cols; col++) {
                    duplicatedGrid[row][col].studentId = null
                }
            }
            var newConfig : SeatingConfiguration = {
                id: uuid(),
                classId: newClassId,
                name: existingSeatingConfigs[i].name,
                rows: existingSeatingConfigs[i].rows,
                cols: existingSeatingConfigs[i].cols,
                grid: duplicatedGrid,
                selectedCell: null,
                createdAt: Date.toString(),
                updatedAt: Date.toString()
            }
            newSeatingConfigs.push(newConfig);
        }
        const duplicatedPreferences = {...selectedClass.classPreferences}
        
        const newClass : SchoolClass = {
            id: newClassId,
            name: `${selectedClass.name} (Copy)`,
            studentIds: [],
            seatingConfigurationIds: [],
            activeConfigurationId: null,
            activeGroupsConfigurationId: null,
            selectedStudentId: null,
            keepApartGroupIds: [],
            keepTogetherGroupIds: [],
            classPreferences: duplicatedPreferences
        }

        onCloseEditClassModal()
        setSelectedClassId('');

        dispatch({ type: 'CREATE_CLASS', payload: { newClass: newClass } });

        for (let i = 0; i < newSeatingConfigs.length; i++) {
            dispatch({ type: 'ADD_SEATING_CONFIG', payload: { classId: newClassId, config: newSeatingConfigs[i] } });
        }

        dispatch({ type: 'SET_ACTIVE_CLASS', payload: { classId: newClassId } });

        
    }

    function onDeleteClass() {
        var selectedClass = classes[selectedClassId]
        if (selectedClass == undefined) {
            return
        }
        if (confirm(`Are you sure you want to delete class '${selectedClass.name}'?`) == true) {
            dispatch({ type: 'REMOVE_CLASS', payload: { classId: selectedClassId}});
            onCloseClassCreationModal()
            onCloseEditClassModal()
            setSelectedClassId('');
            dispatch({ type: 'SET_ACTIVE_CLASS', payload: { classId: null } });
        }
    }


    function onImportState(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        
        // Define what happens once the file is fully read
        reader.onload = (e) => {
            if (e.target != null && typeof e.target.result === 'string') {
                try {
                    let state : AppState = JSON.parse(e.target.result)
                    dispatch({ type: 'LOAD_STATE', payload: state });
                } catch (err) {
                    toast.open(
                        toast.toastError("Error", "Unable to parse provided file.")
                    )
                    return
                }
            }
        };

        reader.onerror = () => {
            console.error("Error reading the file.");
        };
        // Read the file as plain text
        reader.readAsText(file, 'utf-8');
    }

    function onExportState() {
        const fileName = `seating-chart-creator_state_${Date.toString()}.txt`
        const stringifiedState = JSON.stringify(appState);
        const blob = new Blob([stringifiedState], { type: 'text/plain;charset=utf-8' });
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(fileUrl);
    }



    return (
        <div className="class-list-container">
            <ul className="class-list">
                <div className="logo-container">
                    <p>Seating Chart Creator</p>
                </div>
                {Object.values(classes).map(x => {
                    return (
                        <div className={`class-list-button ${x.id === activeClass?.id ? "class-list-button-current" : ""}`} onClick={() => handleSwitchClass(x.id)} key={x.id}>

                            <div className="flex flex-col justify-center">
                                {x.name}
                            </div>
                            <button onClick={(e) => openEditClassModal(e, x.id)} className="class-list-button-option-button">
                                :
                            </button>
                        </div>
                    
                    
                    )
                })}
                <button className={`class-list-button`} onClick={openCloseClassCreationModal}>New Class</button>
                <div className={studentViewEnabled ? 'toggle-student-view-container-active' : 'toggle-student-view-container'}>
                    <p>Toggle Presentation View</p>
                    <Toggle isChecked={studentViewEnabled} onChanged={(newValue) => toggleStudentView(newValue)}></Toggle>
                </div>
                {!studentViewEnabled &&
                    <label htmlFor="importAppStateUpload" className="default-button">
                        <input className="hidden" accept=".txt" id="importAppStateUpload" type="file" onChange={onImportState} />
                        Import App State
                    </label>
                }
                {!studentViewEnabled &&
                    <button className="default-button" onClick={onExportState}>Export App State</button>
                }
                
            </ul>
            <Modal open={isModalOpen} onClose={onCloseClassCreationModal}>
                <div className="class-creation-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Create A Class</p>
                    </div>
                    <div>
                        <p>Class Name</p>
                        <input className="modal-text-input" value={newClassName} onChange={(e) => setNewClassName(e.target.value) }></input>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseClassCreationModal} className="default-button">Cancel</button>
                        <button onClick={onCreateClass} className="default-button">Create</button>
                    </div>
                </div>
            </Modal>
            <Modal open={isEditClassModalOpen} onClose={onCloseEditClassModal}>
                <div className="class-creation-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Edit Class</p>
                    </div>
                    <div>
                        <p>Name</p>
                        {selectedClassId != '' && <input className="modal-text-input" value={classes[selectedClassId]?.name} onChange={(e) => onUpdateClassName(e.target.value) }></input>}
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseEditClassModal} className="default-button">Close</button>
                        <button onClick={onDuplicateClass} className="default-button">Duplicate</button>
                        <button onClick={onDeleteClass} className="default-button destructive">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}