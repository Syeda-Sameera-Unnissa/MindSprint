"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setAge(data.age?.toString() || "");
        setGender(data.gender || "");
        setAvatar(data.avatar_url || "");
      }
    };

    loadProfile();
  }, []);

  const uploadAvatar = async () => {
    if (!file || !user) return avatar;

    const filePath = `${user.id}-${file.name}`;

    await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);

    let avatarUrl = avatar;

    if (file) {
      avatarUrl = await uploadAvatar();
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      await supabase
        .from("profiles")
        .update({
          name,
          age: Number(age),
          gender,
          avatar_url: avatarUrl,
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("profiles").insert([
        {
          user_id: user.id,
          name,
          age: Number(age),
          gender,
          avatar_url: avatarUrl,
        },
      ]);
    }

    setAvatar(avatarUrl);
    setFile(null);
    setLoading(false);

    alert("Profile saved ✅");
  };

  const resetPassword = async () => {
    if (!user?.email) return;

    await supabase.auth.resetPasswordForEmail(user.email);

    alert("Password reset email sent 📩");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold 
          bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
          text-transparent bg-clip-text">
          Your Profile
        </h1>
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative p-[1px] rounded-2xl 
        bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20
        transition-all duration-300 hover:scale-[1.01]"
      >

        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 
          bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
          transition duration-300 hover:opacity-20"></div>

        <div className="relative bg-[#0B0F1A]/80 backdrop-blur-xl 
          border border-white/10 p-8 rounded-2xl shadow-xl shadow-purple-500/10">

          {/* AVATAR */}
          <div className="flex flex-col items-center mb-6">

            <div className="relative">

              <div className="w-24 h-24 rounded-full overflow-hidden 
                border-2 border-purple-500 shadow-md">

                {avatar ? (
                  <img
                    src={avatar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-white/5">
                    No Image
                  </div>
                )}
              </div>

              <label className="absolute bottom-0 right-0 
                bg-gradient-to-r from-blue-500/30 to-purple-500/30
                text-white p-2 rounded-full cursor-pointer
                hover:scale-110 transition">

                +
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            {file && (
              <p className="text-xs text-gray-400 mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* FORM */}
          <div className="space-y-4">

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl 
              bg-white/5 border border-white/10 text-white
              focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />

            <input
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 rounded-xl 
              bg-white/5 border border-white/10 text-white"
            />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 rounded-xl 
              bg-white/5 border border-white/10 text-white"
            >
              <option value="">Select Gender</option>
              <option>Female</option>
              <option>Male</option>
            </select>

            <input
              value={user?.email || ""}
              disabled
              className="w-full p-3 rounded-xl 
              bg-white/5 border border-white/10 text-gray-400"
            />

          </div>

          {/* ACTIONS */}
          <div className="mt-6 space-y-3">

            <button
              onClick={saveProfile}
              disabled={loading}
              className="w-full p-3 rounded-xl 
              bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30
              border border-white/10
              hover:from-blue-500/50 hover:to-pink-500/50
              hover:scale-[1.02] active:scale-[0.97]
              transition-all duration-200 font-medium shadow-lg shadow-purple-500/20"
            >
              {loading ? "Saving..." : " 💾 Save Profile"}
            </button>

            <button
              onClick={resetPassword}
              className="w-full p-3 rounded-xl 
              bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30
              border border-white/10
              hover:from-blue-500/50 hover:to-pink-500/50
              hover:scale-[1.02] active:scale-[0.97]
              transition-all duration-200 font-medium shadow-lg shadow-purple-500/20"
            >
              ⟲ Reset Password
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
}