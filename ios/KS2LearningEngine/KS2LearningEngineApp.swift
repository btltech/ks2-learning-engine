//
//  KS2LearningEngineApp.swift
//  KS2 Learning Engine
//
//  Main app entry point
//

import SwiftUI
import FirebaseCore

@main
struct KS2LearningEngineApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var userPreferences = UserPreferences.shared
    
    init() {
        // Configure Firebase
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }

        // Enable Firebase-dependent listeners
        AuthenticationManager.shared.start()
        
        // Setup app appearance
        setupAppearance()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(userPreferences)
                .preferredColorScheme(userPreferences.colorScheme)
        }
    }
    
    private func setupAppearance() {
        // Customize navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(red: 79/255, green: 70/255, blue: 229/255, alpha: 1.0)
        appearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
    }
}
