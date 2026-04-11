//
//  ContentView.swift
//  KS2 Learning Engine
//
//  Root view coordinator
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var selectedTab = 0
    
    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView(selectedTab: $selectedTab)
            } else {
                LoginView()
            }
        }
        .onAppear {
            authManager.checkAuthenticationStatus()
        }
    }
}

struct MainTabView: View {
    @Binding var selectedTab: Int
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            // Progress
            if authManager.user?.role == .student {
                StudentProgressView()
                    .tabItem {
                        Label("Progress", systemImage: "chart.bar.fill")
                    }
                    .tag(1)
            }
            
            // AI Dashboard
            if authManager.user?.role == .student {
                AdaptiveDashboardView()
                    .tabItem {
                        Label("AI Assistant", systemImage: "brain.head.profile")
                    }
                    .tag(2)
            }
            
            // Teacher Dashboard
            if authManager.user?.role == .teacher {
                TeacherDashboardView()
                    .tabItem {
                        Label("Dashboard", systemImage: "chart.line.uptrend.xyaxis")
                    }
                    .tag(3)
            }
            
            // Profile
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(4)
        }
        .accentColor(.indigo)
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthenticationManager.shared)
        .environmentObject(UserPreferences.shared)
}
