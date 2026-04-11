//
//  Recommendation.swift
//  KS2 Learning Engine
//
//  Smart recommendation models
//

import Foundation

enum RecommendationItemType: String, Codable {
    case quiz
    case lesson
    case game
    case review
    case challenge
}

struct RecommendationItem: Identifiable, Codable {
    let id: String
    let type: RecommendationItemType
    let subject: String
    let topic: String
    let title: String
    let description: String
    let difficulty: Difficulty
    let estimatedTime: Int // minutes
    let relevanceScore: Double // 0-1
    let reason: String
    let tags: [String]
    
    var icon: String {
        switch type {
        case .quiz: return "doc.text.fill"
        case .lesson: return "book.fill"
        case .game: return "gamecontroller.fill"
        case .review: return "arrow.clockwise"
        case .challenge: return "trophy.fill"
        }
    }
}

struct LearningPath: Identifiable, Codable {
    let id: String
    let studentId: String
    let title: String
    let description: String
    var steps: [LearningStep]
    var progress: Double // 0-100
    let estimatedCompletionTime: Int // minutes
    let createdAt: Date
    
    struct LearningStep: Identifiable, Codable {
        let id: String
        let stepNumber: Int
        let subject: String
        let topic: String
        let difficulty: Difficulty
        var completed: Bool
        var score: Double?
    }
}

struct QuizConfiguration: Codable {
    let difficulty: Difficulty
    let questionCount: Int
    let topics: [String]
    let timeLimit: Int? // seconds
}
