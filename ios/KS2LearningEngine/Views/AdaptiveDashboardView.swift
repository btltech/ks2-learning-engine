//
//  AdaptiveDashboardView.swift
//  KS2 Learning Engine
//
//  AI-powered adaptive learning dashboard
//

import SwiftUI

struct AdaptiveDashboardView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var profile: StudentPerformanceProfile?
    @State private var recommendations: [AdaptiveRecommendation] = []
    @State private var smartRecs: [RecommendationItem] = []
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            TabView(selection: $selectedTab) {
                ProfileTab(profile: profile)
                    .tag(0)
                
                RecommendationsTab(smartRecs: smartRecs)
                    .tag(1)
                
                LearningPathTab()
                    .tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .automatic))
            .navigationTitle("AI Assistant")
            .navigationBarTitleDisplayMode(.large)
            .onAppear(perform: loadData)
        }
    }
    
    private func loadData() {
        guard let userId = authManager.user?.id else { return }
        
        profile = AdaptiveLearningEngine.shared.analyzeStudent(studentId: userId)
        recommendations = AdaptiveLearningEngine.shared.generateRecommendations(studentId: userId)
        smartRecs = RecommendationsEngine.shared.generateRecommendations(studentId: userId, count: 8)
    }
}

struct ProfileTab: View {
    let profile: StudentPerformanceProfile?
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let profile = profile {
                    // Stats grid
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        StatCard(title: "Level", value: "\(profile.currentLevel)/10", icon: "chart.line.uptrend.xyaxis", color: .blue)
                        StatCard(title: "Pace", value: profile.learningPace.rawValue.capitalized, icon: "speedometer", color: .green)
                        StatCard(title: "Strengths", value: "\(profile.strengthAreas.count)", icon: "star.fill", color: .purple)
                        StatCard(title: "Focus Areas", value: "\(profile.weaknessAreas.count)", icon: "target", color: .orange)
                    }
                    
                    // Recommended difficulty
                    RecommendedDifficultyCard(difficulty: profile.recommendedDifficulty)
                    
                    // Strengths & Weaknesses
                    if !profile.strengthAreas.isEmpty {
                        AreaSection(title: "💪 Strengths", areas: profile.strengthAreas, color: .green)
                    }
                    
                    if !profile.weaknessAreas.isEmpty {
                        AreaSection(title: "🎯 Focus Areas", areas: profile.weaknessAreas, color: .orange)
                    }
                } else {
                    VStack {
                        ProgressView()
                        Text("Analyzing your performance...")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding()
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct RecommendedDifficultyCard: View {
    let difficulty: Difficulty
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.indigo)
                Text("Optimal Difficulty Level")
                    .font(.headline)
            }
            
            Text(difficulty.rawValue)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(.indigo)
            
            Text("Based on your recent performance, this difficulty level will challenge you appropriately")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(colors: [.indigo.opacity(0.1), .purple.opacity(0.1)], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .cornerRadius(12)
    }
}

struct AreaSection: View {
    let title: String
    let areas: [String]
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            
            ForEach(areas, id: \.self) { area in
                Text(area)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(color.opacity(0.1))
                    .cornerRadius(8)
            }
        }
    }
}

struct RecommendationsTab: View {
    let smartRecs: [RecommendationItem]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                VStack(spacing: 8) {
                    Text("✨ Personalized for You")
                        .font(.headline)
                    Text("These recommendations are based on your learning style, performance, and goals")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
                .background(Color.purple.opacity(0.1))
                .cornerRadius(12)
                
                // Recommendations
                ForEach(smartRecs) { rec in
                    RecommendationCard(recommendation: rec)
                }
            }
            .padding()
        }
    }
}

struct RecommendationCard: View {
    let recommendation: RecommendationItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: recommendation.icon)
                    .font(.title)
                    .foregroundColor(.indigo)
                
                VStack(alignment: .leading) {
                    Text(recommendation.title)
                        .font(.headline)
                    Text("\(recommendation.subject) • \(recommendation.difficulty.rawValue)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            Text(recommendation.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                Label("\(recommendation.estimatedTime) min", systemImage: "clock")
                Spacer()
                Label("\(Int(recommendation.relevanceScore * 100))% match", systemImage: "star.fill")
            }
            .font(.caption)
            .foregroundColor(.secondary)
            
            Text(recommendation.reason)
                .font(.caption)
                .italic()
                .foregroundColor(.purple)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 8)
    }
}

struct LearningPathTab: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("🗺️ Create Your Learning Path")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Choose a subject and target level to generate a personalized learning journey")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                // Subject selection cards
                LazyVGrid(columns: [GridItem(.flexible())], spacing: 16) {
                    ForEach([Subject.maths, .english, .science], id: \.self) { subject in
                        PathSubjectCard(subject: subject)
                    }
                }
            }
            .padding()
        }
    }
}

struct PathSubjectCard: View {
    let subject: Subject
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(subjectIcon)
                .font(.title)
            Text(subject.rawValue)
                .font(.headline)
            
            HStack(spacing: 8) {
                ForEach([5, 7, 10], id: \.self) { level in
                    Button(action: {}) {
                        Text("Level \(level)")
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.indigo)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 8)
    }
    
    var subjectIcon: String {
        switch subject {
        case .maths: return "🔢"
        case .english: return "📖"
        case .science: return "🔬"
        default: return "📚"
        }
    }
}

#Preview {
    AdaptiveDashboardView()
        .environmentObject(AuthenticationManager.shared)
}
