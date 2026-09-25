import "../styles/class-list.css";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { v4 as uuid } from 'uuid'
import { useState } from "react";
import Modal from "./modal";
import { useToast } from "./toast-context";


export default function ClassListComponent(

) {
    const { classes } = useAppState();
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const toast = useToast()



    function handleSwitchClass(classId: string) {
        if (activeClass?.id == classId) {
            return
        }
        dispatch({ type: 'SET_ACTIVE_CLASS', payload: { classId: classId } });
    }

    function openCloseClassCreationModal() {
        setIsModalOpen(true);
    }

    function onCloseClassCreationModal() {
        setIsModalOpen(false)
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

    return (
        <div className="flex flex-row">
            <ul className="flex flex-row">
                {Object.values(classes).map(x => {
                    return (
                        <button onClick={() => handleSwitchClass(x.id)} className={`class-list-button ${x.id === activeClass?.id ? "class-list-button-current" : ""}`} key={x.id}>{x.name}</button>
                    )
                })}
                <button className={`class-list-button`} onClick={openCloseClassCreationModal}>Add Class</button>
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
        </div>
    )
}