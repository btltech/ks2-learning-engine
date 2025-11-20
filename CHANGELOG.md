# Changelog

All notable changes to the KS2 Learning Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-20

### Added
- Initial release of KS2 Learning Engine
- MiRa AI tutor companion for personalized learning
- 18 diverse KS2 subjects including Languages (French, Spanish, German, Japanese, Mandarin, Romanian, Yoruba)
- Comprehensive lesson generation with adaptive difficulty
- Quiz system with 1800+ questions across subjects
- Real-time feedback with AI explanations
- Parent dashboard with progress tracking
- User profile system with mastery levels and badges
- Store with customizable avatar items
- Leaderboard and progress visualization
- **MiRa Enhanced Capabilities**:
  - Progress reports and learning insights for parents
  - Subject connections showing interdisciplinary links
  - Project suggestions for hands-on learning
  - Real-time quiz hints without giving answers
  - Concept reinforcement with extra practice
  - Customized learning recommendations
- Text-to-speech using browser-based Transformers.js
- Offline support with progressive enhancement
- Firebase integration for cloud-based questions
- Question deduplication and caching
- Comprehensive test coverage with Vitest
- Responsive design for mobile and tablet
- Content validation and safety monitoring

### Technical Details
- Built with TypeScript and React
- Vite for fast development and builds
- Tailwind CSS for styling
- Google Generative AI (Gemini) integration
- Firebase Firestore for data persistence
- Web Workers for background TTS processing
- LocalStorage for client-side caching
- Progressive enhancement for offline scenarios

### Browser Support
- Modern browsers with ES2020+ support
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Roadmap

- [ ] Voice input commands for MiRa
- [ ] Advanced analytics dashboard
- [ ] Teacher classroom management tools
- [ ] Multi-language UI support
- [ ] Accessibility improvements
- [ ] Performance optimizations for low-bandwidth
- [ ] Mobile app (React Native)
