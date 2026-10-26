import {
  Code,
  File,
  Image,
  Link,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

interface TypeIconProps extends LucideProps {
  icon: string; // Lucide icon name stored on the item type
  color?: string;
}

export default function TypeIcon({ icon, color, ...props }: TypeIconProps) {
  const Icon = TYPE_ICONS[icon] ?? File;
  // Type colors come from data (custom types later), so they can't be static classes
  return <Icon style={{ color }} {...props} />;
}
