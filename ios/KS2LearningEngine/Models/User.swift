//
//  User.swift
//  KS2 Learning Engine
//
//  User models and types
//

import Foundation

enum UserRole: String, Codable {
    case student
    case teacher
    case parent
    case admin
}

struct User: Identifiable, Codable {
    let id: String
    var name: String
    var email: String
    var role: UserRole
    var avatarURL: String?
    var totalPoints: Int
    var streak: Int
    var level: Int
    var badges: [Badge]
    var createdAt: Date
    var lastActiveAt: Date
    
    init(id: String, name: String, email: String, role: UserRole) {
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.totalPoints = 0
        self.streak = 0
        self.level = 1
        self.badges = []
        self.createdAt = Date()
        self.lastActiveAt = Date()
    }
}

struct Badge: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let iconName: String
    let earnedAt: Date
    let rarity: BadgeRarity
}

enum BadgeRarity: String, Codable {
    case common
    case rare
    case epic
    case legendary
}

// User Progress
struct UserProgress: Codable {
    var subjectScores: [String: Double] // Subject -> Average Score
    var topicMastery: [String: Double] // Topic -> Mastery %
    var quizzesCompleted: Int
    var totalTimeSpent: TimeInterval // in seconds
    var strengths: [String]
    var weaknesses: [String]
}
