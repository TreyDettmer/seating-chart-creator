import { useState } from "react";
import { useActiveClass } from "../app-context";
import ClassStudentList from "./class-student-list";
import SeatingConfigEditor from "./seating-config-editor";
import ClassRulesEditor from "./class-rules-editor";

export default function ClassEditor() {
    const activeClass = useActiveClass();

    const [selectedTab, setSelectedTab] = useState("Students")

    return (
        <div className="flex flex-row grow bg-gray-50">
            <div>
                <div className="flex flex-row bg-blue-500 h-[40px]">
                    <button onClick={() => setSelectedTab("Students")} className={`tab-button ${selectedTab === "Students" ? "tab-button-current" : ""}`}>Students</button>
                    <button onClick={() => setSelectedTab("Rules")} className={`tab-button ${selectedTab === "Rules" ? "tab-button-current" : ""}`}>Rules</button>
                </div>
                <div>
                    {selectedTab == "Students" && <ClassStudentList></ClassStudentList>}
                    {selectedTab == "Rules" && <ClassRulesEditor></ClassRulesEditor>} 
                </div>
                
            </div>
            
            <SeatingConfigEditor></SeatingConfigEditor>
        </div>
    )
}