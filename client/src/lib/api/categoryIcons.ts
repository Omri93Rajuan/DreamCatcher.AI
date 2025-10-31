import {
  Heart,
  Skull,
  Wind,
  Droplets,
  Brain,
  Home,
  Briefcase,
  GraduationCap,
  Users,
  PawPrint,
  Car,
  Plane,
  MapPinOff,
  Ghost,
  Bed,
  ClipboardList,
  Clock,
  ArrowDown,
  Footprints,
  Meh,
} from "lucide-react";
export const CATEGORY_META: Record<
  | "flying"
  | "falling"
  | "being_chased"
  | "teeth"
  | "exam"
  | "late"
  | "death"
  | "romance"
  | "work"
  | "school"
  | "family"
  | "animals"
  | "water"
  | "house"
  | "vehicle"
  | "travel"
  | "lost"
  | "monster"
  | "paralysis"
  | "lucid",
  { label: string; icon: any; gradient: string }
> = {
  flying: { label: "טיסה", icon: Wind, gradient: "from-blue-500 to-cyan-500" },
  falling: {
    label: "נפילה",
    icon: ArrowDown,
    gradient: "from-sky-500 to-blue-600",
  },
  being_chased: {
    label: "מרדף",
    icon: Footprints,
    gradient: "from-rose-500 to-red-600",
  },
  teeth: {
    label: "שיניים",
    icon: Meh,
    gradient: "from-amber-500 to-yellow-600",
  },
  exam: {
    label: "מבחן",
    icon: ClipboardList,
    gradient: "from-emerald-500 to-teal-500",
  },
  late: {
    label: "איחור",
    icon: Clock,
    gradient: "from-orange-500 to-amber-600",
  },
  death: { label: "מוות", icon: Skull, gradient: "from-red-600 to-rose-600" },
  romance: {
    label: "אהבה",
    icon: Heart,
    gradient: "from-pink-500 to-rose-500",
  },
  work: {
    label: "עבודה",
    icon: Briefcase,
    gradient: "from-slate-500 to-gray-600",
  },
  school: {
    label: "בית ספר",
    icon: GraduationCap,
    gradient: "from-indigo-500 to-blue-600",
  },
  family: {
    label: "משפחה",
    icon: Users,
    gradient: "from-purple-500 to-fuchsia-500",
  },
  animals: {
    label: "חיות",
    icon: PawPrint,
    gradient: "from-lime-500 to-green-600",
  },
  water: {
    label: "מים",
    icon: Droplets,
    gradient: "from-cyan-500 to-blue-500",
  },
  house: { label: "בית", icon: Home, gradient: "from-stone-500 to-zinc-600" },
  vehicle: { label: "רכב", icon: Car, gradient: "from-gray-600 to-slate-700" },
  travel: {
    label: "נסיעה",
    icon: Plane,
    gradient: "from-teal-500 to-cyan-600",
  },
  lost: {
    label: "אבוד/ה",
    icon: MapPinOff,
    gradient: "from-violet-500 to-purple-600",
  },
  monster: {
    label: "מפלצת",
    icon: Ghost,
    gradient: "from-fuchsia-500 to-pink-600",
  },
  paralysis: {
    label: "שיתוק שינה",
    icon: Bed,
    gradient: "from-neutral-500 to-stone-600",
  },
  lucid: {
    label: "צלול",
    icon: Brain,
    gradient: "from-indigo-500 to-purple-500",
  },
};
