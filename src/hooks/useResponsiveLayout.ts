import { useWindowDimensions } from "react-native";

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 520;
  const isSmallMobile = width < 380;
  const isTablet = width >= 520 && width < 900;
  const isDesktop = width >= 900;

  return {
    width,
    height,
    isMobile,
    isSmallMobile,
    isTablet,
    isDesktop,
    horizontalPadding: isMobile ? 16 : 24,
    pageTopPadding: isMobile ? 18 : 28,
    cardRadius: isMobile ? 24 : 36,
    cardPadding: isMobile ? 18 : 28,
    titleSize: isSmallMobile ? 30 : isMobile ? 34 : 39,
    sectionTitleSize: isMobile ? 25 : 31,
  };
}
