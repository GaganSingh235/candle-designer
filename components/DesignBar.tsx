"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconLayoutNavbarCollapse,
  IconPalette,
  IconSpray,
  IconSparkles,
  IconTrash,
  IconColorPicker,
} from "@tabler/icons-react";
import Tooltip from "./ui/Tooltip";
import { useClickOutside } from "@/lib/hooks";

// Define exported DesignBar component
export default function DesignBar({
  desktopClassName, // Extra desktop styles
  mobileClassName, // Extra mobile styles
  // Customisation change parameters
  onColorChange,
  onScentChange,
  onDecorChange,
  onClearAll,
  preview, // Preview state
}: {
  // TypeScript parameter types
  desktopClassName?: string;
  mobileClassName?: string;
  onColorChange: (color: string) => void;
  onScentChange: (scent: string) => void;
  onDecorChange: (decor: string) => void;
  onClearAll: () => void;
  preview: boolean;
}) {
  const [open, setOpen] = useState(false); // Open design items state
  // Define design items
  const items = [
    { title: "Color", button: <ColorButton onColorChange={onColorChange} /> },
    { title: "Scent", button: <ScentButton onScentChange={onScentChange} /> },
    { title: "Decor", button: <DecorButton onDecorChange={onDecorChange} /> },
    { title: "Clear All", button: <ClearAllButton onClearAll={onClearAll} /> },
  ];

  // Effect to close design items during preview
  useEffect(() => {
    if (preview) setOpen(false);
  }, [preview]); // Re-run if preview changes

  return (
    <>
      {/* Desktop Customisation Components */}
      <div
        className={`mx-auto hidden absolute bottom-12 md:flex shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-gray-300 dark:border-neutral-700 h-16 gap-4 items-end rounded-2xl bg-gray-200 dark:bg-neutral-800 px-4 pb-3 ${desktopClassName}`}
      >
        <ColorButton onColorChange={onColorChange} />
        <ScentButton onScentChange={onScentChange} />
        <DecorButton onDecorChange={onDecorChange} />
        <ClearAllButton onClearAll={onClearAll} />
      </div>

      {/* Mobile Customisation Components */}
      <div
        className={`absolute bottom-24 right-7 md:hidden ${mobileClassName}`}
      >
        {/* Smooth entry and exit animations */}
        <AnimatePresence>
          {open && (
            <motion.div
              layoutId="nav"
              className="absolute bottom-full right-0 mb-2 flex flex-col gap-2"
            >
              {/* Display each item */}
              {items.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: { delay: idx * 0.05 },
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                >
                  {item.button} {/* Item button */}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Button to open / close customisations */}
        <button
          onClick={() => setOpen(!open)}
          className="h-10 w-10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)] border dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center"
        >
          <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
      </div>
    </>
  );
}

// Colour component
function ColorButton({
  onColorChange,
}: {
  onColorChange: (color: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false); // Show picker state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Selected Colour tracker

  // Picker and button references to close picker when clicked outside
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(pickerRef, buttonRef, () => setShowPicker(false));

  // Colour items
  const colors = [
    "#ff0000",
    "#0000ff",
    "#00ff00",
    "#ffff00",
    "#ffA500",
    "#800080",
    "#000000",
    "#ffffff",
  ];

  return (
    <div className="relative">
      {/* Colour button */}
      <Tooltip text="Color" disabled={showPicker}>
        <button
          ref={buttonRef}
          onClick={() => setShowPicker(!showPicker)}
          className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center hover:scale-125 transition duration-200"
        >
          <IconPalette className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
      </Tooltip>

      {/* Smooth entry / exit animations */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed md:absolute left-7 bottom-7 md:-left-[212%] translate-y-1/2 md:bottom-full md:mb-5 flex flex-col md:flex-row gap-2 bg-gray-200 dark:bg-neutral-800 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl border border-gray-300 dark:border-neutral-700"
          >
            {/* Display each colour */}
            <div className="flex flex-col md:flex-row gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="h-8 w-8 rounded-full border border-gray-300 dark:border-neutral-500 hover:scale-125 transition duration-200"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onColorChange(color); // Update colour change
                    setSelectedColor(color); // Update slected colour
                    setShowPicker(false); // Close picker
                  }}
                />
              ))}

              {/* Custom colour picker */}
              <button
                className="relative h-8 w-8 rounded-full border border-gray-300 dark:border-neutral-500 flex items-center justify-center hover:scale-110 transition duration-200"
                style={{ backgroundColor: selectedColor || "#ffffff" }}
              >
                <input
                  type="color"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={selectedColor || "#ffffff"}
                  onChange={(e) => {
                    onColorChange(e.target.value); // Detect colour change
                    setSelectedColor(e.target.value); // Update selected colour
                  }}
                />
                <IconColorPicker className="absolute -top-2 -right-2 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Scent component
function ScentButton({
  onScentChange,
}: {
  onScentChange: (scent: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false); // Show picker state

  // Picker and button references to close picker when clicked outside
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(pickerRef, buttonRef, () => setShowPicker(false));

  // Scent items
  const scents = [
    { text: "Peach", icon: "🍑" },
    { text: "Lavender", icon: "🌸" },
    { text: "Vanilla", icon: "🍦" },
    { text: "Rose", icon: "🌹" },
    { text: "Lemon & Citrus", icon: "🍋" },
    { text: "Strawberry", icon: "🍓" },
    { text: "Sandalwood", icon: "🪵" },
    { text: "Coconut", icon: "🥥" },
    { text: "Peppermint", icon: "🍃" },
    { text: "Bubblegum", icon: "🫧" },
    { text: "Lilac", icon: "🌷" },
    { text: "Ocean Breeze", icon: "🌊" },
  ];

  return (
    <div className="relative">
      {/* Scent button */}
      <Tooltip text="Scent" disabled={showPicker}>
        <button
          ref={buttonRef}
          onClick={() => setShowPicker(!showPicker)} // Show / close picker
          className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center hover:scale-125 transition duration-200"
        >
          <IconSpray className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
      </Tooltip>

      {/* Smooth entry / exit animations */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed md:absolute left-7 bottom-7 md:-left-[503%] translate-y-1/2 md:bottom-full md:mb-5 flex flex-col md:flex-row gap-2 bg-gray-200 dark:bg-neutral-800 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl border border-gray-300 dark:border-neutral-700"
          >
            {/* Display each scent item */}
            <div className="flex flex-col md:flex-row gap-2">
              {scents.map((scent) => (
                <button
                  key={scent.text}
                  className="h-8 w-8 text-2xl hover:scale-125 transition duration-200"
                  onClick={() => {
                    onScentChange(scent.text);
                    setShowPicker(false);
                  }}
                >
                  <Tooltip text={scent.text} disabled={false}>
                    {scent.icon} {/* Scent icon */}
                  </Tooltip>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Decor component
function DecorButton({
  onDecorChange,
}: {
  onDecorChange: (decor: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false); // Show picker state

  // Picker and button references to close picker when clicked outside
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(pickerRef, buttonRef, () => setShowPicker(false));

  // Decor items
  const decor = [
    { text: "Heart", icon: "❤️" },
    { text: "Leaf", icon: "🍁" },
    { text: "Ribbon", icon: "🎗️" },
    { text: "String", icon: "🧵" },
  ];

  return (
    <div className="relative">
      {/* Decor button */}
      <Tooltip text="Decor" disabled={showPicker}>
        <button
          ref={buttonRef}
          className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center hover:scale-125 transition duration-200"
          onClick={() => setShowPicker(!showPicker)} // Show / close picker
        >
          <IconSparkles className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
      </Tooltip>

      {/* Smooth entry / exit animations  */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed md:absolute left-7 bottom-7 md:-left-[175%] translate-y-1/2 md:bottom-full md:mb-5 flex flex-col md:flex-row gap-2 bg-gray-200 dark:bg-neutral-800 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl border border-gray-300 dark:border-neutral-700"
          >
            {/* Dssplay each decor item */}
            <div className="flex flex-col md:flex-row gap-2">
              {decor.map((decor) => (
                <button
                  key={decor.text}
                  className="h-8 w-8 text-2xl hover:scale-125 transition duration-200"
                  onClick={() => {
                    onDecorChange(decor.text);
                    setShowPicker(false);
                  }}
                >
                  <Tooltip text={decor.text} disabled={false}>
                    {decor.icon} {/* Decor icon */}
                  </Tooltip>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Clear all component
function ClearAllButton({ onClearAll }: { onClearAll: () => void }) {
  return (
    // Clear All button
    <Tooltip text="Clear All" disabled={false}>
      <button
        className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center hover:scale-125 transition duration-200"
        onClick={onClearAll}
      >
        <IconTrash className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </Tooltip>
  );
}
