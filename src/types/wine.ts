/** A wine product in the Argatia catalog */
export interface Wine {
  id: string;
  /** Wine name in Greek */
  name_el: string;
  /** Wine name in English */
  name_en: string;
  /** Wine type category */
  type: "red" | "white" | "special";
  /** Wine type label in Greek */
  type_el: string;
  /** Wine type label in English */
  type_en: string;
  /** Full description in Greek */
  description_el: string;
  /** Full description in English */
  description_en: string;
  /** Grape varieties used */
  varieties: string[];
  /** Food pairing in Greek */
  pairing_el: string;
  /** Food pairing in English */
  pairing_en: string;
  /** Aging process description */
  aging_el?: string;
  aging_en?: string;
  /** Annual production in bottles (if applicable) */
  productionBottles?: number;
  /** Alcohol by volume */
  abv?: number;
  /** Image path in /public/images/wines/ */
  image: string;
  /** Sort order for display */
  order: number;
}
