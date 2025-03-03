/* eslint-disable react-hooks/rules-of-hooks */
// Importing necessary libraries & Components
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  useClickOutside,
  useRetrieveCandles,
  useOpenCandle,
} from "@/lib/hooks";
import {
  IconPlus,
  IconChevronDown,
  IconX,
  IconDots,
  IconEye,
  IconStar,
  IconTrash,
  IconSend,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import Loader from "./ui/Loader";
import ThemeToggle from "./ui/ThemeToggle";
import CandleModel from "./ui/CandleModel";
import CandleOptions from "./ui/CandleOptions";

// Define exported Searched component
export function Searched({
  searchQuery, // Search query parameter
}: {
  searchQuery: string; // TypeScript paramter type
}) {
  const router = useRouter(); // Page router
  const supabase = createClient(); // Establish Supabase connection instance

  const [loading, setLoading] = useState(false); // Loading state

  // Id tracker for specific candle
  const [optionsOpenId, setOptionsOpenId] = useState<string | null>(null); //

  // References to the dropdown and button to detect clicks outside and close them
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(dropdownRef, buttonRef, () => {
    setOptionsOpenId(null);
  });

  // Candle information
  const [candles, setCandles] = useState<
    {
      id: string;
      name: string;
      type: string;
      color: string;
      scent: string;
      decor: string;
      is_current: boolean;
      category: string;
    }[]
  >([]);

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

  // Effct to fetch candles from Supabase
  useEffect(() => {
    if (!searchQuery) return; // Return is query is emtpy

    const fetchCandles = async () => {
      // Search in all relevent column
      const { data, error } = await supabase
        .from("candles")
        .select("id, name, type, color, scent, decor, is_current, category")
        .ilike("name", `%${searchQuery}%`); // Insensitive case for search

      // Return error if failed to fetch candles
      if (error) {
        return console.error("Error fetching candles:", error.message);
      } else {
        setCandles(data || []);
      }
    };
    fetchCandles(); // Fetch candles

    // Subscribe to Supabase real-time with unique channel
    const channel = supabase
      // Generate channel name
      .channel("candles-realtime")
      .on(
        // Listen for changes in "candles" table within "public" schema
        "postgres_changes",
        { event: "*", schema: "public", table: "candles" },
        (payload) => {
          // Update candles state based o event type
          setCandles((prevCandles) => {
            if (!payload.new) return prevCandles; // Return current state if no new data

            const newCandle = payload.new as (typeof prevCandles)[number];
            const matchesSearch = newCandle?.name
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase());

            switch (payload.eventType) {
              case "INSERT":
                // Add new candle to the list
                return matchesSearch
                  ? [...prevCandles, newCandle]
                  : prevCandles;

              case "UPDATE":
                // Update modified candle and filter based on current category
                return prevCandles
                  .map((candle) =>
                    candle.id === newCandle.id ? newCandle : candle
                  )
                  .filter((candle) =>
                    // Using lowercase for case insensitive filter
                    candle.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  );

              case "DELETE":
                // Remove deleted candle from the list
                return prevCandles.filter(
                  (candle) => candle.id !== (payload.old as { id: string })?.id
                );

              default:
                // Return existing state if event type is unrecognised
                return prevCandles;
            }
          });
        }
      )
      .subscribe();

    // Cleanup function removing channel subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery, supabase]);

  return (
    <div className="flex items-center md:items-start flex-col h-full w-full pt-5 gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 ">
      <div className="relative top-32 md:top-0 grid grid-cols-1 md:grid-cols-3 gap-10 w-full pb-10 md:pb-0">
        {/* Display each candle */}
        {candles.length > 0 ? (
          candles.map((candle) => (
            <div
              key={candle.id}
              className="relative w-96 md:w-full min-h-[200px] mx-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 transition duration-200"
            >
              {/* Icon displaying candle category at top right */}
              {candle.category != "candles" && (
                <div className="absolute -top-4 -right-4 p-1.5 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-full text-neutral-600 dark:text-white">
                  {candle.category === "starred" && (
                    <IconStar className="h-5 w-5" />
                  )}
                  {candle.category === "trashed" && (
                    <IconTrash className="h-5 w-5" />
                  )}
                  {candle.category === "exported" && (
                    <IconSend className="h-5 w-5" />
                  )}
                </div>
              )}

              {/* Mini 3D interactive thumbnail */}
              <CandleModel
                preview={false}
                type={candle.type}
                color={candle.color}
              />

              {/* Display candle name, end with "..." if abover 25 characters */}
              <h3 className="absolute left-4 bottom-4 text-sm font-medium text-neutral-800 dark:text-white truncate">
                {candle.name.length > 25
                  ? `${candle.name.slice(0, 35)}...`
                  : candle.name}
              </h3>

              <div className="absolute bottom-2 right-2">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    if (candle.category != "exported") {
                      setOptionsOpenId((prevId) =>
                        prevId === candle.id ? null : candle.id
                      );
                    } else {
                      useOpenCandle(candle.id, setLoading, router);
                    }
                  }}
                  className="text-neutral-500 dark:text-neutral-200 p-2 hover:rotate-180 transition duration-500"
                >
                  {candle.category != "exported" ? (
                    <IconDots className="w-5 h-5" />
                  ) : (
                    <IconEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <CandleOptions
                optionsOpenId={optionsOpenId}
                dropdownRef={dropdownRef}
                candleId={candle.id}
                candleCategory={candle.category}
                setLoading={setLoading}
                router={router}
              />
            </div>
          ))
        ) : (
          <p className="flex justify-center md:justify-start text-black dark:text-neutral-400">
            No candles found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
      <ThemeToggle className="absolute bottom-7 right-7" />
    </div>
  );
}

// Define exported Candles component
export function Candles() {
  const router = useRouter(); // Page router
  const supabase = createClient(); // Establish Supabase connection instance

  const [loading, setLoading] = useState(false); // Loading state
  const [modalOpen, setModalOpen] = useState(false); // Display modal state
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown open state

  // Id tracker for specific candle
  const [optionsOpenId, setOptionsOpenId] = useState<string | null>(null);

  // References to the dropdown and button to detect clicks outside and close them
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(dropdownRef, buttonRef, () => {
    setDropdownOpen(false);
    setOptionsOpenId(null);
  });

  const [candleName, setCandleName] = useState(""); // Candle Name
  const [candleType, setCandleType] = useState(""); // Candle Type
  // Candle information
  const [candles, setCandles] = useState<
    {
      id: string;
      name: string;
      type: string;
      color: string;
      scent: string;
      decor: string;
      is_current: boolean;
      category: string;
    }[]
  >([]);

  // Retrieve Candles from category "candles" and store in "setCandles"
  useRetrieveCandles({ category: "candles", setCandles });

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
        {/* Create new candle button */}
        <Tooltip text="Create New Candle" position="bottom" disabled={false}>
          <Button
            className="w-96 md:w-full min-h-[200px] flex items-center justify-center rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700"
            onClick={() => setModalOpen(true)}
          >
            <IconPlus className="text-neutral-400 h-10 w-10" />
          </Button>
        </Tooltip>

        {/* Display each candle */}
        {candles.map((candle) => (
          <div
            key={candle.id}
            className="relative w-96 md:w-full min-h-[200px] mx-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 transition duration-200"
          >
            {/* Mini 3D interactive thumbnail */}
            <CandleModel
              preview={false}
              type={candle.type}
              color={candle.color}
            />

            {/* Display candle name, end with "..." if abover 25 characters */}
            <h3 className="absolute left-4 bottom-4 text-sm font-medium text-neutral-800 dark:text-white truncate">
              {candle.name.length > 25
                ? `${candle.name.slice(0, 35)}...`
                : candle.name}
            </h3>

            {/* 3 dots button to show / hide candle options menu for specific candle */}
            <div className="absolute bottom-2 right-2">
              <button
                ref={buttonRef}
                onClick={() => {
                  setOptionsOpenId((prevId) =>
                    prevId === candle.id ? null : candle.id
                  );
                }}
                className="text-neutral-500 dark:text-neutral-200 p-2 hover:rotate-180 transition duration-500"
              >
                <IconDots className="w-5 h-5" />
              </button>
            </div>

            {/* Candle options menu */}
            <CandleOptions
              optionsOpenId={optionsOpenId}
              dropdownRef={dropdownRef}
              candleId={candle.id}
              candleCategory={candle.category}
              setLoading={setLoading}
              router={router}
            />
          </div>
        ))}
      </div>
      {/* Smooth entry / exit animation for create candle modal */}
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
              {/* Modal title */}
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Create New Design
              </h2>

              {/* X icon to close model */}
              <IconX
                className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                onClick={() => setModalOpen(false)}
              />

              {/* Candle name input */}
              <input
                type="text"
                placeholder="Design Name"
                value={candleName}
                onChange={(e) => setCandleName(e.target.value)} // Update candle name
                className="w-full p-2 mb-3 border rounded-lg text-sm dark:bg-neutral-700 dark:border-neutral-600 text-neutral-800 dark:text-white shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6"
                required
              />

              {/* Candle type dropdown */}
              <div className="relative text-sm" ref={dropdownRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setDropdownOpen((prev) => !prev)} // Open / close dropdown
                  className={`w-full p-2 border rounded-lg text-left flex justify-between items-center dark:bg-neutral-700 dark:border-neutral-600 ${
                    candleType
                      ? "text-black dark:text-white"
                      : "text-neutral-400 dark:text-neutral-400"
                  }`}
                >
                  {candleType || "Candle Type"}
                  {/* Open close indicator */}
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <IconChevronDown />
                  </motion.span>
                </button>

                {/* Smoorthly animated dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute mt-3 w-full rounded-lg bg-[#EAEAEA] dark:bg-neutral-900 shadow-lg z-10"
                    >
                      {/* 150g 125mm button */}
                      <button
                        type="button"
                        className="flex items-center w-[97.65%] gap-1 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 my-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                        onClick={() => {
                          // Update type and close dropdown
                          setCandleType("150g 125mm");
                          setDropdownOpen(false);
                        }}
                      >
                        150g 125mm
                      </button>
                      {/* 180g 95mm button */}
                      <button
                        type="button"
                        className="flex items-center w-[97.65%] gap-1 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 mb-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                        onClick={() => {
                          // Update type and close dropdown
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

              {/* Create button */}
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
      <ThemeToggle /> {/* Theme Toggle */}
    </div>
  );
}

// Define exported Starred component
export function Starred() {
  const router = useRouter(); // Page router

  const [loading, setLoading] = useState(false); // Loading state
  // Id tracker for specific candle
  const [optionsOpenId, setOptionsOpenId] = useState<string | null>(null);

  // References to the dropdown and button to detect clicks outside and close them
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(dropdownRef, buttonRef, () => setOptionsOpenId(null));

  // Candle informtaion
  const [candles, setCandles] = useState<
    {
      id: string;
      name: string;
      type: string;
      color: string;
      scent: string;
      decor: string;
      is_current: boolean;
      category: string;
    }[]
  >([]);

  // Retrieve Candles from category "candles" and store in "setCandles"
  useRetrieveCandles({ category: "starred", setCandles });

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

  return (
    <div className="flex items-center md:items-start flex-col h-full w-full gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      {/* Display "No Starred Candles if no candles in category" */}
      {candles.length === 0 ? (
        <div className="relative top-36 md:top-0 text-gray-500 dark:text-neutral-400">
          No Starred Candles
        </div>
      ) : (
        <div className="relative top-36 md:top-0 grid grid-cols-1 md:grid-cols-3 gap-10 w-full pb-10 md:pb-0">
          {/* Display each candle */}
          {candles.map((candle) => (
            <div
              key={candle.id}
              className="relative w-96 md:w-full min-h-[200px] mx-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 transition duration-200"
            >
              {/* Mini 3D interactive thumbnail */}
              <CandleModel
                preview={false}
                type={candle.type}
                color={candle.color}
              />

              {/* Display candle name, end with "..." if abover 25 characters */}
              <h3 className="absolute left-4 bottom-4 text-sm font-medium text-neutral-800 dark:text-white truncate">
                {candle.name.length > 25
                  ? `${candle.name.slice(0, 35)}...`
                  : candle.name}
              </h3>

              {/* 3 dots button to show / hide candle options menu for specific candle */}
              <div className="absolute bottom-2 right-2">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    //
                    setOptionsOpenId((prevId) =>
                      prevId === candle.id ? null : candle.id
                    );
                  }}
                  className="text-neutral-500 dark:text-neutral-200 p-2 hover:rotate-180 transition duration-500"
                >
                  <IconDots className="w-5 h-5" />
                </button>
              </div>

              {/* Candle options menu */}
              <CandleOptions
                optionsOpenId={optionsOpenId}
                dropdownRef={dropdownRef}
                candleId={candle.id}
                candleCategory={candle.category}
                setLoading={setLoading}
                router={router}
              />
            </div>
          ))}
        </div>
      )}
      <ThemeToggle /> {/* Theme Toggle */}
    </div>
  );
}

// Define exported Trashed component
export function Trashed() {
  const router = useRouter(); // Page router

  const [loading, setLoading] = useState(false); // Loading state
  // Id tracker for specific candle
  const [optionsOpenId, setOptionsOpenId] = useState<string | null>(null);

  // References to the dropdown and button to detect clicks outside and close them
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(dropdownRef, buttonRef, () => setOptionsOpenId(null));

  // Candle information
  const [candles, setCandles] = useState<
    {
      id: string;
      name: string;
      type: string;
      color: string;
      scent: string;
      decor: string;
      is_current: boolean;
      category: string;
    }[]
  >([]);

  // Retrieve Candles from category "candles" and store in "setCandles"
  useRetrieveCandles({ category: "trashed", setCandles });

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

  return (
    <div className="flex items-center md:items-start flex-col h-full w-full gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      {/* Display "No Trashed Candles if no candles in category" */}
      {candles.length === 0 ? (
        <div className="relative top-36 md:top-0 text-gray-500 dark:text-neutral-400">
          No Trashed Candles
        </div>
      ) : (
        <div className="relative top-36 md:top-0 grid grid-cols-1 md:grid-cols-3 gap-10 w-full pb-10 md:pb-0">
          {/* Display each candle */}
          {candles.map((candle) => (
            <div
              key={candle.id}
              className="relative w-96 md:w-full min-h-[200px] mx-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 transition duration-200"
            >
              {/* Mini 3D interactive thumbnail */}
              <CandleModel
                preview={false}
                type={candle.type}
                color={candle.color}
              />

              {/* Display candle name, end with "..." if abover 25 characters */}
              <h3 className="absolute left-4 bottom-4 text-sm font-medium text-neutral-800 dark:text-white truncate">
                {candle.name.length > 25
                  ? `${candle.name.slice(0, 35)}...`
                  : candle.name}
              </h3>

              {/* 3 dots button to show / hide candle options menu for specific candle */}
              <div className="absolute bottom-2 right-2">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    setOptionsOpenId((prevId) =>
                      prevId === candle.id ? null : candle.id
                    );
                  }}
                  className="text-neutral-500 dark:text-neutral-200 p-2 hover:rotate-180 transition duration-500"
                >
                  <IconDots className="w-5 h-5" />
                </button>
              </div>

              {/* Candle options menu */}
              <CandleOptions
                optionsOpenId={optionsOpenId}
                dropdownRef={dropdownRef}
                candleId={candle.id}
                candleCategory={candle.category}
                setLoading={setLoading}
                router={router}
              />
            </div>
          ))}
        </div>
      )}
      <ThemeToggle /> {/* Theme Toggle */}
    </div>
  );
}

// Define exported Exported component
export function Exported() {
  const router = useRouter(); // Page router

  const [loading, setLoading] = useState(false); // Loading state

  // Candle Information
  const [candles, setCandles] = useState<
    {
      id: string;
      name: string;
      type: string;
      color: string;
      scent: string;
      decor: string;
      is_current: boolean;
      category: string;
    }[]
  >([]);

  // Retrieve Candles from category "exported" and store in "setCandles"
  useRetrieveCandles({ category: "exported", setCandles });

  // Display loading screen if loading
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

  return (
    <div className="flex items-center md:items-start flex-col h-full w-full pt-5 gap-5 md:gap-10 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
      {/* If no candles in this category, display "No Exported Candles" */}
      {candles.length === 0 ? (
        <div className="relative top-36 md:top-0 text-gray-500 dark:text-neutral-400">
          No exported Candles
        </div>
      ) : (
        <div className="relative top-32 md:top-0 grid grid-cols-1 md:grid-cols-3 gap-10 w-full pb-10 md:pb-0">
          {/* Display each candle */}
          {candles.map((candle) => (
            <div
              key={candle.id}
              className="relative w-96 md:w-full min-h-[200px] mx-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 transition duration-200"
            >
              {/* Mini 3D interactive showcase model */}
              <CandleModel
                preview={false}
                type={candle.type}
                color={candle.color}
              />

              {/* Candle Name, if more than 25 character display "..." at the end */}
              <h3 className="absolute left-4 bottom-4 text-sm font-medium text-neutral-800 dark:text-white truncate">
                {candle.name.length > 25
                  ? `${candle.name.slice(0, 35)}...`
                  : candle.name}
              </h3>

              {/* View button */}
              <div className="absolute bottom-2 right-2">
                <button
                  // Open candle in canvas
                  onClick={() => useOpenCandle(candle.id, setLoading, router)}
                  className="text-neutral-500 dark:text-neutral-200 p-2 hover:rotate-180 transition duration-500"
                >
                  <IconEye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ThemeToggle className="absolute bottom-7 right-7" /> {/* Theme Toggle */}
    </div>
  );
}
