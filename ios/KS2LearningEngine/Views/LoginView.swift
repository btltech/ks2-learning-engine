//
//  LoginView.swift
//  KS2 Learning Engine
//
//  Login and authentication screen
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var loginMode: LoginMode = .parent
    @State private var authMode: AuthMode = .signIn
    
    // Parent/Teacher login
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var name = ""
    @State private var selectedRole: UserRole = .parent
    
    // Child login
    @State private var childName = ""
    @State private var parentCode = ""
    @State private var pin = ""
    @State private var age = 9
    
    @State private var showError = false
    @State private var showForgotPassword = false
    
    enum LoginMode {
        case parent
        case child
    }
    
    enum AuthMode {
        case signIn
        case signUp
        case forgotPassword
    }
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [Color.indigo, Color.purple],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    Spacer().frame(height: 40)
                    
                    // Logo and title
                    VStack(spacing: 12) {
                        Image(systemName: "graduationcap.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.white)
                        
                        Text("KS2 Learning Engine")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Learn • Grow • Achieve")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.bottom, 20)
                    
                    // Login Mode Toggle
                    Picker("Login As", selection: $loginMode) {
                        Text("Parent/Teacher").tag(LoginMode.parent)
                        Text("Child").tag(LoginMode.child)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 32)
                    
                    // Form
                    VStack(spacing: 16) {
                        if loginMode == .parent {
                            parentLoginForm
                        } else {
                            childLoginForm
                        }
                    }
                    .padding(.horizontal, 32)
                    
                    Spacer().frame(height: 40)
                }
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(authManager.errorMessage ?? "An error occurred")
        }
        .onChange(of: authManager.errorMessage) { newValue in
            if newValue != nil {
                showError = true
            }
        }
    }
    
    // MARK: - Parent/Teacher Login Form
    
    private var parentLoginForm: some View {
        VStack(spacing: 16) {
            if authMode == .forgotPassword {
                Text("Reset Password")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.bottom, 8)
                
                CustomTextField(placeholder: "Email", text: $email, icon: "envelope.fill")
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                
                Button(action: handleForgotPassword) {
                    if authManager.isLoading {
                        SwiftUI.ProgressView()
                            .tint(.white)
                    } else {
                        Text("Send Reset Email")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.white)
                .foregroundColor(.indigo)
                .cornerRadius(12)
                .disabled(authManager.isLoading)
                
                Button(action: { authMode = .signIn }) {
                    Text("Back to Sign In")
                        .font(.footnote)
                        .foregroundColor(.white)
                }
            } else {
                if authMode == .signUp {
                    CustomTextField(placeholder: "Name", text: $name, icon: "person.fill")
                }
                
                CustomTextField(placeholder: "Email", text: $email, icon: "envelope.fill")
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                
                CustomTextField(placeholder: "Password", text: $password, icon: "lock.fill", isSecure: true)
                
                if authMode == .signUp {
                    CustomTextField(placeholder: "Confirm Password", text: $confirmPassword, icon: "lock.fill", isSecure: true)
                    
                    RolePicker(selectedRole: $selectedRole)
                }
                
                Button(action: handleParentAuthentication) {
                    if authManager.isLoading {
                        SwiftUI.ProgressView()
                            .tint(.white)
                    } else {
                        Text(authMode == .signUp ? "Sign Up" : "Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.white)
                .foregroundColor(.indigo)
                .cornerRadius(12)
                .disabled(authManager.isLoading)
                
                Button(action: { 
                    authMode = authMode == .signUp ? .signIn : .signUp
                    email = ""
                    password = ""
                    confirmPassword = ""
                    name = ""
                }) {
                    Text(authMode == .signUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                        .font(.footnote)
                        .foregroundColor(.white)
                }
                
                if authMode == .signIn {
                    Button(action: { authMode = .forgotPassword }) {
                        Text("Forgot Password?")
                            .font(.footnote)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
        }
    }
    
    // MARK: - Child Login Form
    
    private var childLoginForm: some View {
        VStack(spacing: 16) {
            Text("Child Login")
                .font(.headline)
                .foregroundColor(.white)
                .padding(.bottom, 8)
            
            CustomTextField(placeholder: "Your Name", text: $childName, icon: "person.fill")
            
            CustomTextField(placeholder: "Parent Code (6 characters)", text: $parentCode, icon: "key.fill")
                .textInputAutocapitalization(.characters)
            
            CustomTextField(placeholder: "PIN (4-6 digits)", text: $pin, icon: "lock.fill", isSecure: true)
                .keyboardType(.numberPad)
            
            // Age Picker
            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.white.opacity(0.7))
                    .frame(width: 20)
                
                Text("Age:")
                    .foregroundColor(.white)
                
                Picker("Age", selection: $age) {
                    ForEach(5...18, id: \.self) { age in
                        Text("\(age)").tag(age)
                    }
                }
                .pickerStyle(.menu)
                .accentColor(.white)
            }
            .padding()
            .background(Color.white.opacity(0.2))
            .cornerRadius(12)
            
            Button(action: handleChildLogin) {
                if authManager.isLoading {
                    SwiftUI.ProgressView()
                        .tint(.white)
                } else {
                    Text("Start Learning")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.white)
            .foregroundColor(.indigo)
            .cornerRadius(12)
            .disabled(authManager.isLoading)
            
            Text("Ask your parent for the code and PIN")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.top, 8)
        }
    }
    
    // MARK: - Actions
    
    private func handleParentAuthentication() {
        Task {
            do {
                if authMode == .signUp {
                    guard !name.trimmingCharacters(in: .whitespaces).isEmpty else {
                        await MainActor.run {
                            authManager.errorMessage = "Please enter your name."
                        }
                        return
                    }
                    guard password == confirmPassword else {
                        await MainActor.run {
                            authManager.errorMessage = "Passwords do not match."
                        }
                        return
                    }
                    guard password.count >= 6 else {
                        await MainActor.run {
                            authManager.errorMessage = "Password must be at least 6 characters."
                        }
                        return
                    }
                    try await authManager.signUp(email: email, password: password, name: name, role: selectedRole)
                } else {
                    try await authManager.signIn(email: email, password: password)
                }
            } catch {
                print("Authentication failed: \(error)")
            }
        }
    }
    
    private func handleChildLogin() {
        Task {
            do {
                guard !childName.trimmingCharacters(in: .whitespaces).isEmpty else {
                    await MainActor.run {
                        authManager.errorMessage = "Please enter your name."
                    }
                    return
                }
                guard parentCode.trimmingCharacters(in: .whitespaces).count == 6 else {
                    await MainActor.run {
                        authManager.errorMessage = "Parent code must be exactly 6 characters."
                    }
                    return
                }
                guard pin.count >= 4 && pin.count <= 6 && pin.allSatisfy({ $0.isNumber }) else {
                    await MainActor.run {
                        authManager.errorMessage = "PIN must be 4-6 digits."
                    }
                    return
                }
                
                try await authManager.loginChildWithParentCode(
                    parentCode: parentCode,
                    name: childName,
                    age: age,
                    pin: pin
                )
            } catch {
                print("Child login failed: \(error)")
            }
        }
    }
    
    private func handleForgotPassword() {
        Task {
            do {
                try await authManager.sendPasswordReset(email: email)
                await MainActor.run {
                    authMode = .signIn
                    authManager.errorMessage = "Password reset email sent! Check your inbox."
                }
            } catch {
                print("Password reset failed: \(error)")
            }
        }
    }
}

struct CustomTextField: View {
    let placeholder: String
    @Binding var text: String
    let icon: String
    var isSecure = false
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.white.opacity(0.7))
                .frame(width: 20)
            
            if isSecure {
                SecureField(placeholder, text: $text)
            } else {
                TextField(placeholder, text: $text)
            }
        }
        .padding()
        .background(Color.white.opacity(0.2))
        .foregroundColor(.white)
        .cornerRadius(12)
    }
}

struct RolePicker: View {
    @Binding var selectedRole: UserRole
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("I am a...")
                .font(.subheadline)
                .foregroundColor(.white)
            
            Picker("Role", selection: $selectedRole) {
                Text("Parent").tag(UserRole.parent)
                Text("Teacher").tag(UserRole.teacher)
                Text("Student").tag(UserRole.student)
            }
            .pickerStyle(.segmented)
        }
    }
}
