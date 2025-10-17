/**
 * Frontend Inspection Types (JSDoc)
 * Defines JSDoc types for inspection-related data in the UI
 */

/**
 * @typedef {'pending'|'completed'|'cancelled'} InspectionStatus
 */

/**
 * @typedef {'low'|'normal'|'high'|'urgent'} InspectionPriority
 */

/**
 * @typedef {Object} Inspection
 * @property {string|number} id
 * @property {string} customer
 * @property {string} vehicle
 * @property {string} date
 * @property {string} time
 * @property {string} assignedTechnician
 * @property {InspectionStatus} status
 * @property {string[]} tasks
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [vehicleMake]
 * @property {string} [vehicleModel]
 * @property {number} [vehicleYear]
 * @property {string} [plateNumber]
 * @property {InspectionPriority} [priority]
 * @property {number} [estimatedCost]
 * @property {number} [actualCost]
 * @property {string} [findings]
 * @property {string} [recommendations]
 * @property {string} [internalNotes]
 * @property {string} [inspectionNumber]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {string} [completedAt]
 */

/**
 * @typedef {Object} InspectionApiResponse
 * @property {string} id
 * @property {string} inspection_number
 * @property {string} garage_owner_id
 * @property {string} customer_name
 * @property {string} [customer_phone]
 * @property {string} [customer_email]
 * @property {string} [vehicle_make]
 * @property {string} [vehicle_model]
 * @property {number} [vehicle_year]
 * @property {string} [vehicle_plate_number]
 * @property {string} inspection_date
 * @property {string} [scheduled_time]
 * @property {string} [assigned_technician]
 * @property {string} status
 * @property {string} priority
 * @property {string[]} tasks
 * @property {string} [findings]
 * @property {string} [recommendations]
 * @property {string} [internal_notes]
 * @property {number} [estimated_cost]
 * @property {number} [actual_cost]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} [completed_at]
 */

/**
 * @typedef {Object} InspectionStats
 * @property {number} total
 * @property {number} pending
 * @property {number} in_progress
 * @property {number} completed
 * @property {number} cancelled
 * @property {number} completed_today
 * @property {number} pending_overdue
 * @property {number} [average_completion_time]
 */

/**
 * @typedef {Object} CreateInspectionData
 * @property {string} customer
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [vehicleMake]
 * @property {string} [vehicleModel]
 * @property {number} [vehicleYear]
 * @property {string} [plateNumber]
 * @property {string} date
 * @property {string} [time]
 * @property {string} [assignedTechnician]
 * @property {InspectionPriority} [priority]
 * @property {string[]} [tasks]
 * @property {number} [estimatedCost]
 * @property {string} [internalNotes]
 */

/**
 * @typedef {Object} UpdateInspectionData
 * @property {string} [customer]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [vehicleMake]
 * @property {string} [vehicleModel]
 * @property {number} [vehicleYear]
 * @property {string} [plateNumber]
 * @property {string} [date]
 * @property {string} [time]
 * @property {string} [assignedTechnician]
 * @property {InspectionStatus} [status]
 * @property {InspectionPriority} [priority]
 * @property {string[]} [tasks]
 * @property {string} [findings]
 * @property {string} [recommendations]
 * @property {string} [internalNotes]
 * @property {number} [estimatedCost]
 * @property {number} [actualCost]
 */

/**
 * @typedef {Object} CompletionData
 * @property {string} [findings]
 * @property {string} [recommendations]
 * @property {number} [actualCost]
 */