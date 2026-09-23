import { useState } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { DeskTag } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'

export default function DeskTagsEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, deskTags, keepApartGroups: allKeepApartGroups, keepTogetherGroups: allKeepTogetherGroups } = useAppState();
    const [openTagCreationModal, setOpenTagCreationModal] = useState(false)
    interface NewDeskTagInfoType {
        name: string;
        color: string;
    }
    const [newDeskTagInfo, setNewDeskTagInfo] = useState<NewDeskTagInfoType>({ name: "", color: "blue" })


    if (activeClass == undefined) {
        return null;
    }



    function onDeskTagNameChanged(tagId: string, newName: string) {
        if (activeClass == undefined) {
            return;
        }
        var modifiedTag: DeskTag = {
            ...deskTags[tagId],
            name: newName.trim()
        }
        dispatch({ type: 'EDIT_DESK_TAG', payload: { tagId: tagId, deskTag: modifiedTag } });

    }

    function onDeskTagColorChanged(tagId: string, newColor: string) {
        if (activeClass == undefined) {
            return;
        }
        if (newColor.trim() == "") {
            return;
        }
        var modifiedTag: DeskTag = {
            ...deskTags[tagId],
            color: newColor.trim()
        }
        dispatch({ type: 'EDIT_DESK_TAG', payload: { tagId: tagId, deskTag: modifiedTag } });
    }

    function onDeleteDeskTag(tagId: string) {
        var tag = deskTags[tagId]
        if (confirm(`Are you sure you want to delete desk tag '${tag.name}' across all classes?`) == true) {

            dispatch({ type: 'DELETE_DESK_TAG', payload: { tagId: tagId } });
        }
    }

    function onCreateDeskTag() {
        onCloseDeskTagCreationModal()
        if (newDeskTagInfo.name.trim() == "") {
            return;
        }
        if (newDeskTagInfo.color.trim() == "") {
            return;
        }
        if (Object.values(deskTags).find(x => x.name.toLowerCase() === newDeskTagInfo.name.trim().toLowerCase()) !== undefined) {
            return;
        }
        var newTag: DeskTag = {
            id: uuid(),
            name: newDeskTagInfo.name.trim(),
            color: newDeskTagInfo.color.trim(),
        }
        setNewDeskTagInfo({ name: "", color: "blue" })
        dispatch({ type: 'CREATE_DESK_TAG', payload: { deskTag: newTag, configId: undefined, row: undefined, col: undefined}});
    }

    function openDeskTagCreationModal() {
        setOpenTagCreationModal(true)
    }
    function onCloseDeskTagCreationModal() {
        setOpenTagCreationModal(false)
    }

    return (
        <div className="desk-tags-editor">

            <p className="desk-tags-editor-header" >Desk Tags</p>
            <p className="desk-tags-editor-subheader" >Easily keep students away from each other.</p>
            <ul>
                {Object.entries(deskTags).map(([tagId, deskTag]) => {
                    return <li className="desk-tags-editor-row" key={tagId}>
                        <input type="color" value={deskTag.color} onChange={(e) => onDeskTagColorChanged(tagId, e.target.value)}></input>
                        <input className="modal-text-input" value={deskTag.name} onChange={(e) => onDeskTagNameChanged(tagId, e.target.value)}></input>
                        <button className="class-rules-editor-remove-group-button" onClick={() => onDeleteDeskTag(tagId)}>X</button>
                    </li>

                })}
                
            </ul>
            <button className="default-button" onClick={openDeskTagCreationModal}>Create New Tag</button>
            <Modal open={openTagCreationModal} onClose={onCloseDeskTagCreationModal}>
                <div className="desk-tag-creation-modal">
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