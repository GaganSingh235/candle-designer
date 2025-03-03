"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import CandleModel from "./ui/CandleModel";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconFileExport,
  IconSend,
  IconX,
  IconArrowBack,
} from "@tabler/icons-react";
import DesignBar from "./DesignBar";
import Logo from "./ui/Logo";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import ThemeToggle from "./ui/ThemeToggle";

export default function CandleCanvas() {
  const router = useRouter(); // Page router
  const supabase = createClient(); // Establish Supabase connection instance

  // Candle Data Informtion
  const [candleId, setCandleId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedScent, setSelectedScent] = useState("No Scent");
  const [selectedDecor, setSelectedDecor] = useState("No Decor");

  const [isExported, setIsExported] = useState(false);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [preview, setPreview] = useState(false); // Final Preview state

  // Effect for fetching candles from Supabase
  useEffect(() => {
    const fetchCandle = async () => {
      // REtrieve user from Supabase
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      // Return error is user not authenticated
      if (userError || !userData?.user) {
        return console.error("User not authenticated.");
      }

      const { data, error } = await supabase
        .from("candles") // From candles tabler
        .select("id, type, color, scent, decor, category") // Select columns
        .eq("user_id", userData.user.id) // Select from authorised user's candles
        .eq("is_current", true) // Select current candle
        .single(); // Return single object rather than arrary

      if (error) {
        return console.error("Error fetching candle data:", error);
      } else {
        setCandleId(data.id);
        setSelectedType(data.type);
        setSelectedColor(data.color);
        setSelectedScent(data.scent);
        setSelectedDecor(data.decor);
        setIsExported(data.category === "exported"); // Check if candle is exported
      }
    };
    fetchCandle();

    // Subscribe to real-time updates for the user's candles
    const channel = supabase
      // Unique channel for each user
      .channel(
        `candles-${supabase.auth.getUser().then((res) => res.data?.user?.id)}`
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "candles" },
        (payload) => {
          // Update state if the updated candle matches the current one
          if (payload.new.id === candleId) {
            setSelectedType(payload.new.type);
            setSelectedColor(payload.new.color);
            setSelectedScent(payload.new.scent);
            setSelectedDecor(payload.new.decor);
            setIsExported(payload.new.category === "exported"); // Check if candle is exported
          }
        }
      )
      .subscribe();

    // Cleanup function: remove the real-time subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [candleId, supabase]); // Re-run effect when candleId or supabase changes

  // Clear all function logic
  const clearAll = async () => {
    // Retrieve user and return error if not authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return console.error("User not authenticated.");
    }

    // Reset candle information to default
    const { error: updateError } = await supabase
      .from("candles")
      .update({
        color: "#ffffff",
        scent: "No Scent",
        decor: "No Decor",
      })
      .eq("user_id", userData.user.id)
      .eq("is_current", true);

    // Return error if fail to save candle
    if (updateError) {
      return console.error("Error saving candle:", updateError);
    }
  };

  // Save candle function logic
  const saveCandle = async () => {
    // Retrieve user and return error if not authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return console.error("User not authenticated.");
    }

    // Update candle information in Supabase
    const { error: updateError } = await supabase
      .from("candles")
      .update({
        color: selectedColor,
        scent: selectedScent,
        decor: selectedDecor,
      })
      .eq("user_id", userData.user.id)
      .eq("is_current", true);

    // Return error if fail to save candle
    if (updateError) {
      return console.error("Error saving candle:", updateError);
    }

    router.push("/"); // Redirect to dashboard
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-white dark:bg-neutral-900">
      {/* Logo at top left */}
      <div className="absolute top-0 left-0">
        <Logo
          className="absolute top-5 left-5"
          src="/logo/icon.webp"
          width={50}
          withText
        />
      </div>
      {/* Candle model */}
      {selectedType && (
        <CandleModel
          key={selectedType}
          preview={preview}
          type={selectedType}
          color={selectedColor}
        />
      )}
      {/* Cisplay design features only if candle is not exported */}
      {!isExported ? (
        <>
          {/* Design Bar */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: preview ? 200 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute bottom-0 w-full flex justify-center"
          >
            {/* Pass on customisation changes to detect */}
            <DesignBar
              onColorChange={setSelectedColor}
              onScentChange={setSelectedScent}
              onDecorChange={setSelectedDecor}
              onClearAll={clearAll}
              preview={preview}
            />
          </motion.div>

          {/* Confirm export button */}
          <motion.div
            onClick={() => setExportConfirmOpen(true)}
            initial={{ y: 0 }}
            animate={{ y: preview ? -150 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute -bottom-[7.5rem] w-full flex justify-center text-white dark:text-black"
          >
            <Button
              className="rounded-xl bg-white py-4 px-20"
              onClick={() => setExportConfirmOpen(true)}
            >
              Export Candle
            </Button>
          </motion.div>

          {/* X button to close preview */}
          <motion.button
            onClick={() => setPreview(false)}
            initial={{ y: -150 }}
            animate={{ y: preview ? 0 : -150 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute flex flex-row top-8 right-8 text-neutral-500 dark:text-white"
          >
            <IconX className="h-10 w-10" />
          </motion.button>

          {/* Top right action buttons */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: preview ? -150 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-7 right-7 flex items-center gap-4"
          >
            {/* Save Candle Button */}
            <Tooltip text="Save" position="bottom" disabled={false}>
              <Button
                className="rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-black dark:hover:bg-white text-neutral-500 dark:text-white hover:text-white dark:hover:text-black px-3 py-3"
                color="whiteBlack"
                onClick={saveCandle}
              >
                <span className="text-sm">
                  <IconFileExport className="h-5 w-5" />
                </span>
              </Button>
            </Tooltip>

            {/* Export preview button */}
            <Tooltip text="Export" position="bottom" disabled={false}>
              <Button
                onClick={() => setPreview(true)}
                className="rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-black dark:hover:bg-white text-neutral-500 dark:text-white hover:text-white px-3 py-3 dark:hover:text-black"
                color="whiteBlack"
              >
                <span className="text-sm">
                  <IconSend className="h-5 w-5" />
                </span>
              </Button>
            </Tooltip>
          </motion.div>

          {/* Export modal */}
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
                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Permanently Trash Candle
                  </h2>

                  {/* Confirmation */}
                  <p className="text-sm text-black dark:text-neutral-400 mb-2">
                    Exporting the candle cannot be undone and you won&apos;t be
                    able to edit the candle anymore. <br />
                  </p>
                  <p className="text-sm text-black dark:text-neutral-400 mb-4">
                    Are you sure you want to continue?
                  </p>

                  {/* X button to close export modal */}
                  <IconX
                    className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                    onClick={() =>
                      setExportConfirmOpen && setExportConfirmOpen(false)
                    }
                  />

                  {/* Export button */}
                  <Button
                    onClick={() => {
                      console.log("Exporting Candle!"); // Export logic will go here
                      router.push("/"); // Redirect to Dashboard
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
        </>
      ) : (
        // If candle is exported, display a "return" button
        <div className="absolute top-7 right-7">
          <Tooltip text="Return" position="bottom" disabled={false}>
            <Button
              className="rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-black dark:hover:bg-white text-neutral-500 dark:text-white hover:text-white dark:hover:text-black px-3 py-3"
              color="whiteBlack"
              onClick={() => router.push("/")}
            >
              <span className="text-sm">
                <IconArrowBack className="h-5 w-5" />
              </span>
            </Button>
          </Tooltip>
        </div>
      )}
      <ThemeToggle /> {/* Theme Toggle */}
    </div>
  );
}
