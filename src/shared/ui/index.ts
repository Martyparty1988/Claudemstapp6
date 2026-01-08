/**
 * MST Shared UI - Public API
 * 
 * 2026 Glassmorphism Edition
 * Čisté, znovupoužitelné UI komponenty.
 */

// Layout
export {
  Screen,
  ScreenHeader,
  ScreenContent,
  ScreenFooter,
  BackButton,
  PageTitle,
  Section,
  EmptyState,
  type EmptyStateProps,
} from './Screen';

// Buttons
export {
  Button,
  IconButton,
  GradientButton,
  TextButton,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type IconButtonProps,
  type GradientButtonProps,
} from './Button';

// Cards
export {
  Card,
  GradientCard,
  FeatureCard,
  ActionCard,
  StatCard,
  CardHeader,
  type CardProps,
  type CardVariant,
  type CardPadding,
  type StatCardProps,
  type FeatureCardProps,
  type ActionCardProps,
} from './Card';

// Inputs
export {
  Input,
  SearchInput,
  PasswordInput,
  TextArea,
  useSearch,
  type InputProps,
  type InputSize,
  type InputVariant,
  type SearchInputProps,
  type TextAreaProps,
  type UseSearchOptions,
} from './Input';

// Pull to Refresh
export {
  PullToRefresh,
  usePullToRefresh,
  type PullToRefreshProps,
} from './PullToRefresh';

// Tab Bar
export {
  TabBar,
  DEFAULT_TAB_ITEMS,
  type TabBarProps,
  type TabItem,
} from './TabBar';

// Loading & Spinners
export {
  Spinner,
  LoadingSpinner,
  LoadingScreen,
  LoadingOverlay,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  SkeletonProject,
  SkeletonChat,
  SkeletonStats,
  SkeletonDetail,
  type SpinnerSize,
  type SkeletonProps,
} from './Loading';

// Error States
export {
  ErrorState,
  ErrorBanner,
  SuccessBanner,
  type ErrorStateProps,
  type ErrorBannerProps,
  type SuccessBannerProps,
} from './ErrorState';

// Bottom Sheet
export {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetContent,
  BottomSheetFooter,
  type BottomSheetProps,
} from './BottomSheet';

// Grid
export {
  Grid,
  GridCell,
  ScrollableGrid,
  GridOverlay,
  GridLegend,
  DEFAULT_GRID_LEGEND,
  type GridProps,
  type GridCellProps,
  type CellStatus,
} from './Grid';

// Badges & Chips
export {
  Badge,
  StatusBadge,
  Chip,
  ChipGroup,
  ProgressBadge,
  CountBadge,
  type BadgeVariant,
  type WorkStatusType,
  type ChipOption,
} from './Badge';

// Lists
export {
  List,
  ListItem,
  ListSection,
  ListItemIcon,
  ListItemValue,
  ListSeparator,
  Toggle,
  type ListItemProps,
  type ToggleProps,
} from './List';

// Sync Status
export {
  SyncStatusIndicator,
  SyncStatusBadge,
} from './SyncStatus';

// Avatar
export {
  Avatar,
  AvatarGroup,
  UserAvatar,
  type AvatarProps,
  type AvatarSize,
  type AvatarStatus,
  type AvatarGroupProps,
  type UserAvatarProps,
} from './Avatar';

// Modal
export {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  AlertModal,
  type ModalProps,
  type ModalSize,
  type ModalHeaderProps,
  type ModalContentProps,
  type ModalFooterProps,
  type AlertModalProps,
} from './Modal';

// Toast
export {
  ToastProvider,
  useToast,
  type Toast,
  type ToastType,
  type ToastPosition,
  type ToastProviderProps,
} from './Toast';

// Notifications
export {
  NotificationProvider,
  useNotifications,
  NotificationList,
  NotificationBadge,
  type Notification,
  type BadgeCounts,
} from './Notification';

// Connectivity
export {
  ConnectivityBanner,
  ConnectivityIndicator,
  ConnectivityDot,
  useConnectivity,
  type ConnectionStatus,
  type ConnectivityBannerProps,
} from './Connectivity';

// Progress Ring
export {
  ProgressRing,
  ProgressRingMini,
  type ProgressRingProps,
} from './ProgressRing';

// Stats Card (advanced)
export {
  StatsCard,
  StatsGrid,
  type StatsCardProps,
  type StatsGridProps,
} from './StatsCard';

// Slider
export {
  Slider,
  RangeSlider,
  type SliderProps,
  type RangeSliderProps,
} from './Slider';

// Tabs
export {
  Tabs,
  TabPanel,
  SegmentedControl,
  type Tab,
  type TabsProps,
  type TabPanelProps,
  type SegmentedControlProps,
} from './Tabs';

// Tooltip & Popover
export {
  Tooltip,
  Popover,
  DropdownMenu,
  type TooltipProps,
  type PopoverProps,
  type DropdownItem,
  type DropdownMenuProps,
} from './Tooltip';

// QR Code
export {
  QRCode,
  ProjectQRCode,
  type QRCodeProps,
  type ProjectQRCodeProps,
} from './QRCode';

// Voice Notes
export {
  VoiceNote,
  VoiceNotePlayer,
  type VoiceNoteProps,
  type VoiceNotePlayerProps,
} from './VoiceNote';

// Weather Widget
export {
  WeatherWidget,
  type WeatherWidgetProps,
  type WeatherData,
} from './WeatherWidget';

// Confetti & Celebration
export {
  Confetti,
  Celebration,
  useConfetti,
  type ConfettiProps,
  type CelebrationProps,
} from './Confetti';

// Swipeable
export {
  Swipeable,
  SwipeableListItem,
  useSwipeGesture,
  type SwipeableProps,
  type SwipeAction,
  type SwipeableListItemProps,
} from './Swipeable';

// Accordion
export {
  Accordion,
  FAQAccordion,
  type AccordionItem,
  type AccordionProps,
  type FAQItem,
  type FAQAccordionProps,
} from './Accordion';

// DatePicker
export {
  DatePicker,
  DateRangePicker,
  type DatePickerProps,
  type DateRangePickerProps,
} from './DatePicker';

// Select
export {
  Select,
  MultiSelect,
  type SelectOption,
  type SelectProps,
  type MultiSelectProps,
} from './Select';

// FileUpload
export {
  FileUpload,
  type UploadedFile,
  type FileUploadProps,
} from './FileUpload';

// Timeline
export {
  Timeline,
  ActivityFeed,
  type TimelineItem,
  type TimelineProps,
  type ActivityItem,
  type ActivityFeedProps,
} from './Timeline';

// Charts
export {
  ProgressBar,
  BarChart,
  DonutChart,
  Sparkline,
  Legend,
  type ProgressBarProps,
  type BarChartData,
  type BarChartProps,
  type DonutChartData,
  type DonutChartProps,
  type SparklineProps,
  type LegendItem,
  type LegendProps,
} from './Chart';

// Stepper
export {
  Stepper,
  StepIndicator,
  type Step,
  type StepperProps,
  type StepIndicatorProps,
} from './Stepper';

// Image Gallery
export {
  ImageGallery,
  ZoomableImage,
  type GalleryImage,
  type ImageGalleryProps,
  type ZoomableImageProps,
} from './ImageGallery';
