import { AppService } from '../../src/app.service';

describe('getHello', () => {
    it('should return App is running', () => {
        // Arrange
        const service = new AppService();

        // Act
        const result = service.getHello();

        // Assert
        expect(result).toBe('App is running!');
    });
});
