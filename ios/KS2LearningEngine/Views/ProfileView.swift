//
//  ProfileView.swift
//  KS2 Learning Engine
//
//  User profile and settings
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var userPreferences: UserPreferences
    @State private var showSettings = false
    
    var body: some View {
        NavigationView {
            List {
                // Profile section
                Section {
                    HStack(spacing: 16) {
                        // Avatar
                        Circle()
                            .fill(LinearGradient(colors: [.indigo, .purple], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 80, height: 80)
                            .overlay(
                                Text(initials)
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(authManager.user?.name ?? "User")
                                .font(.title2)
                                .fontWeight(.bold)
                            Text(authManager.user?.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Text(authManager.user?.role.rawValue.capitalized ?? "")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.indigo.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                // Stats section (for students)
                if authManager.user?.role == .student {
                    Section("Stats") {
                        StatRow(icon: "star.fill", title: "Total Points", value: "\(authManager.user?.totalPoints ?? 0)", color: .yellow)
                        StatRow(icon: "flame.fill", title: "Current Streak", value: "\(authManager.user?.streak ?? 0) days", color: .orange)
                        StatRow(icon: "chart.bar.fill", title: "Level", value: "\(authManager.user?.level ?? 1)", color: .blue)
                    }
                }
                
                // Settings section
                Section("Settings") {
                    NavigationLink(destination: Text("Language Settings")) {
                        Label("Language", systemImage: "globe")
                    }
                    
                    Toggle(isOn: $userPreferences.soundEffectsEnabled) {
                        Label("Sound Effects", systemImage: "speaker.wave.2.fill")
                    }
                    
                    Toggle(isOn: $userPreferences.notificationsEnabled) {
                        Label("Notifications", systemImage: "bell.fill")
                    }
                }
                
                // About section
                Section {
                    Link(destination: URL(string: "https://ks2learning.com")!) {
                        Label("Website", systemImage: "safari")
                    }
                    
                    Link(destination: URL(string: "https://ks2learning.com/privacy")!) {
                        Label("Privacy Policy", systemImage: "hand.raised.fill")
                    }
                    
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.4.0")
                            .foregroundColor(.secondary)
                    }
                }
                
                // Sign out
                Section {
                    Button(action: authManager.signOut) {
                        HStack {
                            Label("Sign Out", systemImage: "arrow.right.square")
                            Spacer()
                        }
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Profile")
        }
    }
    
    private var initials: String {
        guard let name = authManager.user?.name else { return "?" }
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))".uppercased()
        } else {
            return String(name.prefix(2)).uppercased()
        }
    }
}

struct StatRow: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)
            Text(title)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager.shared)
        .environmentObject(UserPreferences.shared)
}
