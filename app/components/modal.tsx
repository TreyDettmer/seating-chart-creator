


export default function Modal(
    {open, onClose, children} : any
) {
    return (
    <div onClick={onClose} className={`${open ? "modal-background-open" : "modal-background-closed"}`}>
        <div onClick={e => e.stopPropagation()} className={`${open ? "modal-open" : "modal-closed"}`}>
            {children}
        </div>
    </div>
    )
}