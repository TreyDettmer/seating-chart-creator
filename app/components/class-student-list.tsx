import "../styles/class-student-list.css";
import { useActiveClass, useAppDispatch, useAppState, useStudent } from "../app-context";
import { LocalFile, parse, ParseResult } from 'papaparse'
import { Gender, Student, StudentCsvRow } from "../app-state";
import { useState } from "react";
import Modal from "./modal";
import { useToast } from "./toast-context";
import Select, { ActionMeta, SingleValue } from "react-select";
import { v4 as uuid } from 'uuid'
import {FiUserCheck, FiUserX } from 'react-icons/fi'
import Toggle from "./toggle";



export default function ClassStudentList() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents } = useAppState();
    interface NewStudentInfoType {
        firstName: string;
        lastName: string;
        gender: Gender;
        isEsl: boolean;
        iepDesc: string;
    }
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [newStudentInfo, setNewStudentInfo] = useState<NewStudentInfoType>({ firstName: "", lastName: "", gender: Gender.Boy, isEsl: false, iepDesc: "" })
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
            console.log('file is null')
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
                        id: `${i}`,
                        firstName: `${rowData.FirstName}`,
                        lastName: `${rowData.LastName}`,
                        gender: rowData.Gender,
                        isEsl: false,
                        iepDesc: "",
                        tagIds: [],
                        nameAbbr: "",
                        isPresent: true
                    }
                    importedStudents[student.id] = student
                }
                if (activeClass !== undefined) {
                    dispatch({ type: 'IMPORT_STUDENTS', payload: { classId: activeClass.id, students: importedStudents } });
                }
            },
            error: (err: Error) => {

            }
        })
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
            isEsl: newStudentInfo.isEsl,
            iepDesc: newStudentInfo.iepDesc.trim(),
            tagIds: [],
            nameAbbr: "",
            isPresent: true
        }
        dispatch({ type: 'ADD_STUDENT', payload: { classId: activeClass.id, student: newStudent } });
        setIsAddStudentModalOpen(false)
        setNewStudentInfo({ firstName: "", lastName: "", gender: Gender.Boy, isEsl: false, iepDesc: "" })
    }

    function onStudentUpdated(updatedStudent: Student) {
        if (activeClass == undefined) {
            return
        }
        dispatch({ type: 'UPDATE_STUDENT', payload: { classId: activeClass.id, student: updatedStudent } });

    }

    return (
        <div>
            <div className="student-list-table-container">
                <table className="student-list-table">
                    <thead>
                        <tr>
                            <th>Is Present</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Gender</th>
                            <th>Is ESL?</th>
                            <th>IEP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            return (
                                <tr key={student.id}>
                                    <td>
                                        <button className={`attendance-toggle-button ${student.isPresent ? 'attendance-toggle-button-on' : 'attendance-toggle-button-off'}`} onClick={() => onStudentUpdated({ ...student, isPresent: !student.isPresent})}>
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
                                    <td>
                                        <Select value={{ value: student.gender, label: `${student.gender}` }} options={[
                                            { value: Gender.Boy, label: 'Boy' },
                                            { value: Gender.Girl, label: 'Girl' },
                                        ]} onChange={(newValue: SingleValue<{
                                            value: Gender;
                                            label: string;
                                        }>, actionMeta: ActionMeta<{
                                            value: Gender;
                                            label: string;
                                        }>) => { setNewStudentInfo({ ...newStudentInfo, gender: newValue?.value || Gender.Boy }) }} />
                                    </td>
                                    <td>
                                        <Toggle isChecked={student.isEsl} onChanged={(newVal : boolean) => onStudentUpdated({ ...student, isEsl: newVal })} ></Toggle>
                                    </td>
                                    <td>
                                        <input value={student.iepDesc} onChange={e => onStudentUpdated({ ...student, iepDesc: e.target.value.trim() })}></input>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="student-list-actions-container">
                <button className="default-button" onClick={openAddStudentModal}>Add Student</button>
                <label htmlFor="importStudentsUpload" className="default-button">
                    <input className="hidden" id="importStudentsUpload" type="file" onChange={onImportStudentsFileUploaded} />
                    Import Students
                </label>
            </div>
            <Modal open={isAddStudentModalOpen} onClose={onCloseAddStudentModal}>
                <div className="new-student-creation-modal">
                    <div className="flex flex-row justify-center">
                        <p className="title">New Student Info</p>
                    </div>
                    <div>
                        <div className="new-student-attribute-row">
                            <p>First Name</p>
                            <input value={newStudentInfo.firstName} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, firstName: e.target.value.trim() })} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Last Name</p>
                            <input value={newStudentInfo.lastName} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, lastName: e.target.value.trim() })} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Gender</p>
                            <Select value={{ value: newStudentInfo.gender, label: `${newStudentInfo.gender}` }} options={[
                                { value: Gender.Boy, label: 'Boy' },
                                { value: Gender.Girl, label: 'Girl' },
                            ]} onChange={(newValue: SingleValue<{
                                value: Gender;
                                label: string;
                            }>, actionMeta: ActionMeta<{
                                value: Gender;
                                label: string;
                            }>) => { setNewStudentInfo({ ...newStudentInfo, gender: newValue?.value || Gender.Boy }) }} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>Is ESL</p>
                            <input type="checkbox" checked={newStudentInfo.isEsl} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, isEsl: e.target.checked })} />
                        </div>
                        <div className="new-student-attribute-row">
                            <p>IEP Description</p>
                            <input value={newStudentInfo.iepDesc} onChange={(e) => setNewStudentInfo({ ...newStudentInfo, iepDesc: e.target.value.trim() })} />
                        </div>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button onClick={onCloseAddStudentModal} className="default-button">Cancel</button>
                        <button onClick={onAddStudent} className="default-button">Add Student</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}