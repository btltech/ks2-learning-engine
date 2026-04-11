//
//  TeacherDashboardView.swift
//  KS2 Learning Engine
//
//  Teacher dashboard placeholder
//

import SwiftUI

struct TeacherDashboardView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("📊 Teacher Dashboard")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Class analytics and student management coming soon!")
                        .foregroundColor(.secondary)
                }
                .padding()
            }
            .navigationTitle("Dashboard")
        }
    }
}

struct TeacherProgressPlaceholderView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("📈 Progress Tracking")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Detailed progress charts and analytics coming soon!")
                        .foregroundColor(.secondary)
                }
                .padding()
            }
            .navigationTitle("Progress")
        }
    }
}
