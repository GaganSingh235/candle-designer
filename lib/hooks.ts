// Import necessary libraries and dependencies
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase";

const supabase = createClient(); // Create supabase connection instance

// Define exported useClickOutside hook
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>, // First reference
  ref2: React.RefObject<HTMLElement | null>, // Second reference
  callback: () => void // Function to execute when clicking outside both elements
) {
  useEffect(() => {
    // Handle clicks outside specified elements
    function handleClickOutside(event: MouseEvent) {
      // Check if both refs exist and the clicked target is outside both elements
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        ref2.current &&
        !ref2.current.contains(event.target as Node)
      ) {
        callback(); // Execute provided callback function
      }
    }

    // Event listener to detect clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup to remove event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, ref2, callback]); // Re-run effect if any parameters change
}

// Define exported useRetrieveCandles hook
export function useRetrieveCandles({
  // Parameters
  category,
  setCandles, // Candle Information
}: {
  // TypeScript Paramter Types
  category: string;
  setCandles: React.Dispatch<
    React.SetStateAction<
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
    >
  >;
}) {
  // Effect to fetch Candles
  useEffect(() => {
    const fetchCandles = async () => {
      // Alert error is user not authenticated
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return alert("User not authenticated.");
      }

      // Select authenticated user's candles from database from a category
      const { data: candlesData, error: candlesError } = await supabase
        .from("candles")
        .select("id, name, type, color, scent, decor, is_current, category")
        .eq("user_id", userData.user.id)
        .eq("category", category);

      // Return alert error if fail to fetch candles
      if (!candlesData || candlesError) {
        return alert(`Error fetching candles: ${candlesError.message}`);
      }

      // Otherwise store fetched candles
      setCandles(candlesData);
    };
    fetchCandles(); // Fetch Candles

    // Subscribe to Supabase real-time with unique channel
    const channel = supabase
      .channel(
        // Generate unique channel name based on authenticated user's ID
        `candles-${supabase.auth.getUser().then((res) => res.data?.user?.id)}`
      )
      .on(
        // Listen for changes in "candles" table within "public" schema
        "postgres_changes",
        { event: "*", schema: "public", table: "candles" },
        (payload) => {
          // Update candles state based o event type
          setCandles((prevCandles) => {
            if (!payload.new) return prevCandles; // Return current state if no new data

            switch (payload.eventType) {
              case "INSERT":
                // Add new candle to the list
                return [
                  ...prevCandles,
                  payload.new as (typeof prevCandles)[number],
                ];

              case "UPDATE":
                // Update modified candle and filter based on current category
                return prevCandles
                  .map((candle) =>
                    candle.id === payload.new.id
                      ? (payload.new as (typeof prevCandles)[number])
                      : candle
                  )
                  .filter((candle) => candle.category === category);

              case "DELETE":
                // Remove deleted candle from the list
                return prevCandles.filter(
                  (candle) => candle.id !== payload.old?.id
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
  }, [category, setCandles]);
}

// Define exported useOpenCandle hook
export async function useOpenCandle(
  // Parameters and types
  candleId: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>
) {
  // Return alert error is user not authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return alert("User not authenticated.");
  }

  // Update previous user's is_current candles to false
  const { error: resetError } = await supabase
    .from("candles")
    .update({ is_current: false })
    .eq("user_id", userData.user.id);

  // Return alert error if failed to update
  if (resetError) {
    return alert(`Error resetting current candle: ${resetError.message}`);
  }

  // Update this candle to be current
  const { error: updateError } = await supabase
    .from("candles")
    .update({ is_current: true })
    .eq("user_id", userData.user.id)
    .eq("id", candleId);

  // Return alert error if failed to update
  if (updateError) {
    return alert(`Error opening selected candle: ${updateError.message}`);
  }

  // Otherwise star loading and redirect to candle-canvas page
  setLoading(true);
  router.push("/candle-canvas");
}

// Define exported useRenameCandle hook
export async function useRenameCandle(
  // Parameters and types
  candleId: string,
  newName: string
) {
  // Return alert error if no new name entered
  if (!newName.trim()) return alert("Candle name cannot be empty.");

  // Return alert error is user not authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return alert("User not authenticated.");
  }

  // Check if candles already exist in the table with new name
  const { data: existingCandles, error: nameCheckError } = await supabase
    .from("candles")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("name", newName)
    .neq("id", candleId);

  // Return alert error if failed to check
  if (nameCheckError) {
    return alert(`Error checking candle name: ${nameCheckError.message}`);
  }

  // Return alert error if candle(s) exist with new name
  if (existingCandles && existingCandles.length > 0) {
    return alert("A candle with this name already exists.");
  }

  // Update selected candle's name to be new name
  const { error } = await supabase
    .from("candles")
    .update({ name: newName })
    .eq("user_id", userData.user.id)
    .eq("id", candleId);

  // Return alert error if failed to update
  if (error) {
    return alert(`Error renaming candle: ${error.message}`);
  }
}

// Define exported useUpdateCandleCategory hook
export async function useUpdateCandleCategory(
  // Parameters and types
  candleId: string,
  newCategory: string
) {
  // Return alert error is user not authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return alert("User not authenticated.");
  }

  // Update category to newCatroy for selected candle
  const { error } = await supabase
    .from("candles")
    .update({ category: newCategory })
    .eq("user_id", userData.user.id)
    .eq("id", candleId);

  // Return alert error if failed to update
  if (error) {
    alert(`Error updating candle category: ${error.message}`);
  }
}

// Define exported usePermanentlyTrashCandle hook
export async function usePermanentlyTrashCandle(
  // Parameters and types
  candleId: string
) {
  // Return alert error is user not authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return alert("User not authenticated.");
  }

  // Dekete selected candle from table
  const { error } = await supabase
    .from("candles")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("id", candleId);

  // Return alert error if failed to delete
  if (error) {
    return alert(`Error deleting candle: ${error}`);
  }
}

// Define exported useExportCandle hook
export async function useExportCandle(
  // Parameter and type
  candleId: string
) {
  // Return alert error is user not authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return alert("User not authenticated.");
  }

  // Fetch selected candle as a single object
  const { data: candleData, error: fetchError } = await supabase
    .from("candles")
    .select("*")
    .eq("user_id", userData.user.id)
    .eq("id", candleId)
    .single(); // Returns as single object

  // Return alert error if dailed to fetch candle
  if (fetchError) {
    return alert(`Error fetching candle: ${fetchError?.message}`);
  }

  // Send POST request to API endpoint to send candle data email
  const response = await fetch("/api/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Indicate request body contains JSON data
    },
    body: JSON.stringify({
      email: userData.user.email, // User's email in request payload
      candleData, // Candle data to be sent
    }),
  });

  // Parse the response as JSON
  const result = await response.json();

  // Display success / error alert based on response status
  alert(
    response.ok
      ? "Candle Exported Successfully. Check your email!"
      : `Error exporting candle: ${result.error}`
  );
}
