const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} = require('firebase/firestore');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Sample specialists data
const specialists = [
  {
    name: "Dr. Sarah Johnson",
    type: "mental",
    title: "Clinical Psychologist",
    description: "Specializes in anxiety, depression, and trauma therapy with 10+ years of experience.",
    photoUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 4.8,
    availability: generateAvailability("mental")
  },
  {
    name: "Dr. Michael Chen",
    type: "mental",
    title: "Psychiatrist",
    description: "Board-certified psychiatrist specializing in mood disorders and medication management.",
    photoUrl: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 4.7,
    availability: generateAvailability("mental")
  },
  {
    name: "Emma Rodriguez",
    type: "mental",
    title: "Licensed Therapist",
    description: "Specializes in cognitive behavioral therapy and mindfulness-based approaches.",
    photoUrl: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 4.9,
    availability: generateAvailability("mental")
  },
  {
    name: "Dr. James Wilson",
    type: "physical",
    title: "Physical Therapist",
    description: "Specializes in sports injuries and rehabilitation with a focus on holistic recovery.",
    photoUrl: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 4.6,
    availability: generateAvailability("physical")
  },
  {
    name: "Dr. Lisa Patel",
    type: "physical",
    title: "Nutritionist",
    description: "Registered dietitian specializing in personalized nutrition plans and wellness coaching.",
    photoUrl: "https://randomuser.me/api/portraits/women/5.jpg",
    rating: 4.8,
    availability: generateAvailability("physical")
  },
  {
    name: "Dr. Robert Thompson",
    type: "physical",
    title: "Physician",
    description: "Board-certified physician with expertise in preventive medicine and chronic disease management.",
    photoUrl: "https://randomuser.me/api/portraits/men/6.jpg",
    rating: 4.9,
    availability: generateAvailability("physical")
  }
];

// Function to generate random availability for the next 14 days
function generateAvailability(type) {
  const availability = [];
  const now = new Date();

  // Generate availability for the next 14 days
  for (let i = 1; i <= 14; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Generate 3-5 time slots per day
    const numSlots = Math.floor(Math.random() * 3) + 3;

    // Start times (9 AM to 4 PM)
    const startHours = type === "mental" ? [9, 10, 11, 13, 14, 15, 16] : [8, 9, 10, 13, 14, 15, 16];

    // Randomly select time slots
    const selectedHours = [];
    while (selectedHours.length < numSlots && startHours.length > 0) {
      const randomIndex = Math.floor(Math.random() * startHours.length);
      selectedHours.push(startHours[randomIndex]);
      startHours.splice(randomIndex, 1);
    }

    // Sort hours in ascending order
    selectedHours.sort((a, b) => a - b);

    // Create time slots
    for (const hour of selectedHours) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 60);

      availability.push({
        startTime,
        endTime,
        isBooked: false
      });
    }
  }

  return availability;
}

// Add specialists to Firestore
async function addSpecialists() {
  const specialistsCollection = collection(firestore, 'coaches');

  for (const specialist of specialists) {
    try {
      const docRef = await addDoc(specialistsCollection, {
        ...specialist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added specialist: ${specialist.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error adding specialist ${specialist.name}:`, error);
    }
  }

  console.log('All specialists added successfully!');
}

// Run the function
addSpecialists()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
