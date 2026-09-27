import "../styles/desk-editor.css";
import "../styles/modal.css";
import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { Tag, CustomOption, SelectOption, TagSelectOption, tagColorDot } from "../app-state";
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from 'react-select'
import Toggle from "./toggle";

export default function DeskEditor() {

    const activeClass = useActiveClass();
    const activeConfig = useActiveSeatingConfig()
    const dispatch = useAppDispatch();
    const { tags: allTags } = useAppState()


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

    if (activeClass === undefined) {
        return null;
    }

    if (activeConfig === undefined || activeConfig.selectedCell == null) {
        return (<div className="desk-editor"></div>)
    }

    const floorCell = activeConfig.grid[activeConfig.selectedCell.row][activeConfig.selectedCell.col]



    const tagSelectOptions: TagSelectOption[] = Object.keys(allTags).map(tagId => {
        return { value: tagId, label: allTags[tagId].name, color: allTags[tagId].color }
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
        var newTagIds = newValue.map(x => x.value)
        dispatch({ type: 'EDIT_CELL_ASSIGNED_TAGS', payload: { tagIds: newTagIds, configId: activeConfig.id, row: activeConfig.selectedCell.row, col: activeConfig.selectedCell.col } });
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

                            return floorCell.tagIds.includes(tagOption.value)
                        })
                    }
                    onChange={(newValue, actionMeta) => { onAssignedTagsChange(newValue, actionMeta) }}
                />
                
            </ul>
            <button onClick={onDeleteDesk} className="default-button destructive" >Delete Desk</button>
        </div>
    )
}