import "../styles/class-list.css";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { v4 as uuid } from 'uuid'
import { MouseEvent, useState } from "react";
import Modal from "./modal";
import { useToast } from "./toast-context";
import Toggle from "./toggle";


export default function ClassListComponent(

) {
    const { classes, studentViewEnabled } = useAppState();
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
        var name = newName.trim()
        var selectedClass = classes[selectedClassId]
        if (selectedClass == undefined) {
            return
        }
        dispatch({ type: 'EDIT_CLASS', payload: { newClass: {...selectedClass, name: name}}});
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

    return (
        <div className="class-list-container">
            <ul className="class-list">
                {Object.values(classes).map(x => {
                    return (
                        // <button onClick={() => handleSwitchClass(x.id)} className={`class-list-button ${x.id === activeClass?.id ? "class-list-button-current" : ""}`} key={x.id}>{x.name}</button>
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
                <button className={`class-list-button`} onClick={openCloseClassCreationModal}>Add Class</button>
                <div className={studentViewEnabled ? 'toggle-student-view-container-active' : 'toggle-student-view-container'}>
                    <p>Toggle Student View</p>
                    <Toggle isChecked={studentViewEnabled} onChanged={(newValue) => toggleStudentView(newValue)}></Toggle>
                </div>
                {/* {!studentViewEnabled &&
                    <button className="default-button" onClick={openCloseClassCreationModal}>Import App State</button>
                }
                {!studentViewEnabled &&
                    <button className="default-button" onClick={openCloseClassCreationModal}>Export App State</button>
                } */}
                
            </ul>
            <Modal open={isModalOpen} onClose={onCloseClassCreationModal}>
                <div className="class-creation-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Create A Class</p>
                    </div>
                    <div>
                        <p>Name</p>
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
                        <button onClick={onDeleteClass} className="default-button destructive">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}