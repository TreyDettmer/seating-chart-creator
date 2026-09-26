import "../styles/desk-editor.css";
import "../styles/modal.css";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { DeskTag, CustomOption, SelectOption, TagSelectOption, deskTagColorDot } from "../app-state";
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from 'react-select'
import Toggle from "./toggle";

export default function DeskEditor() {

    const activeClass = useActiveClass();
    const activeConfig = useActiveSeatingConfig()
    const dispatch = useAppDispatch();
    const { deskTags: allDeskTags } = useAppState()


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
        return (<div className="desk-editor"></div>)
    }

    const floorCell = activeConfig.grid[activeConfig.selectedCell.row][activeConfig.selectedCell.col]



    const deskTagSelectOptions: TagSelectOption[] = Object.keys(allDeskTags).map(deskTagId => {
        return { value: deskTagId, label: allDeskTags[deskTagId].name, color: allDeskTags[deskTagId].color }
    })


    function onAllowsStudentsChanged(newValue: boolean) {
        if (activeConfig === undefined || activeClass === undefined || activeConfig.selectedCell == null) {
            return
        }
        dispatch({ type: 'TOGGLE_CELL_ALLOWS_STUDENTS', payload: { configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col, allowsStudents: newValue } });
    }

    function onAssignedDeskTagsChange(newValue: MultiValue<TagSelectOption>, actionMeta: ActionMeta<TagSelectOption>) {
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



    return (
        <div className="desk-editor">
            <p>Selected Desk Options</p>
            <div className="desk-editor-allows-students">
                <p>Allows Students</p>
                <Toggle isChecked={floorCell.allowsStudents} onChanged={(newValue) => { onAllowsStudentsChanged(newValue) }}></Toggle>
            </div>


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
                
            </ul>
            <button onClick={onDeleteDesk} className="default-button destructive" >Delete Desk</button>
        </div>
    )
}