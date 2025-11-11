export type MealSelection = {
  carbs: string;
  greens: string;
  protein: string;
  order: number;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  custom?: string;
};

export type MealData = {
  meals: Record<string, MealSelection>;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
};

export const ProteinList = [
  { name_en: "Meat", name_ar: "لحمة", value: "meat" },
  {
    name_en: "Fried Chicken",
    name_ar: "فراخ مقلية",
    value: "fried_chicken",
  },
  {
    name_en: "Pan Fried Chicken",
    name_ar: "فراخ مقلية حلة",
    value: "pan_fried_chicken",
  },
  { name_en: "Burger", name_ar: "برجر", value: "burger" },
];

export const CarbsList = [
  ["Spagetti", "meat"],
  ["Ditalini (Small Rings Pasta)", "ditalini"],
  ["White Rice", "white_rice"],
  ["Fried Rice", "fried_rice"],
];

export const GreensList = [
  ["", "meat"],
  ["Fried Chicken", "fried_chicken"],
  ["Pan Fried Chicken", "pan_fried_chicken"],
  ["Burger", "burger"],
];
