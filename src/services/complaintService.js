import { db } from "../firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";

const COLLECTION_NAME = "complaints";

/**
 * Submit a new complaint to Firestore.
 * @param {Object} complaintData - The JSON data associated with the complaint.
 * @returns {Promise<string>} - The document ID of the created complaint.
 */
export const submitComplaint = async (complaintData) => {
    try {
        // Ensure we have a timestamp for sorting
        const dataWithTimestamp = {
            ...complaintData,
            createdAt: new Date(),
            status: complaintData.status || "Open", // Default status
            // Generate a readable ID if not present (optional, Firestore has its own IDs)
            complaint_id: complaintData.complaint_id || `C-${Date.now()}`
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);
        console.log("Complaint written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding complaint: ", e);
        throw e;
    }
};

/**
 * Listen to all complaints in real-time, ordered by creation time.
 * @param {Function} callback - Function to call with the list of complaints.
 * @returns {Function} - Unsubscribe function.
 */
export const subscribeToAllComplaints = (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const complaints = [];
        querySnapshot.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });
        console.log("Real-time complaints update:", complaints.length);
        callback(complaints);
    });

    return unsubscribe;
};

/**
 * Listen to a specific complaint by ID (Document ID or query by field if needed).
 * NOTE: This assumes we are passing the Firestore Document ID. 
 * If using custom `complaint_id`, we'd need a query, but `onSnapshot` works best on doc refs.
 * For now, we'll try to match by the field `complaint_id` using a query, 
 * or if we have the docId, use that. 
 * 
 * Strategy: The list view returns objects with `id` (docId). 
 * So we can just use `doc(db, "complaints", docId)`.
 */
export const subscribeToComplaint = (docId, callback) => {
    if (!docId) return () => { };

    const unsubscribe = onSnapshot(doc(db, COLLECTION_NAME, docId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            console.log("No such complaint!");
        }
    });
    return unsubscribe;
};

/**
 * Update the status of a complaint.
 * @param {string} docId - The Firestore Document ID.
 * @param {string} status - New status string.
 */
export const updateComplaintStatus = async (docId, status) => {
    const complaintRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(complaintRef, {
        status: status,
        lastUpdated: new Date()
    });
};
