import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const BANK_ALERTS_COLLECTION = "bank_alerts";

/**
 * Forward an ATM hotspot alert to the bank layer via Firebase.
 * @param {Object} alertData - The alert object containing ATM and complaint details
 * @returns {Promise<string>} - The document ID of the created bank alert
 */
export const forwardAlertToBank = async (alertData) => {
    try {
        // Extract and format the data for the bank layer
        const bankAlertData = {
            // ATM Information
            atm_id: alertData.atmId,
            atm_name: alertData.atmName || alertData.location,
            atm_location: alertData.location,
            atm_lat: alertData.position?.[0] || null,
            atm_lon: alertData.position?.[1] || null,

            // Risk Assessment
            risk_class: alertData.riskClass || alertData.priority,
            risk_score: alertData.riskScore,
            priority: alertData.priority,

            // Complaint Details
            complaint_id: alertData.complaintIds?.[0] || alertData.id,
            fraud_type: alertData.fraudType,
            bank_name: alertData.involvedBank,
            estimated_loss: alertData.amount,
            total_complaints: alertData.complaints,

            // AI Insights
            ai_explanation: alertData.aiExplanation,
            confidence_score: alertData.confidenceScore,
            trend: alertData.trend,

            // Metadata
            forwarded_at: new Date(),
            forwarded_by: "Control Panel",
            status: "Pending",
            time_of_alert: alertData.time,
        };

        const docRef = await addDoc(
            collection(db, BANK_ALERTS_COLLECTION),
            bankAlertData
        );

        console.log("Alert forwarded to bank with ID:", docRef.id);

        // Archive the complaint to history
        const complaintId = alertData.complaintIds?.[0] || alertData.id;
        if (complaintId) {
            try {
                const archiveResponse = await fetch(
                    `http://127.0.0.1:8000/api/complaints/${complaintId}/archive`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    }
                );

                if (archiveResponse.ok) {
                    console.log("Complaint archived to history:", complaintId);
                } else {
                    console.warn("Failed to archive complaint:", await archiveResponse.text());
                }
            } catch (archiveError) {
                console.error("Error archiving complaint:", archiveError);
                // Don't throw - forwarding to bank succeeded, archiving is secondary
            }
        }

        return docRef.id;
    } catch (error) {
        console.error("Error forwarding alert to bank:", error);
        throw error;
    }
};
