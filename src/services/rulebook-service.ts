/**
 * @fileOverview A service for accessing the game's rulebook.
 *
 * - getRulebookText - A function that returns the full text of the rulebook.
 */
'use server';

import fs from 'fs/promises';
import path from 'path';

let rulebookContent: string | null = null;

/**
 * Reads and returns the content of the rulebook.md file.
 * The content is cached in memory after the first read.
 * @returns {Promise<string>} The full text of the rulebook.
 */
export async function getRulebookText(): Promise<string> {
  if (rulebookContent) {
    return rulebookContent;
  }

  try {
    const rulebookPath = path.join(process.cwd(), 'src', 'assets', 'rulebook.md');
    const content = await fs.readFile(rulebookPath, 'utf-8');
    rulebookContent = content;
    return content;
  } catch (error) {
    console.error('Error reading rulebook file:', error);
    return 'Could not load the rulebook. Please check the server logs.';
  }
}
