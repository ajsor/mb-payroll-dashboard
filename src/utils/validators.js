const EXCEL_MIME_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

const MAX_EXCEL_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

export const validateExcelFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const extension = file.name.toLowerCase().split('.').pop();
  if (!['xls', 'xlsx'].includes(extension)) {
    return { valid: false, error: 'File must be .xls or .xlsx format' };
  }

  if (file.size > MAX_EXCEL_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
};

export const validateLogoFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Logo must be an image file (JPG, PNG, GIF, WebP)' };
  }

  if (file.size > MAX_LOGO_SIZE) {
    return { valid: false, error: 'Logo size must be less than 2MB' };
  }

  return { valid: true };
};
