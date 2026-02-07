const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

function initializeFirebase() {
    if (!firebaseApp) {
        try {
            // Check for service account JSON in environment variable
            const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

            let credential;
            if (serviceAccountJson) {
                const serviceAccount = JSON.parse(serviceAccountJson);
                credential = admin.credential.cert(serviceAccount);
            } else {
                // Fallback to application default (works locally if GOOGLE_APPLICATION_CREDENTIALS is set)
                credential = admin.credential.applicationDefault();
            }

            firebaseApp = admin.initializeApp({
                credential: credential,
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
