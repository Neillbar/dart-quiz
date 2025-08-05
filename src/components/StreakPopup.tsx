"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FireIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface StreakPopupProps {
  show: boolean;
  streak: number;
  isNewStreak: boolean;
  onClose: () => void;
}

const StreakPopup: React.FC<StreakPopupProps> = ({ show, streak, isNewStreak, onClose }) => {
  const [displayStreak, setDisplayStreak] = useState(isNewStreak ? 0 : streak);

  useEffect(() => {
    if (show && isNewStreak && streak > 0) {
      // Animate counting up
      const duration = 1500; // 1.5 seconds
      const steps = 30;
      const increment = streak / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= streak) {
          setDisplayStreak(streak);
          clearInterval(timer);
        } else {
          setDisplayStreak(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayStreak(streak);
    }
  }, [show, streak, isNewStreak]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto close after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop - clicking outside closes the popup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 right-8 z-50 cursor-pointer"
            onClick={onClose}
          >
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FireIcon className="w-12 h-12 text-white animate-pulse" />
                <SparklesIcon className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              
              <div className="text-white">
                <h3 className="text-lg font-bold mb-1">
                  {isNewStreak && streak === 1 ? 'Daily Streak Started!' : 'Daily Streak Continues!'}
                </h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{displayStreak}</span>
                  <span className="text-sm opacity-90">day{displayStreak !== 1 ? 's' : ''} in a row!</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
              />
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, x: Math.random() * 100 - 50 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: -100,
                    x: Math.random() * 100 - 50
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute bottom-4"
                >
                  <FireIcon className="w-4 h-4 text-orange-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StreakPopup;