'use client';

import React from 'react';
import {
  Heart,
  HeartCrack,
  Briefcase,
  Lock,
  Gamepad2,
  Smartphone,
  Tv,
  QrCode,
  Snowflake,
  Flame,
  CandlestickChart,
  Drama,
  Wine,
  Sparkles,
  BarChart3,
  TreePine,
  Sprout,
  Zap,
  Target,
  Users,
  Mail,
  Rocket,
  Brain,
  TrendingUp,
  TrendingDown,
  Hourglass,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Send,
  User,
  AlertOctagon,
  MessageCircle,
  Share,
  Link,
  Coffee,
  Volume2,
  Key,
  Medal,
  BookOpen,
  type LucideProps,
} from 'lucide-react';

const ICONS = {
  heart: Heart,
  heartCrack: HeartCrack,
  briefcase: Briefcase,
  lock: Lock,
  gamepad: Gamepad2,
  smartphone: Smartphone,
  tv: Tv,
  qrCode: QrCode,
  ice: Snowflake,
  spicy: Flame,
  flame: Flame,
  deep: CandlestickChart,
  candle: CandlestickChart,
  impostor: Drama,
  mask: Drama,
  dateNight: Wine,
  wine: Wine,
  sparkles: Sparkles,
  chart: BarChart3,
  tree: TreePine,
  sprout: Sprout,
  zap: Zap,
  target: Target,
  users: Users,
  mail: Mail,
  rocket: Rocket,
  brain: Brain,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  hourglass: Hourglass,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  check: Check,
  x: X,
  send: Send,
  user: User,
  alert: AlertOctagon,
  message: MessageCircle,
  share: Share,
  link: Link,
  coffee: Coffee,
  volume: Volume2,
  key: Key,
  medal: Medal,
  bookOpen: BookOpen,
};

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const Component = ICONS[name];
  if (!Component) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <Component {...props} />;
}
