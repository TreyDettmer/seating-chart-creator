import { useActiveClass } from "../app-context";
import ClassEditor from "./class-editor";
import ClassListComponent from "./class-list";
import { ToastProvider } from "./toast-context";

export default function Dashboard() {
    const activeClass = useActiveClass();

    return (
        <ToastProvider>
            <div className="dashboard">
                <ClassListComponent />
                {activeClass && <ClassEditor />}
            </div>
        </ToastProvider>
    )
}