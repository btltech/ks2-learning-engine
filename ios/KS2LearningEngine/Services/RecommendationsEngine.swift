// 
//  RecommendationsEngine.swift
//  KS2 Learning Engine
//
//  Smart recommendations and learning paths
//

import Foundation

class RecommendationsEngine {
    static let shared = RecommendationsEngine()
    
    private init() {}
    
    // MARK: - Public Methods
    
    /// Generate personalized recommendations for student
    func generateRecommendations(studentId: String, count: Int = 10) -> [RecommendationItem] {
        let sessions = getStudentSessions(studentId: studentId)
        let profile = buildStudentProfile(sessions: sessions)
        
        var recommendations: [RecommendationItem] = []
        
        // 1. Review weak areas
        for topic in profile.weakTopics {
            recommendations.append(RecommendationItem(
                id: UUID().uuidString,
                type: .review,
                subject: topic.subject,
                topic: topic.topic,
                title: "Review \(topic.topic)",
                description: "Strengthen your understanding of \(topic.topic)",
                difficulty: .easy,
                estimatedTime: 15,
                relevanceScore: 0.95,
                reason: "You scored \(Int(topic.score))% on this topic. A review will help!",
                tags: ["review", "improvement", topic.subject.lowercased()]
            ))
        }
        
        // 2. Next progression topics
        for topic in profile.nextTopics {
            recommendations.append(RecommendationItem(
                id: UUID().uuidString,
                type: .lesson,
                subject: topic.subject,
                topic: topic.topic,
                title: "Learn \(topic.topic)",
                description: "Continue your learning journey with \(topic.topic)",
                difficulty: profile.recommendedDifficulty,
                estimatedTime: 20,
                relevanceScore: 0.85,
                reason: "Natural next step in your learning path",
                tags: ["new", "progression", topic.subject.lowercased()]
            ))
        }
        
        // 3. Challenge strong areas
        for topic in profile.strongTopics {
            recommendations.append(RecommendationItem(
                id: UUID().uuidString,
                type: .challenge,
                subject: topic.subject,
                topic: topic.topic,
                title: "\(topic.topic) Challenge",
                description: "Test your mastery with advanced \(topic.topic) questions",
                difficulty: .hard,
                estimatedTime: 10,
                relevanceScore: 0.75,
                reason: "You're excellent at \(topic.topic)! Ready for a challenge?",
                tags: ["challenge", "advanced", topic.subject.lowercased()]
            ))
        }
        
        // 4. Gamified learning (if high engagement)
        if profile.engagementLevel > 0.7 {
            for subject in Subject.allCases.prefix(3) {
                recommendations.append(RecommendationItem(
                    id: UUID().uuidString,
                    type: .game,
                    subject: subject.rawValue,
                    topic: "Mixed",
                    title: "\(subject.rawValue) Mini-Game",
                    description: "Fun \(subject.rawValue) challenges and puzzles",
                    difficulty: .medium,
                    estimatedTime: 5,
                    relevanceScore: 0.65,
                    reason: "Take a fun break while learning!",
                    tags: ["game", "fun", subject.rawValue.lowercased()]
                ))
            }
        }
        
        // Sort by relevance score and return top N
        return recommendations
            .sorted { $0.relevanceScore > $1.relevanceScore }
            .prefix(count)
            .map { $0 }
    }
    
    /// Create personalized learning path for student
    func createLearningPath(studentId: String, subject: String, targetLevel: Int) -> LearningPath {
        let sessions = getStudentSessions(studentId: studentId)
        let currentLevel = estimateLevel(sessions: sessions, subject: subject)
        
        let topicProgression = getTopicProgression(subject: subject)
        let startIndex = max(0, currentLevel - 1)
        let endIndex = min(topicProgression.count, targetLevel)
        
        let steps = topicProgression[startIndex..<endIndex].enumerated().map { index, topic in
            let completed = isTopicCompleted(sessions: sessions, subject: subject, topic: topic)
            let score = getTopicScore(sessions: sessions, subject: subject, topic: topic)
            
            return LearningPath.LearningStep(
                id: UUID().uuidString,
                stepNumber: index + 1,
                subject: subject,
                topic: topic,
                difficulty: index < 3 ? .easy : index < 6 ? .medium : .hard,
                completed: completed,
                score: score
            )
        }
        
        let completedSteps = steps.filter { $0.completed }.count
        let progress = Double(completedSteps) / Double(steps.count) * 100
        let estimatedTime = (steps.count - completedSteps) * 20 // 20 min per topic
        
        return LearningPath(
            id: UUID().uuidString,
            studentId: studentId,
            title: "\(subject) Mastery Path",
            description: "Complete learning path from Level \(currentLevel) to Level \(targetLevel)",
            steps: steps,
            progress: progress,
            estimatedCompletionTime: estimatedTime,
            createdAt: Date()
        )
    }
    
    /// Suggest optimal quiz configuration
    func suggestQuizConfig(studentId: String, subject: String) -> QuizConfiguration {
        let sessions = getStudentSessions(studentId: studentId)
        let subjectSessions = sessions.filter { $0.subject.rawValue == subject }
        
        guard !subjectSessions.isEmpty else {
            return QuizConfiguration(difficulty: .medium, questionCount: 10, topics: ["Mixed"], timeLimit: nil)
        }
        
        let avgScore = subjectSessions.map { $0.score }.reduce(0, +) / Double(subjectSessions.count)
        let avgTime = subjectSessions.map { $0.timeSpent }.reduce(0, +) / Double(subjectSessions.count)
        
        let difficulty: Difficulty = avgScore >= 85 ? .hard : avgScore >= 65 ? .medium : .easy
        let questionCount = avgScore >= 80 ? 15 : 10
        let timeLimit = avgTime > 600 ? 900 : 600 // 10 or 15 minutes
        
        // Find topics with low mastery
        var topicScores: [String: [Double]] = [:]
        for session in subjectSessions {
            topicScores[session.topic, default: []].append(session.score)
        }
        
        let weakTopics = topicScores
            .map { (topic: $0.key, avg: $0.value.reduce(0, +) / Double($0.value.count)) }
            .filter { $0.avg < 75 }
            .map { $0.topic }
        
        let topics = weakTopics.isEmpty ? ["Mixed"] : Array(weakTopics.prefix(3))
        
        return QuizConfiguration(
            difficulty: difficulty,
            questionCount: questionCount,
            topics: topics,
            timeLimit: timeLimit
        )
    }
    
    // MARK: - Private Helper Methods
    
    private func getStudentSessions(studentId: String) -> [QuizSession] {
        guard let data = UserDefaults.standard.data(forKey: "quiz_sessions_\(studentId)"),
              let sessions = try? JSONDecoder().decode([QuizSession].self, from: data) else {
            return []
        }
        return sessions
    }
    
    private struct StudentProfile {
        var weakTopics: [(subject: String, topic: String, score: Double)]
        var strongTopics: [(subject: String, topic: String, score: Double)]
        var nextTopics: [(subject: String, topic: String)]
        var recommendedDifficulty: Difficulty
        var engagementLevel: Double
    }
    
    private func buildStudentProfile(sessions: [QuizSession]) -> StudentProfile {
        var topicScores: [String: [Double]] = [:]
        
        for session in sessions {
            let key = "\(session.subject.rawValue):\(session.topic)"
            topicScores[key, default: []].append(session.score)
        }
        
        var weakTopics: [(String, String, Double)] = []
        var strongTopics: [(String, String, Double)] = []
        
        for (key, scores) in topicScores {
            let parts = key.split(separator: ":")
            guard parts.count == 2 else { continue }
            
            let subject = String(parts[0])
            let topic = String(parts[1])
            let avg = scores.reduce(0, +) / Double(scores.count)
            
            if avg < 65 {
                weakTopics.append((subject, topic, avg))
            } else if avg >= 85 {
                strongTopics.append((subject, topic, avg))
            }
        }
        
        let nextTopics = getNextTopics(topicScores: topicScores)
        let recommendedDifficulty = calculateDifficulty(sessions: sessions)
        let engagementLevel = min(1.0, Double(sessions.count) / 30.0)
        
        return StudentProfile(
            weakTopics: weakTopics.prefix(3).map { $0 },
            strongTopics: strongTopics.prefix(3).map { $0 },
            nextTopics: nextTopics,
            recommendedDifficulty: recommendedDifficulty,
            engagementLevel: engagementLevel
        )
    }
    
    private func getNextTopics(topicScores: [String: [Double]]) -> [(String, String)] {
        // Simplified progression logic
        let progressions: [Subject: [String]] = [
            .maths: ["Counting", "Addition", "Subtraction", "Multiplication", "Division"],
            .english: ["Phonics", "Reading", "Writing", "Grammar"],
            .science: ["Living Things", "Materials", "Forces", "Light"]
        ]
        
        var next: [(String, String)] = []
        
        for (subject, topics) in progressions {
            for topic in topics {
                let key = "\(subject.rawValue):\(topic)"
                if topicScores[key] == nil || (topicScores[key]?.first ?? 0) < 85 {
                    next.append((subject.rawValue, topic))
                    break
                }
            }
        }
        
        return next
    }
    
    private func calculateDifficulty(sessions: [QuizSession]) -> Difficulty {
        guard !sessions.isEmpty else { return .medium }
        
        let recent = Array(sessions.suffix(5))
        let avg = recent.map { $0.score }.reduce(0, +) / Double(recent.count)
        
        return avg >= 85 ? .hard : avg >= 65 ? .medium : .easy
    }
    
    private func getTopicProgression(subject: String) -> [String] {
        let progressions: [String: [String]] = [
            "Maths": ["Counting", "Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Decimals", "Algebra"],
            "English": ["Phonics", "Reading", "Writing", "Grammar", "Vocabulary", "Comprehension"],
            "Science": ["Living Things", "Materials", "Forces", "Light", "Earth", "Space"]
        ]
        
        return progressions[subject] ?? []
    }
    
    private func estimateLevel(sessions: [QuizSession], subject: String) -> Int {
        let subjectSessions = sessions.filter { $0.subject.rawValue == subject }
        guard !subjectSessions.isEmpty else { return 1 }
        
        let avgScore = subjectSessions.map { $0.score }.reduce(0, +) / Double(subjectSessions.count)
        return max(1, min(10, Int(avgScore / 10)))
    }
    
    private func isTopicCompleted(sessions: [QuizSession], subject: String, topic: String) -> Bool {
        let topicSessions = sessions.filter { $0.subject.rawValue == subject && $0.topic == topic }
        guard !topicSessions.isEmpty else { return false }
        
        let avgScore = topicSessions.map { $0.score }.reduce(0, +) / Double(topicSessions.count)
        return avgScore >= 85
    }
    
    private func getTopicScore(sessions: [QuizSession], subject: String, topic: String) -> Double? {
        let topicSessions = sessions.filter { $0.subject.rawValue == subject && $0.topic == topic }
        guard !topicSessions.isEmpty else { return nil }
        
        return topicSessions.map { $0.score }.reduce(0, +) / Double(topicSessions.count)
    }
}
