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
  ```typescript
  import { Component, Input } from '@angular/core';

  @Component({
    selector: 'app-user-profile',
    standalone: true,
    // ...
  })
  export class UserProfileComponent {
    @Input({ required: true }) userId: string;
    @Input() showDetails = false; // Optional with default
  }
  ```

### Signals Implementation
- Use signals for reactive state management:
  ```typescript
  import { Component, signal, computed } from '@angular/core';

  export class CounterComponent {
    // Create a signal with an initial value
    count = signal(0);

    // Create computed signals
    doubleCount = computed(() => this.count() * 2);

    increment() {
      // Update signal value
      this.count.update(value => value + 1);
    }

    reset() {
      // Set signal to a new value
      this.count.set(0);
    }
  }
  ```

- Use Signal-based Inputs/Outputs for components:
  ```typescript
  import { Component, input, output, model } from '@angular/core';
  import { User } from './models/user.model';

  @Component({
    selector: 'user-profile',
    standalone: true,
    // ...
  })
  export class UserProfileComponent {
    // Signal-based input
    name = input<string>('Default Name');
    
    // Required signal input
    userId = input.required<string>();
    
    // Signal-based output
    saved = output<User>();
    
    // Signal-based model
    userModel = model<{name: string}>({ name: 'Default' });
  }
  ```

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
  ```typescript
  import { Component } from '@angular/core';
  import { FormControl, FormGroup, Validators } from '@angular/forms';

  interface UserForm {
    name: FormControl<string>;
    email: FormControl<string>;
    preferences: FormGroup<{
      notifications: FormControl<boolean>;
    }>;
  }

  export class FormComponent {
    form = new FormGroup<UserForm>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', { nonNullable: true }),
      preferences: new FormGroup({
        notifications: new FormControl(true, { nonNullable: true })
      })
    });
  }
  ```

### Using inject() Instead of Constructors
- Use the `inject()` function instead of constructor injection:
  ```typescript
  import { Component, inject } from '@angular/core';
  import { UserService } from './services/user.service';
  import { Router } from '@angular/router';

  @Component({
    // ...
  })
  export class MyComponent {
    // Prefer:
    private userService = inject(UserService);
    private router = inject(Router);
    
    // Instead of:
    // constructor(private userService: UserService, private router: Router) {}
  }
  ```

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
  ```typescript
  import { Injectable, signal, computed } from '@angular/core';
  import { User } from '../models/user.model';

  @Injectable({ providedIn: 'root' })
  export class UserStateService {
    // Private state with signals
    private _user = signal<User | null>(null);
    private _isAuthenticated = signal<boolean>(false);
    
    // Public readonly state
    user = this._user.asReadonly();
    isAuthenticated = this._isAuthenticated.asReadonly();
    
    // Computed state
    userName = computed(() => this._user()?.name || 'Guest');
    
    login(user: User) {
      this._user.set(user);
      this._isAuthenticated.set(true);
    }
    
    logout() {
      this._user.set(null);
      this._isAuthenticated.set(false);
    }
  }
  ```

- Using signals in components:
  ```typescript
  import { Component, computed, inject } from '@angular/core';
  import { UserStateService } from './services/user-state.service';

  @Component({
    selector: 'app-user-profile',
    template: `
      <div *ngIf="isAuthenticated()">
        <h2>Welcome, {{ fullName() }}</h2>
        <button (click)="logout()">Logout</button>
      </div>
    `
  })
  export class UserProfileComponent {
    private userService = inject(UserStateService);
    
    // Read state directly from the service
    user = this.userService.user;
    isAuthenticated = this.userService.isAuthenticated;
    
    // Computed signal based on another signal
    fullName = computed(() => {
      const currentUser = this.user();
      return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest';
    });
    
    logout() {
      this.userService.logout();
    }
  }
  ```

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

- Use Firestore with typed data and converters:
  ```typescript
  import { collection, FirestoreDataConverter } from '@angular/fire/firestore';
  import { Project } from '../models/project.model';

  // Define a converter for your models
  const projectConverter: FirestoreDataConverter<Project> = {
    toFirestore: (project: Project) => ({
      name: project.name,
      description: project.description,
      createdAt: project.createdAt
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Project(
        snapshot.id,
        data.name,
        data.description,
        data.createdAt.toDate()
      );
    }
  };
  
  // Use the converter in your queries
  private projectsCollection = collection(this.firestore, 'projects')
    .withConverter(projectConverter);
  ```

- Implement optimized Firebase data loading:
  ```typescript
  import { Injectable, inject } from '@angular/core';
  import { Firestore, doc, docData } from '@angular/fire/firestore';
  import { Observable } from 'rxjs';
  import { startWith, shareReplay } from 'rxjs/operators';
  
  @Injectable()
  export class DataService {
    private firestore = inject(Firestore);
    
    getProject(id: string): Observable<Project | null> {
      const docRef = doc(this.firestore, `projects/${id}`);
      return docData(docRef).pipe(
        // Use caching strategies
        startWith(null), // To handle initial loading state
        shareReplay(1)   // To share the same response with multiple subscribers
      );
    }
  }
  ```

## Optimizations for Studies and Projects
- Implement lazy loading for study results:
  ```html
  <!-- In study-results-page.component.html -->
  @defer (when study && study.hasResponses) {
    <app-study-results [studyId]="study.id"></app-study-results>
  } @loading {
    <div class="loading-placeholder">Loading results...</div>
  }
  ```

- Use Virtual Scrolling for long lists of participants:
  ```html
  <!-- In a component with long lists -->
  <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
    @for (participant of participants(); track participant.id) {
      <app-participant-card [participant]="participant"></app-participant-card>
    }
  </cdk-virtual-scroll-viewport>
  ```

## UX Strategies for Tracking Applications
- Implement visual feedback during long operations:
  ```typescript
  import { Injectable, inject, signal } from '@angular/core';
  import { Firestore, addDoc, collection } from '@angular/fire/firestore';
  import { Observable, throwError } from 'rxjs';
  import { catchError, finalize } from 'rxjs/operators';
  import { Study } from '../models/study.model';

  @Injectable()
  export class StudyService {
    private firestore = inject(Firestore);
    private studiesCollection = collection(this.firestore, 'studies');
    
    // Loading state signal
    isCreating = signal(false);
    errorMessage = signal<string | null>(null);
    
    createStudy(study: Study): Observable<string> {
      // Set loading state
      this.isCreating.set(true);
      this.errorMessage.set(null);
      
      return addDoc(this.studiesCollection, study).pipe(
        finalize(() => this.isCreating.set(false)),
        catchError(error => {
          this.errorMessage.set('Could not create study');
          return throwError(() => error);
        })
      );
    }
  }
  ```

- Use Material CDK for enhanced accessibility:
  ```typescript
  import { Component, inject, input } from '@angular/core';
  import { DialogRef } from '@angular/cdk/dialog';
  import { FormBuilder, Validators } from '@angular/forms';
  import { Project } from '../models/project.model';

  @Component({
    selector: 'app-edit-project-modal',
    templateUrl: './edit-project-modal.component.html'
  })
  export class EditProjectModalComponent {
    private dialogRef = inject(DialogRef);
    private formBuilder = inject(FormBuilder);
    
    project = input.required<Project>();
    
    form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
    
    ngOnInit() {
      // Initialize form with existing data
      this.form.patchValue({
        name: this.project().name,
        description: this.project().description
      });
    }
    
    save() {
      if (this.form.valid) {
        this.dialogRef.close(this.form.value);
      }
    }
  }
  ```

## Specific File Organization for Your Project
- Recommended structure for Studies and Projects:
  ```
  features/
    study/
      components/           # Study-specific components
      pages/                # Study pages (main routes)
      modals/               # Dialog components
      services/             # Study-related services
        study.service.ts    # Main service
        study.api.ts        # API/Firebase operations
        study.store.ts      # Study state (with signals)
      models/               # Data models
      utils/                # Study-specific utilities
  ```

## Signals for State in your UX-Tracker Application
- Implement a state service for participants:
  ```typescript
  import { Injectable, signal, computed } from '@angular/core';
  import { Participant } from '../models/participant.model';

  @Injectable({ providedIn: 'root' })
  export class ParticipantStateService {
    // Private state
    private _participants = signal<Participant[]>([]);
    private _selectedParticipant = signal<Participant | null>(null);
    private _loading = signal<boolean>(false);
    
    // Public readonly state
    participants = this._participants.asReadonly();
    selectedParticipant = this._selectedParticipant.asReadonly();
    loading = this._loading.asReadonly();
    
    // Computed state
    hasParticipants = computed(() => this._participants().length > 0);
    participantCount = computed(() => this._participants().length);
    
    // Methods to update state
    loadParticipants(studyId: string) {
      this._loading.set(true);
      // Implementation with Firebase
    }
    
    selectParticipant(id: string) {
      const participant = this._participants().find(p => p.id === id) || null;
      this._selectedParticipant.set(participant);
    }
    
    addParticipant(participant: Participant) {
      this._participants.update(current => [...current, participant]);
    }
  }
  ```
