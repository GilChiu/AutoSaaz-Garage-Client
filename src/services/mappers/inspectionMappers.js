/**
 * Maps API inspection response to UI inspection model
 * Note: formatDate and formatTime here are data transformers, not display formatters
 * Display formatting is handled by GST utilities in the UI components
 * @param {import('../../types/inspection.js').InspectionApiResponse} apiInspection
 * @param {number} index - Index for generating inspection ID if not available
 * @returns {import('../../types/inspection.js').Inspection}
 */
export function mapApiInspectionToInspection(apiInspection, index = 0) {
  // Format vehicle information
  const vehicle = [
    apiInspection.vehicle_make,
    apiInspection.vehicle_model,
    apiInspection.vehicle_year
  ].filter(Boolean).join(' ');

  // Format date and time
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return dateString.split('T')[0]; // Convert to YYYY-MM-DD format
  };

  const formatTime = (timeString) => {
    if (!timeString) return '12:00 PM';
    
    // If it's already formatted (e.g., "3:00 PM"), return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    // If it's in HH:MM format, convert to 12-hour format
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return '12:00 PM';
    }
  };

  // Normalize tasks to an array of displayable strings
  const normalizeTasks = (raw) => {
    try {
      // If backend sent JSON string, parse it
      const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const arr = Array.isArray(value) ? value : [];
      return arr.map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          // Prefer common keys; fallback to compact JSON
          return item.task || item.title || item.name || JSON.stringify(item);
        }
        return String(item ?? '');
      }).filter(Boolean);
    } catch {
      return [];
    }
  };

  return {
    // Core fields (required by UI)
    id: apiInspection.inspection_number 
      ? apiInspection.inspection_number 
      : (apiInspection.id ? apiInspection.id : (1001 + index)),
    customer: apiInspection.customer_name,
    vehicle: vehicle || 'Unknown Vehicle',
    date: formatDate(apiInspection.inspection_date),
    time: formatTime(apiInspection.scheduled_time),
    assignedTechnician: apiInspection.assigned_technician || 'Unassigned',
    status: mapApiStatusToUiStatus(apiInspection.status),
  tasks: normalizeTasks(apiInspection.tasks),
    
    // Extended fields (for detail view)
    phone: apiInspection.customer_phone,
    email: apiInspection.customer_email,
    vehicleMake: apiInspection.vehicle_make,
    vehicleModel: apiInspection.vehicle_model,
    vehicleYear: apiInspection.vehicle_year,
    plateNumber: apiInspection.vehicle_plate_number,
    priority: apiInspection.priority || 'normal',
    estimatedCost: apiInspection.estimated_cost,
    actualCost: apiInspection.actual_cost,
    findings: apiInspection.findings,
    recommendations: apiInspection.recommendations,
    internalNotes: apiInspection.internal_notes,
    inspectionNumber: apiInspection.inspection_number,
    createdAt: apiInspection.created_at,
    updatedAt: apiInspection.updated_at,
    completedAt: apiInspection.completed_at
  };
}

/**
 * Maps API status to UI status
 * Backend statuses: pending, in_progress, completed, cancelled
 * UI statuses: pending, completed
 * @param {'pending'|'in_progress'|'completed'|'cancelled'} apiStatus
 * @returns {'pending'|'completed'}
 */
export function mapApiStatusToUiStatus(apiStatus) {
  switch (apiStatus?.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
    case 'in_progress':
    default:
      return 'pending';
  }
}

/**
 * Maps UI inspection data to API format for creation/updates
 * @param {Object} uiInspection - UI inspection data
 * @returns {Object} - API format inspection data
 */
export function mapUiInspectionToApi(uiInspection) {
  return {
    customer_name: uiInspection.customer,
    customer_phone: uiInspection.phone,
    customer_email: uiInspection.email,
    vehicle_make: uiInspection.vehicleMake,
    vehicle_model: uiInspection.vehicleModel,
    vehicle_year: uiInspection.vehicleYear,
    vehicle_plate_number: uiInspection.plateNumber,
    inspection_date: uiInspection.date,
    scheduled_time: uiInspection.time,
    assigned_technician: uiInspection.assignedTechnician,
    priority: uiInspection.priority || 'normal',
    tasks: uiInspection.tasks || [],
    estimated_cost: uiInspection.estimatedCost,
    findings: uiInspection.findings,
    recommendations: uiInspection.recommendations,
    internal_notes: uiInspection.internalNotes
  };
}

/**
 * Gets display text for status
 * @param {'pending'|'completed'|'cancelled'} status
 * @returns {string}
 */
export function getStatusDisplayText(status) {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'pending':
    default:
      return 'Pending';
  }
}

/**
 * Gets CSS class for status badge
 * @param {'pending'|'completed'|'cancelled'} status
 * @returns {string}
 */
export function getStatusCssClass(status) {
  switch (status) {
    case 'completed':
      return 'status-completed';
    case 'cancelled':
      return 'status-cancelled';
    case 'pending':
    default:
      return 'status-pending';
  }
}

/**
 * Gets display text for priority
 * @param {'low'|'normal'|'high'|'urgent'} priority
 * @returns {string}
 */
export function getPriorityDisplayText(priority) {
  switch (priority) {
    case 'low':
      return 'Low';
    case 'high':
      return 'High';
    case 'urgent':
      return 'Urgent';
    case 'normal':
    default:
      return 'Normal';
  }
}

/**
 * Gets CSS class for priority badge
 * @param {'low'|'normal'|'high'|'urgent'} priority
 * @returns {string}
 */
export function getPriorityCssClass(priority) {
  switch (priority) {
    case 'low':
      return 'priority-low';
    case 'high':
      return 'priority-high';
    case 'urgent':
      return 'priority-urgent';
    case 'normal':
    default:
      return 'priority-normal';
  }
}