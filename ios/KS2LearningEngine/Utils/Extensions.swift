//
//  Extensions.swift
//  KS2 Learning Engine
//
//  Swift extensions and utilities
//

import SwiftUI

// MARK: - View Extensions

extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content
    ) -> some View {
        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
            self
        }
    }
}

// MARK: - Date Extensions

extension Date {
    func timeAgoDisplay() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: self, relativeTo: Date())
    }
    
    func formattedDate() -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }
}

// MARK: - Color Extensions

extension Color {
    static let adaptiveBackground = Color(uiColor: .systemBackground)
    static let adaptiveSecondaryBackground = Color(uiColor: .secondarySystemBackground)
}
