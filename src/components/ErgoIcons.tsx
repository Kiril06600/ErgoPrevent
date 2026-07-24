import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type BadgeProps = {
  children: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
};

export function IconBadge({
  children,
  size = 36,
  backgroundColor = "rgba(255,255,255,0.08)",
  borderColor = "rgba(255,255,255,0.14)",
}: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2.4,
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function HomeIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 11.2L12 5L19.5 11.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 10.5V18.5H10V14.5H14V18.5H17.5V10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RoutineIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="7.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M8.8 12.2L11 14.4L15.6 9.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlanIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6.5H19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M5 12H15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M5 17.5H11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle
        cx="18"
        cy="17"
        r="2.2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M18 14.8V13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function EducationIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 6.5C4.5 5.7 5.2 5 6 5H10.5C11.4 5 12.2 5.35 12.8 5.9C13.4 5.35 14.2 5 15.1 5H18C18.8 5 19.5 5.7 19.5 6.5V17.5C19.5 18.05 19.05 18.5 18.5 18.5H15.2C14.3 18.5 13.45 18.82 12.8 19.4C12.15 18.82 11.3 18.5 10.4 18.5H5.5C4.95 18.5 4.5 18.05 4.5 17.5V6.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Line
        x1="12.8"
        y1="6"
        x2="12.8"
        y2="19"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export function ProfileIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M6.5 19C7.3 15.9 9.3 14.3 12 14.3C14.7 14.3 16.7 15.9 17.5 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PostureIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="13"
        width="7"
        height="3"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="6"
        y1="16"
        x2="6"
        y2="19"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="10"
        y1="16"
        x2="10"
        y2="19"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M14 6.5C15.5 8.2 16.1 10.3 15.5 12.5C15.1 14 14.3 15.4 13.2 16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="14" cy="5" r="1.4" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function ProgressIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5"
        y1="18"
        x2="19"
        y2="18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="5"
        y1="18"
        x2="5"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Polyline
        points="7,15 10,12 13,13 18,8"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});