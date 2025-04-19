import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { StudyCreationPageComponent } from './features/study/pages/study-creation-page/study-creation-page.component';
import { StudyPublicPageComponent } from './features/study/pages/study-public-page/study-public-page.component';
import { StudyAnalyticsPageComponent } from './features/study/pages/study-analytics-page/study-analytics-page.component';
import { ProjectsComponent } from './features/projects/pages/projects-page/projects.component';
import { ProjectPageComponent } from './features/projects/pages/project-page/project-page.component';
import { StudyLayoutComponent } from './features/study/components/study-layout/study-layout.component';
import { StudySharePageComponent } from './features/study/pages/study-share-page/study-share-page.component';
import { StudyResultsPageComponent } from './features/study/pages/study-results-page/study-results-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', component: ProjectsComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/:id', component: ProjectPageComponent },
    ]
  },
  {
    path: 'study/:id',
    component: StudyLayoutComponent,
    children: [
      { path: '', redirectTo: 'creation', pathMatch: 'full' },
      { path: 'creation', component: StudyCreationPageComponent },
      { path: 'share', component: StudySharePageComponent },
      { path: 'results', component: StudyResultsPageComponent },
      { path: 'analytics', component: StudyAnalyticsPageComponent }
    ]
  },
  { path: 'study-public/:id', component: StudyPublicPageComponent },
  { path: '**', redirectTo: 'projects', pathMatch: 'full' } // Redirect to home for any other paths
];