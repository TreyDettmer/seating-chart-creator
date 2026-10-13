import "../styles/class-student-list.css";
import { useActiveClass, useAppDispatch, useAppState, useStudent } from "../app-context";
import { LocalFile, parse, ParseResult } from 'papaparse'
import { CustomOption, Gender, Student, StudentCsvRow, StudentListDisplayPrefs } from "../app-state";
import { useState } from "react";
import Modal from "./modal";
import { useToast } from "./toast-context";
import Select, { ActionMeta, SingleValue } from "react-select";
import { v4 as uuid } from 'uuid'
import { FiUserCheck, FiUserX, FiAlertCircle } from 'react-icons/fi'
import Toggle from "./toggle";



export default function ClassStudentList() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents, studentListDisplayPrefs } = useAppState();
    interface NewStudentInfoType {
        firstName: string;
        lastName: string;
        gender: Gender;
        isELL: boolean;
        iepDesc: string;
    }
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isTablePrefsModalOpen, setIsTablePrefsModalOpen] = useState(false);
    const [isImportStudentsModalOpen, setIsImportStudentsModalOpen] = useState(false);
    const [newStudentInfo, setNewStudentInfo] = useState<NewStudentInfoType>({ firstName: "", lastName: "", gender: Gender.None, isELL: false, iepDesc: "" })
    const toast = useToast()

    if (activeClass == undefined) {
        return null;
    }
    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });



    function onImportStudentsFileUploaded(event: any) {
        var csvFile: LocalFile = event.target.files?.[0]
        if (csvFile == null) {
            return
        }
        parse<StudentCsvRow>(csvFile, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results: ParseResult<StudentCsvRow>, file: LocalFile) => {
                var importedStudents: Record<string, Student> = {}
                for (let i = 0; i < results.data.length; i++) {
                    var rowData: StudentCsvRow = results.data[i]
                    var student: Student = {
                        id: uuid(),
                        firstName: `${rowData.FirstName}`,
                        lastName: `${rowData.LastName}`,
                        gender: rowData.Gender || Gender.None,
                        isELL: rowData.IsELL || false,
                        iepDesc: rowData.IepDesc || "",
                        tagIds: [],
                        nameAbbr: "",
                        isPresent: true
                    }
                    importedStudents[student.id] = student
                }
                onCloseImportStudentsModal()
                if (activeClass !== undefined) {
                    dispatch({ type: 'IMPORT_STUDENTS', payload: { classId: activeClass.id, students: importedStudents } });
                }
            },
            error: (err: Error) => {
                console.log(err);
                toast.open(
                    toast.toastError("Error", "Issue with provided CSV file")
                )
                return
            }
        })
    }

    function openImportStudentsModal() {
        setIsImportStudentsModalOpen(true)
    }

    function onCloseImportStudentsModal() {
        setIsImportStudentsModalOpen(false)
    }

    function openTablePrefsModal() {
        setIsTablePrefsModalOpen(true);
    }

    function updateStudentListDisplayPrefs(newPrefs: StudentListDisplayPrefs) {
        dispatch({ type: 'UPDATE_STUDENT_LIST_DISPLAY_PREFS', payload: { newPrefs: newPrefs } });
    }

    function onCloseTablePrefsModal() {
        setIsTablePrefsModalOpen(false);
    }

    function openAddStudentModal() {
        setIsAddStudentModalOpen(true);
    }

    function onCloseAddStudentModal() {
        setIsAddStudentModalOpen(false)
    }

    function onAddStudent() {
        if (activeClass == undefined) {
            return
        }
        if (newStudentInfo.firstName.trim() == "") {
            toast.open(
                toast.toastError("Error", "Blank first name.")
            )
            return
        }
        if (newStudentInfo.lastName.trim() == "") {
            toast.open(
                toast.toastError("Error", "Blank first name.")
            )
            return
        }
        if (students.some(x => `${x.firstName.toLowerCase()}${x.lastName.toLowerCase}` == `${newStudentInfo.firstName.toLowerCase().trim()}${newStudentInfo.lastName.toLowerCase().trim()}`)) {
            toast.open(
                toast.toastError("Error", "Duplicate student name.")
            )
            return
        }
        var newStudent: Student = {
            id: uuid(),
            firstName: newStudentInfo.firstName.trim(),
            lastName: newStudentInfo.lastName.trim(),
            gender: newStudentInfo.gender,
            isELL: newStudentInfo.isELL,
            iepDesc: newStudentInfo.iepDesc.trim(),
            tagIds: [],
            nameAbbr: "",
            isPresent: true
        }
        dispatch({ type: 'ADD_STUDENT', payload: { classId: activeClass.id, student: newStudent } });
        setIsAddStudentModalOpen(false)
        setNewStudentInfo({ firstName: "", lastName: "", gender: Gender.None, isELL: false, iepDesc: "" })
    }

    function onStudentUpdated(updatedStudent: Student) {
        if (activeClass == undefined) {
            return
        }
        dispatch({ type: 'UPDATE_STUDENT', payload: { classId: activeClass.id, student: updatedStudent } });
    }

    function onDeleteStudent(student: Student) {
        if (activeClass == undefined) {
            return
        }
        if (confirm(`Are you sure you want to remove student '${student.firstName} ${student.lastName}'?`) == true) {
            dispatch({ type: 'REMOVE_STUDENT', payload: { classId: activeClass.id, studentId: student.id } });
        }
    }

    return (
        <div>
            <div className="student-list-table-container">
                {students.length > 0 && <table className="student-list-table">
                    <thead>
                        <tr>
                            <th>Is Present</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            {studentListDisplayPrefs.showGender && <th>Gender</th>}
                            {studentListDisplayPrefs.showIsELL && <th>Is ELL?</th>}
                            {studentListDisplayPrefs.showIepDesc && <th>IEP</th>}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            return (
                                <tr key={student.id}>
                                    <td>
                                        <button className={`attendance-toggle-button ${student.isPresent ? 'attendance-toggle-button-on' : 'attendance-toggle-button-off'}`} onClick={() => onStudentUpdated({ ...student, isPresent: !student.isPresent })}>
                                            {student.isPresent && <FiUserCheck size={25}></FiUserCheck>}
                                            {!student.isPresent && <FiUserX size={25}></FiUserX>}
                                        </button>
                                    </td>
                                    <td>
                                        <input value={student.firstName} onChange={e => onStudentUpdated({ ...student, firstName: e.target.value.trim() })}></input>
                                    </td>
                                    <td>
                                        <input value={student.lastName} onChange={e => onStudentUpdated({ ...student, lastName: e.target.value.trim() })}></input>
                                    </td>
                                    {studentListDisplayPrefs.showGender &&
                                        <td>
                                            <Select value={{ value: student.gender, label: `${student.gender}` }} options={[
                                                { value: Gender.Male, label: 'Male' },
                                                { value: Gender.Female, label: 'Female' },
                                                { value: Gender.NonBinary, label: 'NonBinary' },
                                                { value: Gender.None, label: 'None' },
                                            ]} components={{ Option: CustomOption }} onChange={(newValue: SingleValue<{
                                                value: Gender;
                                                label: string;
                                            }>, _: ActionMeta<{
                                                value: Gender;
                                                label: string;
                                            }>) => { setNewStudentInfo({ ...newStudentInfo, gender: newValue?.value || Gender.None }) }} />
                                        </td>
                                    }
                                    {studentListDisplayPrefs.showIsELL &&
                                        <td>
                                            <Toggle isChecked={student.isELL} onChanged={(newVal: boolean) => onStudentUpdated({ ...student, isELL: newVal })} ></Toggle>
                                        </td>
                                    }
                                    {studentListDisplayPrefs.showIepDesc &&
                                        <td>
                                            <input value={student.iepDesc} onChange={e => onStudentUpdated({ ...student, iepDesc: e.target.value })}></input>
                                        </td>
                                    }
                                    <td>
                                        <button className="remove-student-button" onClick={() => onDeleteStudent(student)}>X</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                }
            </div>
            <div className="student-list-actions-container">
                <button className="default-button" onClick={openAddStudentModal}>Add Student</button>
                <button className="default-button" onClick={openImportStudentsModal}>Import Students</button>
                <button className="default-button" onClick={openTablePrefsModal}>Table Preferences</button>
            </div>
            <Modal open={isAddStudentModalOpen} onClose={onCloseAddStudentModal}>
                <div className="new-student-creation-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">New Student Info</p>
                    </div>
                    <div>
                        <div className="new-student-attribute-row">
                            <p>First Name</p>
                            <input className="modal-text-input" value={newStudentInfo.firstName} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, firstName: e.target.value.trim() })} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Last Name</p>
                            <input className="modal-text-input" value={newStudentInfo.lastName} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, lastName: e.target.value.trim() })} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Gender</p>
                            <Select value={{ value: newStudentInfo.gender, label: `${newStudentInfo.gender}` }} options={[
                                { value: Gender.Male, label: 'Male' },
                                { value: Gender.Female, label: 'Female' },
                                { value: Gender.NonBinary, label: 'NonBinary' },
                                { value: Gender.None, label: 'None' },
                            ]} components={{ Option: CustomOption }} onChange={(newValue: SingleValue<{
                                value: Gender;
                                label: string;
                            }>, actionMeta: ActionMeta<{
                                value: Gender;
                                label: string;
                            }>) => { setNewStudentInfo({ ...newStudentInfo, gender: newValue?.value || Gender.None }) }} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Is ELL</p>
                            <Toggle isChecked={newStudentInfo.isELL} onChanged={(newValue) => { setNewStudentInfo({ ...newStudentInfo, isELL: newValue }) }}></Toggle>
                        </div>
                        <div className="new-student-attribute-row">
                            <p>IEP Description</p>
                            <input className="modal-text-input" value={newStudentInfo.iepDesc} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, iepDesc: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseAddStudentModal} className="default-button">Cancel</button>
                        <button onClick={onAddStudent} className="default-button">Add Student</button>
                    </div>
                </div>
            </Modal>

            <Modal open={isTablePrefsModalOpen} onClose={onCloseTablePrefsModal}>
                <div className="new-student-creation-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Table Preferences</p>
                    </div>
                    <div>
                        <div className="new-student-attribute-row">
                            <p>Show Gender</p>
                            <Toggle isChecked={studentListDisplayPrefs.showGender} onChanged={(newValue) => { updateStudentListDisplayPrefs({ ...studentListDisplayPrefs, showGender: newValue }) }}></Toggle>
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Show Is ELL</p>
                            <Toggle isChecked={studentListDisplayPrefs.showIsELL} onChanged={(newValue) => { updateStudentListDisplayPrefs({ ...studentListDisplayPrefs, showIsELL: newValue }) }}></Toggle>
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Show IEP</p>
                            <Toggle isChecked={studentListDisplayPrefs.showIepDesc} onChanged={(newValue) => { updateStudentListDisplayPrefs({ ...studentListDisplayPrefs, showIepDesc: newValue }) }}></Toggle>
                        </div>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseTablePrefsModal} className="default-button">Close</button>
                    </div>
                </div>
            </Modal>

            <Modal open={isImportStudentsModalOpen} onClose={onCloseImportStudentsModal}>
                <div className="import-students-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">Import Students</p>
                    </div>
                    <div>
                        <p>Upload a CSV file containing FirstName, LastName columns and optional Gender, IsELL, and IepDesc columns.</p>
                    </div>
                    <div className="flex flex-row">
                        <FiAlertCircle className="text-yellow-500" size={25}></FiAlertCircle>
                        <p>This will clear existing students from the current class.</p>
                        <FiAlertCircle className="text-yellow-500" size={25}></FiAlertCircle>
                    </div>
                    <label htmlFor="importStudentsUpload" className="default-button">
                        <input className="hidden" accept=".csv" id="importStudentsUpload" type="file" onChange={onImportStudentsFileUploaded} />
                        Import Students
                    </label>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseImportStudentsModal} className="default-button">Close</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}