/**
 * Cleans and formats raw text content before creating embeddings.
 */
export const cleanText = (text: string): string => {
  if (!text) return '';
  
  return text
    // Replace multiple newlines with a single newline
    .replace(/\n+/g, '\n')
    // Remove extra spaces
    .replace(/ +/g, ' ')
    // Trim edges
    .trim();
};
