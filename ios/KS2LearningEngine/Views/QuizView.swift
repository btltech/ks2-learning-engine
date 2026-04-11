import SwiftUI

struct QuizView: View {
    let quiz: Quiz
    @StateObject private var quizManager = QuizManager.shared
    @State private var currentQuestionIndex = 0
    @State private var selectedAnswer: String?
    @State private var showingResults = false
    @State private var session: QuizSession?
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthenticationManager
    
    var currentQuestion: Question {
        quiz.questions[currentQuestionIndex]
    }
    
    var progress: Double {
        Double(currentQuestionIndex + 1) / Double(quiz.questions.count)
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Progress Bar
            ProgressView(value: progress)
                .padding()
                .tint(.indigo)
            
            // Question Header
            HStack {
                Text("Question \(currentQuestionIndex + 1)/\(quiz.questions.count)")
                    .font(.headline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(quiz.difficulty.rawValue)
                    .font(.caption)
                    .padding(6)
                    .background(Color.indigo.opacity(0.1))
                    .cornerRadius(8)
            }
            .padding(.horizontal)
            
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Question Text
                    Text(currentQuestion.text)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .padding(.vertical)
                    
                    // Options
                    VStack(spacing: 12) {
                        ForEach(currentQuestion.options, id: \.self) { option in
                            Button(action: {
                                selectedAnswer = option
                            }) {
                                HStack {
                                    Text(option)
                                        .font(.body)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    if selectedAnswer == option {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.indigo)
                                    } else {
                                        Image(systemName: "circle")
                                            .foregroundColor(.secondary)
                                    }
                                }
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(selectedAnswer == option ? Color.indigo : Color.gray.opacity(0.3), lineWidth: 2)
                                        .background(selectedAnswer == option ? Color.indigo.opacity(0.05) : Color.clear)
                                )
                            }
                        }
                    }
                }
                .padding()
            }
            
            // Navigation Buttons
            HStack {
                if currentQuestionIndex > 0 {
                    Button(action: {
                        currentQuestionIndex -= 1
                        selectedAnswer = session?.answers[quiz.questions[currentQuestionIndex].id]
                    }) {
                        Text("Previous")
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(12)
                    }
                }
                
                Button(action: nextQuestion) {
                    Text(currentQuestionIndex == quiz.questions.count - 1 ? "Finish" : "Next")
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(selectedAnswer == nil ? Color.gray : Color.indigo)
                        .cornerRadius(12)
                }
                .disabled(selectedAnswer == nil)
            }
            .padding()
        }
        .navigationTitle(quiz.subject.rawValue)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            startQuiz()
        }
        .sheet(isPresented: $showingResults) {
            if let session = session {
                QuizResultView(session: session, totalQuestions: quiz.questions.count)
            }
        }
    }
    
    private func startQuiz() {
        if let userId = authManager.user?.id {
            session = quizManager.startQuiz(quiz: quiz, userId: userId)
        } else {
            // Fallback for demo/testing without login
            session = quizManager.startQuiz(quiz: quiz, userId: "test_user")
        }
    }
    
    private func nextQuestion() {
        guard let answer = selectedAnswer else { return }
        
        // Save answer
        quizManager.submitAnswer(questionId: currentQuestion.id, answer: answer)
        
        if currentQuestionIndex < quiz.questions.count - 1 {
            currentQuestionIndex += 1
            selectedAnswer = session?.answers[quiz.questions[currentQuestionIndex].id]
        } else {
            finishQuiz()
        }
    }
    
    private func finishQuiz() {
        Task {
            do {
                _ = try await quizManager.completeQuiz()
                showingResults = true
            } catch {
                print("Error finishing quiz: \(error)")
                // For demo purposes, just show results anyway using local session data
                showingResults = true
            }
        }
    }
}

struct QuizResultView: View {
    let session: QuizSession
    let totalQuestions: Int
    @Environment(\.dismiss) private var dismiss
    
    var score: Int {
        // Simple mock calculation since we might not have the quiz object here locally
        // In a real app, pass the full result object
        return Int(session.score) 
        // Note: Real implementation needs QuizResult from manager, but for now we'll display what we have
    }
    
    var percentage: Int {
        guard totalQuestions > 0 else { return 0 }
        // Determine correct answers count locally for display (since manager does it async)
        // For this view, we'll just mock it or better yet, pass the result if available.
        // Let's simplify:
        return Int((Double(score) / Double(totalQuestions)) * 100)
    }
    
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "star.fill")
                .font(.system(size: 80))
                .foregroundColor(.yellow)
                .padding()
                .background(Color.yellow.opacity(0.2))
                .clipShape(Circle())
            
            Text("Quiz Completed!")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 8) {
                Text("Your Score")
                    .foregroundColor(.secondary)
                Text("\(score) / \(totalQuestions)")
                    .font(.system(size: 48, weight: .heavy, design: .rounded))
            }
            
            Button("Back to Home") {
                // Dimiss both result sheet and quiz view provided they are handled correctly by the navigation flow
                // Actually, often easier to just dismiss this sheet, then the parent view dismisses itself
                 if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let rootViewController = windowScene.windows.first?.rootViewController {
                    rootViewController.dismiss(animated: true)
                }
            }
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.indigo)
            .cornerRadius(12)
            .padding(.horizontal)
        }
        .padding()
    }
}
