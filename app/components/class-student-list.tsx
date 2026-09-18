import { useActiveClass, useAppDispatch, useAppState, useStudent } from "../app-context";
import { LocalFile, parse, ParseResult } from 'papaparse'
import { Student, StudentCsvRow } from "../app-state";



export default function ClassStudentList() {
    const activeClass = useActiveClass();
    const dispatch = useAppDispatch();
    const { students: allStudents } = useAppState();

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
                        id: `${i}`, firstName: `${rowData.FirstName}`, lastName: `${rowData.LastName}`, gender: rowData.Gender,
                        likeIds: rowData.LikeIds != null ? rowData.LikeIds.split(";") : [],
                        dislikeIds: rowData.DislikeIds != null ? rowData.DislikeIds.split(";") : []
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

    function onAddStudent() {

    }

    function onStudentUpdated(updatedStudent: Student) {
        if (activeClass == undefined) {
            return
        }
        dispatch({ type: 'UPDATE_STUDENT', payload: { classId: activeClass.id, student: updatedStudent } });

    }

    return (
        <div>
            <table className="table-auto border-spacing-1 mb-3 student-list-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Gender</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        return (
                            <tr key={student.id}>
                                <td>
                                    <input value={student.firstName} onChange={e => onStudentUpdated({ ...student, firstName: e.target.value })}></input>
                                </td>
                                <td>
                                    <input value={student.lastName} onChange={e => onStudentUpdated({ ...student, lastName: e.target.value })}></input>
                                </td>
                                <td>
                                    <input type="number" value={student.gender} onChange={e => onStudentUpdated({ ...student, gender: !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : 0 })}></input>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <label htmlFor="importStudentsUpload" className="default-button">
                <input className="hidden" id="importStudentsUpload" type="file" onChange={onImportStudentsFileUploaded} />
                Import Students
            </label>
        </div>
    )
}