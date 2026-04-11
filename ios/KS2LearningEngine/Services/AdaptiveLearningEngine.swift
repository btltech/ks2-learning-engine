//
//  AdaptiveLearningEngine.swift
//  KS2 Learning Engine
//
//  AI-powered adaptive learning analysis
//

import Foundation

class AdaptiveLearningEngine {
    static let shared = AdaptiveLearningEngine()
    
    private let performanceWindow = 10 // Last 10 sessions
    private let masteryThreshold = 85.0
    private let struggleThreshold = 60.0
    
    private init() {}
    
    // MARK: - Public Methods
    
    /// Analyze student performance and create adaptive profile
    func analyzeStudent(studentId: String) -> StudentPerformanceProfile {
        let sessions = getRecentSessions(for: studentId)
        
        guard !sessions.isEmpty else {
            return getDefaultProfile(studentId: studentId)
        }
        
        // Calculate current level (1-10 scale)
        let averageScore = sessions.map { $0.score }.reduce(0, +) / Double(sessions.count)
        let currentLevel = max(1, min(10, Int(averageScore / 10)))
        
        // Determine learning pace
        let recentSessions = Array(sessions.suffix(5))
        let avgTimePerQuestion = recentSessions.map { $0.timeSpent / 10.0 }.reduce(0, +) / Double(recentSessions.count)
        let learningPace: LearningPace = avgTimePerQuestion < 30 ? .fast :
                                         avgTimePerQuestion < 60 ? .average : .slow
        
        // Identify strengths and weaknesses
        let subjectScores = groupBySubject(sessions)
        var strengthAreas: [String] = []
        var weaknessAreas: [String] = []
        
        for (subject, scores) in subjectScores {
            let avg = scores.reduce(0, +) / Double(scores.count)
            if avg >= masteryThreshold {
                strengthAreas.append(subject)
            }
            if avg < struggleThreshold {
                weaknessAreas.append(subject)
            }
        }
        
        // Calculate mastery scores by topic
        var masteryScores: [String: Double] = [:]
        for session in sessions {
            let key = "\(session.subject.rawValue):\(session.topic)"
            if let existing = masteryScores[key] {
                masteryScores[key] = existing * 0.7 + session.score * 0.3
            } else {
                masteryScores[key] = session.score
            }
        }
        
        // Recommend difficulty
        let recommendedDifficulty = calculateOptimalDifficulty(averageScore: averageScore, pace: learningPace)
        
        // Recommend next topics
        let nextTopics = recommendNextTopics(sessions: sessions, masteryScores: masteryScores)
        
        // Convert sessions to recent performance
        let recentPerformance = sessions.suffix(10).map { session in
            StudentPerformanceProfile.RecentPerformance(
                date: session.completedAt ?? session.startedAt,
                subject: session.subject.rawValue,
                topic: session.topic,
                score: session.score,
                difficulty: session.difficulty.rawValue,
                timeSpent: session.timeSpent
            )
        }
        
        return StudentPerformanceProfile(
            studentId: studentId,
            currentLevel: currentLevel,
            learningPace: learningPace,
            strengthAreas: strengthAreas,
            weaknessAreas: weaknessAreas,
            recentPerformance: Array(recentPerformance),
            recommendedDifficulty: recommendedDifficulty,
            nextTopics: nextTopics,
            masteryScores: masteryScores
        )
    }
    
    /// Generate adaptive recommendations for student
    func generateRecommendations(studentId: String) -> [AdaptiveRecommendation] {
        let profile = analyzeStudent(studentId: studentId)
        var recommendations: [AdaptiveRecommendation] = []
        
        // 1. Difficulty Adjustment Recommendations
        for session in profile.recentPerformance.suffix(3) {
            if session.score >= 95 {
                recommendations.append(AdaptiveRecommendation(
                    type: .difficultyAdjustment,
                    subject: session.subject,
                    topic: session.topic,
                    difficulty: .hard,
                    reason: "Excellent performance (\(Int(session.score))%) indicates readiness for harder challenges",
                    confidence: 0.9,
                    priority: .medium
                ))
            } else if session.score < 50 {
                recommendations.append(AdaptiveRecommendation(
                    type: .difficultyAdjustment,
                    subject: session.subject,
                    topic: session.topic,
                    difficulty: .easy,
                    reason: "Struggling with current level (\(Int(session.score))%). Easier content will build confidence",
                    confidence: 0.85,
                    priority: .high
                ))
            }
        }
        
        // 2. Intervention Recommendations for Weaknesses
        for subject in profile.weaknessAreas {
            recommendations.append(AdaptiveRecommendation(
                type: .intervention,
                subject: subject,
                topic: "Review Basics",
                difficulty: .easy,
                reason: "Identified weakness in \(subject). Recommend focused review sessions",
                confidence: 0.8,
                priority: .high
            ))
        }
        
        // 3. Challenge Recommendations for Strengths
        for subject in profile.strengthAreas {
            recommendations.append(AdaptiveRecommendation(
                type: .challenge,
                subject: subject,
                topic: "Advanced Topics",
                difficulty: .hard,
                reason: "Strong performance in \(subject). Ready for advanced challenges",
                confidence: 0.85,
                priority: .low
            ))
        }
        
        // 4. Topic Recommendations
        for topic in profile.nextTopics.prefix(3) {
            let parts = topic.split(separator: ":")
            if parts.count == 2 {
                recommendations.append(AdaptiveRecommendation(
                    type: .topicRecommendation,
                    subject: String(parts[0]),
                    topic: String(parts[1]),
                    difficulty: profile.recommendedDifficulty,
                    reason: "Natural progression based on your learning path",
                    confidence: 0.75,
                    priority: .medium
                ))
            }
        }
        
        // Sort by priority and confidence
        return recommendations.sorted { rec1, rec2 in
            let priority1 = priorityWeight(rec1.priority)
            let priority2 = priorityWeight(rec2.priority)
            if priority1 != priority2 {
                return priority1 > priority2
            }
            return rec1.confidence > rec2.confidence
        }
    }
    
    /// Predict optimal study time for student
    func predictOptimalStudyTime(studentId: String) -> OptimalStudyTime {
        let profile = analyzeStudent(studentId: studentId)
        
        // Base recommendation on learning pace
        let baseMinutes = profile.learningPace == .fast ? 20 :
                         profile.learningPace == .average ? 30 : 45
        
        // Adjust for current level
        let levelAdjustment = profile.currentLevel / 2
        let recommendedMinutes = baseMinutes + levelAdjustment
        
        // Analyze best time of day from historical data
        let timeScores = analyzeTimeOfDay(sessions: profile.recentPerformance)
        let bestTimeOfDay = timeScores.max(by: { $0.value < $1.value })?.key ?? "afternoon"
        
        // Recommend frequency
        let sessionFrequency = profile.currentLevel < 5 ? "daily" :
                              profile.currentLevel < 8 ? "3-4 times per week" :
                              "2-3 times per week"
        
        return OptimalStudyTime(
            recommendedMinutes: recommendedMinutes,
            bestTimeOfDay: bestTimeOfDay,
            sessionFrequency: sessionFrequency
        )
    }
    
    // MARK: - Private Helper Methods
    
    private func getRecentSessions(for studentId: String) -> [QuizSession] {
        // Load from UserDefaults (in production, use CoreData)
        guard let data = UserDefaults.standard.data(forKey: "quiz_sessions_\(studentId)"),
              let sessions = try? JSONDecoder().decode([QuizSession].self, from: data) else {
            return []
        }
        return Array(sessions.suffix(performanceWindow))
    }
    
    private func getDefaultProfile(studentId: String) -> StudentPerformanceProfile {
        StudentPerformanceProfile(
            studentId: studentId,
            currentLevel: 5,
            learningPace: .average,
            strengthAreas: [],
            weaknessAreas: [],
            recentPerformance: [],
            recommendedDifficulty: .medium,
            nextTopics: [],
            masteryScores: [:]
        )
    }
    
    private func groupBySubject(_ sessions: [QuizSession]) -> [String: [Double]] {
        var grouped: [String: [Double]] = [:]
        for session in sessions {
            let subject = session.subject.rawValue
            grouped[subject, default: []].append(session.score)
        }
        return grouped
    }
    
    private func calculateOptimalDifficulty(averageScore: Double, pace: LearningPace) -> Difficulty {
        if averageScore >= 85 && pace == .fast {
            return .hard
        } else if averageScore >= 75 {
            return .medium
        } else if averageScore < 60 {
            return .easy
        }
        return .medium
    }
    
    private func recommendNextTopics(sessions: [QuizSession], masteryScores: [String: Double]) -> [String] {
        let topicOrder: [Subject: [String]] = [
            .maths: ["Counting", "Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Decimals"],
            .english: ["Phonics", "Reading", "Writing", "Grammar", "Vocabulary"],
            .science: ["Living Things", "Materials", "Forces", "Earth and Space", "Light"]
        ]
        
        var recommended: [String] = []
        
        for (subject, topics) in topicOrder {
            for topic in topics where recommended.count < 5 {
                let key = "\(subject.rawValue):\(topic)"
                let mastery = masteryScores[key] ?? 0
                if mastery < masteryThreshold {
                    recommended.append(key)
                }
            }
        }
        
        return recommended
    }
    
    private func analyzeTimeOfDay(sessions: [StudentPerformanceProfile.RecentPerformance]) -> [String: Double] {
        var timeScores: [String: [Double]] = [:]
        
        for session in sessions {
            let hour = Calendar.current.component(.hour, from: session.date)
            let timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"
            timeScores[timeOfDay, default: []].append(session.score)
        }
        
        return timeScores.mapValues { scores in
            scores.reduce(0, +) / Double(scores.count)
        }
    }
    
    private func priorityWeight(_ priority: RecommendationPriority) -> Int {
        switch priority {
        case .high: return 3
        case .medium: return 2
        case .low: return 1
        }
    }
}
