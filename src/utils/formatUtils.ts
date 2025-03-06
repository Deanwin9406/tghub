
/**
 * Utility functions for formatting various types of data
 */

/**
 * Format a date to a localized string
 * @param dateString ISO date string to format
 * @param includeTime Whether to include the time in the formatted string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a currency amount
 * @param amount Amount to format
 * @param currency Currency code (default: XOF)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'XOF'): string => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get status badge color classname based on status
 * @param status Status string
 * @returns Tailwind CSS class name for badge color
 */
export const getStatusColorClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'verified':
    case 'paid':
    case 'accepted':
      return 'bg-green-100 text-green-800';
      
    case 'pending':
    case 'scheduled':
    case 'in_progress':
    case 'processing':
    case 'rescheduled':
      return 'bg-yellow-100 text-yellow-800';
      
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'suspended':
    case 'overdue':
      return 'bg-red-100 text-red-800';
      
    case 'draft':
    case 'available':
    case 'open':
      return 'bg-blue-100 text-blue-800';
      
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Translate status terms to French
 * @param status Status string in English
 * @returns Translated status in French
 */
export const translateStatus = (status: string): string => {
  if (!status) return '';
  
  const statusMap: Record<string, string> = {
    // General statuses
    'active': 'Actif',
    'pending': 'En attente',
    'completed': 'Terminé',
    'cancelled': 'Annulé',
    'draft': 'Brouillon',
    
    // Property statuses
    'available': 'Disponible',
    'rented': 'Loué',
    'sold': 'Vendu',
    'unavailable': 'Indisponible',
    'maintenance': 'En maintenance',
    'archived': 'Archivé',
    
    // Verification statuses
    'verified': 'Vérifié',
    'rejected': 'Rejeté',
    'approved': 'Approuvé',
    
    // Payment statuses
    'paid': 'Payé',
    'overdue': 'En retard',
    'processing': 'En traitement',
    'failed': 'Échoué',
    
    // Service request statuses
    'open': 'Ouvert',
    'in_progress': 'En cours',
    
    // Appointment statuses
    'scheduled': 'Programmé',
    'rescheduled': 'Reprogrammé',
    
    // Proposal statuses
    'accepted': 'Accepté',
    
    // User statuses
    'suspended': 'Suspendu',
    'deleted': 'Supprimé',
    'inactive': 'Inactif'
  };
  
  return statusMap[status.toLowerCase()] || status;
};

/**
 * Translate urgency terms to French
 * @param urgency Urgency string in English
 * @returns Translated urgency in French
 */
export const translateUrgency = (urgency: string): string => {
  if (!urgency) return '';
  
  const urgencyMap: Record<string, string> = {
    'low': 'Basse',
    'medium': 'Moyenne',
    'high': 'Haute',
    'critical': 'Critique'
  };
  
  return urgencyMap[urgency.toLowerCase()] || urgency;
};

/**
 * Translate service categories to French
 * @param category Category string in English
 * @returns Translated category in French
 */
export const translateCategory = (category: string): string => {
  if (!category) return '';
  
  const categoryMap: Record<string, string> = {
    'plumbing': 'Plomberie',
    'electrical': 'Électricité',
    'heating': 'Chauffage',
    'aircon': 'Climatisation',
    'painting': 'Peinture',
    'cleaning': 'Nettoyage',
    'gardening': 'Jardinage',
    'moving': 'Déménagement',
    'security': 'Sécurité',
    'renovation': 'Rénovation',
    'other': 'Autre'
  };
  
  return categoryMap[category.toLowerCase()] || category;
};

/**
 * Translate property types to French
 * @param type Property type string in English
 * @returns Translated property type in French
 */
export const translatePropertyType = (type: string): string => {
  if (!type) return '';
  
  const typeMap: Record<string, string> = {
    'apartment': 'Appartement',
    'house': 'Maison',
    'villa': 'Villa',
    'studio': 'Studio',
    'condo': 'Condo',
    'duplex': 'Duplex',
    'land': 'Terrain',
    'commercial': 'Commercial',
    'office': 'Bureau',
    'warehouse': 'Entrepôt',
    'other': 'Autre'
  };
  
  return typeMap[type.toLowerCase()] || type;
};
