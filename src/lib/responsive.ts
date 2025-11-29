/**
 * Responsive Typography and Layout Utilities
 * Provides consistent font sizing and spacing across all screen sizes
 */

export const responsiveTypography = {
  // Page Titles (h4 reduced to 80%)
  pageTitle: "text-lg sm:text-xl md:text-2xl font-bold",

  // Section Titles (h3)
  sectionTitle: "text-base sm:text-lg md:text-xl font-bold",

  // Card Titles (h3)
  cardTitle: "text-sm sm:text-base md:text-lg font-bold",

  // Table Headers
  tableHeader: "text-[10px] sm:text-xs md:text-sm font-semibold",

  // Table Cells
  tableCell: "text-[10px] sm:text-xs md:text-sm",

  // Labels
  label: "text-[10px] sm:text-xs md:text-sm font-medium",

  // Body Text
  body: "text-[10px] sm:text-xs md:text-sm",

  // Small Text (captions, descriptions)
  small: "text-[8px] sm:text-[10px] md:text-xs",

  // Stat Values (large numbers)
  statValue: "text-base sm:text-lg md:text-2xl font-bold",

  // Stat Labels
  statLabel: "text-[10px] sm:text-xs md:text-sm text-muted-foreground",

  // Badge Text
  badge: "text-[8px] sm:text-[10px] md:text-xs",

  // Button Text
  button: "text-[10px] sm:text-xs md:text-sm",
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
