export const formatCurrencyVND = (value: number): string => {
    if (typeof value !== 'number') return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Check if the date is valid. Handles cases where dateString might be malformed.
    if (isNaN(date.getTime())) {
        return dateString;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
