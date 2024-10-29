import { UserServiceClient } from '../../../src/_shared/services/user-service';
import { UserService } from '../../../src/features/users/services/user.service';
import { validSession } from '../../integration-tests/_stubs/helper';

// describe('UserService', () => {
//     describe('getUserSession', () => {
//         it('should return success when session valid', async () => {
//             // Arrange
//             const service = new UserService();

//             jest.spyOn(UserServiceClient, 'getSession').mockReturnValue(Promise.resolve(validSession));

//             // Act
//             const result = await service.getUserSession({ sessionId: 'session', username: 'user', browserUserAgent: 'test' });

//             // Assert
//             expect(result.isSuccessful).toBe(true);
//         });

//         it('should return fail when session invalid', async () => {
//             // Arrange
//             const service = new UserService();

//             jest.spyOn(UserServiceClient, 'getSession').mockReturnValue(Promise.resolve({ isAuthenticated: false, session: null }));

//             // Act
//             const result = await service.getUserSession({ sessionId: 'session', username: 'user', browserUserAgent: 'test' });

//             // Assert
//             expect(result.isSuccessful).toBe(false);
//         });
//         it('should return fail when user is disabled award', async () => {
//             // Arrange
//             const service = new UserService();

//             jest.spyOn(UserServiceClient, 'getSession').mockReturnValue(
//                 Promise.resolve({ isAuthenticated: true, session: { ...validSession.session, disableAward: true } }),
//             );

//             // Act
//             const result = await service.getUserSession({ sessionId: 'session', username: 'user', browserUserAgent: 'test' });

//             // Assert
//             expect(result.isSuccessful).toBe(false);
//         });
//     });
// });
