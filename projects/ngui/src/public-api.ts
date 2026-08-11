/**
 * Atmus UI — public API.
 * npm install @atmus/ngui, then:
 *   - @import '@atmus/ngui/styles.css' in your global stylesheet
 *   - add provideAtmusUi({...}) to app.config.ts providers
 *   - import AtmusUiModule (or individual components) where needed
 */

// Config & services
export * from './lib/config';
export * from './lib/types';
export * from './lib/services/theme.service';
export * from './lib/services/toast.service';
export * from './lib/services/dialog.service';
export * from './lib/services/alert-dialog.service';
export * from './lib/services/rest.service';
export * from './lib/services/assistant.service';

// Utils
export * from './lib/utils/position';
export * from './lib/utils/value-accessor';
export * from './lib/utils/overlay-base';

// Components
export * from './lib/components/icon/icon.component';
export * from './lib/components/spinner/spinner.component';
export * from './lib/components/button/button.component';
export * from './lib/components/button/button-group.component';
export * from './lib/components/button/close-button.component';
export * from './lib/components/field/field.components';
export * from './lib/components/input/input.component';
export * from './lib/components/input/input-group.component';
export * from './lib/components/input/textarea.component';
export * from './lib/components/input/number-field.component';
export * from './lib/components/input/search-field.component';
export * from './lib/components/input/input-otp.component';
export * from './lib/components/rich-text/rich-text.component';
export * from './lib/components/file-input/file-input.component';
export * from './lib/components/image-crop/image-crop.component';
export * from './lib/components/signature/signature.component';
export * from './lib/components/qrcode/qrcode.component';
export * from './lib/components/qrcode/qr-encoder';
export * from './lib/components/checkbox/checkbox.component';
export * from './lib/components/checkbox/checkbox-group.component';
export * from './lib/components/radio/radio-group.component';
export * from './lib/components/switch/switch.component';
export * from './lib/components/slider/slider.component';
export * from './lib/components/select/select.component';
export * from './lib/components/listbox/listbox.component';
export * from './lib/components/autocomplete/autocomplete.component';
export * from './lib/components/combobox-user/combobox-user.component';
export * from './lib/components/dropdown/dropdown.component';
export * from './lib/components/dropdown/dropdown-remote.component';
export * from './lib/components/context-menu/context-menu.component';
export * from './lib/components/tooltip/tooltip.directive';
export * from './lib/components/popover/popover.component';
export * from './lib/components/modal/modal.component';
export * from './lib/components/drawer/drawer.component';
export * from './lib/components/toast/toast-container.component';
export * from './lib/components/badge/badge.component';
export * from './lib/components/chip/chip.component';
export * from './lib/components/avatar/avatar.component';
export * from './lib/components/avatar/avatar-group.component';
export * from './lib/components/alert/alert.component';
export * from './lib/components/card/card.component';
export * from './lib/components/surface/surface.component';
export * from './lib/components/skeleton/skeleton.component';
export * from './lib/components/progress/progress-bar.component';
export * from './lib/components/progress/progress-circle.component';
export * from './lib/components/meter/meter.component';
export * from './lib/components/accordion/accordion.component';
export * from './lib/components/tabs/tabs.component';
export * from './lib/components/pagination/pagination.component';
export * from './lib/components/breadcrumbs/breadcrumbs.component';
export * from './lib/components/table/table.component';
export * from './lib/components/toggle/toggle-button.component';
export * from './lib/components/tag-group/tag-group.component';
export * from './lib/components/tags/tags.component';
export * from './lib/components/toolbar/toolbar.component';
export * from './lib/components/action-bar/action-bar.component';
export * from './lib/components/misc/misc.components';
export * from './lib/components/calendar/calendar.component';
export * from './lib/components/datepicker/date-presets';
export * from './lib/components/datepicker/date-picker.component';
export * from './lib/components/datepicker/date-range-picker.component';
export * from './lib/components/datepicker/time-field.component';
export * from './lib/components/color/color.components';
export * from './lib/components/chart/chart.component';
export * from './lib/components/audio-visualizer/audio-visualizer.component';
export * from './lib/components/kanban/kanban.component';
export * from './lib/components/event-calendar/event-calendar.component';
export * from './lib/components/office/office.component';
export * from './lib/components/flow/flow.types';
export * from './lib/components/flow/flow.component';
export * from './lib/components/flow/flow-node-def.directive';
export * from './lib/components/flow/flow-handle.component';

export * from './lib/atmus-ui.module';
