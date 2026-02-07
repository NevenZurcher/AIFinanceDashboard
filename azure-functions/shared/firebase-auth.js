const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

function initializeFirebase() {
    if (!firebaseApp) {
        try {
            // Check for service account JSON in environment variable
            let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
            const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

            if (serviceAccountBase64) {
                try {
                    serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
                    console.log('Decoded service account from base64');
                } catch (e) {
                    console.error('Failed to decode base64 service account:', e);
                }
            }

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
    let authHeader;

    // Debug logging
    console.log('Verifying token for request to:', req.url);
    if (req.headers && typeof req.headers.get === 'function') {
        const headerNames = [];
        req.headers.forEach((v, k) => headerNames.push(k));
        console.log('Request Headers (v4):', headerNames.join(', '));
    } else {
        console.log('Request Headers (legacy):', req.headers ? Object.keys(req.headers).join(', ') : 'None');
    }

    // Azure Functions v4 request.headers is a Headers object (map-like)
    if (req.headers && typeof req.headers.get === 'function') {
        authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    } else if (req.headers) {
        // Fallback for object-like headers
        authHeader = req.headers['authorization'] || req.headers['Authorization'];
    }

    console.log('Authorization Header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('No authorization token provided or invalid format');
        throw new Error('No authorization token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const app = initializeFirebase();
        console.log('Firebase App initialized:', app.name);

        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token verified for user:', decodedToken.uid);
        return decodedToken;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw new Error('Invalid or expired token: ' + error.message);
    }
}

module.exports = { verifyFirebaseToken, initializeFirebase };
