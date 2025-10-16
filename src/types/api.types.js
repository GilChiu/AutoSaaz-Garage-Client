/**
 * API Type Definitions
 * Type definitions for API requests and responses
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {*} [data]
 * @property {Array} [errors]
 * @property {Object} meta
 * @property {string} meta.timestamp
 */

/**
 * @typedef {Object} RegisterStep1Request
 * @property {string} fullName - 3-100 chars, letters and spaces only
 * @property {string} email - Valid email format
 * @property {string} phoneNumber - UAE format: +971XXXXXXXXX
 * @property {string} password - Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
 */

/**
 * @typedef {Object} RegisterStep1Response
 * @property {string} userId
 * @property {string} email
 * @property {string} phoneNumber
 * @property {boolean} requiresVerification
 */

/**
 * @typedef {Object} RegisterStep2Request
 * @property {string} userId
 * @property {string} address - 5-255 chars
 * @property {string} street - 3-100 chars
 * @property {string} state - 2-50 chars
 * @property {string} location - 2-100 chars
 * @property {Object} [coordinates]
 * @property {number} [coordinates.latitude]
 * @property {number} [coordinates.longitude]
 */

/**
 * @typedef {Object} RegisterStep3Request
 * @property {string} userId
 * @property {string} companyLegalName - 3-255 chars
 * @property {string} emiratesIdUrl - URL from file upload
 * @property {string} tradeLicenseNumber - 5-50 chars, uppercase
 * @property {string} [vatCertification] - Max 50 chars, uppercase
 */

/**
 * @typedef {Object} VerifyRequest
 * @property {string} code - 6 digits
 * @property {string} [email]
 * @property {string} [phoneNumber]
 */

/**
 * @typedef {Object} ResendVerificationRequest
 * @property {string} [email]
 * @property {string} [phoneNumber]
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} role
 * @property {string} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} GarageProfile
 * @property {string} fullName
 * @property {string} email
 * @property {string} phoneNumber
 * @property {string} companyLegalName
 * @property {string} status
 */

/**
 * @typedef {Object} LoginResponse
 * @property {User} user
 * @property {GarageProfile} profile
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} LogoutRequest
 * @property {string} [userId]
 */

export {};
