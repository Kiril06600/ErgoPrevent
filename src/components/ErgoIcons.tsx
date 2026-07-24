import React from "react";
import { View, StyleSheet } from "react-native";

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

type LineProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotate?: number;
  radius?: number;
};

type CircleProps = {
  x: number;
  y: number;
  size: number;
  color: string;
  strokeWidth: number;
};

type RectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  radius?: number;
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

function IconCanvas({
  size,
  children,
}: {
  size: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={[
          styles.canvas,
          {
            transform: [{ scale: size / 24 }],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function LineShape({
  x,
  y,
  width,
  height,
  color,
  rotate = 0,
  radius = 999,
}: LineProps) {
  return (
    <View
      style={[
        styles.absolute,
        {
          left: x,
          top: y,
          width,
          height,
          backgroundColor: color,
          borderRadius: radius,
          transform: [{ rotate: `${rotate}deg` }],
        } as any,
      ]}
    />
  );
}

function CircleShape({ x, y, size, color, strokeWidth }: CircleProps) {
  return (
    <View
      style={[
        styles.absolute,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
        } as any,
      ]}
    />
  );
}

function RectShape({
  x,
  y,
  width,
  height,
  color,
  strokeWidth,
  radius = 3,
}: RectProps) {
  return (
    <View
      style={[
        styles.absolute,
        {
          left: x,
          top: y,
          width,
          height,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderColor: color,
        } as any,
      ]}
    />
  );
}

export function HomeIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <LineShape
        x={5}
        y={8}
        width={8}
        height={strokeWidth}
        color={color}
        rotate={-35}
      />
      <LineShape
        x={11}
        y={8}
        width={8}
        height={strokeWidth}
        color={color}
        rotate={35}
      />
      <RectShape
        x={6.5}
        y={11}
        width={11}
        height={8}
        color={color}
        strokeWidth={strokeWidth}
        radius={2}
      />
      <LineShape
        x={10.8}
        y={15}
        width={2.8}
        height={4}
        color={color}
        radius={1}
      />
    </IconCanvas>
  );
}

export function RoutineIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <CircleShape
        x={4}
        y={4}
        size={16}
        color={color}
        strokeWidth={strokeWidth}
      />
      <LineShape
        x={8.2}
        y={12.5}
        width={5.5}
        height={strokeWidth}
        color={color}
        rotate={42}
      />
      <LineShape
        x={11.1}
        y={11.5}
        width={7.5}
        height={strokeWidth}
        color={color}
        rotate={-46}
      />
    </IconCanvas>
  );
}

export function PlanIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <LineShape
        x={5}
        y={6}
        width={14}
        height={strokeWidth}
        color={color}
      />
      <LineShape
        x={5}
        y={11}
        width={10}
        height={strokeWidth}
        color={color}
      />
      <LineShape
        x={5}
        y={16}
        width={7}
        height={strokeWidth}
        color={color}
      />
      <CircleShape
        x={15}
        y={14}
        size={5}
        color={color}
        strokeWidth={strokeWidth}
      />
      <LineShape
        x={17.1}
        y={11.6}
        width={strokeWidth}
        height={3.2}
        color={color}
      />
    </IconCanvas>
  );
}

export function EducationIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <RectShape
        x={4}
        y={5}
        width={16}
        height={14}
        color={color}
        strokeWidth={strokeWidth}
        radius={3}
      />
      <LineShape
        x={12}
        y={5.8}
        width={strokeWidth}
        height={12.8}
        color={color}
      />
      <LineShape
        x={6.5}
        y={8.5}
        width={3.8}
        height={strokeWidth}
        color={color}
      />
      <LineShape
        x={14}
        y={8.5}
        width={3.5}
        height={strokeWidth}
        color={color}
      />
    </IconCanvas>
  );
}

export function ProfileIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <CircleShape
        x={8.6}
        y={4}
        size={6.8}
        color={color}
        strokeWidth={strokeWidth}
      />
      <RectShape
        x={5.5}
        y={14}
        width={13}
        height={6}
        color={color}
        strokeWidth={strokeWidth}
        radius={6}
      />
      <LineShape
        x={5.5}
        y={18.6}
        width={13}
        height={3}
        color={"transparent"}
      />
    </IconCanvas>
  );
}

export function PostureIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <RectShape
        x={4}
        y={13}
        width={7}
        height={3.5}
        color={color}
        strokeWidth={strokeWidth}
        radius={1.4}
      />
      <LineShape
        x={5.5}
        y={16}
        width={strokeWidth}
        height={4}
        color={color}
      />
      <LineShape
        x={9.5}
        y={16}
        width={strokeWidth}
        height={4}
        color={color}
      />
      <CircleShape
        x={13}
        y={4}
        size={3.2}
        color={color}
        strokeWidth={strokeWidth}
      />
      <LineShape
        x={14.1}
        y={7.8}
        width={strokeWidth}
        height={8.5}
        color={color}
        rotate={12}
      />
      <LineShape
        x={12.5}
        y={11.5}
        width={5.4}
        height={strokeWidth}
        color={color}
        rotate={-28}
      />
    </IconCanvas>
  );
}

export function ProgressIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <LineShape
        x={5}
        y={18}
        width={14}
        height={strokeWidth}
        color={color}
      />
      <LineShape
        x={5}
        y={6}
        width={strokeWidth}
        height={12}
        color={color}
      />
      <LineShape
        x={7}
        y={14.2}
        width={5}
        height={strokeWidth}
        color={color}
        rotate={-42}
      />
      <LineShape
        x={10.8}
        y={12.6}
        width={4.2}
        height={strokeWidth}
        color={color}
        rotate={18}
      />
      <LineShape
        x={13.6}
        y={10.7}
        width={6}
        height={strokeWidth}
        color={color}
        rotate={-42}
      />
    </IconCanvas>
  );
}

export function PreventionIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <RectShape
        x={6}
        y={4.5}
        width={12}
        height={15}
        color={color}
        strokeWidth={strokeWidth}
        radius={5}
      />
      <LineShape
        x={8.8}
        y={12.5}
        width={4.7}
        height={strokeWidth}
        color={color}
        rotate={42}
      />
      <LineShape
        x={11.3}
        y={11.4}
        width={6.7}
        height={strokeWidth}
        color={color}
        rotate={-46}
      />
    </IconCanvas>
  );
}

export function BreakIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <CircleShape
        x={4}
        y={4}
        size={16}
        color={color}
        strokeWidth={strokeWidth}
      />
      <LineShape
        x={11.2}
        y={8}
        width={strokeWidth}
        height={5}
        color={color}
      />
      <LineShape
        x={11.7}
        y={12}
        width={5}
        height={strokeWidth}
        color={color}
        rotate={22}
      />
      <LineShape
        x={8.5}
        y={3}
        width={7}
        height={strokeWidth}
        color={color}
      />
    </IconCanvas>
  );
}

export function ExerciseIcon({
  size = 20,
  color = "#E0E0E0",
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconCanvas size={size}>
      <CircleShape
        x={10}
        y={4}
        size={4}
        color={color}
        strokeWidth={strokeWidth}
      />
      <LineShape
        x={11.2}
        y={8}
        width={strokeWidth}
        height={6}
        color={color}
      />
      <LineShape
        x={7}
        y={10}
        width={5.8}
        height={strokeWidth}
        color={color}
        rotate={-25}
      />
      <LineShape
        x={11.5}
        y={10}
        width={5.8}
        height={strokeWidth}
        color={color}
        rotate={25}
      />
      <LineShape
        x={8.5}
        y={15}
        width={5.2}
        height={strokeWidth}
        color={color}
        rotate={-55}
      />
      <LineShape
        x={12}
        y={15}
        width={5.2}
        height={strokeWidth}
        color={color}
        rotate={55}
      />
    </IconCanvas>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  canvas: {
    width: 24,
    height: 24,
    position: "relative",
  },
  absolute: {
    position: "absolute",
  },
});