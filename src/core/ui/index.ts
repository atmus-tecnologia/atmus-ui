/**
 * Atmus UI — public API.
 * Copy the whole src/core/ui folder into a new project, then:
 *   - import atmus.css in your styles.css (after tailwindcss)
 *   - add provideAtmusUi({...}) to app.config.ts providers
 *   - import AtmusUiModule (or individual components) where needed
 */

// Config & services
export * from './config';
export * from './types';
export * from './services/theme.service';
export * from './services/toast.service';
export * from './services/dialog.service';
export * from './services/alert-dialog.service';
export * from './services/rest.service';

// Utils
export * from './utils/position';
export * from './utils/value-accessor';
export * from './utils/overlay-base';

// Components
export * from './components/icon/icon.component';
export * from './components/spinner/spinner.component';
export * from './components/button/button.component';
export * from './components/button/button-group.component';
export * from './components/button/close-button.component';
export * from './components/field/field.components';
export * from './components/input/input.component';
export * from './components/input/input-group.component';
export * from './components/input/textarea.component';
export * from './components/input/number-field.component';
export * from './components/input/search-field.component';
export * from './components/input/input-otp.component';
export * from './components/checkbox/checkbox.component';
export * from './components/checkbox/checkbox-group.component';
export * from './components/radio/radio-group.component';
export * from './components/switch/switch.component';
export * from './components/slider/slider.component';
export * from './components/select/select.component';
export * from './components/listbox/listbox.component';
export * from './components/autocomplete/autocomplete.component';
export * from './components/dropdown/dropdown.component';
export * from './components/dropdown/dropdown-remote.component';
export * from './components/tooltip/tooltip.directive';
export * from './components/popover/popover.component';
export * from './components/modal/modal.component';
export * from './components/drawer/drawer.component';
export * from './components/toast/toast-container.component';
export * from './components/badge/badge.component';
export * from './components/chip/chip.component';
export * from './components/avatar/avatar.component';
export * from './components/alert/alert.component';
export * from './components/card/card.component';
export * from './components/surface/surface.component';
export * from './components/skeleton/skeleton.component';
export * from './components/progress/progress-bar.component';
export * from './components/progress/progress-circle.component';
export * from './components/meter/meter.component';
export * from './components/accordion/accordion.component';
export * from './components/tabs/tabs.component';
export * from './components/pagination/pagination.component';
export * from './components/breadcrumbs/breadcrumbs.component';
export * from './components/table/table.component';
export * from './components/toggle/toggle-button.component';
export * from './components/tag-group/tag-group.component';
export * from './components/tags/tags.component';
export * from './components/toolbar/toolbar.component';
export * from './components/misc/misc.components';
export * from './components/calendar/calendar.component';
export * from './components/datepicker/date-picker.component';
export * from './components/datepicker/date-range-picker.component';
export * from './components/datepicker/time-field.component';
export * from './components/color/color.components';

export * from './atmus-ui.module';
