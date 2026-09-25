import { useState } from "react";
import { useActiveClass, useAppDispatch, useAppState } from "../app-context";
import { GroupsConfiguration, Student, CustomOption, SelectNumberOption } from "../app-state";
import "../styles/groups-editor.css";
import { useToast } from "./toast-context";
import Select, { ActionMeta, SingleValue } from "react-select";



export default function GroupsEditor() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, groupsConfigurations: allGroupsConfigurations } = useAppState();
    const toast = useToast();
    const [displayedGroupId, setDisplayedGroupId] = useState("");
    const [useAllStudents, setUseAllStudents] = useState(true);
    const [numberOfGroups, setNumberOfGroups] = useState(1);
    if (activeClass == undefined) {
        return null;
    }
    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const groupsConfigurations: GroupsConfiguration[] = Object.values(allGroupsConfigurations).filter(x => x.classId == activeClass.id);


    var numberOfGroupsOptions: SelectNumberOption[] = students.map((x, index) => {
        return { value: index + 1, label: `${index + 1} groups` }
    })

    return (
        <div className="groups-editor">
            <div>
                <h2>Generate Random Groups</h2>
                <div>
                    <p>Divide</p>
                    <Select components={{ Option: CustomOption }} classNamePrefix="select" value={{ value: useAllStudents, label: `${useAllStudents ? 'All Students' : 'Present Students'}` }} options={[
                        { value: true, label: 'All Students' },
                        { value: false, label: 'Present Students' },
                    ]} onChange={(newValue: SingleValue<{
                        value: boolean;
                        label: string;
                    }>, actionMeta: ActionMeta<{
                        value: boolean;
                        label: string;
                    }>) => { setUseAllStudents(newValue?.value ?? false) }} />
                    <p>Into</p>
                    <Select components={{ Option: CustomOption }}
                        classNamePrefix="select"
                        options={numberOfGroupsOptions}
                        value={{ value: numberOfGroups, label: `${numberOfGroups} groups` }}
                        onChange={(newValue: SingleValue<{
                            value: number;
                            label: string;
                        }>, actionMeta: ActionMeta<{
                            value: number;
                            label: string;
                        }>) => { setNumberOfGroups(newValue?.value || 2) }}
                    />
                    <button className="default-button">Generate Groups</button>
                </div>
            </div>
        </div>
    )
}