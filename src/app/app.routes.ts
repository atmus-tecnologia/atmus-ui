import { Routes } from '@angular/router';
import { ShowcaseShell } from './showcase/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShowcaseShell,
    children: [
      { path: '', loadComponent: () => import('./showcase/pages/home.page').then((m) => m.HomePage) },
      { path: 'buttons', loadComponent: () => import('./showcase/pages/buttons.page').then((m) => m.ButtonsPage) },
      { path: 'inputs', loadComponent: () => import('./showcase/pages/inputs.page').then((m) => m.InputsPage) },
      { path: 'upload', loadComponent: () => import('./showcase/pages/upload.page').then((m) => m.UploadPage) },
      { path: 'selection', loadComponent: () => import('./showcase/pages/selection.page').then((m) => m.SelectionPage) },
      { path: 'selects', loadComponent: () => import('./showcase/pages/selects.page').then((m) => m.SelectsPage) },
      { path: 'dropdowns', loadComponent: () => import('./showcase/pages/dropdowns.page').then((m) => m.DropdownsPage) },
      { path: 'dates', loadComponent: () => import('./showcase/pages/dates.page').then((m) => m.DatesPage) },
      { path: 'overlays', loadComponent: () => import('./showcase/pages/overlays.page').then((m) => m.OverlaysPage) },
      { path: 'feedback', loadComponent: () => import('./showcase/pages/feedback.page').then((m) => m.FeedbackPage) },
      { path: 'display', loadComponent: () => import('./showcase/pages/display.page').then((m) => m.DisplayPage) },
      { path: 'data', loadComponent: () => import('./showcase/pages/data.page').then((m) => m.DataPage) },
      { path: 'charts', loadComponent: () => import('./showcase/pages/charts.page').then((m) => m.ChartsPage) },
      { path: 'flow', loadComponent: () => import('./showcase/pages/flow.page').then((m) => m.FlowPage) },
      { path: 'audio', loadComponent: () => import('./showcase/pages/audio.page').then((m) => m.AudioPage) },
      { path: 'colors', loadComponent: () => import('./showcase/pages/colors.page').then((m) => m.ColorsPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
