import "../globals.css";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";

export interface ToggleProps {
    isChecked: boolean;
    onChanged: (newValue : boolean) => void;
}

export default function Toggle(
    props : ToggleProps
) {
    return (
        <button className={`toggle-button ${props.isChecked ? 'toggle-button-on' : 'toggle-button-off'}`} onClick={() => props.onChanged(!props.isChecked)}>
            {props.isChecked  && <BsToggleOn size={25}></BsToggleOn>}
            {!props.isChecked  && <BsToggleOff size={25}></BsToggleOff>}
        </button>
    )
}