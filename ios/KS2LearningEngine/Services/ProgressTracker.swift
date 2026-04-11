//
//  ProgressTracker.swift
//  KS2 Learning Engine
//
//  Learning progress tracking service
//

import Foundation
import FirebaseFirestore

@MainActor
class ProgressTracker: ObservableObject {
    static let shared = ProgressTracker()
    private var db: Firestore { Firestore.firestore() }
    
    @Published var userProgress: UserProgress?
    @Published var isLoading = false
    
    private init() {}
    
    // Fetch user progress
    func fetchProgress(userId: String) async throws -> UserProgress {
        let doc = try await db.collection("user_progress").document(userId).getDocument()
        
        if doc.exists, let data = doc.data() {
            let progress = try Firestore.Decoder().decode(UserProgress.self, from: data)
            await MainActor.run {
                self.userProgress = progress
            }
            return progress
        } else {
            // Create new progress
            let progress = UserProgress(
                subjectScores: [:],
                topicMastery: [:],
                quizzesCompleted: 0,
                totalTimeSpent: 0,
                strengths: [],
                weaknesses: []
            )
            
            try await db.collection("user_progress").document(userId).setData([
                "subjectScores": [:],
                "topicMastery": [:],
                "quizzesCompleted": 0,
                "totalTimeSpent": 0,
                "strengths": [],
                "weaknesses": []
            ])
            
            await MainActor.run {
                self.userProgress = progress
            }
            return progress
        }
    }
    
    // Update progress after quiz
    func updateAfterQuiz(userId: String, subject: Subject, score: Double, timeTaken: TimeInterval) async throws {
        let progressRef = db.collection("user_progress").document(userId)
        
        try await progressRef.updateData([
            "quizzesCompleted": FieldValue.increment(Int64(1)),
            "totalTimeSpent": FieldValue.increment(Int64(timeTaken))
        ])
    }
    
    // Get subject statistics
    func getSubjectStats(userId: String, subject: Subject) async throws -> SubjectProgress {
        let progress = try await fetchProgress(userId: userId)
        let score = progress.subjectScores[subject.rawValue] ?? 0
        return SubjectProgress(
            subject: subject,
            level: 1,
            totalTime: 0,
            quizzesTaken: progress.quizzesCompleted,
            averageScore: score
        )
    }
    
    // Check and update streak
    func updateStreak(userId: String) async throws {
        let userRef = db.collection("users").document(userId)
        let doc = try await userRef.getDocument()
        
        guard let data = doc.data(),
              let lastActive = (data["lastActiveDate"] as? Timestamp)?.dateValue() else {
            return
        }
        
        let calendar = Calendar.current
        let now = Date()
        
        if calendar.isDateInToday(lastActive) {
            // Already active today
            return
        } else if calendar.isDateInYesterday(lastActive) {
            // Continue streak
            try await userRef.updateData([
                "streak": FieldValue.increment(Int64(1)),
                "lastActiveDate": Timestamp(date: now)
            ])
        } else {
            // Reset streak
            try await userRef.updateData([
                "streak": 1,
                "lastActiveDate": Timestamp(date: now)
            ])
        }
    }
}

struct SubjectProgress: Codable {
    let subject: Subject
    var level: Int
    var totalTime: TimeInterval
    var quizzesTaken: Int
    var averageScore: Double
}
