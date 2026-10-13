import "../styles/group-editor.css";

import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { Tag, CustomOption, SelectOption, TagSelectOption, tagColorDot, GroupsConfiguration, StudentGroup } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from 'react-select'
import Toggle from "./toggle";

export default function GroupEditor() {

    const activeClass = useActiveClass();
    const activeConfig = useActiveSeatingConfig()
    const dispatch = useAppDispatch();
    const { tags: allTags, groupsConfigurations: allGroupsConfigurations } = useAppState()

    if (activeClass === undefined) {
        return null;
    }

    if (activeClass.activeGroupsConfigurationId == null) {
        return null;
    }
    const groupsConfiguration: GroupsConfiguration = allGroupsConfigurations[activeClass.activeGroupsConfigurationId];
    if (groupsConfiguration.selectedGroupId == null) {
        return null;
    }
    const selectedGroup : StudentGroup = groupsConfiguration.studentGroups.find(x => x.id == groupsConfiguration.selectedGroupId)! 


    const tagSelectStyles: StylesConfig<TagSelectOption> = {
        option: (styles, { data }) => {
            data.value
            return {
                ...styles,
                ...tagColorDot(data.color)
            };
        },
        input: (styles) => ({ ...styles, ...tagColorDot() }),
        multiValue: (styles, { data }) => {
            return {
                ...styles,
                ...tagColorDot(data.color)
            };
        },
    }


    const tagSelectOptions: TagSelectOption[] = Object.keys(allTags).map(tagId => {
        return { value: tagId, label: allTags[tagId].name, color: allTags[tagId].color }
    })


    function onAssignedTagsChange(newValue: MultiValue<TagSelectOption>, actionMeta: ActionMeta<TagSelectOption>) {
        var newTagIds = newValue.map(x => x.value)
        const updatedGroup : StudentGroup = {
            ...selectedGroup,
            tagIds: newTagIds
        }
        dispatch({ type: 'EDIT_GROUP', payload: { groupsConfigId: groupsConfiguration.id, updatedGroup: updatedGroup } });
    }

    function updateGroupName(newName: string) {
        const updatedGroup : StudentGroup = {
            ...selectedGroup,
            name: newName
        }
        dispatch({ type: 'EDIT_GROUP', payload: { groupsConfigId: groupsConfiguration.id, updatedGroup: updatedGroup } });
    }


    return (
        <div className="group-editor">
            <p>Selected Group Options</p>
            <input className="modal-text-input" value={selectedGroup.name} onChange={(e) => updateGroupName(e.target.value)} />
            <p>Assigned Tags</p>
            <ul>
                <Select
                    isMulti
                    options={tagSelectOptions}
                    className="tag-select"
                    classNamePrefix="select"
                    components={{ Option: CustomOption }}
                    styles={tagSelectStyles}
                    value={
                        tagSelectOptions.filter((tagOption) => {

                            return selectedGroup.tagIds.includes(tagOption.value)
                        })
                    }
                    onChange={(newValue, actionMeta) => { onAssignedTagsChange(newValue, actionMeta) }}
                />
            </ul>
        </div>
    )
}