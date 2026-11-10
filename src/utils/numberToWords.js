/**
 * Converts a numeric amount to Indian English currency words
 * e.g. 35400 -> "Thirty Five Thousand Four Hundred Rupees Only"
 * e.g. 30400 -> "Thirty Thousand Four Hundred Rupees Only"
 */
export function numberToIndianWords(num) {
  if (num === undefined || num === null || isNaN(num) || Number(num) === 0) {
    return 'Zero Rupees Only.';
  }

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertSection(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + (n % 100 ? convertSection(n % 100) : '');
    if (n < 100000) return convertSection(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? convertSection(n % 1000) : '');
    if (n < 10000000) return convertSection(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? convertSection(n % 100000) : '');
    return convertSection(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? convertSection(n % 10000000) : '');
  }

  const integerAmount = Math.round(Number(num));
  const words = convertSection(integerAmount).trim();
  return words ? `${words} Rupees Only.` : 'Zero Rupees Only.';
}

