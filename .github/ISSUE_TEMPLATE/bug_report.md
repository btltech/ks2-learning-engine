name: Bug Report
description: Report a bug or issue with the KS2 Learning Engine
labels: ["bug"]

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please provide as much detail as possible.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Describe the bug
      placeholder: What happened?
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: Please provide relevant environment details
      value: |
        - Browser: 
        - OS: 
        - Node version: 
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Logs or Error Messages
      description: Any relevant logs or error messages
      render: bash
