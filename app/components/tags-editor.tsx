import "../styles/tags-editor.css";
import "../styles/modal.css";
import { useState } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { Tag } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'

export default function TagsEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, tags, keepApartGroups: allKeepApartGroups, keepTogetherGroups: allKeepTogetherGroups } = useAppState();
    const [isTagCreationModalOpen, setIsTagCreationModalOpen] = useState(false)
    interface NewTagInfoType {
        name: string;
        color: string;
    }
    const [newTagInfo, setNewTagInfo] = useState<NewTagInfoType>({ name: "", color: "blue" })


    if (activeClass == undefined) {
        return null;
    }



    function onTagNameChanged(tagId: string, newName: string) {
        if (activeClass == undefined) {
            return;
        }
        var modifiedTag: Tag = {
            ...tags[tagId],
            name: newName.trim()
        }
        dispatch({ type: 'EDIT_TAG', payload: { tagId: tagId, tag: modifiedTag } });

    }

    function onTagColorChanged(tagId: string, newColor: string) {
        if (activeClass == undefined) {
            return;
        }
        if (newColor.trim() == "") {
            return;
        }
        var modifiedTag: Tag = {
            ...tags[tagId],
            color: newColor.trim()
        }
        dispatch({ type: 'EDIT_TAG', payload: { tagId: tagId, tag: modifiedTag } });
    }

    function onDeleteTag(tagId: string) {
        var tag = tags[tagId]
        if (confirm(`Are you sure you want to delete tag '${tag.name}' across all classes?`) == true) {
            dispatch({ type: 'DELETE_TAG', payload: { tagId: tagId } });
        }
    }

    function onCreateTag() {
        onCloseTagCreationModal()
        if (newTagInfo.name.trim() == "") {
            return;
        }
        if (newTagInfo.color.trim() == "") {
            return;
        }
        if (Object.values(tags).find(x => x.name.toLowerCase() === newTagInfo.name.trim().toLowerCase()) !== undefined) {
            return;
        }
        var newTag: Tag = {
            id: uuid(),
            name: newTagInfo.name.trim(),
            color: newTagInfo.color.trim(),
            priority: Object.keys(tags).length + 1
        }
        setNewTagInfo({ name: "", color: "blue" })
        dispatch({ type: 'CREATE_TAG', payload: { tag: newTag}});
    }

    function openTagCreationModal() {
        setIsTagCreationModalOpen(true)
    }
    function onCloseTagCreationModal() {
        setIsTagCreationModalOpen(false)
    }

    return (
        <div className="tags-editor">

            <p className="tags-editor-header" >Tags</p>
            <p className="tags-editor-subheader" >Easily keep students away from each other.</p>
            <ul>
                {Object.entries(tags).map(([tagId, tag]) => {
                    return <li className="tags-editor-row" key={tagId}>
                        <input type="color" value={tag.color} onChange={(e) => onTagColorChanged(tagId, e.target.value)}></input>
                        <input className="modal-text-input" value={tag.name} onChange={(e) => onTagNameChanged(tagId, e.target.value)}></input>
                        <button className="tags-editor-remove-group-button" onClick={() => onDeleteTag(tagId)}>X</button>
                    </li>

                })}
                
            </ul>
            <button className="default-button" onClick={openTagCreationModal}>Create New Tag</button>
            <Modal open={isTagCreationModalOpen} onClose={onCloseTagCreationModal}>
                <div>
                    <div className="flex flex-row justify-center">
                        <p className="title">Tag Creator</p>
                    </div>
                    <div>
                        <p>Name</p>
                        <input className="modal-text-input" value={newTagInfo.name} onChange={(e) => setNewTagInfo({ ...newTagInfo, name: e.target.value })}></input>
                        <p>Color</p>
                        <input type="color" value={newTagInfo.color} onChange={(e) => setNewTagInfo({ ...newTagInfo, color: e.target.value })}></input>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseTagCreationModal} className="default-button destructive">Cancel</button>
                        <button onClick={onCreateTag} className="default-button">Create</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}