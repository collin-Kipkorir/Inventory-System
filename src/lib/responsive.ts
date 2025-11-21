/**
 * Responsive Typography and Layout Utilities
 * Provides consistent font sizing and spacing across all screen sizes
 */

export const responsiveTypography = {
  // Page Titles (h1)
  pageTitle: "text-2xl sm:text-3xl md:text-4xl font-bold",

  // Section Titles (h2)
  sectionTitle: "text-xl sm:text-2xl md:text-3xl font-bold",

  // Card Titles (h3)
  cardTitle: "text-lg sm:text-xl md:text-2xl font-bold",

  // Table Headers
  tableHeader: "text-xs sm:text-sm md:text-base font-semibold",

  // Table Cells
  tableCell: "text-xs sm:text-sm md:text-base",

  // Labels
  label: "text-xs sm:text-sm md:text-base font-medium",

  // Body Text
  body: "text-xs sm:text-sm md:text-base",

  // Small Text (captions, descriptions)
  small: "text-[10px] sm:text-xs md:text-sm",

  // Stat Values (large numbers)
  statValue: "text-lg sm:text-2xl md:text-4xl font-bold",

  // Stat Labels
  statLabel: "text-xs sm:text-sm md:text-base text-muted-foreground",

  // Badge Text
  badge: "text-[10px] sm:text-xs md:text-sm",

  // Button Text
  button: "text-xs sm:text-sm md:text-base",
};

export const responsiveSpacing = {
  // Page spacing
  pagePadding: "p-3 sm:p-4 md:p-6",
  pageGap: "space-y-3 sm:space-y-4 md:space-y-6",

  // Card spacing
  cardPadding: "p-3 sm:p-4 md:p-6",
  cardGap: "space-y-2 sm:space-y-3 md:space-y-4",

  // Table spacing
  tableGap: "gap-2 sm:gap-3 md:gap-4",
};

export const responsiveBreakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

/**
 * Helper to combine responsive classes
 */
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};
