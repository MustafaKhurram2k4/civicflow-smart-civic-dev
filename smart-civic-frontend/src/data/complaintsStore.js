// -----------------------------------------------------------------------------
// complaintsStore.js — User session & MongoDB complaint data synchronization
// -----------------------------------------------------------------------------

const STORAGE_KEY = "civicflow_complaints_v1";
const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api/complaints`;

function normalizeCategory(category, customCategory) {
  if (category === "Pothole / Road") return { category: "Pothole", custom_category: customCategory || null };
  if (category === "Garbage / Waste") return { category: "Garbage", custom_category: customCategory || null };
  if (category === "Streetlight" || category === "Water Supply" || category === "Drainage") {
    return { category: "Other", custom_category: customCategory || category };
  }
  if (["Road Damage", "Garbage", "Pothole", "Other"].includes(category)) {
    return { category, custom_category: customCategory || null };
  }
  return { category: "Other", custom_category: customCategory || category || null };
}

function normalizeComplaint(item) {
  const normalized = normalizeCategory(item.category, item.custom_category);
  return { ...item, ...normalized };
}

const DEFAULT_COMPLAINTS = [];

// Get current logged-in user from localStorage
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("civic_user");
    if (!raw) return { name: "Citizen", role: "citizen", email: "" };
    return JSON.parse(raw);
  } catch {
    return { name: "Citizen", role: "citizen", email: "" };
  }
}

// Generate dynamic time-based greeting (Good morning / afternoon / evening)
export function getTimeGreeting(userName) {
  const hour = new Date().getHours();
  let timeStr = "Good morning";
  if (hour >= 12 && hour < 17) {
    timeStr = "Good afternoon";
  } else if (hour >= 17 || hour < 5) {
    timeStr = "Good evening";
  }
  const name = userName || getCurrentUser().name || "User";
  return `${timeStr}, ${name}`;
}

// Get all stored complaints from localStorage (synced with MongoDB)
export function getAllComplaints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPLAINTS));
      return DEFAULT_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeComplaint) : DEFAULT_COMPLAINTS;
  } catch {
    return DEFAULT_COMPLAINTS;
  }
}

// Get complaints filtered for the current user's session
export function getUserComplaints(user = getCurrentUser()) {
  const all = getAllComplaints();
  
  // Admins see all municipal complaints
  if (user?.role === "admin") {
    return all;
  }

  return all.filter(
    (c) =>
      (user?.email && c.created_by_email?.toLowerCase() === user.email.toLowerCase()) ||
      (user?.name && c.created_by?.toLowerCase() === user.name.toLowerCase())
  );
}

// Asynchronously fetch complaints from FastAPI MongoDB backend
export async function syncComplaintsFromDB(user = getCurrentUser()) {
  try {
    const url = user?.role === "admin"
      ? API_BASE
      : (user?.email ? `${API_BASE}?created_by_email=${encodeURIComponent(user.email)}` : API_BASE);
    
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Merge with local storage
        const currentLocal = getAllComplaints();
        const mergedMap = new Map();
        [...currentLocal, ...data.map(normalizeComplaint)].forEach(item => mergedMap.set(item.id, item));
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return user?.role === "admin" ? merged : data.map(normalizeComplaint);
      }
    }
  } catch (err) {
    console.warn("Backend sync fallback to local cache:", err.message);
  }
  return getUserComplaints(user);
}

// Add a newly submitted complaint -> POST to FastAPI MongoDB backend + update local cache
export async function addComplaint(formData, user = getCurrentUser()) {
  const creatorName = formData.anonymous ? "Anonymous" : (user?.name || "Citizen");
  const creatorEmail = user?.email || "";

  const payload = {
    category: formData.category || "General",
    custom_category: formData.customCategory || null,
    description: formData.description,
    location: formData.location || "City Center",
    priority: formData.priority || "Medium",
    anonymous: !!formData.anonymous,
    photo_url: formData.photo || null,
    image_verification: formData.imageVerification || null,
    created_by: creatorName,
    created_by_email: creatorEmail,
  };

  let savedComplaint = null;

  // 1. Post to MongoDB Backend
  try {
    const token = localStorage.getItem("civic_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(API_BASE, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      savedComplaint = await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend, storing locally:", err.message);
  }

  // 2. Fallback / Local sync
  if (!savedComplaint) {
    const all = getAllComplaints();
    const year = new Date().getFullYear();
    const newSeq = String(all.length + 1).padStart(4, "0");
    savedComplaint = {
      id: `CIV-${year}-${newSeq}`,
      title: formData.description.slice(0, 48) + (formData.description.length > 48 ? "..." : ""),
      category: formData.category || "General",
      custom_category: formData.customCategory || null,
      location: formData.location || "City Center",
      priority: formData.priority || "Medium",
      status: "New",
      age: 0,
      assigned: "Unassigned",
      score: 0,
      time: "Just now",
      description: formData.description,
      anonymous: !!formData.anonymous,
      created_by: creatorName,
      created_by_email: creatorEmail,
      created_at: new Date().toISOString(),
      photo_url: formData.photo || null,
      image_verification: formData.imageVerification || null,
    };
  }

  const all = getAllComplaints();
  const updated = [savedComplaint, ...all.filter(c => c.id !== savedComplaint.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return savedComplaint;
}
