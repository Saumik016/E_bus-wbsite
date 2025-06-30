// js/admin.js
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const allowedAdmins = [
  "admin@example.com",   // Replace with your real admin email
  "yourname@gmail.com"
];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Login required.");
    window.location.href = "login.html";
  } else {
    if (!allowedAdmins.includes(user.email)) {
      alert("Access Denied: Not an Admin");
      window.location.href = "index.html";
      return;
    }

    currentUser = user;
    loadBuses();
  }
});

// 🚪 Logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// ➕ Add Bus
document.getElementById("add-bus-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const departureTime = document.getElementById("departureTime").value;
  const price = parseInt(document.getElementById("price").value);
  const totalSeats = parseInt(document.getElementById("totalSeats").value);

  try {
    await addDoc(collection(db, "buses"), {
      source,
      destination,
      departureTime,
      price,
      totalSeats,
      bookedSeats: []
    });

    alert("Bus added successfully!");
    e.target.reset();
    loadBuses();
  } catch (error) {
    console.error("Error adding bus:", error);
  }
});

// 📋 Load Buses
async function loadBuses() {
  const busList = document.getElementById("bus-list");
  busList.innerHTML = "Loading...";
  const snapshot = await getDocs(collection(db, "buses"));

  if (snapshot.empty) {
    busList.innerHTML = "<p>No buses available.</p>";
    return;
  }

  busList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const bus = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "bus-card";
    div.innerHTML = `
      <h4>${bus.source} ➡️ ${bus.destination}</h4>
      <p>Time: ${bus.departureTime} | ₹${bus.price} | Seats: ${bus.totalSeats}</p>
      <div class="action-buttons">
        <button onclick="editBus('${id}')">Edit</button>
        <button onclick="deleteBus('${id}')">Delete</button>
      </div>
    `;
    busList.appendChild(div);
  });
}

// 🗑️ Delete Bus
window.deleteBus = async function (busId) {
  if (confirm("Are you sure you want to delete this bus?")) {
    await deleteDoc(doc(db, "buses", busId));
    alert("Bus deleted.");
    loadBuses();
  }
};

// ✏️ Edit Bus (basic prompt-based edit)
window.editBus = async function (busId) {
  const docRef = doc(db, "buses", busId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return alert("Bus not found");

  const bus = snap.data();

  const newPrice = prompt("Enter new price", bus.price);
  const newSeats = prompt("Enter new total seats", bus.totalSeats);

  await updateDoc(docRef, {
    price: parseInt(newPrice),
    totalSeats: parseInt(newSeats)
  });

  alert("Bus updated.");
  loadBuses();
};
