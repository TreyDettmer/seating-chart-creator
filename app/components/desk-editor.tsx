import { ChangeEventHandler, useState } from "react";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { DeskTag, CustomOption, SelectOption } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'
import Select, { ActionMeta, MultiValue, SingleValue } from 'react-select'

export default function DeskEditor() {

    const activeClass = useActiveClass();
    const activeConfig = useActiveSeatingConfig()
    const dispatch = useAppDispatch();
    const { deskTags: allDeskTags } = useAppState()
    const [openTagCreationModal, setOpenTagCreationModal] = useState(false)
    const [newTagName, setNewTagName] = useState("")

    if (activeClass === undefined) {
        return null;
    }

    if (activeConfig === undefined || activeConfig.selectedCell == null) {
        return (<div className="desk-editor"></div>)
    }

    const floorCell = activeConfig.grid[activeConfig.selectedCell.row][activeConfig.selectedCell.col]
    const deskTags = floorCell.deskTagIds.map(x => {
        return allDeskTags[x]
    })



    const deskTagSelectOptions: SelectOption[] = Object.keys(allDeskTags).map(deskTagId => {
        return { value: deskTagId, label: allDeskTags[deskTagId].name }
    })


    function onAllowsStudentsChanged(event: React.ChangeEvent<HTMLInputElement>) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        dispatch({ type: 'TOGGLE_CELL_ALLOWS_STUDENTS', payload: { configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col, allowsStudents: event.target.checked } });
    }

    function onAssignedDeskTagsChange(newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        var newDeskTagIds = newValue.map(x => x.value)
        dispatch({ type: 'EDIT_CELL_ASSIGNED_DESK_TAGS', payload: { tagIds: newDeskTagIds, configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col} });

        
    }

    function onCreateDeskTag() {
        onCloseDeskTagCreationModal()
        if (newTagName.trim() == "") {
            return;
        }
        if (activeConfig === undefined) {
            return;
        }
        if (activeConfig.selectedCell === null) {
            return;
        }
        if (Object.values(allDeskTags).find(x => x.name.toLowerCase() === newTagName.trim().toLowerCase()) !== undefined) {
            return;
        }
        var newTag: DeskTag = {
            id: uuid(),
            name: newTagName.trim()
        }
        setNewTagName("");
        dispatch({ type: 'CREATE_DESK_TAG', payload: { configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col, deskTag: newTag } });
    }

    function openDeskTagCreationModal() {
        setOpenTagCreationModal(true)
    }
    function onCloseDeskTagCreationModal() {
        setOpenTagCreationModal(false)
    }


    return (
        <div className="desk-editor">
            <p>Selected Desk Options</p>
            <label htmlFor="allowStudents">Allows Students</label>
            <input id="allowStudents" type="checkbox" checked={floorCell.allowsStudents} onChange={onAllowsStudentsChanged} />
            <p>Assigned Desk Tags</p>
            <ul>
                <Select
                    isMulti
                    options={deskTagSelectOptions}
                    className="desk-editor-tag-select"
                    classNamePrefix="select"
                    components={{ Option: CustomOption }}
                    value={
                        deskTagSelectOptions.filter((deskTagOption) => {

                            return floorCell.deskTagIds.includes(deskTagOption.value)
                        })
                    }
                    onChange={(newValue, actionMeta) => { onAssignedDeskTagsChange(newValue, actionMeta) }}
                />
                <button onClick={openDeskTagCreationModal} className="default-button">Create Desk Tag</button>
            </ul>
            <Modal open={openTagCreationModal} onClose={onCloseDeskTagCreationModal}>
                <div>
                    <p>Enter Tag Name</p>
                    <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)}></input>
                    <div className="flex flex-row">
                        <button onClick={onCloseDeskTagCreationModal} className="default-button">Cancel</button>
                        <button onClick={onCreateDeskTag} className="default-button">Create</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}