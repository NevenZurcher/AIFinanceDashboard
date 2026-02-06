const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

function initializeFirebase() {
    if (!firebaseApp) {
        try {
            // In production, use environment variable for service account
            // For now, we'll use the project ID from environment
            firebaseApp = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID || 'wisewallet-6e673'
            });
            console.log('Firebase Admin initialized successfully');
        } catch (error) {
            console.error('Error initializing Firebase Admin:', error);
            // Fallback for development specific scenarios if needed, but alerting is better
            throw error;
        }
    }
    return firebaseApp;
}

// Middleware to verify Firebase token
async function verifyFirebaseToken(req) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No authorization token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        initializeFirebase();
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

module.exports = { verifyFirebaseToken, initializeFirebase };
