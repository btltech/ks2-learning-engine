//
//  UserPreferences.swift
//  KS2 Learning Engine
//
//  User preferences and settings
//

import SwiftUI
import Combine

@MainActor
class UserPreferences: ObservableObject {
    static let shared = UserPreferences()
    
    @Published var colorScheme: ColorScheme? {
        didSet {
            UserDefaults.standard.set(colorScheme == .dark ? "dark" : colorScheme == .light ? "light" : "system", forKey: "colorScheme")
        }
    }
    
    @Published var selectedLanguage: String {
        didSet {
            UserDefaults.standard.set(selectedLanguage, forKey: "language")
        }
    }
    
    @Published var soundEffectsEnabled: Bool {
        didSet {
            UserDefaults.standard.set(soundEffectsEnabled, forKey: "soundEffects")
        }
    }
    
    @Published var notificationsEnabled: Bool {
        didSet {
            UserDefaults.standard.set(notificationsEnabled, forKey: "notifications")
        }
    }
    
    private init() {
        // Load saved preferences
        let savedColorScheme = UserDefaults.standard.string(forKey: "colorScheme")
        self.colorScheme = savedColorScheme == "dark" ? .dark : savedColorScheme == "light" ? .light : nil
        
        self.selectedLanguage = UserDefaults.standard.string(forKey: "language") ?? "en"
        self.soundEffectsEnabled = UserDefaults.standard.bool(forKey: "soundEffects")
        self.notificationsEnabled = UserDefaults.standard.bool(forKey: "notifications")
    }
}
