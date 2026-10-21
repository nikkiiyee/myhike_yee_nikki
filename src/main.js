// Import the file that has the authentication helper function we want to use.
// The function we want to use is called "onAuthReady" which returns the login state
import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

function showName() {
  // Pass a CALLBACK function to run when Firebase finishes checking login status
  onAuthReady(function (user) {
    // Firebase passes the user object (or null)
    if (user) {
      // User is logged in
      const name = user.displayName || user.email; // Use email if name is missing
      document.getElementById("name-goes-here").textContent = name + "!";
    } else {
      // User is NOT logged in
      location.href = "index.html"; // Redirect to login page
    }
  });
}

showName();

function readQuote(day) {
  //reference to the quote collection
  const quoteRef = doc(db, "quotes", day);

  //read the collection
  onSnapshot(
    quoteRef,
    (docSnap) => {
      if (docSnap.exists()) {
        //replace the front end with the quote from the day document
        document.getElementById("quote-goes-here").innerHTML = docSnap.data().quote;
      }else{
        console.log("no such document");
      }
    },
    (error) => {
      console.error("failed reading the document", error);
    },
  );
}

readQuote("tuesday");


// Helper function to add the sample hike documents.
function addHikeData() {
    const hikesRef = collection(db, "hikes");
    console.log("Adding sample hike data...");
    addDoc(hikesRef, {
        code: "BBY01", name: "Burnaby Lake Park Trail", city: "Burnaby",
        level: "easy", details: "A lovely place for a lunch walk.", length: 10,
        hike_time: 60, lat: 49.2467097082573, lng: -122.9187029619698,
        last_updated: serverTimestamp()
    });
    addDoc(hikesRef, {
        code: "AM01", name: "Buntzen Lake Trail", city: "Anmore",
        level: "moderate", details: "Close to town, and relaxing.", length: 10.5,
        hike_time: 80, lat: 49.3399431028579, lng: -122.85908496766939,
        last_updated: serverTimestamp()
    });
    addDoc(hikesRef, {
        code: "NV01", name: "Mount Seymour Trail", city: "North Vancouver",
        level: "hard", details: "Amazing ski slope views.", length: 8.2,
        hike_time: 120, lat: 49.38847101455571,lng: -122.94092543551031,
        last_updated: serverTimestamp()
    });
}

async function seedHikes() {
  //make reference to the hikes collection
  const hikesRef = collection(db, "hikes");

  // Retrieve all documents currently in the collection
  const hikesSnapshot = await getDocs(hikesRef);

  //if hikes collection does not exist, then write
  if (hikesSnapshot.empty) {
    console.log("seeding the hikes collection...");
    addHikeData();
  } else {
    //else do nothing
    console.log("hikes collection already exists");
  }
}

seedHikes();

async function displayCardsDynamically() {
  let cardTemplate = document.getElementById("hikeCardTemplate");
  const hikesCollectionRef = collection(db, "hikes");

  try {
    const querySnapshot = await getDocs(hikesCollectionRef);
    querySnapshot.forEach((doc) => {
      // Clone the template
      let newcard = cardTemplate.content.cloneNode(true);
      // Get hike data once
      const hike = doc.data();

      // Populate the card with hike data
      newcard.querySelector(".card-title").textContent = hike.name;
      newcard.querySelector(".card-text").textContent =
        hike.details || `Located in ${hike.city}.`;
      newcard.querySelector(".card-length").textContent = hike.length;
      newcard.querySelector(".card-image").src = `./images/${hike.code}.jpg`;
      // Add the link with the document ID
      newcard.querySelector(".read-more").href =`eachHike.html?docID=${doc.id}`;

      // Attach the new card to the container
      document.getElementById("hikes-go-here").appendChild(newcard);
    };);
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
}

// Call the function to display cards when the page loads
displayCardsDynamically();
