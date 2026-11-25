export const money = (n: number) => '₹' + Number(n).toLocaleString('en-IN');

export const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : '';
