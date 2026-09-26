import "../styles/group-editor.css";

import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { DeskTag, CustomOption, SelectOption, TagSelectOption, deskTagColorDot } from "../app-state";
import Modal from "./modal";
import { v4 as uuid } from 'uuid'
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from 'react-select'
import Toggle from "./toggle";

export default function GroupEditor() {

    const activeClass = useActiveClass();
    const activeConfig = useActiveSeatingConfig()
    const dispatch = useAppDispatch();
    const { deskTags: allDeskTags, groupsConfigurations: allGroupsConfigurations } = useAppState()


    const tagSelectStyles: StylesConfig<TagSelectOption> = {
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
        return (<div className="group-editor"></div>)
    }

    const floorCell = activeConfig.grid[activeConfig.selectedCell.row][activeConfig.selectedCell.col]



    const tagSelectOptions: TagSelectOption[] = Object.keys(allDeskTags).map(deskTagId => {
        return { value: deskTagId, label: allDeskTags[deskTagId].name, color: allDeskTags[deskTagId].color }
    })


    function onAllowsStudentsChanged(newValue: boolean) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        dispatch({ type: 'TOGGLE_CELL_ALLOWS_STUDENTS', payload: { configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col, allowsStudents: newValue } });
    }

    function onAssignedTagsChange(newValue: MultiValue<TagSelectOption>, actionMeta: ActionMeta<TagSelectOption>) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        var newDeskTagIds = newValue.map(x => x.value)
        dispatch({ type: 'EDIT_CELL_ASSIGNED_DESK_TAGS', payload: { tagIds: newDeskTagIds, configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col } });
    }


    return (
        <div className="group-editor">
            <p>Selected Group Options</p>

            <p>Assigned Tags</p>
            <ul>
                <Select
                    isMulti
                    options={tagSelectOptions}
                    className="desk-editor-tag-select"
                    classNamePrefix="select"
                    components={{ Option: CustomOption }}
                    styles={tagSelectStyles}
                    value={
                        tagSelectOptions.filter((tagOption) => {

                            return floorCell.deskTagIds.includes(tagOption.value)
                        })
                    }
                    onChange={(newValue, actionMeta) => { onAssignedTagsChange(newValue, actionMeta) }}
                />
            </ul>
        </div>
    )
}