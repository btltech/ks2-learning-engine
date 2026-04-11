//
//  HomeView.swift
//  KS2 Learning Engine
//
//  Main home screen
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showQuizPicker = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Welcome header
                    welcomeHeader
                    
                    // Quick stats (for students)
                    if authManager.user?.role == .student {
                        quickStatsCard
                    }
                    
                    // Subject cards
                    subjectGrid
                    
                    // Daily missions
                    if authManager.user?.role == .student {
                        dailyMissionsCard
                    }
                }
                .padding()
            }
            .navigationTitle("Home")
            .navigationBarTitleDisplayMode(.large)
        }
    }
    
    private var welcomeHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Welcome back,")
                .font(.title2)
                .foregroundColor(.secondary)
            Text(authManager.user?.name ?? "Student")
                .font(.largeTitle)
                .fontWeight(.bold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(
            LinearGradient(colors: [.indigo.opacity(0.1), .purple.opacity(0.1)], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .cornerRadius(16)
    }
    
    private var quickStatsCard: some View {
        HStack(spacing: 20) {
            StatItem(icon: "star.fill", value: "\(authManager.user?.totalPoints ?? 0)", label: "Points", color: .yellow)
            StatItem(icon: "flame.fill", value: "\(authManager.user?.streak ?? 0)", label: "Streak", color: .orange)
            StatItem(icon: "chart.bar.fill", value: "Lvl \(authManager.user?.level ?? 1)", label: "Level", color: .blue)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10)
    }
    
    private var subjectGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            ForEach(Subject.allCases, id: \.self) { subject in
                SubjectCard(subject: subject)
            }
        }
    }
    
    private var dailyMissionsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.indigo)
                Text("Daily Missions")
                    .font(.headline)
                Spacer()
                Text("3/5")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .foregroundColor(.gray.opacity(0.3))
                        .frame(height: 8)
                        .cornerRadius(4)
                    Rectangle()
                        .foregroundColor(.indigo)
                        .frame(width: geometry.size.width * 0.6, height: 8)
                        .cornerRadius(4)
                }
            }
            .frame(height: 8)
            
            Text("Complete 2 more to earn bonus points!")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.indigo.opacity(0.1))
        .cornerRadius(16)
    }
}

struct StatItem: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct SubjectCard: View {
    let subject: Subject
    @State private var showQuizSheet = false
    
    var subjectColor: Color {
        switch subject {
        case .maths: return .blue
        case .english: return .green
        case .science: return .purple
        case .history: return .orange
        case .geography: return .teal
        case .art: return .pink
        case .music: return .indigo
        case .pe: return .red
        case .computing: return .cyan
        }
    }
    
    var subjectIcon: String {
        switch subject {
        case .maths: return "function"
        case .english: return "book.fill"
        case .science: return "flask.fill"
        case .history: return "clock.fill"
        case .geography: return "globe"
        case .art: return "paintbrush.fill"
        case .music: return "music.note"
        case .pe: return "figure.run"
        case .computing: return "desktopcomputer"
        }
    }
    
    var body: some View {
        Button(action: { showQuizSheet = true }) {
            VStack(spacing: 12) {
                Image(systemName: subjectIcon)
                    .font(.system(size: 40))
                    .foregroundColor(.white)
                Text(subject.rawValue)
                    .font(.headline)
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 120)
            .background(
                LinearGradient(colors: [subjectColor, subjectColor.opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .cornerRadius(16)
            .shadow(color: subjectColor.opacity(0.3), radius: 8, y: 4)
        }
        .sheet(isPresented: $showQuizSheet) {
            QuizSelectionView(subject: subject)
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthenticationManager.shared)
}

struct QuizSelectionView: View {
    let subject: Subject
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingQuiz = false
    @State private var selectedQuiz: Quiz?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Subject header
                    VStack(spacing: 8) {
                        Image(systemName: subjectIcon)
                            .font(.system(size: 60))
                            .foregroundColor(subjectColor)
                        
                        Text(subject.rawValue.capitalized)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Choose a quiz to start learning")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    
                    // Quiz options
                    VStack(spacing: 16) {
                        QuizOptionCard(
                            title: "Practice Quiz",
                            description: "Practice questions to improve your skills",
                            icon: "pencil.circle.fill",
                            color: subjectColor.opacity(0.7)
                        ) {
                            startQuiz(type: "practice")
                        }
                        
                        QuizOptionCard(
                            title: "Timed Challenge",
                            description: "Test your knowledge against the clock",
                            icon: "clock.fill",
                            color: subjectColor
                        ) {
                            startQuiz(type: "timed")
                        }
                        
                        QuizOptionCard(
                            title: "Topic Review",
                            description: "Review specific topics you've learned",
                            icon: "book.fill",
                            color: subjectColor.opacity(0.5)
                        ) {
                            startQuiz(type: "review")
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle(subject.rawValue.capitalized)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .fullScreenCover(item: $selectedQuiz) { quiz in
                NavigationView {
                    QuizView(quiz: quiz)
                }
            }
        }
    }
    
    func startQuiz(type: String) {
        // In a real app, this would fetch from QuizManager based on type
        // For now, we generate a sample quiz immediately so buttons work
        selectedQuiz = Quiz(
            id: UUID().uuidString,
            subject: subject,
            topic: "General \(subject.rawValue)",
            difficulty: .medium,
            questions: [
                Question(
                    id: "1",
                    text: "What is the capital of France?",
                    options: ["London", "Paris", "Berlin", "Madrid"],
                    correctAnswer: "Paris",
                    explanation: "Paris is the capital and most populous city of France.",
                    imageURL: nil,
                    points: 10
                ),
                Question(
                    id: "2",
                    text: "Which planet is known as the Red Planet?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correctAnswer: "Mars",
                    explanation: "Mars is often referred to as the 'Red Planet' because of the reddish iron oxide prevalent on its surface.",
                    imageURL: nil,
                    points: 10
                ),
                Question(
                    id: "3",
                    text: "What is 7 x 8?",
                    options: ["54", "56", "64", "48"],
                    correctAnswer: "56",
                    explanation: "7 multiplied by 8 equals 56.",
                    imageURL: nil,
                    points: 10
                )
            ],
            timeLimit: type == "timed" ? 300 : nil,
            createdAt: Date()
        )
    }
    
    var subjectColor: Color {
        switch subject {
        case .maths: return .blue
        case .english: return .green
        case .science: return .purple
        case .history: return .orange
        case .geography: return .teal
        case .art: return .pink
        case .music: return .indigo
        case .pe: return .red
        case .computing: return .cyan
        }
    }
    
    var subjectIcon: String {
        switch subject {
        case .maths: return "function"
        case .english: return "book.fill"
        case .science: return "flask.fill"
        case .history: return "clock.fill"
        case .geography: return "globe"
        case .art: return "paintbrush.fill"
        case .music: return "music.note"
        case .pe: return "figure.run"
        case .computing: return "desktopcomputer"
        }
    }
}

struct QuizOptionCard: View {
    let title: String
    let description: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 40))
                    .foregroundColor(color)
                    .frame(width: 60, height: 60)
                    .background(color.opacity(0.1))
                    .cornerRadius(12)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

