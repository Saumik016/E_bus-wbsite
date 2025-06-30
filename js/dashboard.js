// js/dashboard.js
import { auth, db } from './firebase.js';
import {
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in");
    window.location.href = "login.html";
  } else {
    currentUser = user;
    loadBookings(user.uid);
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// Search Buses
document.getElementById("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const source = document.getElementById("source").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const busResults = document.getElementById("bus-results");
  busResults.innerHTML = "Loading...";

  try {
    const busesRef = collection(db, "buses");
    const q = query(busesRef, where("source", "==", source), where("destination", "==", destination));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      busResults.innerHTML = "<p>No buses found.</p>";
      return;
    }

    busResults.innerHTML = "";
    snapshot.forEach((doc) => {
      const bus = doc.data();
      busResults.innerHTML += `
        <div class="bus-card">
          <h3>${bus.source} ➡️ ${bus.destination}</h3>
          <p><strong>Departure:</strong> ${bus.departureTime}</p>
          <p><strong>Seats:</strong> ${bus.totalSeats - (bus.bookedSeats?.length || 0)}</p>
          <p><strong>Price:</strong> ₹${bus.price}</p>
          <button onclick="window.location.href='book.html?busId=${doc.id}'">Book Now</button>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    busResults.innerHTML = "<p>Error fetching buses.</p>";
  }
});

// Load Booking History
async function loadBookings(uid) {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("userId", "==", uid), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  const history = document.getElementById("booking-history");

  if (snapshot.empty) {
    history.innerHTML = "<p>No bookings found.</p>";
    return;
  }

  history.innerHTML = "";
  for (const docSnap of snapshot.docs) {
    const booking = docSnap.data();
    const busDoc = await getDoc(doc(db, "buses", booking.busId));

    if (busDoc.exists()) {
      const bus = busDoc.data();
      history.innerHTML += `
        <div class="bus-card">
          <h3>${bus.source} ➡️ ${bus.destination}</h3>
          <p><strong>Seats Booked:</strong> ${booking.seats.join(", ")}</p>
          <p><strong>Departure:</strong> ${bus.departureTime}</p>
          <p><strong>Price:</strong> ₹${bus.price} × ${booking.seats.length} = ₹${bus.price * booking.seats.length}</p>
        </div>
      `;
    }
  }
}
