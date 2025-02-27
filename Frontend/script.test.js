import { jest } from '@jest/globals';
import fetch from 'node-fetch';

global.fetch = jest.fn();

const mockLocation = new URL('http://localhost');
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
});

global.showLoading = jest.fn();
global.showStatus = jest.fn();

describe('initiateLogin', () => {
});
