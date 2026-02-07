import { Injectable, inject } from '@angular/core';
import {
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    user,
    GoogleAuthProvider,
    signInWithPopup,
    User
} from '@angular/fire/auth';
import { Observable, firstValueFrom } from 'rxjs';
import { take, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    user$ = user(this.auth);
    currentUser: User | null = null;

    constructor() {
        this.user$.subscribe(user => {
            this.currentUser = user;
        });
    }

    // Email/Password Sign In
    async signIn(email: string, password: string) {
        return await signInWithEmailAndPassword(this.auth, email, password);
    }

    // Email/Password Sign Up
    async signUp(email: string, password: string) {
        return await createUserWithEmailAndPassword(this.auth, email, password);
    }

    // Google Sign In
    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(this.auth, provider);
    }

    // Sign Out
    async signOut() {
        return await signOut(this.auth);
    }

    // Get ID Token (for Azure API calls)
    async getIdToken(): Promise<string> {
        // Wait for the auth state to resolve to a logged-in user
        // We filter for non-null user to ensure we don't proceed until auth is ready
        const user = await firstValueFrom(this.user$.pipe(
            filter(u => !!u),
            take(1)
        ));

        if (user) {
            return await user.getIdToken();
        }
        throw new Error('No user logged in');
    }
}
