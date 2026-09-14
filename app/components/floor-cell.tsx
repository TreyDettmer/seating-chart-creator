import { ReactNode } from "react"
import { Desk } from "../app-state"

export interface FloorCell {
    id: string,
    index: number,
    row: number,
    column: number,
    desk: Desk | null
    studentId: string | null
    children?: ReactNode
}

export default function FloorCellComponent() {
    return (
        <p>FloorCell</p>
    )
}