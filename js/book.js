// js/book.js
import { auth, db } from './firebase.js';
import {
  doc, getDoc, updateDoc, arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  addDoc,
  serverTimestamp,
  collection
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const params = new URLSearchParams(window.location.search);
const busId = params.get("busId");

const seatGrid = document.getElementById("seat-grid");
const busInfo = document.getElementById("bus-info");
const confirmBtn = document.getElementById("confirm-btn");
let selectedSeats = [];
let currentUser = null;

// 🧑‍💼 Auth Check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Login required.");
    window.location.href = "login.html";
  } else {
    currentUser = user;
    loadBus(busId);
  }
});

// 🚌 Load Bus Info + Seats
async function loadBus(id) {
  const docRef = doc(db, "buses", id);
  const busSnap = await getDoc(docRef);
  if (!busSnap.exists()) {
    busInfo.textContent = "Bus not found.";
    return;
  }

  const bus = busSnap.data();
  busInfo.innerHTML = `
    <h3>${bus.source} ➡️ ${bus.destination}</h3>
    <p>Departure: ${bus.departureTime} | Price: ₹${bus.price}</p>
  `;

  const totalSeats = bus.totalSeats || 40; // fallback
  const bookedSeats = bus.bookedSeats || [];

  for (let i = 1; i <= totalSeats; i++) {
    const seatBtn = document.createElement("div");
    seatBtn.textContent = i;
    seatBtn.classList.add("seat");

    if (bookedSeats.includes(i)) {
      seatBtn.classList.add("booked");
    } else {
      seatBtn.addEventListener("click", () => toggleSeat(i, seatBtn));
    }

    seatGrid.appendChild(seatBtn);
  }
}

// 🎯 Seat Select/Unselect
function toggleSeat(seatNumber, element) {
  if (selectedSeats.includes(seatNumber)) {
    selectedSeats = selectedSeats.filter(s => s !== seatNumber);
    element.classList.remove("selected");
  } else {
    selectedSeats.push(seatNumber);
    element.classList.add("selected");
  }
}

// ✅ Confirm Booking
confirmBtn.addEventListener("click", async () => {
  if (selectedSeats.length === 0) {
    alert("Please select at least one seat.");
    return;
  }

  try {
    const busRef = doc(db, "buses", busId);
    const busSnap = await getDoc(busRef);
    const currentBooked = busSnap.data().bookedSeats || [];

    const isConflict = selectedSeats.some(seat => currentBooked.includes(seat));
    if (isConflict) {
      alert("One or more selected seats are already booked.");
      return;
    }

    // Add booking
    await updateDoc(busRef, {
      bookedSeats: arrayUnion(...selectedSeats)
    });

// Save booking to "bookings" collection
await addDoc(collection(db, "bookings"), {
  userId: currentUser.uid,
  busId: busId,
  seats: selectedSeats,
  timestamp: serverTimestamp()
});

    alert("Booking confirmed!");
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    alert("Booking failed.");
  }
});
