//
//  AdaptiveLearning.swift
//  KS2 Learning Engine
//
//  Models for AI adaptive learning
//

import Foundation

enum LearningPace: String, Codable {
    case slow
    case average
    case fast
}

struct StudentPerformanceProfile: Codable {
    let studentId: String
    var currentLevel: Int // 1-10
    var learningPace: LearningPace
    var strengthAreas: [String]
    var weaknessAreas: [String]
    var recentPerformance: [RecentPerformance]
    var recommendedDifficulty: Difficulty
    var nextTopics: [String]
    var masteryScores: [String: Double] // Topic -> Mastery Score
    
    struct RecentPerformance: Codable {
        let date: Date
        let subject: String
        let topic: String
        let score: Double
        let difficulty: String
        let timeSpent: TimeInterval
    }
}

enum RecommendationType: String, Codable {
    case difficultyAdjustment = "difficulty_adjustment"
    case topicRecommendation = "topic_recommendation"
    case intervention
    case challenge
}

enum RecommendationPriority: String, Codable {
    case low
    case medium
    case high
}

struct AdaptiveRecommendation: Identifiable, Codable {
    let id: String
    let type: RecommendationType
    let subject: String
    let topic: String
    let difficulty: Difficulty
    let reason: String
    let confidence: Double // 0-1
    let priority: RecommendationPriority
    
    init(type: RecommendationType, subject: String, topic: String, difficulty: Difficulty, reason: String, confidence: Double, priority: RecommendationPriority) {
        self.id = UUID().uuidString
        self.type = type
        self.subject = subject
        self.topic = topic
        self.difficulty = difficulty
        self.reason = reason
        self.confidence = confidence
        self.priority = priority
    }
}

struct OptimalStudyTime: Codable {
    let recommendedMinutes: Int
    let bestTimeOfDay: String // "morning", "afternoon", "evening"
    let sessionFrequency: String // "daily", "3-4 times per week", etc.
}
