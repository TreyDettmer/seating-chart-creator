import "../styles/tags-editor.css";
import "../styles/modal.css";
import { useState } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { useSortable, isSortable } from '@dnd-kit/react/sortable';
import { Tag } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";

interface SortableTagRowProps {
    tag: Tag;
    index: number;
    onTagColorChanged: (tagId: string, newColor: string) => void;
    onTagNameChanged: (tagId: string, newName: string) => void;
    onDeleteTag: (tagId: string) => void;
}

function SortableTagRow(
    { tag, index, onTagColorChanged, onTagNameChanged, onDeleteTag }: SortableTagRowProps) {
    const { ref } = useSortable({ id: tag.id, index });

    return (
        <li ref={ref} className="tags-editor-row" key={tag.id}>
            <p>{tag.priority}</p>
            <input type="color" value={tag.color} onChange={(e) => onTagColorChanged(tag.id, e.target.value)}></input>
            <input className="modal-text-input" value={tag.name} onChange={(e) => onTagNameChanged(tag.id, e.target.value)}></input>
            <button className="tags-editor-remove-group-button" onClick={() => onDeleteTag(tag.id)}>X</button>
        </li>
    );
}

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
        dispatch({ type: 'CREATE_TAG', payload: { tag: newTag } });
    }

    function openTagCreationModal() {
        setIsTagCreationModalOpen(true)
    }
    function onCloseTagCreationModal() {
        setIsTagCreationModalOpen(false)
    }

    function onDragEnd(event: DragEndEvent) {
        
        if (event.canceled) {
            return;
        }

        const { source } = event.operation;
        if (!isSortable(source)) {
            return
        }

        const {initialIndex: oldIndex, index: newIndex, id: sourceId } = source;
        if (oldIndex == newIndex) {
            return
        }


        const elementWithNewIndex = Object.values(tags).find(x => x.priority == newIndex + 1)
        if (elementWithNewIndex == undefined) {
            return
        }
        var oldPriority = tags[sourceId].priority;
        var newPriority = tags[elementWithNewIndex.id].priority;
        var newTags = { ...tags };
        newTags[sourceId].priority = newPriority;
        newTags[elementWithNewIndex.id].priority = oldPriority;
        dispatch({ type: 'UPDATE_TAGS', payload: { newTags: newTags } });


        // if (!event.operation.target) {
        //     return;
        // }
        
        // const sourceId = event.operation.source?.id as string;
        // const targetId = event.operation.target?.id as string;

        // if (sourceId == null || targetId == null) {
        //     return;
        // }
        
        // if (sourceId == targetId) {
        //     return
        // }
        // console.log('Drag ended')
        // var oldPriority = tags[sourceId].priority;
        // var newPriority = tags[targetId].priority;
        // var newTags = { ...tags };
        // newTags[sourceId].priority = newPriority;
        // newTags[targetId].priority = oldPriority;
        // console.log(`Old: ${oldPriority}, New: ${newPriority}`)
    }

    return (
        <div className="tags-editor">

            <p className="tags-editor-header" >Tags</p>
            <p className="tags-editor-subheader" >Easily keep students away from each other.</p>
            <DragDropProvider
                onDragStart={() => { }}
                onDragMove={() => { }}
                onDragOver={() => { }}
                onDragEnd={onDragEnd}>
                <ul>
                    {Object.entries(tags).map((tagInfo) => {
                        return { id: tagInfo[0], tag: tagInfo[1] }
                    }

                    ).toSorted((t1, t2) => t1.tag.priority - t2.tag.priority).map((tagInfo, index) => {
                        return <SortableTagRow key={tagInfo.id} tag={tagInfo.tag} index={index} onTagColorChanged={onTagColorChanged} onTagNameChanged={onTagNameChanged} onDeleteTag={onDeleteTag}></SortableTagRow>

                    })}
                </ul>
            </DragDropProvider>
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