//
//  Quiz.swift
//  KS2 Learning Engine
//
//  Quiz-related models
//

import Foundation

enum Subject: String, Codable, CaseIterable {
    case maths = "Maths"
    case english = "English"
    case science = "Science"
    case history = "History"
    case geography = "Geography"
    case art = "Art"
    case music = "Music"
    case pe = "PE"
    case computing = "Computing"
}

enum Difficulty: String, Codable {
    case easy = "Easy"
    case medium = "Medium"
    case hard = "Hard"
}

struct Quiz: Identifiable, Codable {
    let id: String
    let subject: Subject
    let topic: String
    let difficulty: Difficulty
    let questions: [Question]
    let timeLimit: TimeInterval?
    var createdAt: Date
    
    var estimatedTime: Int {
        questions.count * 60 // 1 minute per question
    }
}

struct Question: Identifiable, Codable {
    let id: String
    let text: String
    let options: [String]
    let correctAnswer: String
    let explanation: String?
    let imageURL: String?
    let points: Int
}

struct QuizSession: Identifiable, Codable {
    let id: String
    let quizId: String
    let userId: String
    let subject: Subject
    let topic: String
    let difficulty: Difficulty
    var answers: [String: String] // questionId: answer
    let startedAt: Date
    var completedAt: Date?
    var score: Double
    var timeSpent: TimeInterval
    
    var isCompleted: Bool {
        completedAt != nil
    }
}

struct QuizResult: Identifiable, Codable {
    let id: String
    let quizId: String
    let userId: String
    let score: Int
    let totalQuestions: Int
    let percentage: Double
    let timeTaken: TimeInterval
    let passed: Bool
    let completedAt: Date
}
