import "../styles/class-editor.css";
import { useState } from "react";
import { useActiveClass } from "../app-context";
import ClassStudentList from "./class-student-list";
import SeatingConfigEditor from "./seating-config-editor";
import ClassRulesEditor from "./class-rules-editor";
import DeskTagsEditor from "./desk-tags-editor";
import GroupsEditor from "./groups-editor";

export default function ClassEditor() {
    const activeClass = useActiveClass();

    const [selectedSidebarTab, setSelectedSidebarTab] = useState("Students")
    const [selectedEditorTab, setSelectedEditorTab] = useState("Seating Chart")

    return (
        <div className="class-editor">
            <div className="class-editor-sidebar">
                <div className="class-editor-sidebar-tabs-container">
                    <button onClick={() => setSelectedSidebarTab("Students")} className={`sidebar-tab ${selectedSidebarTab === "Students" ? "sidebar-tab-current" : ""}`}>Students</button>
                    <button onClick={() => setSelectedSidebarTab("Rules")} className={`sidebar-tab ${selectedSidebarTab === "Rules" ? "sidebar-tab-current" : ""}`}>Rules</button>
                    <button onClick={() => setSelectedSidebarTab("Tags")} className={`sidebar-tab ${selectedSidebarTab === "Tags" ? "sidebar-tab-current" : ""}`}>Tags</button>
                </div>
                <div>
                    {selectedSidebarTab == "Students" && <ClassStudentList></ClassStudentList>}
                    {selectedSidebarTab == "Rules" && <ClassRulesEditor></ClassRulesEditor>}
                    {selectedSidebarTab == "Tags" && <DeskTagsEditor></DeskTagsEditor>}  
                </div>
                
            </div>
            <div className="editors-container">
                <div className="editors-tabs-container">
                    <button onClick={() => setSelectedEditorTab("Seating Chart")} className={`sidebar-tab ${selectedEditorTab === "Seating Chart" ? "sidebar-tab-current" : ""}`}>Seating Chart</button>
                    <button onClick={() => setSelectedEditorTab("Groups")} className={`sidebar-tab ${selectedEditorTab === "Groups" ? "sidebar-tab-current" : ""}`}>Groups</button>
                </div>
                {selectedEditorTab == "Seating Chart" && <SeatingConfigEditor></SeatingConfigEditor>}
                {selectedEditorTab == "Groups" && <GroupsEditor></GroupsEditor>}
            </div>
            
        </div>
    )
}