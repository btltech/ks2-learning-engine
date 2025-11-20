name: Feature Request
description: Suggest an idea for the KS2 Learning Engine
labels: ["enhancement"]

body:
  - type: markdown
    attributes:
      value: |
        Thank you for suggesting a feature! We'd love to hear your ideas.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Describe the feature you'd like to see
      placeholder: What would you like to improve or add?
    validations:
      required: true

  - type: textarea
    id: use_case
    attributes:
      label: Use Case
      description: Explain how this feature would help students or parents
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Any other approaches you've considered?

  - type: checkboxes
    id: area
    attributes:
      label: Area
      options:
        - label: Student Learning Experience
        - label: Parent Dashboard
        - label: MiRa AI Features
        - label: Quiz & Assessment
        - label: Performance & Speed
        - label: Accessibility
        - label: Other
