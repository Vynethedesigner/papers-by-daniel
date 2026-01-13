import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import soundManager from '../utils/soundManager';

/**
 * Minimal sound toggle for gallery experience.
 * Off by default - users opt-in to the sound experience.
 */
const SoundToggle = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [showHint, setShowHint] = useState(true);

    // Auto-hide hint after 5 seconds
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleToggle = () => {
        const newState = soundManager.toggle();
        setIsEnabled(newState);
        setShowHint(false);
    };

    return (
        <div className="relative group/sound">
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

            {/* Desktop Tooltip */}
            <div className={`absolute top-1/2 -left-3 -translate-x-full -translate-y-1/2 hidden md:block pointer-events-none transition-opacity duration-300 ${!isEnabled && showHint ? 'opacity-100' : 'opacity-0 group-hover/sound:opacity-100'}`}>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap bg-white/80 backdrop-blur px-2 py-1 rounded-sm border border-black/5">
                    {showHint && !isEnabled ? "Enable audio for a better experience" : (isEnabled ? "Mute" : "Enable Audio")}
                </span>
            </div>
        </div>
    );
};

export default SoundToggle;
