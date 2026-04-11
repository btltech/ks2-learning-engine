//
//  StudentProgressView.swift
//  KS2 Learning Engine
//
//  Student progress tracking view
//

import SwiftUI

struct StudentProgressView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var progressData: UserProgress?
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if isLoading {
                        VStack {
                            SwiftUI.ProgressView()
                                .scaleEffect(1.5)
                                .padding()
                            Text("Loading your progress...")
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if let progress = progressData {
                        // Stats Overview
                        VStack(spacing: 16) {
                            ProgressStatCard(
                                title: "Quizzes Completed",
                                value: "\(progress.quizzesCompleted)",
                                icon: "checkmark.circle.fill",
                                color: .green
                            )
                            
                            ProgressStatCard(
                                title: "Study Time",
                                value: formatTime(progress.totalTimeSpent),
                                icon: "clock.fill",
                                color: .blue
                            )
                        }
                        .padding()
                        
                        // Subject Scores
                        if !progress.subjectScores.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Subject Performance")
                                    .font(.headline)
                                    .padding(.horizontal)
                                
                                ForEach(Array(progress.subjectScores.keys.sorted()), id: \.self) { subject in
                                    SubjectProgressBar(
                                        subject: subject,
                                        score: progress.subjectScores[subject] ?? 0
                                    )
                                }
                            }
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(12)
                            .padding(.horizontal)
                        }
                        
                        // Strengths & Weaknesses
                        HStack(spacing: 16) {
                            if !progress.strengths.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("💪 Strengths")
                                        .font(.headline)
                                    ForEach(progress.strengths, id: \.self) { strength in
                                        Text("• \(strength)")
                                            .font(.subheadline)
                                    }
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.green.opacity(0.1))
                                .cornerRadius(12)
                            }
                            
                            if !progress.weaknesses.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("🎯 Focus Areas")
                                        .font(.headline)
                                    ForEach(progress.weaknesses, id: \.self) { weakness in
                                        Text("• \(weakness)")
                                            .font(.subheadline)
                                    }
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.orange.opacity(0.1))
                                .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal)
                    } else {
                        VStack(spacing: 16) {
                            Image(systemName: "chart.bar.xaxis")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            Text("No progress data yet")
                                .font(.title2)
                                .foregroundColor(.secondary)
                            Text("Complete some quizzes to see your progress!")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding()
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("My Progress")
            .onAppear {
                loadProgress()
            }
        }
    }
    
    private func loadProgress() {
        guard let userId = authManager.user?.id else { return }
        
        Task {
            isLoading = true
            do {
                progressData = try await ProgressTracker.shared.fetchProgress(userId: userId)
            } catch {
                print("Error loading progress: \(error)")
            }
            isLoading = false
        }
    }
    
    private func formatTime(_ seconds: TimeInterval) -> String {
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

struct SubjectProgressBar: View {
    let subject: String
    let score: Double
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(subject)
                    .font(.subheadline)
                Spacer()
                Text(String(format: "%.0f%%", score))
                    .font(.subheadline)
                    .bold()
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .foregroundColor(.gray.opacity(0.3))
                        .frame(height: 8)
                        .cornerRadius(4)
                    
                    Rectangle()
                        .foregroundColor(colorForScore(score))
                        .frame(width: geometry.size.width * (score / 100), height: 8)
                        .cornerRadius(4)
                }
            }
            .frame(height: 8)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
    
    private func colorForScore(_ score: Double) -> Color {
        if score >= 80 {
            return .green
        } else if score >= 60 {
            return .yellow
        } else {
            return .orange
        }
    }
}

struct ProgressStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 30))
                .foregroundColor(color)
                .frame(width: 50)
            
            VStack(alignment: .leading) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.title2)
                    .bold()
            }
            
            Spacer()
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}
