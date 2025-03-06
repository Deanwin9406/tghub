
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
    case 'success':
      return 'bg-green-100 text-green-800';
      
    case 'pending':
    case 'scheduled':
    case 'in_progress':
    case 'processing':
    case 'rescheduled':
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
      
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'suspended':
    case 'overdue':
    case 'error':
    case 'destructive':
      return 'bg-red-100 text-red-800';
      
    case 'draft':
    case 'available':
    case 'open':
    case 'info':
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
    'critical': 'Critique',
    'very_high': 'Très haute'
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
    'townhouse': 'Maison de ville',
    'industrial': 'Industriel',
    'mixed_use': 'Usage mixte',
    'other': 'Autre'
  };
  
  return typeMap[type.toLowerCase()] || type;
};

/**
 * Translate admin roles to French
 * @param role Role string in English
 * @returns Translated role in French
 */
export const translateRole = (role: string): string => {
  if (!role) return '';
  
  const roleMap: Record<string, string> = {
    'tenant': 'Locataire',
    'landlord': 'Propriétaire',
    'agent': 'Agent',
    'manager': 'Gestionnaire',
    'admin': 'Administrateur',
    'vendor': 'Prestataire',
    'mod': 'Modérateur'
  };
  
  return roleMap[role.toLowerCase()] || role;
};

/**
 * Format a phone number to French format 
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as French phone number if appropriate length
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  // Return original if not a standard length
  return phone;
};

/**
 * Format area size with unit
 * @param size Area size in square meters
 * @returns Formatted area size with unit
 */
export const formatAreaSize = (size: number): string => {
  if (!size && size !== 0) return '';
  
  return `${size} m²`;
};

/**
 * Convert ISO date to a relative time string (e.g. "il y a 2 jours")
 * @param dateString ISO date string
 * @returns Relative time string in French
 */
export const getRelativeTimeString = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? 'il y a 1 an' : `il y a ${interval} ans`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? 'il y a 1 mois' : `il y a ${interval} mois`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? 'il y a 1 jour' : `il y a ${interval} jours`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? 'il y a 1 heure' : `il y a ${interval} heures`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? 'il y a 1 minute' : `il y a ${interval} minutes`;
  }
  
  return seconds < 10 ? 'à l\'instant' : `il y a ${Math.floor(seconds)} secondes`;
};

/**
 * Get badge variant based on status or category
 * @param status Status or category string
 * @returns Badge variant name
 */
export const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'verified':
    case 'paid':
    case 'accepted':
    case 'available':
      return 'default';
      
    case 'pending':
    case 'scheduled':
    case 'in_progress':
    case 'processing':
    case 'rescheduled':
    case 'draft':
      return 'secondary';
      
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'suspended':
    case 'overdue':
    case 'unavailable':
      return 'destructive';
      
    default:
      return 'outline';
  }
};

export const getErrorMessage = (error: any): string => {
  if (!error) return 'Une erreur est survenue';
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  return 'Une erreur inattendue est survenue';
};
