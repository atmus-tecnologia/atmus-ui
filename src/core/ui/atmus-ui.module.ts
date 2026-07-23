import { NgModule } from '@angular/core';

import { AtmIcon } from './components/icon/icon.component';
import { AtmSpinner } from './components/spinner/spinner.component';
import { AtmButton } from './components/button/button.component';
import { AtmButtonGroup } from './components/button/button-group.component';
import { AtmCloseButton } from './components/button/close-button.component';
import {
  AtmDescription,
  AtmErrorMessage,
  AtmFieldset,
  AtmLabel,
} from './components/field/field.components';
import { AtmInput } from './components/input/input.component';
import { AtmInputGroup } from './components/input/input-group.component';
import { AtmTextarea } from './components/input/textarea.component';
import { AtmNumberField } from './components/input/number-field.component';
import { AtmSearchField } from './components/input/search-field.component';
import { AtmInputOtp } from './components/input/input-otp.component';
import { AtmFileInput } from './components/file-input/file-input.component';
import { AtmImageCrop, AtmImageCropDialog } from './components/image-crop/image-crop.component';
import { AtmCheckbox } from './components/checkbox/checkbox.component';
import { AtmCheckboxGroup } from './components/checkbox/checkbox-group.component';
import { AtmRadioGroup } from './components/radio/radio-group.component';
import { AtmSwitch } from './components/switch/switch.component';
import { AtmSlider } from './components/slider/slider.component';
import { AtmSelect } from './components/select/select.component';
import { AtmListbox } from './components/listbox/listbox.component';
import { AtmAutocomplete } from './components/autocomplete/autocomplete.component';
import { AtmComboboxUser } from './components/combobox-user/combobox-user.component';
import { AtmDropdown } from './components/dropdown/dropdown.component';
import { AtmDropdownRemote } from './components/dropdown/dropdown-remote.component';
import { AtmContextMenu, AtmContextMenuTrigger } from './components/context-menu/context-menu.component';
import { AtmTooltip } from './components/tooltip/tooltip.directive';
import { AtmPopover } from './components/popover/popover.component';
import { AtmModal } from './components/modal/modal.component';
import { AtmDrawer } from './components/drawer/drawer.component';
import { AtmToastContainer } from './components/toast/toast-container.component';
import { AtmBadge } from './components/badge/badge.component';
import { AtmChip } from './components/chip/chip.component';
import { AtmAvatar } from './components/avatar/avatar.component';
import { AtmAvatarGroup } from './components/avatar/avatar-group.component';
import { AtmAlert } from './components/alert/alert.component';
import { AtmCard } from './components/card/card.component';
import { AtmSurface } from './components/surface/surface.component';
import { AtmSkeleton } from './components/skeleton/skeleton.component';
import { AtmProgressBar } from './components/progress/progress-bar.component';
import { AtmProgressCircle } from './components/progress/progress-circle.component';
import { AtmMeter } from './components/meter/meter.component';
import { AtmAccordion, AtmAccordionItem } from './components/accordion/accordion.component';
import { AtmTab, AtmTabs } from './components/tabs/tabs.component';
import { AtmPagination } from './components/pagination/pagination.component';
import { AtmBreadcrumbs } from './components/breadcrumbs/breadcrumbs.component';
import { AtmTable } from './components/table/table.component';
import { AtmToggleButton, AtmToggleButtonGroup } from './components/toggle/toggle-button.component';
import { AtmTagGroup } from './components/tag-group/tag-group.component';
import { AtmTags } from './components/tags/tags.component';
import { AtmToolbar } from './components/toolbar/toolbar.component';
import {
  AtmKbd,
  AtmLink,
  AtmScrollShadow,
  AtmSeparator,
  AtmTypography,
} from './components/misc/misc.components';
import { AtmCalendar } from './components/calendar/calendar.component';
import { AtmDatePicker } from './components/datepicker/date-picker.component';
import { AtmDateRangePicker } from './components/datepicker/date-range-picker.component';
import { AtmTimeField } from './components/datepicker/time-field.component';
import {
  AtmColorField,
  AtmColorSwatch,
  AtmColorSwatchPicker,
} from './components/color/color.components';
import { AtmChart } from './components/chart/chart.component';
import { AtmAudioVisualizer } from './components/audio-visualizer/audio-visualizer.component';
import { AtmFlow } from './components/flow/flow.component';
import { AtmFlowNodeHandle } from './components/flow/flow-handle.component';
import { AtmFlowNodeDef } from './components/flow/flow-node-def.directive';

const COMPONENTS = [
  AtmIcon,
  AtmSpinner,
  AtmButton,
  AtmButtonGroup,
  AtmCloseButton,
  AtmLabel,
  AtmDescription,
  AtmErrorMessage,
  AtmFieldset,
  AtmInput,
  AtmInputGroup,
  AtmTextarea,
  AtmNumberField,
  AtmSearchField,
  AtmInputOtp,
  AtmFileInput,
  AtmImageCrop,
  AtmImageCropDialog,
  AtmCheckbox,
  AtmCheckboxGroup,
  AtmRadioGroup,
  AtmSwitch,
  AtmSlider,
  AtmSelect,
  AtmListbox,
  AtmAutocomplete,
  AtmComboboxUser,
  AtmDropdown,
  AtmDropdownRemote,
  AtmContextMenu,
  AtmContextMenuTrigger,
  AtmTooltip,
  AtmPopover,
  AtmModal,
  AtmDrawer,
  AtmToastContainer,
  AtmBadge,
  AtmChip,
  AtmAvatar,
  AtmAvatarGroup,
  AtmAlert,
  AtmCard,
  AtmSurface,
  AtmSkeleton,
  AtmProgressBar,
  AtmProgressCircle,
  AtmMeter,
  AtmAccordion,
  AtmAccordionItem,
  AtmTabs,
  AtmTab,
  AtmPagination,
  AtmBreadcrumbs,
  AtmTable,
  AtmToggleButton,
  AtmToggleButtonGroup,
  AtmTagGroup,
  AtmTags,
  AtmToolbar,
  AtmSeparator,
  AtmKbd,
  AtmLink,
  AtmScrollShadow,
  AtmTypography,
  AtmCalendar,
  AtmDatePicker,
  AtmDateRangePicker,
  AtmTimeField,
  AtmColorSwatch,
  AtmColorSwatchPicker,
  AtmColorField,
  AtmChart,
  AtmAudioVisualizer,
  AtmFlow,
  AtmFlowNodeDef,
  AtmFlowNodeHandle,
];

/**
 * Convenience NgModule that imports/exports every Atmus UI standalone
 * component. Prefer importing individual components for tree-shaking;
 * use this module for quick prototyping.
 */
@NgModule({
  imports: COMPONENTS,
  exports: COMPONENTS,
})
export class AtmusUiModule {}
