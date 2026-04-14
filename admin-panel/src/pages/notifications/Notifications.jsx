import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Send,
  Bell,
  User,
  Users,
  ShieldCheck,
  Image as ImageIcon,
  Search,
  Smartphone,
  CheckCircle2,
  Cross,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Notifications = () => {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    target: "all_users",
    token: "",
    topic: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (formData.target === "token") {
      fetchUsers();
    }
  }, [formData.target]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL || "http://localhost:8008/api"}/auth/all-users?limit=100`,
      );
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users list");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL || "http://localhost:8008/api"}/upload-media`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (user) => {
    if (!user.fcmToken) {
      toast.error(`${user.name || user.phone} has no registered device!`);
      return;
    }
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, token: user.fcmToken }));
    toast.success(`Selected ${user.name || user.phone}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.target === "token" && !formData.token) {
      toast.error("Please select a user with a registered device");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL || "http://localhost:8008/api"}/notifications/send`,
        formData,
      );
      if (response.data.success) {
        toast.success("Notification sent successfully!");
        setFormData({
          title: "",
          body: "",
          target: "all_users",
          token: "",
          topic: "",
          imageUrl: "",
        });
        setSelectedUser(null);
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send notification",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(search) ||
      u.phone?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-white font-bold flex items-center gap-3">
          <Bell className="text-white" /> Push Notifications
        </h1>
        <p className="text-slate-400 mt-2">
          Send push notifications to users, providers, or specific devices via
          FCM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6">
              <h2 className="text-xl font-semibold text-white">
                Create New Notification
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter title (e.g., Special Offer!)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Notification Image
                  </label>
                  <div className="relative">
                    {formData.imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden aspect-video border-2 border-slate-100 bg-slate-50">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, imageUrl: "" }))}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Cross size={16} className="rotate-45" />
                        </button>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-xs text-slate-500">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="text-slate-400 mb-2" size={24} />
                            <span className="text-xs text-slate-500 font-medium">Click to select image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Notification Message
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter message content..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider block">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: "all_users", label: "All Users", icon: Users },
                    {
                      id: "all_providers",
                      label: "All Providers",
                      icon: ShieldCheck,
                    },
                    { id: "token", label: "Specific User", icon: User },
                    // { id: "topic", label: "Custom Topic", icon: Bell },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, target: item.id }))
                      }
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                        formData.target === item.id
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                          : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                      }`}
                    >
                      <item.icon size={24} className="mb-2" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.target === "token" && selectedUser && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {(selectedUser.name || selectedUser.phone)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-blue-900">
                        {selectedUser.name || "Unnamed User"}
                      </p>
                      <p className="text-xs text-blue-700 uppercase tracking-tighter">
                        {selectedUser.phone}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
              )}

              {formData.target === "topic" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="Enter FCM Topic (e.g., promotions)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send size={20} /> Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Selection List (Side Section) */}
        {formData.target === "token" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Search size={18} className="text-blue-600" /> Select
                  Recipient
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={16}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {fetchingUsers ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm">Loading users...</p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between text-left ${
                        selectedUser?.id === user.id
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "border-slate-50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.fcmToken ? "bg-blue-600" : "bg-slate-300"}`}
                        >
                          {(user.name || user.phone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${selectedUser?.id === user.id ? "text-blue-900" : "text-slate-700"}`}
                          >
                            {user.name || "Unnamed"}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                      <div>
                        {user.fcmToken ? (
                          <Smartphone size={16} className="text-green-500" />
                        ) : (
                          <Cross size={16} className="text-slate-300" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Users className="mx-auto text-slate-200 mb-2" size={40} />
                    <p className="text-sm text-slate-400">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <h3 className="text-blue-800 font-bold flex items-center gap-2 mb-2">
          💡 Quick Tips
        </h3>
        <ul className="text-blue-700/80 text-sm space-y-1 ml-6 list-disc">
          <li>
            Users must have a registered device (indicated by{" "}
            <Smartphone size={14} className="inline inline-block" />) to receive
            notifications.
          </li>
          <li>
            Specific User selection is great for personalized messages or
            testing.
          </li>
          <li>
            Use <strong>All Providers</strong> to announce new policy updates or
            app improvements to your service team.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
