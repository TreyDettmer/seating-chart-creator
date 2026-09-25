import "../styles/desk-editor.css";
import "../styles/modal.css";
import { ChangeEventHandler, useState } from "react";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { DeskTag, CustomOption, SelectOption, DeskTagSelectOption, deskTagColorDot } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from 'react-select'

export default function DeskEditor() {

    const activeClass = useActiveClass();
    const activeConfig = useActiveSeatingConfig()
    const dispatch = useAppDispatch();
    const { deskTags: allDeskTags } = useAppState()
    const [openTagCreationModal, setOpenTagCreationModal] = useState(false)
    interface NewDeskTagInfoType {
        name: string;
        color: string;
    }
    const [newDeskTagInfo, setNewDeskTagInfo] = useState<NewDeskTagInfoType>({ name: "", color: "blue" })



    const tagSelectStyles: StylesConfig<DeskTagSelectOption> = {
        option: (styles, { data }) => {
            data.value
            return {
                ...styles,
                ...deskTagColorDot(data.color)
            };
        },
        input: (styles) => ({ ...styles, ...deskTagColorDot() }),
        multiValue: (styles, { data }) => {
            return {
                ...styles,
                ...deskTagColorDot(data.color)
            };
        },
    }

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



    const deskTagSelectOptions: DeskTagSelectOption[] = Object.keys(allDeskTags).map(deskTagId => {
        return { value: deskTagId, label: allDeskTags[deskTagId].name, color: allDeskTags[deskTagId].color }
    })


    function onAllowsStudentsChanged(event: React.ChangeEvent<HTMLInputElement>) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        dispatch({ type: 'TOGGLE_CELL_ALLOWS_STUDENTS', payload: { configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col, allowsStudents: event.target.checked } });
    }

    function onAssignedDeskTagsChange(newValue: MultiValue<DeskTagSelectOption>, actionMeta: ActionMeta<DeskTagSelectOption>) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        var newDeskTagIds = newValue.map(x => x.value)
        dispatch({ type: 'EDIT_CELL_ASSIGNED_DESK_TAGS', payload: { tagIds: newDeskTagIds, configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col } });
    }

    function onDeleteDesk() {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        dispatch({ type: 'REMOVE_DESK', payload: { configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col } });
    }

    function onCreateDeskTag() {
        onCloseDeskTagCreationModal()
        if (newDeskTagInfo.name.trim() == "") {
            return;
        }
        if (newDeskTagInfo.color.trim() == "") {
            return;
        }
        if (activeConfig === undefined) {
            return;
        }
        if (activeConfig.selectedCell === null) {
            return;
        }
        if (Object.values(allDeskTags).find(x => x.name.toLowerCase() === newDeskTagInfo.name.trim().toLowerCase()) !== undefined) {
            return;
        }
        var newTag: DeskTag = {
            id: uuid(),
            name: newDeskTagInfo.name.trim(),
            color: newDeskTagInfo.color.trim(),
        }
        setNewDeskTagInfo({ name: "", color: "blue" })
        dispatch({ type: 'CREATE_DESK_TAG', payload: { configId: activeConfig.id, deskTag: newTag, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col } });
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
                    styles={tagSelectStyles}
                    value={
                        deskTagSelectOptions.filter((deskTagOption) => {

                            return floorCell.deskTagIds.includes(deskTagOption.value)
                        })
                    }
                    onChange={(newValue, actionMeta) => { onAssignedDeskTagsChange(newValue, actionMeta) }}
                />
                <button onClick={openDeskTagCreationModal} className="default-button">Create Desk Tag</button>
            </ul>
            <button onClick={onDeleteDesk} className="default-button destructive" >Delete Desk</button>
            <Modal open={openTagCreationModal} onClose={onCloseDeskTagCreationModal}>
                <div>
                    <div className="flex flex-row justify-center">
                        <p className="title">Desk Tag Creator</p>
                    </div>
                    <div>
                        <p>Name</p>
                        <input className="modal-text-input" value={newDeskTagInfo.name} onChange={(e) => setNewDeskTagInfo({ ...newDeskTagInfo, name: e.target.value })}></input>
                        <p>Color</p>
                        <input type="color" value={newDeskTagInfo.color} onChange={(e) => setNewDeskTagInfo({ ...newDeskTagInfo, color: e.target.value })}></input>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseDeskTagCreationModal} className="default-button destructive">Cancel</button>
                        <button onClick={onCreateDeskTag} className="default-button">Create</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}