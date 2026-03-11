"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function TestFirestore() {

  async function testConnection() {
    try {
      const docRef = await addDoc(collection(db, "test"), {
        message: "Connection successful",
        createdAt: new Date()
      });

      console.log("Document written with ID:", docRef.id);
      alert("Firestore connected!");
    } catch (error) {
      console.error("Error connecting to Firestore:", error);
    }
  }

  return (
    <div>
      <h1>Test Firestore Connection</h1>
      <button onClick={testConnection}>Test Connection</button>
    </div>
  );
}