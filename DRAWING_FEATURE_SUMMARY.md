# Drawing Feature Implementation Summary

I have implemented a drawing feature for Art and Design & Technology quizzes, allowing students to draw answers directly on their touch screen devices.

## 1. New Component: `DrawingCanvas`
**File:** `components/DrawingCanvas.tsx`
- Implemented a responsive HTML5 Canvas component.
- Supports touch and mouse input (using Pointer Events).
- Features:
  - Color picker (preset colors + custom color input).
  - Brush size slider.
  - Clear canvas button.
  - Submit drawing button.
  - White background by default.

## 2. Quiz Integration
**File:** `components/QuizView.tsx`
- Added `Drawing` to the `QuestionType` enum in `types.ts`.
- Updated `QuizView` to render the `DrawingCanvas` when the question type is `drawing`.
- Handled drawing submission:
  - The drawing is captured as a Data URL (image).
  - Currently, all submitted drawings are marked as "Correct" (since automated grading of free-form art is complex).
  - The drawing data is stored in the quiz results.

## 3. AI Quiz Generation
**File:** `services/geminiService.ts`
- Updated the AI prompt to generate "drawing" questions specifically for "Art" and "Design & Technology" subjects.
- Added instructions to the AI to ask students to draw specific things (e.g., "Draw a secondary colour", "Draw a pattern").
- Updated the response schema and normalization logic to handle the new `drawing` question type.

## How to Test
1. Start a quiz in the **Art** or **Design & Technology** subject.
2. The AI should now generate 1-2 drawing questions per quiz.
3. When a drawing question appears, use the canvas to draw the answer.
4. Click "Submit Drawing" and then "Next Question".

## Future Improvements
- **Save Drawings:** Currently, drawings are just passed through the quiz flow. We could save them to Firebase Storage to create a "Digital Sketchbook" for the student.
- **AI Analysis:** We could potentially use a vision model (like Gemini Pro Vision) to analyze the drawing and give feedback (e.g., "That looks like a great circle!").
