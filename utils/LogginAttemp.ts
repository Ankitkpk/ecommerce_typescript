const MAX_ATTEMPTS = 5;
const LOCK_TIME = 5 * 60 * 1000; 

interface LoginAttempt {
    attempts: number;
    lockUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>(); 

export const isBlocked = (email: string): boolean => {
    const user = loginAttempts.get(email);

    if (!user) return false;

    if (user.lockUntil && user.lockUntil > Date.now()) {
        return true; 
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
        loginAttempts.delete(email); 
    }

    return false;
};

export const trackFailedLogin = (email: string): void => {
    let user = loginAttempts.get(email);

    if (!user) {
        user = { attempts: 0 };
    }

    user.attempts++;

    if (user.attempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME; 
    }

    loginAttempts.set(email, user);
};

export const resetLoginAttempts = (email: string): void => {
    loginAttempts.delete(email);
};