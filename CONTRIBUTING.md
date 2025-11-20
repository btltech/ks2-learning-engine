# Contributing to KS2 Learning Engine

We appreciate your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ks2-learning-engine.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start development: `npm run dev`

## Development Workflow

### Before You Start
- Check existing issues to avoid duplicating work
- Create an issue to discuss major changes
- Keep PRs focused on a single feature or fix

### Making Changes

1. Write clear, descriptive commit messages
2. Keep commits small and logical
3. Test your changes: `npm test`
4. Build to check for errors: `npm run build`

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Format code with Prettier (runs on commit)
- Use meaningful variable/function names
- Add comments for complex logic

### Testing

- Write tests for new features
- Ensure all tests pass: `npm test -- --run`
- Aim for good test coverage

### Commit Messages

Use clear, descriptive commit messages:
```
feat: Add new MiRa feature
fix: Resolve quiz timer bug
docs: Update deployment guide
test: Add tests for offline mode
```

## Pull Request Process

1. Update README if needed
2. Add test cases for new features
3. Ensure CI passes (tests + build)
4. Request review from maintainers
5. Address feedback promptly

## Areas for Contribution

- **Features**: New MiRa capabilities, UI improvements
- **Bug Fixes**: Help squash bugs
- **Documentation**: Improve guides and comments
- **Testing**: Increase coverage
- **Accessibility**: Make learning experience more inclusive
- **Performance**: Optimize for slower devices

## Questions?

- Check the README and documentation
- Look at existing issues for similar questions
- Ask in pull request discussions

Thank you for contributing! 🎉
