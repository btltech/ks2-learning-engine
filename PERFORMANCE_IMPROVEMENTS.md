# Performance Improvements

## Code Splitting for Question Bank

### Problem
The `data/questionBank.ts` file was statically importing all question files (Maths, English, Science, etc.). This meant that the entire question bank (thousands of questions) was being bundled into the main application bundle, increasing the initial load time significantly.

### Solution
We refactored `data/questionBank.ts` to use dynamic imports (`await import(...)`).

1.  **Dynamic Loading**: Questions are now loaded only when needed for a specific subject.
    *   `loadQuestionsForSubject(subject)`: Asynchronously loads questions for the requested subject.
2.  **Async API**: `getRandomQuestions` is now an async function (`Promise<BankQuestion[]>`).
3.  **Consumer Updates**:
    *   `services/geminiService.ts`: Updated to `await getRandomQuestions(...)`.
    *   `scripts/test-hybrid-mode.ts`: Updated to use the new async API.
    *   `services/geminiService.test.ts`: Updated mocks to return Promises.

### Benefits
*   **Reduced Initial Bundle Size**: The main bundle no longer includes the entire question bank.
*   **Faster Load Time**: The app loads faster because it downloads less code initially.
*   **On-Demand Loading**: Subject-specific questions are loaded only when a user starts a quiz for that subject.

### Verification
*   **Unit Tests**: `npx vitest run` passes (including `geminiService` tests).
*   **Integration Script**: `npx vite-node scripts/test-hybrid-mode.ts` runs successfully and verifies question retrieval.
