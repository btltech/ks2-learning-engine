//
//  AuthenticationManager.swift
//  KS2 Learning Engine
//
//  Handles user authentication with Firebase
//

import Foundation
import FirebaseAuth
import FirebaseFirestore
import Combine

@MainActor
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()
    
    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var authStateListener: AuthStateDidChangeListenerHandle?
    private let userDefaults = UserDefaults.standard
    private var db: Firestore { Firestore.firestore() }
    
    private init() {
        // Delay Firebase-dependent setup until after FirebaseApp.configure().
    }
    
    deinit {
        if let listener = authStateListener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
    }
    
    // MARK: - Public Methods

    /// Call once after FirebaseApp.configure() to enable auth state updates.
    func start() {
        if authStateListener == nil {
            setupAuthStateListener()
        }
    }
    
    func checkAuthenticationStatus() {
        start()
        if let firebaseUser = Auth.auth().currentUser {
            loadUserProfile(userId: firebaseUser.uid)
        } else {
            self.isAuthenticated = false
            self.user = nil
        }
    }
    
    func signIn(email: String, password: String) async throws {
        start()
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            loadUserProfile(userId: result.user.uid)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            throw error
        }
    }
    
    func signUp(email: String, password: String, name: String, role: UserRole) async throws {
        start()
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            
            // Create user profile
            let newUser = User(id: result.user.uid, name: name, email: email, role: role)
            
            self.user = newUser
            self.isAuthenticated = true
            saveUserLocally(newUser)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            throw error
        }
    }
    
    func signOut() {
        start()
        do {
            try Auth.auth().signOut()
            self.user = nil
            self.isAuthenticated = false
            clearLocalUser()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func sendPasswordReset(email: String) async throws {
        start()
        isLoading = true
        errorMessage = nil
        
        do {
            try await Auth.auth().sendPasswordReset(withEmail: email)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            throw error
        }
    }
    
    func loginChildWithParentCode(parentCode: String, name: String, age: Int, pin: String) async throws {
        start()
        isLoading = true
        errorMessage = nil

        let normalizedParentCode = parentCode.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedPin = pin.trimmingCharacters(in: .whitespacesAndNewlines)

        guard normalizedParentCode.count == 6 else {
            isLoading = false
            errorMessage = "Parent code must be exactly 6 characters."
            throw NSError(domain: "AuthenticationManager", code: 400, userInfo: [NSLocalizedDescriptionKey: errorMessage ?? "Invalid parent code"])
        }

        guard !trimmedName.isEmpty else {
            isLoading = false
            errorMessage = "Please enter your name."
            throw NSError(domain: "AuthenticationManager", code: 400, userInfo: [NSLocalizedDescriptionKey: errorMessage ?? "Invalid name"])
        }

        guard (5...18).contains(age) else {
            isLoading = false
            errorMessage = "Please choose a valid age."
            throw NSError(domain: "AuthenticationManager", code: 400, userInfo: [NSLocalizedDescriptionKey: errorMessage ?? "Invalid age"])
        }

        if !trimmedPin.isEmpty {
            let pinRegex = try! NSRegularExpression(pattern: "^[0-9]{4,6}$")
            let range = NSRange(location: 0, length: trimmedPin.utf16.count)
            guard pinRegex.firstMatch(in: trimmedPin, options: [], range: range) != nil else {
                isLoading = false
                errorMessage = "PIN must be 4 to 6 digits."
                throw NSError(domain: "AuthenticationManager", code: 400, userInfo: [NSLocalizedDescriptionKey: errorMessage ?? "Invalid PIN"])
            }
        }

        do {
            var request = URLRequest(url: AppConfig.childSessionURL)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let payload: [String: Any] = [
                "parentCode": normalizedParentCode,
                "name": trimmedName,
                "age": age,
                "pin": trimmedPin
            ]

            request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

            let (data, response) = try await URLSession.shared.data(for: request)
            let http = response as? HTTPURLResponse

            if http?.statusCode != 200 {
                let message = Self.extractServerErrorMessage(from: data) ?? "Unable to start child session. Please try again."
                isLoading = false
                errorMessage = message
                throw NSError(domain: "AuthenticationManager", code: http?.statusCode ?? 500, userInfo: [NSLocalizedDescriptionKey: message])
            }

            let json = (try JSONSerialization.jsonObject(with: data, options: [])) as? [String: Any]
            guard let customToken = json?["customToken"] as? String, !customToken.isEmpty else {
                isLoading = false
                errorMessage = "Child session response missing token."
                throw NSError(domain: "AuthenticationManager", code: 500, userInfo: [NSLocalizedDescriptionKey: errorMessage ?? "Missing token"])
            }

            let result = try await Auth.auth().signIn(withCustomToken: customToken)
            loadUserProfile(userId: result.user.uid)
            isLoading = false
        } catch {
            if errorMessage == nil {
                errorMessage = error.localizedDescription
            }
            isLoading = false
            throw error
        }
    }
    
    // MARK: - Private Methods
    
    private func setupAuthStateListener() {
        authStateListener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            guard let self = self else { return }
            Task { @MainActor in
                if let user = user {
                    self.loadUserProfile(userId: user.uid)
                } else {
                    self.isAuthenticated = false
                    self.user = nil
                    self.clearLocalUser()
                }
            }
        }
    }
    
    private func loadUserProfile(userId: String) {
        // Try to load from local storage first
        if let savedUser = loadUserLocally(), savedUser.id == userId {
            self.user = savedUser
            self.isAuthenticated = true
            return
        }

        Task { @MainActor in
            do {
                let doc = try await db.collection("users").document(userId).getDocument()

                if doc.exists, let data = doc.data() {
                    var role: UserRole = .student
                    if let roleString = data["role"] as? String, let parsed = UserRole(rawValue: roleString) {
                        role = parsed
                    } else if let roles = data["roles"] as? [String], let first = roles.first, let parsed = UserRole(rawValue: first) {
                        role = parsed
                    }

                    let name = (data["name"] as? String) ?? "User"
                    let email = (data["email"] as? String) ?? (Auth.auth().currentUser?.email ?? "")

                    var loadedUser = User(id: userId, name: name, email: email, role: role)
                    loadedUser.totalPoints = Self.intValue(data["totalPoints"])
                    loadedUser.streak = Self.intValue(data["streak"])
                    loadedUser.level = max(1, Self.intValue(data["level"]))
                    loadedUser.avatarURL = data["avatarUrl"] as? String

                    if let createdAt = data["createdAt"] as? Timestamp {
                        loadedUser.createdAt = createdAt.dateValue()
                    }
                    if let lastActive = data["lastActiveDate"] as? Timestamp {
                        loadedUser.lastActiveAt = lastActive.dateValue()
                    } else if let lastLogin = data["lastLoginDate"] as? String, let date = ISO8601DateFormatter().date(from: lastLogin) {
                        loadedUser.lastActiveAt = date
                    }

                    self.user = loadedUser
                    self.isAuthenticated = true
                    saveUserLocally(loadedUser)
                    return
                }

                // Fallback
                let fallback = User(id: userId, name: "User", email: Auth.auth().currentUser?.email ?? "", role: .student)
                self.user = fallback
                self.isAuthenticated = true
                saveUserLocally(fallback)
            } catch {
                let fallback = User(id: userId, name: "User", email: Auth.auth().currentUser?.email ?? "", role: .student)
                self.user = fallback
                self.isAuthenticated = true
                saveUserLocally(fallback)
            }
        }
    }

    private static func intValue(_ value: Any?) -> Int {
        if let int = value as? Int { return int }
        if let int64 = value as? Int64 { return Int(int64) }
        if let num = value as? NSNumber { return num.intValue }
        return 0
    }

    private static func extractServerErrorMessage(from data: Data) -> String? {
        guard let json = (try? JSONSerialization.jsonObject(with: data, options: [])) as? [String: Any] else {
            return nil
        }
        if let message = json["error"] as? String, !message.isEmpty {
            return message
        }
        if let message = json["message"] as? String, !message.isEmpty {
            return message
        }
        return nil
    }
    
    private func saveUserLocally(_ user: User) {
        if let encoded = try? JSONEncoder().encode(user) {
            userDefaults.set(encoded, forKey: "currentUser")
        }
    }
    
    private func loadUserLocally() -> User? {
        guard let data = userDefaults.data(forKey: "currentUser"),
              let user = try? JSONDecoder().decode(User.self, from: data) else {
            return nil
        }
        return user
    }
    
    private func clearLocalUser() {
        userDefaults.removeObject(forKey: "currentUser")
    }
}
