import { Heart, Skull, Wind, Droplets, Brain, Home, Briefcase, GraduationCap, Users, PawPrint, Car, Plane, MapPinOff, Ghost, Bed, ClipboardList, Clock, ArrowDown, Footprints, Meh, } from "lucide-react";
export const CATEGORY_META: Record<"flying" | "falling" | "being_chased" | "teeth" | "exam" | "late" | "death" | "romance" | "work" | "school" | "family" | "animals" | "water" | "house" | "vehicle" | "travel" | "lost" | "monster" | "paralysis" | "lucid", {
    labelKey: string;
    icon: any;
    gradient: string;
}> = {
    flying: { labelKey: "categories.flying", icon: Wind, gradient: "from-blue-500 to-cyan-500" },
    falling: {
        labelKey: "categories.falling",
        icon: ArrowDown,
        gradient: "from-sky-500 to-blue-600",
    },
    being_chased: {
        labelKey: "categories.being_chased",
        icon: Footprints,
        gradient: "from-rose-500 to-red-600",
    },
    teeth: {
        labelKey: "categories.teeth",
        icon: Meh,
        gradient: "from-amber-500 to-yellow-600",
    },
    exam: {
        labelKey: "categories.exam",
        icon: ClipboardList,
        gradient: "from-emerald-500 to-teal-500",
    },
    late: {
        labelKey: "categories.late",
        icon: Clock,
        gradient: "from-orange-500 to-amber-600",
    },
    death: { labelKey: "categories.death", icon: Skull, gradient: "from-red-600 to-rose-600" },
    romance: {
        labelKey: "categories.romance",
        icon: Heart,
        gradient: "from-pink-500 to-rose-500",
    },
    work: {
        labelKey: "categories.work",
        icon: Briefcase,
        gradient: "from-slate-500 to-gray-600",
    },
    school: {
        labelKey: "categories.school",
        icon: GraduationCap,
        gradient: "from-indigo-500 to-blue-600",
    },
    family: {
        labelKey: "categories.family",
        icon: Users,
        gradient: "from-purple-500 to-fuchsia-500",
    },
    animals: {
        labelKey: "categories.animals",
        icon: PawPrint,
        gradient: "from-lime-500 to-green-600",
    },
    water: {
        labelKey: "categories.water",
        icon: Droplets,
        gradient: "from-cyan-500 to-blue-500",
    },
    house: { labelKey: "categories.house", icon: Home, gradient: "from-stone-500 to-zinc-600" },
    vehicle: { labelKey: "categories.vehicle", icon: Car, gradient: "from-gray-600 to-slate-700" },
    travel: {
        labelKey: "categories.travel",
        icon: Plane,
        gradient: "from-teal-500 to-cyan-600",
    },
    lost: {
        labelKey: "categories.lost",
        icon: MapPinOff,
        gradient: "from-violet-500 to-purple-600",
    },
    monster: {
        labelKey: "categories.monster",
        icon: Ghost,
        gradient: "from-fuchsia-500 to-pink-600",
    },
    paralysis: {
        labelKey: "categories.paralysis",
        icon: Bed,
        gradient: "from-neutral-500 to-stone-600",
    },
    lucid: {
        labelKey: "categories.lucid",
        icon: Brain,
        gradient: "from-indigo-500 to-purple-500",
    },
};
