# TransAIRobot Website Testing

This directory contains tests for the TransAIRobot website project. The testing framework uses Vitest with Vue Test Utils and Testing Library for Vue.

## Test Structure

The tests are organized into the following directories:

- `unit/`: Unit tests for individual components, store modules, and utility functions
  - `components/`: Tests for Vue components
  - `store/`: Tests for Vuex store modules
  - `utils/`: Tests for utility functions
- `integration/`: Integration tests for page components and feature workflows

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

## Testing Approach

### Unit Tests

Unit tests focus on testing individual components, store modules, and utility functions in isolation. They verify that:

- Components render correctly with different props and states
- Components emit the correct events when interacted with
- Store modules handle mutations and actions correctly
- Utility functions produce the expected output for given inputs

### Integration Tests

Integration tests verify that different parts of the application work together correctly. They test:

- Page components with their child components
- Interactions between components and the store
- Navigation flows and route handling

### Accessibility Testing

Accessibility tests ensure that the application is usable by people with disabilities. They verify:

- Keyboard navigation works correctly
- Screen readers can interpret the content
- Color contrast meets WCAG standards

## Mocking

The tests use mocking to isolate the code being tested:

- Vue Router is mocked to avoid actual navigation
- Vuex Store is mocked to provide controlled state
- API services are mocked to avoid actual network requests
- Child components are sometimes mocked to focus on the component being tested

## Best Practices

When writing tests, follow these best practices:

1. Test component behavior, not implementation details
2. Use descriptive test names that explain what is being tested
3. Keep tests independent of each other
4. Mock external dependencies
5. Test both success and error scenarios
6. Test edge cases and boundary conditions
