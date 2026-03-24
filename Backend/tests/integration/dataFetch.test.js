const request = require('supertest');
const app = require('../../app'); // Your Express app instance

describe('GET /processed/mail-activity', () => {
    test('should return 200 and a list of processed mails', async () => {
        const response = await request(app)
            .get('/processed/mail-activity')
            .query({ createdBy: 'personalusecase10@gmail.com', limit: 10 });

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        
        // Check if the body in the response is actually decrypted (String)
        if (response.body.length > 0) {
            expect(typeof response.body[0].body).toBe('string');
        }
    });
});
