//
//  QuizManager.swift
//  KS2 Learning Engine
//
//  Quiz session management service
//

import Foundation
import FirebaseFirestore

@MainActor
class QuizManager: ObservableObject {
    static let shared = QuizManager()
    private var db: Firestore { Firestore.firestore() }
    
    @Published var currentSession: QuizSession?
    @Published var isLoading = false
    
    private init() {}
    
    // Fetch quiz by ID
    func fetchQuiz(id: String) async throws -> Quiz {
        let doc = try await db.collection("quizzes").document(id).getDocument()
        guard let data = doc.data() else {
            throw NSError(domain: "QuizManager", code: 404, userInfo: [NSLocalizedDescriptionKey: "Quiz not found"])
        }
        return try Firestore.Decoder().decode(Quiz.self, from: data)
    }
    
    // Get quizzes for subject and difficulty
    func fetchQuizzes(subject: Subject, difficulty: Difficulty? = nil, limit: Int = 10) async throws -> [Quiz] {
        var query: Query = db.collection("quizzes")
            .whereField("subject", isEqualTo: subject.rawValue)
        
        if let difficulty = difficulty {
            query = query.whereField("difficulty", isEqualTo: difficulty.rawValue)
        }
        
        let snapshot = try await query.limit(to: limit).getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: Quiz.self) }
    }
    
    // Start quiz session
    func startQuiz(quiz: Quiz, userId: String) -> QuizSession {
        let session = QuizSession(
            id: UUID().uuidString,
            quizId: quiz.id,
            userId: userId,
            subject: quiz.subject,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            answers: [:],
            startedAt: Date(),
            completedAt: nil,
            score: 0.0,
            timeSpent: 0
        )
        
        currentSession = session
        return session
    }
    
    // Submit answer
    func submitAnswer(questionId: String, answer: String) {
        guard currentSession != nil else { return }
        currentSession?.answers[questionId] = answer
    }
    
    // Complete quiz
    func completeQuiz() async throws -> QuizResult {
        guard let session = currentSession else {
            throw NSError(domain: "QuizManager", code: 400, userInfo: [NSLocalizedDescriptionKey: "No active session"])
        }
        
        let quiz = try await fetchQuiz(id: session.quizId)
        
        // Calculate score
        var correctCount = 0
        for question in quiz.questions {
            if let userAnswer = session.answers[question.id],
               question.correctAnswer == userAnswer {
                correctCount += 1
            }
        }
        
        let percentage = Double(correctCount) / Double(quiz.questions.count) * 100
        let passed = percentage >= 70
        
        let result = QuizResult(
            id: UUID().uuidString,
            quizId: quiz.id,
            userId: session.userId,
            score: correctCount,
            totalQuestions: quiz.questions.count,
            percentage: percentage,
            timeTaken: Date().timeIntervalSince(session.startedAt),
            passed: passed,
            completedAt: Date()
        )
        
        // Save to Firebase
        try await db.collection("quiz_results").document(result.id).setData([
            "quizId": result.quizId,
            "userId": result.userId,
            "score": result.score,
            "totalQuestions": result.totalQuestions,
            "percentage": result.percentage,
            "timeTaken": result.timeTaken,
            "passed": result.passed,
            "completedAt": Timestamp(date: result.completedAt)
        ])
        
        // Update user progress
        try await updateUserProgress(result: result)
        
        currentSession = nil
        return result
    }
    
    // Get user results
    func fetchUserResults(userId: String, limit: Int = 20) async throws -> [QuizResult] {
        let snapshot = try await db.collection("quiz_results")
            .whereField("userId", isEqualTo: userId)
            .order(by: "completedAt", descending: true)
            .limit(to: limit)
            .getDocuments()
        
        return try snapshot.documents.compactMap { try $0.data(as: QuizResult.self) }
    }
    
    private func updateUserProgress(result: QuizResult) async throws {
        let userRef = db.collection("users").document(result.userId)
        
        // Calculate points
        let points = result.passed ? 100 : 50
        
        try await userRef.updateData([
            "totalPoints": FieldValue.increment(Int64(points)),
            "quizzesCompleted": FieldValue.increment(Int64(1))
        ])
    }
}
