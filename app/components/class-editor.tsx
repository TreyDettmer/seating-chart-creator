import "../styles/class-editor.css";
import { useState } from "react";
import ClassStudentList from "./class-student-list";
import SeatingConfigEditor from "./seating-config-editor";
import ClassRulesEditor from "./class-rules-editor";
import TagsEditor from "./tags-editor";
import GroupsEditor from "./groups-editor";

export default function ClassEditor() {

    const [selectedSidebarTab, setSelectedSidebarTab] = useState("Students")
    const [selectedEditorTab, setSelectedEditorTab] = useState("Seating Charts")

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
                    {selectedSidebarTab == "Tags" && <TagsEditor></TagsEditor>}  
                </div>
                
            </div>
            <div className="editors-container">
                <div className="editors-tabs-container">
                    <button onClick={() => setSelectedEditorTab("Seating Charts")} className={`sidebar-tab ${selectedEditorTab === "Seating Charts" ? "sidebar-tab-current" : ""}`}>Seating Charts</button>
                    <button onClick={() => setSelectedEditorTab("Groups")} className={`sidebar-tab ${selectedEditorTab === "Groups" ? "sidebar-tab-current" : ""}`}>Groups</button>
                </div>
                {selectedEditorTab == "Seating Charts" && <SeatingConfigEditor></SeatingConfigEditor>}
                {selectedEditorTab == "Groups" && <GroupsEditor></GroupsEditor>}
            </div>
            
        </div>
    )
}