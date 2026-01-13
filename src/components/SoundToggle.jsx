import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import soundManager from '../utils/soundManager';

/**
 * Minimal sound toggle for gallery experience.
 * Off by default - users opt-in to the sound experience.
 */
const SoundToggle = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    const handleToggle = () => {
        const newState = soundManager.toggle();
        setIsEnabled(newState);
    };

    return (
        <button
            onClick={handleToggle}
            className="p-2 hover:opacity-50 transition-opacity duration-300 pointer-events-auto"
            aria-label={isEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={isEnabled ? 'Sound on' : 'Sound off'}
        >
            {isEnabled ? (
                <Volume2 size={16} strokeWidth={1.5} className="text-paper-black" />
            ) : (
                <VolumeX size={16} strokeWidth={1.5} className="text-gray-400" />
            )}
        </button>
    );
};

export default SoundToggle;
