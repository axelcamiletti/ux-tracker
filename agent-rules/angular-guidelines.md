# Angular Development Guidelines

> **IMPORTANTE**: Estas directrices deben ser seguidas por todos los miembros del equipo para mantener la consistencia y calidad del código. Por favor, cíñete a estas reglas cuando desarrolles en este proyecto.

# Angular Development guidelines Rules

## File Structure
- Each feature should be self-contained in its own directory with the following structure:
  ```
  feature-name/
  ├── components/
  │   └── component-name/
  │       ├── component-name.component.ts
  │       ├── component-name.component.html
  │       ├── component-name.component.css
  │       └── component-name.component.spec.ts
  ├── services/
  │   └── feature-name.service.ts
  ├── models/
  │   └── feature-name.model.ts
  └── interfaces/
      └── feature-name.interface.ts
  ```

- Global shared items should be in their respective directories:
  ```
  app/
  ├── shared/
  │   ├── components/    # Standalone shared components
  │   ├── directives/
  │   ├── pipes/
  │   └── utils/
  ├── core/
  │   ├── services/      # App-wide services
  │   ├── guards/
  │   └── interceptors/
  └── features/          # Each feature is standalone
      ├── home/
      ├── projects/
      └── study/
  ```

## Standalone Components
- Use standalone components exclusively
- Import dependencies directly in each component
- Group related components by feature/domain
- Share components through direct imports
- Use route-level code splitting for lazy loading
- Apply `@Component({ standalone: true })` to all new components

## Angular Modernization
- Adopt the latest Angular 19+/20+ patterns and APIs:
  - Use the new control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives
  - Replace ngModules with standalone components
  - Use functional guards and resolvers with the `inject()` function
  - Use signals for state management
  - Implement typed forms and controls
  - Use standalone-based lazy loading
  - Adopt the Angular image directives (`NgOptimizedImage`)
  - Use `withComponentInputBinding()` for routing with component inputs
  - Take advantage of deferred loading with `@defer` blocks

### Deferred Loading
- Use `@defer` blocks to lazy load components when needed:
  ```typescript
  // In template file:
  @defer {
    <expensive-component [input]="data"></expensive-component>
  } @loading {
    <p>Loading...</p>
  }
  ```

### Required Inputs
- Use the `required` modifier with input properties:

### Signals Implementation
- Use signals for reactive state management:
- Use Signal-based Inputs/Outputs for components:


### Modern Route Configuration
- Use functional route configuration:
  ```typescript
  import { Routes } from '@angular/router';
  import { inject } from '@angular/core';
  import { AuthService } from './services/auth.service';

  export const routes: Routes = [
    {
      path: 'studies',
      loadComponent: () => import('./features/study/pages/studies/studies.component')
        .then(m => m.StudiesComponent),
      canActivate: [() => inject(AuthService).isAuthenticated()]
    }
  ];
  ```

### Typed Forms Implementation
- Use typed reactive forms:

### Using inject() Instead of Constructors
- Use the `inject()` function instead of constructor injection:

## Naming Conventions
- Files: `kebab-case`
  - Components: `feature-name.component.ts`
  - Services: `feature-name.service.ts`
  - Models: `feature-name.model.ts`
  - Interfaces: `feature-name.interface.ts`
- Classes: `PascalCase`
  - Components: `FeatureNameComponent`
  - Services: `FeatureNameService`
  - Models: `FeatureNameModel`
- Methods and properties: `camelCase`
- Component selectors: `app-feature-name`
- Directive selectors: `appDirectiveName`
- Interface names: `IFeatureName`
- Enum names: `FeatureNameEnum`

## Component Structure
- Import order in component files:
  1. Angular core imports
  2. Angular material imports
  3. Third-party imports
  4. Application imports (ordered by relative path depth)
- Declare component members in the following order:
  1. Input/Output decorators
  2. ViewChild/ViewChildren
  3. Public properties
  4. Private properties
  5. Constructor
  6. Lifecycle hooks
  7. Public methods
  8. Private methods

## Template Guidelines
- Use `trackBy` with `*ngFor` for better performance
- Prefer `*ngIf` over `[hidden]`
- Use async pipe (`|`) for observables
- Keep templates clean and readable
- Extract complex logic to component methods
- Use meaningful names for template variables
- Keep templates focused on presentation logic
- Move complex business logic to services

## Style Guidelines
- Use Tailwind classes for styling
- Avoid inline styles
- Use CSS variables for theming
- Keep styles scoped to components
- Follow mobile-first approach
- Use BEM methodology for custom CSS classes when needed

## Best Practices
- Use TypeScript strict mode
- Implement proper error handling
- Use strong typing (avoid `any`)
- Follow Single Responsibility Principle
- Keep components small and focused
- Use services for data management and business logic
- Implement proper unsubscribe patterns for observables
- Use Angular's change detection strategies appropriately
- Use inject() function for service injection instead of constructor injection

## Performance
- Use `OnPush` change detection when possible
- Implement lazy loading for routes and components
- Optimize images and assets
- Implement simple caching strategies for frequent data
- Minimize bundle size
- Use `NgOptimizedImage` directive for image optimization

## Testing
- Write unit tests for components and services
- Use TestBed for component testing
- Mock dependencies appropriately
- Test edge cases and error scenarios
- Maintain good test coverage
- Follow AAA pattern (Arrange, Act, Assert)

## Error Handling
- Implement proper error boundaries
- Use try-catch blocks appropriately
- Handle HTTP errors gracefully
- Show user-friendly error messages
- Log errors appropriately
- Implement global error handling

## State Management with Signals
- Use services with signals for simple state management:
- Using signals in components:

## Security
- Sanitize user input
- Use Angular's built-in XSS protection
- Implement proper authentication/authorization
- Follow OWASP security guidelines
- Use HTTPS for all API calls
- Implement CSRF protection

## Accessibility
- Use semantic HTML
- Implement ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Follow WCAG guidelines
- Provide alternative text for images

## Documentation
- Use JSDoc for documentation
- Document complex logic
- Keep README files updated
- Document API endpoints
- Include setup instructions
- Document build and deployment processes

## Version Control
- Use meaningful commit messages
- Follow conventional commits
- Create feature branches
- Review code before merging
- Keep dependencies updated
- Use proper versioning (SemVer)

## Routing
- Use standalone route configuration with functional approach
- Implement lazy loading through loadComponent and loadChildren
- Use functional route guards with inject()
- Pass data to components using component inputs and withComponentInputBinding()
- Implement proper navigation with Router.navigateByUrl() and Router.navigate()
- Use URL parameters effectively with ParamMap and typed route params

## Forms
- Use Reactive Forms when possible
- Implement proper validation
- Show validation errors clearly
- Use typed forms
- Handle form state appropriately
- Use `FormBuilder` with typed methods

## Data Management
- Use services for API calls
- Implement basic error handling
- Use proper typing for API responses
- Handle loading states with signals

## Firebase Integration
- Use modern injection for Firebase services:
  ```typescript
  import { Injectable, inject } from '@angular/core';
  import { Firestore, collection, doc, setDoc, getDocs, query } from '@angular/fire/firestore';

  @Injectable({ providedIn: 'root' })
  export class ProjectService {
    // Prefer:
    private firestore = inject(Firestore);
    
    // Instead of:
    // constructor(private firestore: Firestore) {}
  }
  ```
