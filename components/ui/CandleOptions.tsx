/* eslint-disable react-hooks/rules-of-hooks */
// Importing necessary libraries & Components
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  useOpenCandle,
  useRenameCandle,
  useUpdateCandleCategory,
  usePermanentlyTrashCandle,
  useExportCandle,
} from "@/lib/hooks";
import {
  IconPencil,
  IconLabel,
  IconStar,
  IconStarOff,
  IconTrash,
  IconTrashOff,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";

// Define exported CnadleOptions component
export default function CandleOptions({
  // Parameters
  optionsOpenId, // Id for chosen candle
  dropdownRef,
  candleId,
  candleCategory,
  setLoading,
  router,
}: {
  // Typescript parameter types
  optionsOpenId: string | null;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  candleId: string;
  candleCategory: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  router: ReturnType<typeof useRouter>;
}) {
  // State for managing rename, trash confirmation, and export confirmation modals
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [trashConfirmOpen, setTrashConfirmOpen] = useState(false);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);

  return (
    // Smooth ebtry / exit animations
    <AnimatePresence>
      {/* Render options dropdown if it matches selected candle and is not exported */}
      {optionsOpenId === candleId && candleCategory !== "exported" && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="z-50 absolute -bottom-[230px] right-0 mb-2 w-[200px] rounded-lg bg-neutral-200 md:bg-white text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:bg-neutral-700"
        >
          {/* Edit button */}
          <button
            // Triggers hook which will open candle in canvas
            onClick={() => useOpenCandle(candleId, setLoading, router)}
            className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
          >
            <IconPencil
              strokeWidth={1.5}
              className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
            />
            Edit
          </button>

          {/* Rename button */}
          <button
            onClick={() => setRenameOpen(true)}
            className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
          >
            <IconLabel
              strokeWidth={1.5}
              className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
            />
            Rename
          </button>

          {/* Star button if not in "starred" category */}
          {candleCategory !== "starred" && (
            <button
              onClick={() => {
                useUpdateCandleCategory(candleId, "starred");
              }}
              className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
            >
              <IconStar
                strokeWidth={1.5}
                className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
              />
              Star
            </button>
          )}

          {/* Unstar button if in "starred" category */}
          {candleCategory === "starred" && (
            <button
              onClick={() => {
                useUpdateCandleCategory(candleId, "candles");
              }}
              className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
            >
              <IconStarOff
                strokeWidth={1.5}
                className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
              />
              Unstar
            </button>
          )}

          {/* Trash button if in "trashed" category */}
          {candleCategory !== "trashed" && (
            <button
              onClick={() => {
                useUpdateCandleCategory(candleId, "trashed");
              }}
              className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
            >
              <IconTrash
                strokeWidth={1.5}
                className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
              />
              Trash
            </button>
          )}

          {/* Untrash and Trash Forever buttons if in "trashed" category */}
          {candleCategory === "trashed" && (
            <>
              <button
                onClick={() => useUpdateCandleCategory(candleId, "candles")}
                className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
              >
                <IconTrashOff
                  strokeWidth={1.5}
                  className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
                />
                Untrash
              </button>
              <button
                onClick={() => setTrashConfirmOpen && setTrashConfirmOpen(true)}
                className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
              >
                <IconTrash
                  strokeWidth={1.5}
                  className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
                />
                Trash Forever
              </button>
            </>
          )}
          {candleCategory !== "exported" && candleCategory !== "trashed" && (
            <button
              onClick={() => setExportConfirmOpen && setExportConfirmOpen(true)}
              className="w-[96%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 rounded-md px-4 m-1 p-2 hover:bg-[#F5F5F5] dark:hover:bg-neutral-600 text-sm"
            >
              <IconSend
                strokeWidth={1.5}
                className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200"
              />
              Export
            </button>
          )}

          {/* Rename modal */}
          <AnimatePresence>
            {renameOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg w-96"
                >
                  {/* Modal title */}
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Rename Candle
                  </h2>

                  {/* X icon to close modal */}
                  <IconX
                    className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                    onClick={() => setRenameOpen(false)}
                  />

                  {/* newName input */}
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)} // update newName
                    placeholder="New Name"
                    className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 my-4"
                  />

                  {/* Rename button */}
                  <Button
                    onClick={() => {
                      // Rename candle with hook and close modal
                      useRenameCandle(candleId, newName);
                      setRenameOpen(false);
                    }}
                    className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                    color="whiteBlack"
                  >
                    Rename
                  </Button>
                </motion.div>
                <ThemeToggle /> {/* Theme Toggle */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trash modal */}
          <AnimatePresence>
            {trashConfirmOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg w-96"
                >
                  {/* Modal title */}
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Permanently Trash Candle
                  </h2>

                  {/* Confirmation text */}
                  <p className="text-sm text-black dark:text-neutral-400 mb-4">
                    Permanently trashing the candle cannot be undone. Are you
                    sure you want to continue?
                  </p>

                  {/* X icon to close modal */}
                  <IconX
                    className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                    onClick={() =>
                      setTrashConfirmOpen && setTrashConfirmOpen(false)
                    }
                  />

                  {/* Permanently trash button */}
                  <Button
                    onClick={() => {
                      // Permanently trash selected candle using hook and close modal
                      usePermanentlyTrashCandle(candleId);
                      if (setTrashConfirmOpen) setTrashConfirmOpen(false);
                    }}
                    className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                    color="whiteBlack"
                  >
                    Yes, Delete
                  </Button>
                </motion.div>
                <ThemeToggle /> {/* Theme Toggle */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trash modal */}
          <AnimatePresence>
            {exportConfirmOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg w-96"
                >
                  {/* Modal title */}
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Export Candle
                  </h2>

                  {/* Confirmation text */}
                  <p className="text-sm text-black dark:text-neutral-400 mb-2">
                    Exporting the candle cannot be undone and you won&apos;t be
                    able to edit the candle anymore. <br />
                  </p>
                  <p className="text-sm text-black dark:text-neutral-400 mb-4">
                    Are you sure you want to continue?
                  </p>

                  {/* X icon to close modal */}
                  <IconX
                    className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                    onClick={() =>
                      setExportConfirmOpen && setExportConfirmOpen(false)
                    }
                  />

                  {/* Export button */}
                  <Button
                    onClick={() => {
                      // Exportselected candle using hook and close modal
                      useExportCandle(candleId);
                      useUpdateCandleCategory(candleId, "exported");
                      if (setExportConfirmOpen) setExportConfirmOpen(false);
                    }}
                    className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                    color="whiteBlack"
                  >
                    Yes, Export
                  </Button>
                </motion.div>
                <ThemeToggle /> {/* Theme Toggle */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
