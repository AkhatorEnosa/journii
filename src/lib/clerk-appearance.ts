// Clerk appearance configuration using colors from globals.css
export const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    // Use CSS variables from globals.css for consistent theming
    colorPrimary: 'oklch(0.488 0.243 264.376)', // sidebar-primary (purple/blue accent)
    colorBackground: 'oklch(0.205 0 0)', // card
    colorInputBackground: 'oklch(0.325 0 0)', // input
    colorText: 'oklch(0.985 0 0)', // primary-foreground
    colorTextSecondary: 'oklch(0.708 0 0)', // muted-foreground
    colorAlphaShade: 'oklch(0.488 0.243 264.376)', // sidebar-primary
    colorBorder: 'oklch(0.275 0 0)', // border
    borderRadius: '0.5rem',
    fontFamily: 'Montserrat, system-ui, sans-serif',
  },
  elements: {
    // Card and container elements
    card: 'bg-card border-border',
    cardBox: 'bg-card border-border',
    
    // Form elements
    formFieldLabel: 'text-foreground',
    formFieldInput: 'bg-input border-border text-foreground placeholder:text-muted-foreground',
    formFieldInputShowAction: 'text-primary hover:text-primary/80',
    formFieldInputShowActionIcon: 'text-primary',
    formFieldInputShowActionIconHover: 'text-primary/80',
    formFieldInputShowActionIconActive: 'text-primary/60',
    
    // Buttons
    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    formButtonPrimaryHover: 'bg-primary/90 text-primary-foreground',
    formButtonPrimaryActive: 'bg-primary/80 text-primary-foreground',
    formButtonSecondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
    formButtonSecondaryHover: 'bg-secondary/90 text-secondary-foreground',
    formButtonSecondaryActive: 'bg-secondary/80 text-secondary-foreground',
    
    // Navigation and links
    navbarButton: 'text-foreground hover:text-primary',
    navbarButtonHover: 'text-primary',
    navbarButtonActive: 'text-primary/80',
    footerActionLink: 'text-primary hover:text-primary/80',
    footerActionText: 'text-muted-foreground',
    
    // Social buttons
    socialButtonsBlockButton: 'bg-secondary border-border text-secondary-foreground hover:bg-secondary/90',
    socialButtonsBlockButtonText: 'text-secondary-foreground',
    socialButtonsIconButton: 'bg-secondary border-border hover:bg-secondary/90',
    socialButtonsIconButtonIcon: 'text-secondary-foreground',
    
    // OTP and verification
    otpCodeFieldInput: 'bg-input border-border text-foreground',
    otpCodeFieldInputError: 'bg-input border-destructive/50 text-foreground',
    otpCodeFieldInputSuccess: 'bg-input border-primary/50 text-foreground',
    formResendCodeLink: 'text-primary hover:text-primary/80',
    
    // Form actions and labels
    formFieldLabelShowPassword: 'text-muted-foreground',
    formFieldAction: 'text-muted-foreground hover:text-foreground',
    formFieldActionText: 'text-muted-foreground',
    formFieldActionTextHover: 'text-foreground',
    
    // Headers and titles
    headerTitle: 'text-foreground',
    headerSubtitle: 'text-muted-foreground',
    
    // Modal elements
    modalBackdrop: 'bg-background/80',
    modalBack: 'text-primary hover:text-primary/80',
    modalCloseButton: 'text-muted-foreground hover:text-foreground',
    modalCloseButtonIcon: 'text-muted-foreground',
    modalCloseButtonIconHover: 'text-foreground',
    
    // Profile and user elements
    profilePage: 'bg-card',
    userButtonPopoverCard: 'bg-card border-border',
    userButtonPopoverActionButton: 'text-foreground hover:bg-accent hover:text-accent-foreground',
    userButtonPopoverActionButtonText: 'text-foreground',
    userButtonPopoverActionButtonSVG: 'text-foreground',
    userButtonPopoverFooter: 'text-muted-foreground',
    userButtonTriggerIcon: 'text-foreground',
    userButtonTriggerIconHover: 'text-primary',
    
    // Identity preview
    identityPreviewEditButton: 'text-primary hover:text-primary/80',
    identityPreviewEditButtonIcon: 'text-primary',
    identityPreviewEditButtonIconHover: 'text-primary/80',
    
    // Form states
    formFieldInputError: 'bg-input border-destructive/50 text-foreground',
    formFieldInputSuccess: 'bg-input border-primary/50 text-foreground',
    formFieldInputWarning: 'bg-input border-accent/50 text-foreground',
    
    // Form messages
    formMessage: 'text-muted-foreground',
    formMessageError: 'text-destructive',
    formMessageSuccess: 'text-primary',
    formMessageWarning: 'text-accent',
    
    // Progress indicators
    progressBar: 'bg-border',
    progressBarIndicator: 'bg-primary',
    
    // Divider
    dividerLine: 'border-border',
    dividerText: 'text-muted-foreground',
    
    // List items
    listItem: 'hover:bg-accent',
    listItemText: 'text-foreground',
    listItemTextSecondary: 'text-muted-foreground',
    
    // Avatar
    avatarBox: 'bg-accent',
    avatarImage: 'object-cover',
    avatarFallback: 'bg-primary text-primary-foreground',
    
    // Badge
    badge: 'bg-primary/10 text-primary border-primary/20',
    badgeSuccess: 'bg-primary/10 text-primary border-primary/20',
    badgeError: 'bg-destructive/10 text-destructive border-destructive/20',
    badgeWarning: 'bg-accent/10 text-accent border-accent/20',
    
    // Steps
    steps: 'text-muted-foreground',
    stepsActive: 'text-foreground',
    stepsCompleted: 'text-primary',
    
    // Tabs
    tabButton: 'text-muted-foreground hover:text-foreground',
    tabButtonActive: 'text-foreground border-b-2 border-primary',
    tabButtonDisabled: 'text-muted-foreground opacity-50',
    
    // Tooltip
    tooltip: 'bg-card border-border text-foreground',
    tooltipText: 'text-foreground',
    
    // Skeleton
    skeleton: 'bg-border',
    
    // Scrollbar
    scrollbar: 'scrollbar-thin scrollbar-thumb-border scrollbar-track-card',
    
    // Focus ring
    focusRing: 'ring-2 ring-ring',
    focusRingInset: 'ring-inset',
    
    // Shadows
    shadow: 'shadow-lg',
    shadowHover: 'shadow-xl',
    
    // Typography
    text: 'text-foreground',
    textSecondary: 'text-muted-foreground',
    textError: 'text-destructive',
    textSuccess: 'text-primary',
    textWarning: 'text-accent',
    
    // Layout
    container: 'bg-card border-border',
    containerBox: 'bg-card border-border',
    
    // Inputs
    input: 'bg-input border-border text-foreground',
    inputError: 'bg-input border-destructive/50 text-foreground',
    inputSuccess: 'bg-input border-primary/50 text-foreground',
    inputWarning: 'bg-input border-accent/50 text-foreground',
    
    // Select
    select: 'bg-input border-border text-foreground',
    selectOption: 'bg-card text-foreground hover:bg-accent',
    selectOptionSelected: 'bg-primary text-primary-foreground',
    
    // Checkbox and radio
    checkbox: 'border-border text-primary',
    checkboxChecked: 'bg-primary border-primary',
    radio: 'border-border text-primary',
    radioChecked: 'bg-primary border-primary',
    
    // Switch
    switch: 'bg-border',
    switchChecked: 'bg-primary',
    switchThumb: 'bg-card',
    
    // Slider
    slider: 'bg-border',
    sliderTrack: 'bg-primary',
    sliderThumb: 'bg-primary border-2 border-card',
    
    // Toggle
    toggle: 'bg-border',
    toggleChecked: 'bg-primary',
    toggleThumb: 'bg-card',
    
    // Progress
    progress: 'bg-border',
    progressIndicator: 'bg-primary',
    
    // Rating
    rating: 'text-muted-foreground',
    ratingActive: 'text-primary',
    ratingHover: 'text-primary/80',
    
    // Chip
    chip: 'bg-card border-border text-foreground',
    chipRemovable: 'bg-card border-border text-foreground hover:bg-accent',
    chipRemovableIcon: 'text-muted-foreground hover:text-foreground',
    
    // Tag
    tag: 'bg-primary/10 text-primary border-primary/20',
    tagRemovable: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    tagRemovableIcon: 'text-primary hover:text-primary/80',
    
    // Alert
    alert: 'bg-card border-border text-foreground',
    alertError: 'bg-destructive/10 border-destructive/20 text-destructive',
    alertSuccess: 'bg-primary/10 border-primary/20 text-primary',
    alertWarning: 'bg-accent/10 border-accent/20 text-accent',
    
    // Toast
    toast: 'bg-card border-border text-foreground',
    toastError: 'bg-destructive/10 border-destructive/20 text-destructive',
    toastSuccess: 'bg-primary/10 border-primary/20 text-primary',
    toastWarning: 'bg-accent/10 border-accent/20 text-accent',
    
    // Dialog
    dialog: 'bg-card border-border text-foreground',
    dialogBackdrop: 'bg-background/80',
    dialogCloseButton: 'text-muted-foreground hover:text-foreground',
    
    // Drawer
    drawer: 'bg-card border-border text-foreground',
    drawerBackdrop: 'bg-background/80',
    drawerCloseButton: 'text-muted-foreground hover:text-foreground',
    
    // Sheet
    sheet: 'bg-card border-border text-foreground',
    sheetBackdrop: 'bg-background/80',
    sheetCloseButton: 'text-muted-foreground hover:text-foreground',
    
    // Popover
    popover: 'bg-card border-border text-foreground',
    popoverBackdrop: 'bg-background/80',
    popoverCloseButton: 'text-muted-foreground hover:text-foreground',
    
    // Dropdown
    dropdown: 'bg-card border-border text-foreground',
    dropdownItem: 'text-foreground hover:bg-accent',
    dropdownItemActive: 'bg-primary text-primary-foreground',
    
    // Menu
    menu: 'bg-card border-border text-foreground',
    menuItem: 'text-foreground hover:bg-accent',
    menuItemActive: 'bg-primary text-primary-foreground',
    
    // Navigation
    navigation: 'bg-card border-border text-foreground',
    navigationItem: 'text-foreground hover:text-primary',
    navigationItemActive: 'text-primary border-b-2 border-primary',
    
    // Sidebar
    sidebar: 'bg-sidebar border-sidebar-border text-sidebar-foreground',
    sidebarItem: 'text-sidebar-foreground hover:text-sidebar-primary',
    sidebarItemActive: 'text-sidebar-primary border-r-2 border-sidebar-primary',
    
    // Toolbar
    toolbar: 'bg-card border-border text-foreground',
    toolbarItem: 'text-foreground hover:text-primary',
    toolbarItemActive: 'text-primary border-b-2 border-primary',
    
    // Breadcrumb
    breadcrumb: 'text-foreground',
    breadcrumbItem: 'text-foreground hover:text-primary',
    breadcrumbItemActive: 'text-primary',
    
    // Pagination
    pagination: 'text-foreground',
    paginationItem: 'text-foreground hover:text-primary',
    paginationItemActive: 'text-primary bg-primary/10 border-primary/20',
    
    // Table
    table: 'bg-card border-border text-foreground',
    tableHeader: 'bg-card border-border text-foreground',
    tableRow: 'border-border hover:bg-accent',
    tableCell: 'border-border text-foreground',
    
    // Calendar
    calendar: 'bg-card border-border text-foreground',
    calendarDay: 'text-foreground hover:bg-accent',
    calendarDayActive: 'bg-primary text-primary-foreground',
    calendarDayToday: 'border-2 border-primary',
    
    // Date picker
    datePicker: 'bg-card border-border text-foreground',
    datePickerInput: 'bg-input border-border text-foreground',
    datePickerCalendar: 'bg-card border-border text-foreground',
    
    // Time picker
    timePicker: 'bg-card border-border text-foreground',
    timePickerInput: 'bg-input border-border text-foreground',
    timePickerClock: 'bg-card border-border text-foreground',
    
    // Color picker
    colorPicker: 'bg-card border-border text-foreground',
    colorPickerInput: 'bg-input border-border text-foreground',
    colorPickerPalette: 'bg-card border-border text-foreground',
    
    // File upload
    fileUpload: 'bg-card border-border text-foreground',
    fileUploadInput: 'bg-input border-border text-foreground',
    fileUploadPreview: 'bg-card border-border text-foreground',
    
    // Image upload
    imageUpload: 'bg-card border-border text-foreground',
    imageUploadInput: 'bg-input border-border text-foreground',
    imageUploadPreview: 'bg-card border-border text-foreground',
    
    // Video upload
    videoUpload: 'bg-card border-border text-foreground',
    videoUploadInput: 'bg-input border-border text-foreground',
    videoUploadPreview: 'bg-card border-border text-foreground',
    
    // Audio upload
    audioUpload: 'bg-card border-border text-foreground',
    audioUploadInput: 'bg-input border-border text-foreground',
    audioUploadPreview: 'bg-card border-border text-foreground',
    
    // Rich text editor
    richTextEditor: 'bg-card border-border text-foreground',
    richTextEditorToolbar: 'bg-card border-border text-foreground',
    richTextEditorContent: 'bg-input border-border text-foreground',
    
    // Code editor
    codeEditor: 'bg-card border-border text-foreground',
    codeEditorToolbar: 'bg-card border-border text-foreground',
    codeEditorContent: 'bg-input border-border text-foreground',
    
    // Chart
    chart: 'bg-card border-border text-foreground',
    chartLegend: 'text-foreground',
    chartTooltip: 'bg-card border-border text-foreground',
    
    // Map
    map: 'bg-card border-border text-foreground',
    mapMarker: 'bg-primary text-primary-foreground',
    mapPopup: 'bg-card border-border text-foreground',
    
    // Timeline
    timeline: 'bg-card border-border text-foreground',
    timelineItem: 'text-foreground',
    timelineItemActive: 'text-primary',
    
    // Tree
    tree: 'bg-card border-border text-foreground',
    treeItem: 'text-foreground hover:bg-accent',
    treeItemActive: 'text-primary bg-primary/10',
    
    // Kanban
    kanban: 'bg-card border-border text-foreground',
    kanbanColumn: 'bg-card border-border text-foreground',
    kanbanCard: 'bg-card border-border text-foreground hover:bg-accent',
    
    // Dashboard
    dashboard: 'bg-card border-border text-foreground',
    dashboardWidget: 'bg-card border-border text-foreground',
    dashboardWidgetHeader: 'bg-card border-border text-foreground',
    dashboardWidgetContent: 'bg-card border-border text-foreground',
    
    // Form
    form: 'bg-card border-border text-foreground',
    formField: 'text-foreground',
    formFieldError: 'text-destructive',
    formFieldSuccess: 'text-primary',
    formFieldWarning: 'text-accent',
    
    // Button
    button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    buttonSecondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
    buttonTertiary: 'bg-transparent hover:bg-accent text-foreground',
    buttonDestructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    buttonSuccess: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    buttonWarning: 'bg-accent hover:bg-accent/90 text-accent-foreground',
    buttonGhost: 'bg-transparent hover:bg-accent text-foreground',
    buttonLink: 'bg-transparent hover:bg-transparent text-primary underline',
    
    // Link
    link: 'text-primary hover:text-primary/80',
    linkSecondary: 'text-muted-foreground hover:text-foreground',
    linkTertiary: 'text-foreground hover:text-primary',
    
    // Label
    label: 'text-foreground',
    labelSecondary: 'text-muted-foreground',
    labelTertiary: 'text-foreground',
    
    // Icon
    icon: 'text-foreground',
    iconSecondary: 'text-muted-foreground',
    iconTertiary: 'text-foreground',
    iconError: 'text-destructive',
    iconSuccess: 'text-primary',
    iconWarning: 'text-accent',
  },
} as const;