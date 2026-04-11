//
//  AppConfig.swift
//  KS2 Learning Engine
//
//  Central place for runtime configuration.
//

import Foundation

enum AppConfig {
    /// Base URL for the web app / Cloudflare Pages deployment hosting the `/api/*` endpoints.
    ///
    /// Override by adding `KS2_API_BASE_URL` to Info.plist.
    /// Default falls back to the production Pages domain.
    static var apiBaseURL: URL {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "KS2_API_BASE_URL") as? String,
           let url = URL(string: raw.trimmingCharacters(in: .whitespacesAndNewlines)),
           !raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return url
        }

        return URL(string: "https://ks2-learning-engine.pages.dev")!
    }

    static var childSessionURL: URL {
        apiBaseURL.appendingPathComponent("api").appendingPathComponent("child-session")
    }
}
