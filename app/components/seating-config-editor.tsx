import { useActiveClass, useActiveSeatingConfig, useAppDispatch, useAppState } from "../app-context";
import { FloorCell, KeepApartGroup, KeepTogetherGroup, SeatingConfiguration, ShuffleResult, Student } from "../app-state";

import SeatingConfigList from "./seating-config-list";
import FloorCellComponent from "./floor-cell";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import DeskEditor from "./desk-editor";
import { useToast } from "./toast-context";

export default function SeatingConfigEditor() {
    const activeClass = useActiveClass();
    const toast = useToast()
    const { students: allStudents, seatingConfigurations: allSeatingConfigs, keepApartGroups: allKeepApartGroups, keepTogetherGroups: allKeepTogetherGroups, deskTags: allDeskTags } = useAppState();
    const dispatch = useAppDispatch();
    const activeConfig = useActiveSeatingConfig()
    const PREFERENCE_WEIGHT = 10; // reward: student seated at a desk that tags them
    const TOGETHER_WEIGHT = 8;    // reward: keepTogether pair seated adjacently
    const APART_PENALTY = 12;     // penalty: keepApart pair seated adjacently

    if (activeClass === undefined) {
        return null;
    }

    const seatingConfigs: SeatingConfiguration[] = activeClass?.seatingConfigurationIds.map((id) => {
        const seatingConfig = allSeatingConfigs[id];
        return seatingConfig;
    });
    const students: Student[] = activeClass?.studentIds.map((id) => {
        const student = allStudents[id];
        return student;
    });
    const activeConfigurationId = activeClass.activeConfigurationId
    const keepApartGroups: KeepApartGroup[] = activeClass.keepApartGroupIds.map(x => allKeepApartGroups[x])
    const keepTogetherGroups: KeepTogetherGroup[] = activeClass.keepTogetherGroupIds.map(x => allKeepTogetherGroups[x])

    function onDragEnd(event: DragEndEvent) {
        if (event.canceled) {
            return;
        }

        if (activeConfig === undefined) {
            return
        }

        if (activeConfigurationId === null) {
            return
        }

        const sourceId = event.operation.source?.id as string;
        const targetId = event.operation.target?.id as string;

        if (sourceId == null || targetId == null) {
            return;
        }
        if (sourceId.startsWith('student-')) {
            // Get the floor cell that has this studentId
            var sourceCell: { row: number; col: number } | undefined;
            var targetCell: { row: number; col: number } | undefined;
            for (let y = 0; y < activeConfig.rows; y++) {
                for (let x = 0; x < activeConfig.cols; x++) {
                    if (activeConfig.grid[y][x].id === sourceId.replace('student-', '')) {
                        sourceCell = { row: y, col: x }
                    }
                    if (activeConfig.grid[y][x].id === targetId) {
                        targetCell = { row: y, col: x }
                    }
                }
            }

            if (targetCell === undefined || sourceCell === undefined) {
                return;
            }

            dispatch({ type: 'SWAP_STUDENTS', payload: { configId: activeConfigurationId, cellA: sourceCell, cellB: targetCell } });
        }
        else if (sourceId.startsWith('desk-')) {
            // Get the floor cell that has this desk
            var sourceCell: { row: number; col: number } | undefined;
            var targetCell: { row: number; col: number } | undefined;
            for (let y = 0; y < activeConfig.rows; y++) {
                for (let x = 0; x < activeConfig.cols; x++) {
                    if (activeConfig.grid[y][x].id === sourceId.replace('desk-', '')) {
                        sourceCell = { row: y, col: x }
                    }
                    if (activeConfig.grid[y][x].id === targetId) {
                        targetCell = { row: y, col: x }
                    }
                }
            }
            if (targetCell === undefined || sourceCell === undefined) {
                return;
            }
            dispatch({ type: 'SWAP_DESKS', payload: { configId: activeConfigurationId, cellA: sourceCell, cellB: targetCell } });
        }
    }

    function onAddDesk() {
        if (activeConfig === undefined) {
            return
        }

        if (activeConfigurationId === null) {
            return
        }
        console.log("Calling!")
        dispatch({ type: 'ADD_DESK', payload: { configId: activeConfigurationId } });

    }

    function onShuffleStudents() {
        const iterations = 100, startTemp = 10, endTemp = 0.01
        if (activeConfig === undefined || activeClass === undefined) {
            return
        }
        // Get number of available desks
        var numberOfAvailableDesks = 0
        for (let rowIndex = 0; rowIndex < activeConfig.rows; rowIndex++) {
            for (let colIndex = 0; colIndex < activeConfig.cols; colIndex++) {
                if (activeConfig.grid[rowIndex][colIndex].hasDesk && activeConfig.grid[rowIndex][colIndex].allowsStudents) {
                    numberOfAvailableDesks++
                }
            }
        }
        if (activeClass.studentIds.length > numberOfAvailableDesks) {
            toast.open(
                toast.toastWarning("Warning","Not enough desks.")
            )
            return
        }

        var grid: FloorCell[][] = activeConfig.grid.map(row => row.map(cell => ({ ...cell })));
        // Get the cells which have a student at a desk which doesn't allows students
        var cellsInvalidOccupiedDesks: number[][] = []
        for (let rowIndex = 0; rowIndex < activeConfig.rows; rowIndex++) {
            for (let colIndex = 0; colIndex < activeConfig.cols; colIndex++) {
                if (grid[rowIndex][colIndex].hasDesk && grid[rowIndex][colIndex].studentId && grid[rowIndex][colIndex].allowsStudents === false) {
                    cellsInvalidOccupiedDesks.push([rowIndex, colIndex])
                }
            }
        }

        // Move students out of desks that don't allow students
        for (let i = cellsInvalidOccupiedDesks.length - 1; i >= 0; i--) {
            var focusedCell = cellsInvalidOccupiedDesks.pop()
            if (focusedCell === undefined) {
                continue;
            }
            var studentIdToMove: string = grid[focusedCell[0]][focusedCell[1]].studentId!
            var hasMovedStudent: boolean = false
            for (let rowIndex = 0; rowIndex < activeConfig.rows; rowIndex++) {
                for (let colIndex = 0; colIndex < activeConfig.cols; colIndex++) {
                    if (grid[rowIndex][colIndex].hasDesk && grid[rowIndex][colIndex].studentId == null && grid[rowIndex][colIndex].allowsStudents === true) {
                        grid[rowIndex][colIndex].studentId = studentIdToMove;
                        grid[focusedCell[0]][focusedCell[1]].studentId = null;
                        hasMovedStudent = true
                        break
                    }
                }
                if (hasMovedStudent) {
                    break
                }
            }
            if (hasMovedStudent === false) {
                console.log("Not enough available desks to move students off of restricted desks")
                return
            }
        }

        var desks: FloorCell[] = []
        for (let rowIndex = 0; rowIndex < activeConfig.rows; rowIndex++) {
            for (let colIndex = 0; colIndex < activeConfig.cols; colIndex++) {
                if (grid[rowIndex][colIndex].hasDesk && grid[rowIndex][colIndex].allowsStudents) {
                    desks.push(grid[rowIndex][colIndex])
                }
            }
        }

        var adjacencyMap: Map<string, string[]> = new Map();
        for (const cell of desks) {
            adjacencyMap.set(cell.id, getAdjacentFloorCells(cell, grid, activeConfig.rows, activeConfig.cols).filter(x => x != null).map((x) => x.id));
        }




        var deskSetPreferenceMap: Map<string, Set<string>> = new Map();
        for (const cell of desks) {
            const set: Set<string> = new Set();
            for (const deskTagId of cell.deskTagIds) {
                students.filter(x => x.deskTagIds.includes(deskTagId)).map(x =>
                    set.add(x.id)
                )
            }
            deskSetPreferenceMap.set(cell.id, set);
        }




        // Start from a random assignment: shuffle desks, take the first N for students,
        // the rest start out (and may remain) empty.
        const shuffledDeskIds = [...desks.map(x => x.id)].sort(() => Math.random() - 0.5);
        const studentToDesk: Map<string, string> = new Map();
        students.forEach((student, i) => {
            studentToDesk.set(student.id, shuffledDeskIds[i]);
        });

        // Remaining desks are empty. Order doesn't matter -- we just need a
        // mutable list we can pick from and swap entries in/out of.
        let emptyDeskIds = shuffledDeskIds.slice(students.length);


        let currentScore = scoreAssignment(
            studentToDesk,
            deskSetPreferenceMap,
            adjacencyMap
        );

        let bestAssignment = new Map(studentToDesk);
        let bestScore = currentScore;

        for (let iter = 0; iter < iterations; iter++) {
            // Exponential cooling schedule
            const t = startTemp * Math.pow(endTemp / startTemp, iter / iterations);

            // Two kinds of moves:
            //  - "swap": two students trade desks
            //  - "relocate": one student moves to a currently-empty desk
            // Only offer "relocate" when there's an empty desk to move to.
            const canRelocate = emptyDeskIds.length > 0;
            const doRelocate = canRelocate && Math.random() < 0.5;

            let undoMove;

            if (doRelocate) {
                const studentIdx = Math.floor(Math.random() * students.length);
                const emptyIdx = Math.floor(Math.random() * emptyDeskIds.length);

                const studentId = students[studentIdx].id;
                const oldDeskId = studentToDesk.get(studentId);
                const newDeskId = emptyDeskIds[emptyIdx];

                studentToDesk.set(studentId, newDeskId);
                emptyDeskIds[emptyIdx] = oldDeskId!;

                undoMove = () => {
                    studentToDesk.set(studentId, oldDeskId!);
                    emptyDeskIds[emptyIdx] = newDeskId;
                };
            } else {
                const idxA = Math.floor(Math.random() * students.length);
                let idxB = Math.floor(Math.random() * students.length);
                while (idxB === idxA) idxB = Math.floor(Math.random() * students.length);

                const studentA = students[idxA].id;
                const studentB = students[idxB].id;
                const deskA = studentToDesk.get(studentA);
                const deskB = studentToDesk.get(studentB);

                studentToDesk.set(studentA, deskB!);
                studentToDesk.set(studentB, deskA!);

                undoMove = () => {
                    studentToDesk.set(studentA, deskA!);
                    studentToDesk.set(studentB, deskB!);
                };
            }

            const newScore = scoreAssignment(
                studentToDesk,
                deskSetPreferenceMap,
                adjacencyMap
            );
            const delta = newScore - currentScore;

            if (delta >= 0 || Math.random() < Math.exp(delta / t)) {
                // accept (better, or accepted anyway per annealing schedule)
                currentScore = newScore;
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestAssignment = new Map(studentToDesk);
                }
            } else {
                // reject: undo the move
                undoMove();
            }
        }

        var reveresedBestAssignment = new Map(Array.from(bestAssignment, ([key, value]) => [value, key]));
        for (let rowIndex = 0; rowIndex < activeConfig.rows; rowIndex++) {
            for (let colIndex = 0; colIndex < activeConfig.cols; colIndex++) {
                if (reveresedBestAssignment.has(grid[rowIndex][colIndex].id)) {
                    grid[rowIndex][colIndex].studentId = reveresedBestAssignment.get(grid[rowIndex][colIndex].id)!
                } else {
                    grid[rowIndex][colIndex].studentId = null
                }
                

            }
        }
        
        dispatch({ type: 'UPDATE_SEATING_CONFIG_GRID', payload: { configId: activeConfig.id, newGrid: grid } });
    }

    function scoreAssignment(
        studentToDesk: Map<string, string>,
        deskPrefSets: Map<string, Set<string>>,
        adjacencyMap: Map<string, string[]>
    ) {
        let score = 0;

        // 1. Desk-tag preference
        for (const [studentId, deskId] of studentToDesk.entries()) {
            const prefSet = deskPrefSets.get(deskId);
            if (prefSet && prefSet.has(studentId)) score += PREFERENCE_WEIGHT;
        }

        // 2. Keep-together groups
        for (const group of keepTogetherGroups) {
            if (group.studentIds.length < 2) {
                continue
            }
            if (group.useAnd) {
                let areAllTogether = true;
                let pairCount = (group.studentIds.length * (group.studentIds.length - 1)) / 2;
                for (let i = 0; i < group.studentIds.length; i++) {
                    for (let j = i + 1; j < group.studentIds.length; j++) {
                        const deskA = studentToDesk.get(group.studentIds[i]);
                        const deskB = studentToDesk.get(group.studentIds[j]);

                        if (deskA && deskB && adjacencyMap!.get(deskA)!.includes(deskB) == false) {
                            areAllTogether = false
                        }
                    }
                }
                if (areAllTogether) {
                    score += TOGETHER_WEIGHT * pairCount;
                }
            } else {
                for (let i = 0; i < group.studentIds.length; i++) {
                    for (let j = i + 1; j < group.studentIds.length; j++) {
                        const deskA = studentToDesk.get(group.studentIds[i]);
                        const deskB = studentToDesk.get(group.studentIds[j]);

                        if (deskA && deskB && adjacencyMap!.get(deskA)!.includes(deskB)) {
                            score += TOGETHER_WEIGHT;
                        }
                    }
                }
            }
        }

        // 3. Keep-apart groups
        for (const group of keepApartGroups) {
            if (group.studentIds.length < 2) {
                continue
            }
            if (group.useAnd) {
                let areAllSeparate = true
                let pairCount = (group.studentIds.length * (group.studentIds.length - 1)) / 2;
                for (let i = 0; i < group.studentIds.length; i++) {
                    for (let j = i + 1; j < group.studentIds.length; j++) {
                        const deskA = studentToDesk.get(group.studentIds[i]);
                        const deskB = studentToDesk.get(group.studentIds[j]);
                        if (deskA && deskB && adjacencyMap!.get(deskA)!.includes(deskB)) {
                            areAllSeparate = false
                            
                        }
                    }
                }
                if (areAllSeparate == false) {
                    score -= APART_PENALTY * pairCount;
                }
            } else {
                for (let i = 0; i < group.studentIds.length; i++) {
                    for (let j = i + 1; j < group.studentIds.length; j++) {
                        const deskA = studentToDesk.get(group.studentIds[i]);
                        const deskB = studentToDesk.get(group.studentIds[j]);
                        if (deskA && deskB && adjacencyMap!.get(deskA)!.includes(deskB)) {
                            score -= APART_PENALTY;
                        }
                    }
                }
            }
        }

        return score;
    }


    function getAdjacentFloorCells(givenCell: FloorCell, floorCells: FloorCell[][], rows: number, cols: number): (FloorCell | null)[] {
        var leftCell: FloorCell | null = givenCell.column > 0 ? floorCells[givenCell.row][givenCell.column - 1] : null
        var rightCell: FloorCell | null = givenCell.column < cols - 1 ? floorCells[givenCell.row][givenCell.column + 1] : null
        var upperCell: FloorCell | null = givenCell.row > 0 ? floorCells[givenCell.row - 1][givenCell.column] : null
        var lowerCell: FloorCell | null = givenCell.row < rows - 1 ? floorCells[givenCell.row + 1][givenCell.column] : null
        var upperLeftCell: FloorCell | null = givenCell.column > 0 && givenCell.row > 0 ? floorCells[givenCell.row - 1][givenCell.column - 1] : null
        var upperRightCell: FloorCell | null = givenCell.column < cols - 1 && givenCell.row > 0 ? floorCells[givenCell.row - 1][givenCell.column + 1] : null
        var lowerLeftCell: FloorCell | null = givenCell.column > 0 && givenCell.row < rows - 1 ? floorCells[givenCell.row + 1][givenCell.column - 1] : null
        var lowerRightCell: FloorCell | null = givenCell.column < cols - 1 && givenCell.row < rows - 1 ? floorCells[givenCell.row + 1][givenCell.column + 1] : null
        return [leftCell, rightCell, upperCell, lowerCell, upperLeftCell, upperRightCell, lowerLeftCell, lowerRightCell]
    }


    return (
        <div className="flex flex-col grow border-l">
            <div id="config-list-container" className="flex flex-row bg-blue-500 h-[40px]">
                <SeatingConfigList></SeatingConfigList>
            </div>

            <div className="flex flex-row grow h-full w-full">
                <div className="h-full">
                    <DragDropProvider
                        onDragStart={() => { }}
                        onDragMove={() => { }}
                        onDragOver={() => { }}
                        onDragEnd={onDragEnd}>
                        <div id="grid-container" className="classroom">
                            {activeConfig ? (

                                <div id="grid" className="classroom-floor-grid"
                                    style={{
                                        gridTemplateColumns: `repeat(${activeConfig.cols}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${activeConfig.rows}, minmax(0, 1fr))`,
                                    }}
                                >
                                    {activeConfig.grid.map(row => {
                                        return row.map(cell => {
                                            return <FloorCellComponent key={cell.id} {...cell}></FloorCellComponent>
                                        })
                                    })}
                                </div>) : (null)}
                        </div>
                    </DragDropProvider>
                    <div id="shuffle-options" className="bg-yellow-300 h-[150px]">
                        <button onClick={onShuffleStudents} className="default-button">Shuffle Students</button>
                        <button onClick={onAddDesk} className="default-button">Add Desk</button>
                    </div>
                </div>
                <DeskEditor></DeskEditor>
            </div>
        </div>
    )
}