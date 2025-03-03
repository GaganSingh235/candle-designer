"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import {
  Searched,
  Candles,
  Starred,
  Trashed,
  Exported,
} from "@/components/Categories";
import { useClickOutside } from "@/lib/hooks";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconMenu2,
  IconX,
  IconSend,
  IconCandle,
  IconTrash,
  IconStar,
  IconChevronDown,
  IconLogout,
  IconUserOff,
  IconSearch,
  IconKey,
  IconUserCircle,
  IconLabel,
} from "@tabler/icons-react";
import Logo from "@/components/ui/Logo";
import Button from "./ui/Button";
import ThemeToggle from "./ui/ThemeToggle";
import FileUpload from "./ui/FileUpload";
import PasswordField from "./ui/PasswordField";

// Define Exported Dashboard Component
export default function Dashboard() {
  // Active category tracker
  const [activeCategory, setActiveCategory] = useState("Candles");
  const [searchQuery, setSearchQuery] = useState(""); // Search query tracker

  // Set active category with default being 'Candles'
  const ActiveComponent =
    {
      Searched,
      Candles,
      Starred,
      Trashed,
      Exported,
    }[activeCategory] || Candles;

  return (
    // Display SidebarLayout
    <SidebarLayout
      onCategoryChange={setActiveCategory}
      activeCategory={activeCategory}
      onSearchQueryChange={setSearchQuery}
    >
      <ActiveComponent searchQuery={searchQuery} /> {/* Show active category */}
    </SidebarLayout>
  );
}

// Define Sidebar Layout Component
function SidebarLayout({
  className, // className for extra styles
  children, // Content
  activeCategory,
  onCategoryChange,
  onSearchQueryChange,
}: {
  // TypeScript parameter types
  className?: string;
  children: React.ReactNode;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchQueryChange: (searchQuery: string) => void;
}) {
  const router = useRouter(); // page router
  const supabase = createClient(); // establish supabase connection
  const [error, setError] = useState(""); // error state tracker

  const [accountOpen, setAccountOpen] = useState(false); // Display account menu state
  const [changeAvatarOpen, setChangeAvatarOpen] = useState(false); // Display avatar modal state
  const [changeNameOpen, setChangeNameOpen] = useState(false); // Change Name modal state
  const [confirmSignOut, setConfirmSignOut] = useState(false); // Confirm logout modal state

  const dropdownRef = useRef<HTMLDivElement | null>(null); // Reference to dropdown container
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Reference to dropdown toggle button
  // Hook to detect clicks outside dropdown and button
  useClickOutside(dropdownRef, buttonRef, () => {
    setAccountOpen(false); // Close dropdown when click outside
  });

  const [confirmDelete, setConfirmDelete] = useState(""); // Confirm delete account state
  const [firstName, setFirstName] = useState(""); // New first name tracker
  const [lastName, setLastName] = useState(""); // New Last name tracker

  // Store user data
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    avatar: "",
  });

  // Fetch user data from supabase auth table and store to userData
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: authData } = await supabase.auth.getUser();

      // Return error if user not authenticated
      if (!authData?.user?.id) {
        return setError("User not authenticated.");
      }

      setUserData((prev) => ({
        ...prev,
        email: authData.user.email ?? prev.email,
        name: authData.user.user_metadata?.full_name ?? prev.name,
        avatar: authData.user.user_metadata?.avatar_url ?? prev.avatar,
      }));
    };
    fetchUserData();
  }, [supabase]); // Re-run effect if any change in Supabase

  const [confirmResetOpen, setConfirmResetOpen] = useState(false); // Open reset password modal state
  // Pasword trackers
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Hover state tracker
  const [hovered, setHovered] = useState<string | null>(null);

  // Reset password function logic
  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page refresh
    setError(""); // Set errors to empty

    // Set input variable to empty each time
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    // Return error if fields left empty
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return setError("All fields must be filled in.");
    }

    // Check new password length and security
    if (
      newPassword.length < 8 ||
      !/[!@#$%^&*()-=_+,.<>/?'":;{}|]/.test(newPassword)
    ) {
      // Return error if invalid
      return setError(
        "New password must be at least 8 characters long and contain a special character."
      );
    }

    // Check is new password matched the confirm new password
    if (newPassword !== confirmNewPassword) {
      return setError("New passwords do not match."); // return error if invalid
    }

    // Retrieve use from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Attempt sign-in with user old password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: oldPassword,
    });

    // Return error if old password incorrect
    if (signInError) {
      return setError("Old password is incorrect.");
    }

    // Otherwise, update user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    // Return error if failed to update
    if (updateError) {
      return setError("Failed to update password. Please try again.");
    }

    router.push("/login"); // Otherwise, redirect to login page
  };

  // Open delete account modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Delete user function logic
  const deleteUser = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page refresh

    if (confirmDelete !== "DELETE") return; // Return if "DELETE" has not been entered

    // Retrieve user from Supavase
    const { data, error } = await supabase.auth.getUser();
    // Return error if failed to retrieve user
    if (error || !data.user) return setError("Failed to retrieve user.");

    // Connecting to deleteUser api
    const response = await fetch("/api/deleteUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.user.id }), // Convert object userId into JSON string
    });

    const result = await response.json(); // Storing the result of the response

    if (response.ok) {
      router.push("/login"); // Redirect to login page if response is successful
    } else {
      return setError(`Error: ${result.error}`); // Otherwise return error
    }
  };

  const [file, setFile] = useState<File | null>(null); // File tracker for avatar

  // Change avatar function logic
  const changeAvatar = async () => {
    if (!file) return alert("Please select an image"); // Return alert if no file selected

    // Configuring filepath to match Supabase bucket storage filepath
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Attempot to upload avatar to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    // Return alert error if fail to upload avatar to Supabase storage
    if (uploadError) {
      return alert(`Error uploading avatar: ${uploadError.message}`);
    }

    // Retrieve avatar url from Supabase storage
    const { data: publicURLData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    //
    const avatarUrl = publicURLData.publicUrl; // Store avatar url

    // Attempt to update User avatar using Supabase
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl, picture: avatarUrl },
    });

    // Return alert error if failed to update
    if (error) {
      return alert(`Error updating avatar: ${error}`);
    }

    setChangeAvatarOpen(false); // Close modal
    window.location.reload(); // Reload window to see changes
  };

  // Define category names and icons
  const categories = [
    {
      label: "Candles",
      icon: (
        <IconCandle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Starred",
      icon: (
        <IconStar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Trashed",
      icon: (
        <IconTrash className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Exported",
      icon: (
        <IconSend className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const showSearchCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchQueryChange(value);
    if (value !== "" && activeCategory !== "Searched") {
      onCategoryChange("Searched");
    } else if (value === "" && activeCategory === "Searched") {
      onCategoryChange("Candles");
    }
  };

  return (
    <div
      className={`mx-auto flex w-full flex-1 flex-col border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 md:flex-row h-screen ${className}`}
    >
      {/* Display Sidebar */}
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        onSearchQueryChange={onSearchQueryChange}
        className="justify-between gap-10"
      >
        <div className="flex flex-1 flex-col">
          {/* Display Logo */}
          <Logo
            className="absolute top-1 left-1"
            src="/logo/icon.webp"
            width={50}
            withText
          />
          <div className="mt-6 flex flex-col">
            {/* Searchbar */}
            <div className="relative rounded-lg z-20 hidden md:flex items-center justify-start mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-700 dark:text-neutral-200">
                <IconSearch className="h-5 w-5" /> {/* Searchbar Icon */}
              </span>
              {/* Searchbar Input */}
              <input
                name="search"
                type="text"
                onChange={showSearchCategory}
                placeholder="Search Candles"
                className="block w-full h-12 bg-neutral-300 md:bg-white dark:bg-neutral-900 pl-11 pr-4 py-1.5 rounded-lg border-0 text-black dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
              />
            </div>

            {/* Display each category in the Sidebar */}
            {categories.map((category, idx) => {
              // Creating id that acts as a unique key for each Category
              const id = `primary-link-${idx}`;

              return (
                <button
                  key={id}
                  onClick={() => onCategoryChange(category.label)}
                  className="group/sidebar relative px-4 py-2 w-full text-left"
                  onMouseEnter={() => setHovered(id)} // Track hover over category
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Animate the background highlight on active category */}
                  {(hovered === id || activeCategory === category.label) && (
                    <motion.div
                      layoutId="hovered-sidebar-link"
                      className="absolute inset-0 z-10 rounded-lg bg-neutral-200 dark:bg-neutral-700"
                    />
                  )}
                  <div className="relative z-20 flex items-center justify-start gap-2 py-2">
                    {category.icon} {/* Display Category Icon */}
                    <span className="text-sm text-neutral-700 transition duration-200 group-hover/sidebar:translate-x-1 dark:text-neutral-200">
                      {category.label} {/* Display Category Name */}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Account profile dropdown reference */}
        <div className="relative group/profile" ref={dropdownRef}>
          <button
            ref={buttonRef}
            onClick={() => setAccountOpen((prev) => !prev)}
            className="flex group/profile justify-between items-center w-full pl-3 p-3 py-3 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Image // Profile Image
                src={userData.avatar ? userData.avatar : "/user.png"}
                className="h-10 w-10 rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                width={50}
                height={50}
                alt="Avatar" // Text if image unable to load
              />
              <div className="flex flex-col items-start">
                <span className="text-sm pl-2 font-medium text-neutral-700 dark:text-neutral-200 group-hover/profile:translate-x-1 transition duration-200">
                  {/* Display user name, or "Loading..." */}
                  {userData.name || "Loading..."}{" "}
                </span>
                <span className="text-xs pl-2 font-light text-neutral-700 dark:text-neutral-400 group-hover/profile:translate-x-1 transition duration-200">
                  {/* Display user email, or "Loading..." */}
                  {userData.email
                    ? // If email is longer than 20 characters, "..." will be displayed at the end
                      userData.email.length > 20
                      ? `${userData.email.slice(0, 20)}...`
                      : userData.email
                    : "Loading..."}
                </span>
              </div>
            </div>
            <motion.span
              animate={{ rotate: accountOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {/* Animated icon indicating dropdown */}
              <IconChevronDown className="h-4 w-4 text-black dark:text-white" />
            </motion.span>
          </button>

          {/* Account Settings Dropdown */}
          <AnimatePresence>
            {" "}
            {/* Smoothly Animate on appear and exit */}
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute bottom-full mb-2 w-full rounded-lg bg-neutral-200 md:bg-white text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:bg-neutral-900"
              >
                <ul className="py-1 text-sm">
                  <li className="flex items-start mx-1 px-4 py-2 mb-1">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {/* Display user name, or "Loading..." */}
                        {userData.name || "Loading..."}{" "}
                      </span>
                      <span className="text-xs font-light text-neutral-700 dark:text-neutral-400">
                        {/* Display user email, or "Loading..." */}
                        {userData.email
                          ? // If email is longer than 20 characters, "..." will be displayed at the end
                            userData.email.length > 20
                            ? `${userData.email.slice(0, 20)}...`
                            : userData.email
                          : "Loading..."}
                      </span>
                    </div>
                  </li>

                  {/* Gradient Line Divider */}
                  <div
                    className="w-full border-[0.5px] border-neutral-200 dark:border-neutral-800"
                    style={{
                      // Most Browsers Compatible
                      maskImage:
                        "linear-gradient(to right, transparent, white 20%, white 80%, transparent)",
                      // Safari Compatible
                      WebkitMaskImage:
                        "linear-gradient(to right, transparent, white 20%, white 80%, transparent)",
                    }}
                  />

                  {/* Delete account button */}
                  <button
                    onClick={() => setConfirmDeleteOpen(true)} // Display delete account modal when clicked
                    className="w-[97%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 my-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                  >
                    <IconUserOff className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    Delete Account
                  </button>
                  {/* Reset password button */}
                  <button
                    onClick={() => setConfirmResetOpen(true)} // Display reset password modal when clicked
                    className="w-[97%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 mb-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                  >
                    <IconKey className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    Reset Password
                  </button>
                  {/* Change Avatar button */}
                  <button
                    onClick={() => setChangeAvatarOpen(true)} // Display avatar modal when clicked
                    className="w-[97%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 mb-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                  >
                    <IconUserCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    Change Avatar
                  </button>
                  {/* Chaneg name button */}
                  <button
                    onClick={() => setChangeNameOpen(true)} // Display change name modal when clicked
                    className="w-[97%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 mb-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                  >
                    <IconLabel className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    Change Name
                  </button>
                  {/* Logout button */}
                  <button
                    onClick={() => setConfirmSignOut(true)} // Display logout modal when clicked
                    className="w-[97%] flex items-center gap-3 text-neutral-700 dark:text-neutral-200 mx-1 rounded-md px-4 py-2 mt-1 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800"
                  >
                    <IconLogout className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    Logout
                  </button>
                </ul>

                {/* Reset Password Modal */}
                {confirmResetOpen && (
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
                      {/* Modal Title */}
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Reset Password
                      </h2>

                      {/* X icon to close modal */}
                      <IconX
                        className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                        onClick={() => setConfirmResetOpen(false)}
                      />

                      {/* Reset password form */}
                      <form onSubmit={resetPassword} className="space-y-4">
                        {/* Old Password Input */}
                        <PasswordField
                          password={oldPassword}
                          setPassword={setOldPassword}
                          showPassword={showOldPassword}
                          setShowPassword={setShowOldPassword}
                          label
                          labelText="Old Password"
                        />

                        {/* New Password Input */}
                        <PasswordField
                          password={newPassword}
                          setPassword={setNewPassword}
                          showPassword={showNewPassword}
                          setShowPassword={setShowNewPassword}
                          label
                          labelText="New Password"
                        />

                        {/* Confirm New Password Input */}
                        <PasswordField
                          password={confirmNewPassword}
                          setPassword={setConfirmNewPassword}
                          showPassword={showConfirmNewPassword}
                          setShowPassword={setShowConfirmNewPassword}
                          label
                          labelText="Confirm New Password"
                        />

                        {/* Display any errors */}
                        {error && (
                          <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                        {/* Reset Password button */}
                        <Button
                          onClick={resetPassword} // Call resetPassword function when clicked
                          className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                          color="whiteBlack"
                        >
                          Reset Password
                        </Button>
                      </form>
                    </motion.div>
                    <ThemeToggle /> {/* Theme Toggle */}
                  </motion.div>
                )}

                {/* Delete Account Modal */}
                {confirmDeleteOpen && (
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
                      {/* Modal Title */}
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Delete Account
                      </h2>

                      {/* Confirmation text */}
                      <p className="text-black dark:text-neutral-400 text-sm">
                        Deleting your account will remove all of your
                        information from our database. This cannot be undone.
                      </p>

                      {/* X icon to close modal */}
                      <IconX
                        className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                        onClick={() => setConfirmDeleteOpen(false)}
                      />

                      <label className="block text-sm leading-6 text-neutral-700 dark:text-neutral-400 mt-2">
                        To confirm this, type &quot;
                        <span className="font-bold">DELETE</span>&quot;
                      </label>
                      {/* Delete account form */}
                      <form
                        onSubmit={deleteUser}
                        className="flex flex-row gap-4"
                      >
                        <div className="w-64">
                          {/* Input to confirm account deletion */}
                          <input
                            value={confirmDelete}
                            onChange={(e) => setConfirmDelete(e.target.value)} // Update confirmDelete
                            className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 my-2"
                            required
                          />
                        </div>
                        {/* Delete account button */}
                        <Button
                          onClick={deleteUser} // Call deleteUser function when clicked
                          className="w-36 h-full text-sm my-2 px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                          color="whiteBlack"
                        >
                          Delete
                        </Button>
                      </form>
                    </motion.div>
                    <ThemeToggle /> {/* Theme Toggle */}
                  </motion.div>
                )}

                {changeAvatarOpen && (
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
                        Change Avatar
                      </h2>

                      <IconX
                        className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                        onClick={() => setChangeAvatarOpen(false)}
                      />

                      <p className="text-neutral-400">
                        Drop your files here or click to upload
                      </p>

                      <FileUpload
                        onChange={(file) => setFile(file)}
                        className="mb-2"
                      />
                      {error && (
                        <p className="text-red-500 text-sm my-2">{error}</p>
                      )}

                      <Button
                        onClick={changeAvatar}
                        className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                        color="whiteBlack"
                      >
                        Confirm Change
                      </Button>
                    </motion.div>
                    <ThemeToggle />
                  </motion.div>
                )}

                {/* Change name modal */}
                {changeNameOpen && (
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
                        Change Name
                      </h2>

                      {/* X icon to close modal */}
                      <IconX
                        className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 text-black dark:text-white"
                        onClick={() => setChangeNameOpen(false)}
                      />

                      {/* Change name form */}
                      <form onSubmit={deleteUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="first-name"
                              className="block text-sm font-medium leading-6 text-neutral-700 dark:text-white"
                            >
                              First Name
                            </label>
                            {/* new firstName input */}
                            <div className="mt-2">
                              <input
                                id="first-name"
                                name="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)} // Update firstName
                                placeholder="John"
                                className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="last-name"
                              className="block text-sm font-medium leading-6 text-neutral-700 dark:text-white"
                            >
                              Last Name
                            </label>
                            {/* New lastName input */}
                            <div className="mt-2">
                              <input
                                id="last-name"
                                name="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)} // Update lastName
                                placeholder="Doe"
                                className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 mb-2"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        {/* Change name button */}
                        <Button
                          onClick={async () => {
                            // Update user's firstName and lastName in supabase
                            await supabase.auth.updateUser({
                              data: {
                                full_name: `${firstName} ${lastName}`,
                              },
                            });
                            setChangeNameOpen(false); // Close modal
                            window.location.reload(); // Reload page to show updates
                          }}
                          className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                          color="whiteBlack"
                        >
                          Confirm Change
                        </Button>
                      </form>
                    </motion.div>
                    <ThemeToggle /> {/* Theme Toggle */}
                  </motion.div>
                )}

                {/* Logout modal */}
                {confirmSignOut && (
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
                        Logout Confirmation
                      </h2>

                      {/* Confirmation text */}
                      <p className="text-sm text-black dark:text-neutral-400 mb-4">
                        Are you sure you want to logout?
                      </p>

                      {/* X icon to close modal */}
                      <IconX
                        className="absolute top-6 right-5 hover:rotate-90 cursor-pointer transition duration-300 mb-2 text-black dark:text-white"
                        onClick={() => setConfirmSignOut(false)}
                      />

                      {/* Logout Button */}
                      <Button
                        onClick={async () => {
                          await supabase.auth.signOut(); // Sign out user with Supabase
                          router.push("/login"); // Redirect to login page
                        }}
                        className="w-full text-sm px-4 py-2 bg-[#334CB5] dark:bg-white text-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-white"
                        color="whiteBlack"
                      >
                        Yes, Logout
                      </Button>
                    </motion.div>
                    <ThemeToggle /> {/* Theme Toggle */}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ThemeToggle /> {/* Theme Toggle */}
      </Sidebar>
      {children}
    </div>
  );
}

// Define Sidebar Component
function Sidebar({
  className, // className for extra styles
  children, // Content
  activeCategory,
  onCategoryChange, //Category tracker
  onSearchQueryChange, // Search query tacker
}: {
  // TypeScript Parameter Types
  className?: string;
  children?: React.ReactNode;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchQueryChange: (searchQuery: string) => void;
}) {
  const [open, setOpen] = useState(false); // Mobile navigation open state

  // Function
  const showSearchCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Input value
    onSearchQueryChange(value); // Update search query

    // Switch active category to "Searched" if somthing is being searched
    if (value !== "" && activeCategory !== "Searched") {
      onCategoryChange("Searched");
      // If nothing is searched go back to "Candles" category
    } else if (value === "" && activeCategory === "Searched") {
      onCategoryChange("Candles");
    }
  };

  return (
    <>
      <motion.div
        className={`hidden h-full w-[300px] flex-shrink-0 bg-neutral-100 px-4 py-4 dark:bg-neutral-800 md:flex md:flex-col border-r border-neutral-200 dark:border-neutral-700 ${className}`}
      >
        {children} {/* Content */}
      </motion.div>

      <div className="fixed z-50 flex h-28 w-full flex-row items-center justify-between bg-neutral-100 px-4 dark:bg-neutral-800 md:hidden border-b dark:border-neutral-700 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex w-full justify-end">
          {/* Mobile Searchbar */}
          <div className="absolute w-[76%] left-5 top-7 rounded-lg z-20 flex items-center justify-start mb-5">
            <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-neutral-700 dark:text-neutral-200">
              <IconSearch />
            </span>
            {/* Searchbar input */}
            <input
              name="search"
              type="text"
              onChange={showSearchCategory} // Call search logic
              placeholder="Search Candles"
              className="ml-1 block w-full h-12 bg-neutral-100 md:bg-white dark:bg-neutral-800 pl-10 pr-4 py-1.5 rounded-lg text-black dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
            />
          </div>
          <IconMenu2
            className="text-neutral-700 dark:text-neutral-200 relative right-2"
            onClick={() => setOpen(true)}
          />
        </div>

        {/* Mobile Sidebar Navigation  */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[90] bg-black/50"
                onClick={() => setOpen(false)} // Exit sidebar when press outside
              />
              {/* Sidebar animates smoothly from left into the sceen */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed inset-0 z-[100] flex h-full w-[75%] border-r dark:border-r-neutral-700 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex-col justify-between bg-white p-4 dark:bg-neutral-800 sm:p-10 rounded-tr-3xl rounded-br-3xl ${className}`}
              >
                <div
                  className="absolute right-6 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                  onClick={() => setOpen(false)} // Exit sidebar when X is pressed
                >
                  <IconX />
                </div>
                {children} {/* Content */}
              </motion.div>
            </>
          )}
          <ThemeToggle /> {/* Theme Toggle */}
        </AnimatePresence>
      </div>
    </>
  );
}
