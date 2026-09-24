import "../styles/class-editor.css";
import { useState } from "react";
import { useActiveClass } from "../app-context";
import ClassStudentList from "./class-student-list";
import SeatingConfigEditor from "./seating-config-editor";
import ClassRulesEditor from "./class-rules-editor";
import DeskEditor from "./desk-editor";
import DeskTagsEditor from "./desk-tags-editor";

export default function ClassEditor() {
    const activeClass = useActiveClass();

    const [selectedTab, setSelectedTab] = useState("Students")

    return (
        <div className="class-editor">
            <div className="class-editor-sidebar">
                <div className="flex flex-row bg-blue-500 h-[40px]">
                    <button onClick={() => setSelectedTab("Students")} className={`tab ${selectedTab === "Students" ? "tab-current" : ""}`}>Students</button>
                    <button onClick={() => setSelectedTab("Rules")} className={`tab ${selectedTab === "Rules" ? "tab-current" : ""}`}>Rules</button>
                    <button onClick={() => setSelectedTab("Tags")} className={`tab ${selectedTab === "Tags" ? "tab-current" : ""}`}>Tags</button>
                </div>
                <div>
                    {selectedTab == "Students" && <ClassStudentList></ClassStudentList>}
                    {selectedTab == "Rules" && <ClassRulesEditor></ClassRulesEditor>}
                    {selectedTab == "Tags" && <DeskTagsEditor></DeskTagsEditor>}  
                </div>
                
            </div>
            <SeatingConfigEditor></SeatingConfigEditor>
        </div>
    )
}