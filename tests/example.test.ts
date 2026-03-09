import { describe, it, expect } from 'vitest';

describe('Sample Test Suite', () => {
    it('should pass a basic test', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle string operations', () => {
        const greeting = 'Takk Arena';
        expect(greeting).toContain('Arena');
    });
});

// Example of how to test a utility function
describe('Utility Functions', () => {
    it('should format currency correctly', () => {
        const amount = 25000;
        const formatted = amount.toLocaleString('is-IS');
        expect(formatted).toBe('25.000');
    });
});
