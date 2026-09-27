import "../styles/modal.css";
import { useAppDispatch, useAppState } from "../app-context";
import { ShufflePreferences } from "../app-state";
import Modal from "./modal";

export default function ShufflePreferencesModal(
    {open, onClose} : any
) {
    const { shufflePreferences } = useAppState();
    const dispatch = useAppDispatch();

    function updateShufflePreferences(updatedPreferences: ShufflePreferences) {
        dispatch({ type: 'EDIT_SHUFFLE_PREFERENCES', payload: { updatedPreferences: updatedPreferences } });

    }
    return (
        <Modal open={open} onClose={onClose}>
            <div className="shuffle-preferences-modal">
                <div className="flex flex-row justify-center">
                    <p className="title">Shuffle Preferences</p>
                </div>
                <div>
                    <div className="shuffle-preference-row">
                        <p>Iterations</p>
                        <input type="range" min="100" max="50000" value={shufflePreferences.iterations} onChange={(e) => updateShufflePreferences({ ...shufflePreferences, iterations: parseInt(e.target.value) })} />
                        <p>{shufflePreferences.iterations}</p>
                    </div>
                    <div className="shuffle-preference-row">
                        <p>Initial Exploration</p>
                        <input type="range" step={.1} min="8.0" max="12.0" value={shufflePreferences.explorationStrengthStart} onChange={(e) => updateShufflePreferences({ ...shufflePreferences, explorationStrengthStart: parseFloat(e.target.value) })} />
                        <p>{shufflePreferences.explorationStrengthStart.toFixed(2)}</p>
                    </div>
                    <div className="shuffle-preference-row">
                        <p>Final Exploration</p>
                        <input type="range" step={.01} min="0.05" max="0.2" value={shufflePreferences.explorationStrengthEnd} onChange={(e) => updateShufflePreferences({ ...shufflePreferences, explorationStrengthEnd: parseFloat(e.target.value) })} />
                        <p>{shufflePreferences.explorationStrengthEnd.toFixed(2)}</p>
                    </div>
                    <div className="shuffle-preference-row">
                        <p>Ignore Keep Apart Groups</p>
                        <input type="checkbox" checked={shufflePreferences.ignoreKeepApartGroups} onChange={(e) => updateShufflePreferences({ ...shufflePreferences, ignoreKeepApartGroups: e.target.checked })} />
                        <p>{shufflePreferences.ignoreKeepApartGroups ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="shuffle-preference-row">
                        <p>Ignore Keep Together Groups</p>
                        <input type="checkbox" checked={shufflePreferences.ignoreKeepTogetherGroups} onChange={(e) => updateShufflePreferences({ ...shufflePreferences, ignoreKeepTogetherGroups: e.target.checked })} />
                        <p>{shufflePreferences.ignoreKeepTogetherGroups ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="shuffle-preference-row">
                        <p>Ignore Tags</p>
                        <input type="checkbox" checked={shufflePreferences.ignoreTags} onChange={(e) => updateShufflePreferences({ ...shufflePreferences, ignoreTags: e.target.checked })} />
                        <p>{shufflePreferences.ignoreTags ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <div className="flex flex-row justify-center">
                    <button onClick={onClose} className="default-button">Close</button>
                </div>
            </div>
        </Modal>
    )
}