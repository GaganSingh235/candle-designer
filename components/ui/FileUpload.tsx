// Importing necessary libraries & Components
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

// Define exported FileUpload component
export default function FileUpload({
  // Parameters
  onChange,
  className,
}: {
  // TypeScript parameter types
  onChange?: (file: File) => void;
  className?: string;
}) {
  // States to hold uploaded file and its preview URL
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to generate an object URL for preview when a file is set
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Cleanup function to revoke the object URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]); // Re-run effect when file dependecy changes

  // Function to handle file selection
  const handleFileChange = (newFile: File) => {
    setFile(newFile);
    if (onChange) onChange(newFile);
  };

  // Configuring dropzone for file drag-and-drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false, // Accept only one file
    noClick: true, // Prevent auto file dialog on click
    accept: { "image/*": [] }, // Accept only image files
    onDrop: (files) => files && handleFileChange(files[0]), // Handle dropped file
  });

  return (
    <div className={`w-full ${className}`} {...getRootProps()}>
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        whileHover="animate"
        className="pt-1 pb-5 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        {/* Hidden file input for selecting files */}
        <input
          {...getInputProps()}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            // Handle files when uploaded
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="flex items-center justify-center">
          <div className="relative w-full">
            {preview ? (
              // Show preview of avatar when uploaded
              <motion.div className="flex items-center justify-center mt-4">
                <motion.img
                  src={preview}
                  alt="Uploaded file preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </motion.div>
            ) : (
              <>
                {/* Animated upload box */}
                <motion.div
                  variants={{
                    initial: { x: 0, y: 0 },
                    animate: { x: 20, y: -20 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="relative z-50 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[18rem] mx-auto rounded-xl shadow-2xl"
                >
                  {/* Display "Drop Image" when file is dragged over */}
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop Image
                    </motion.p>
                  ) : (
                    // Show upload icon when idle
                    <IconUpload className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>

                {/* Dashed border around upload box */}
                <motion.div
                  variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                  }}
                  className="absolute border border-dashed border-black dark:border-white inset-0 z-40 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[18rem] mx-auto rounded-xl"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
