import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('./firebase', () => ({
    db: {},
    auth: {
        onAuthStateChanged: vi.fn(),
        signOut: vi.fn()
    }
}));

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock as any;
