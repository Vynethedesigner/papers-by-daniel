import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OpeningScreen from './components/OpeningScreen';
import Gallery from './components/Gallery';

function App() {
  const [showOpening, setShowOpening] = useState(true);

  return (
    <div className="min-h-screen w-full bg-paper-white text-paper-black selection:bg-gray-200">
      <AnimatePresence mode="wait">
        {showOpening && (
          <OpeningScreen key="opening" onComplete={() => setShowOpening(false)} />
        )}
      </AnimatePresence>

      {!showOpening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {/* Placeholder for Gallery, passing a prop if needed */}
          <Gallery />
        </motion.div>
      )}
    </div>
  );
}

export default App;
