// Importing necessary libraries & Components
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useClickOutside } from "@/lib/hooks";
import { IconPlus, IconChevronDown, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import Loader from "./ui/Loader";
import ThemeToggle from "./ui/ThemeToggle";

// Define exported Searched component
export function Searched() {
  return <div>Searched</div>;
}

// Define exported Candles component
export function Candles() {
  const router = useRouter(); // Page router
  const supabase = createClient(); // Establish Supabase connection instance

  const [loading, setLoading] = useState(false); // Loading state

  const [modalOpen, setModalOpen] = useState(false); // Display modal state
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown open state

  // References to the dropdown and button to detect clicks outside and close them
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(dropdownRef, buttonRef, () => {
    setDropdownOpen(false);
  });

  const [candleName, setCandleName] = useState(""); // Candle Name
  const [candleType, setCandleType] = useState(""); // Candle Type

  // Display Loader when loading
  if (loading) {
    return (
      <Loader
        loadingStates={[
          "Loading Assets",
          "Rendering Scene",
          "Finalising setup",
        ]}
      />
    );
  }

  // Function with create new candle logic
  const createCandle = async () => {
    if (!candleName.trim() || !candleType.trim()) return; // Return if candle name or type has not been selected

    // Return error if user not authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser(); // Retrieve user
    if (userError || !userData?.user) {
      return alert("User not authenticated.");
    }

    // Check if name exists in Supabase
    const { data: existingCandles, error: nameCheckError } = await supabase
      .from("candles") // From candles tabler
      .select("id") // Select id column
      .eq("user_id", userData.user.id) // Select using user id
      .eq("name", candleName); // Select name

    // Return alert error if fail to check name
    if (nameCheckError) {
      return alert(`Error checking candle name: ${nameCheckError.message}`);
    }

    // Return alert error if name already exists
    if (existingCandles && existingCandles.length > 0) {
      return alert("A candle with this name already exists.");
    }

    // Make the created candle the current one
    const { error: updateError } = await supabase
      .from("candles")
      .update({ is_current: false }) // Set previous current to false
      .eq("user_id", userData.user.id) // Selct using user id
      .eq("is_current", true); // Set this candle to current

    // Return alert error if failed to update candle
    if (updateError) {
      return alert(`Error updating current candle: ${updateError}`);
    }

    // Insert new candle in Supabase
    const { error } = await supabase
      .from("candles")
      .insert([
        {
          user_id: userData.user.id,
          name: candleName,
          type: candleType,
          is_current: true,
        },
      ])
      .select();

    // Return alert error if fail to insert candle
    if (error) {
      return alert(`Error creating candle: ${error}`);
    }

    setModalOpen(false); // Otherwise close the modal
    setLoading(true); // Start loading
    router.push("/candle-canvas"); // Redirect to candle canvas page
  };

  return (
    <div className="flex items-center md:items-start flex-col h-full w-full gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      <div className="relative top-36 md:top-0 grid grid-cols-1 md:grid-cols-3 gap-10 w-full pb-10 md:pb-0">
        <Tooltip text="Create New Candle" position="bottom" disabled={false}>
          <Button
            className="w-96 md:w-full min-h-[200px] flex items-center justify-center rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700"
            onClick={() => setModalOpen(true)}
          >
            <IconPlus className="text-neutral-400 h-10 w-10" />
          </Button>
        </Tooltip>
      </div>

      <AnimatePresence>
        {modalOpen && (
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Create New Design
              </h2>

              <IconX
                className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                onClick={() => setModalOpen(false)}
              />

              <input
                type="text"
                placeholder="Design Name"
                value={candleName}
                onChange={(e) => setCandleName(e.target.value)}
                className="w-full p-2 mb-3 border rounded-lg text-sm dark:bg-neutral-700 dark:border-neutral-600 text-neutral-800 dark:text-white shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6"
                required
              />

              <div className="relative text-sm" ref={dropdownRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`w-full p-2 border rounded-lg text-left flex justify-between items-center dark:bg-neutral-700 dark:border-neutral-600 ${
                    candleType
                      ? "text-black dark:text-white"
                      : "text-neutral-400 dark:text-neutral-400"
                  }`}
                >
                  {candleType || "Candle Type"}
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <IconChevronDown />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute mt-3 w-full rounded-lg bg-[#EAEAEA] dark:bg-neutral-900 shadow-lg z-10"
                    >
                      <button
                        type="button"
                        className="flex items-center w-[97.65%] gap-1 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 my-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                        onClick={() => {
                          setCandleType("150g 125mm");
                          setDropdownOpen(false);
                        }}
                      >
                        150g 125mm
                      </button>
                      <button
                        type="button"
                        className="flex items-center w-[97.65%] gap-1 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 mb-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                        onClick={() => {
                          setCandleType("180g 95mm");
                          setDropdownOpen(false);
                        }}
                      >
                        180g 95mm
                      </button>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={createCandle}
                className="w-full text-sm px-4 py-2 mt-3 bg-[#334cb5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                color="whiteBlack"
              >
                Create
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ThemeToggle />
    </div>
  );
}

// Define exported Candles component
export function Starred() {
  return (
    <div className="flex items-center md:items-start flex-col h-full w-full gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      Starred
    </div>
  );
}

// Define exported Trashed component
export function Trashed() {
  return (
    <div className="flex items-center md:items-start flex-col h-full w-full gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      Trashed
    </div>
  );
}

// Define exported Exported component
export function Exported() {
  return (
    <div className="flex items-center md:items-start flex-col h-full w-full gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      Exported
    </div>
  );
}
