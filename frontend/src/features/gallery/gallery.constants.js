export const GALLERY_CATEGORIES = [
  {
    value: "EXTERIOR",
    label: "Exterior",
  },
  {
    value: "RECEPTION",
    label: "Reception",
  },
  {
    value: "WARD",
    label: "Ward",
  },
  {
    value: "ICU",
    label: "ICU",
  },
  {
    value: "OPERATION_THEATRE",
    label: "Operation Theatre",
  },
  {
    value: "LABORATORY",
    label: "Laboratory",
  },
  {
    value: "RADIOLOGY",
    label: "Radiology",
  },
  {
    value: "PHARMACY",
    label: "Pharmacy",
  },
  {
    value: "EMERGENCY",
    label: "Emergency",
  },
  {
    value: "CAFETERIA",
    label: "Cafeteria",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export function getGalleryCategoryLabel(category) {
  const item = GALLERY_CATEGORIES.find(
    (item) => item.value === category
  );

  return item?.label || category;
}