/** A vineyard location owned by Argatia */
export interface Vineyard {
  id: string;
  /** Vineyard name in Greek */
  name_el: string;
  /** Vineyard name in English */
  name_en: string;
  /** Village/region location in Greek */
  location_el: string;
  /** Village/region location in English */
  location_en: string;
  /** Elevation above sea level in meters */
  elevationM: number;
  /** Year the vineyard was established */
  established: number;
  /** Soil type description in Greek */
  soil_el: string;
  /** Soil type description in English */
  soil_en: string;
  /** Grape varieties planted */
  varieties: string[];
  /** Rootstock used */
  rootstock: string[];
  /** Full description in Greek */
  description_el: string;
  /** Full description in English */
  description_en: string;
  /** GPS coordinates [latitude, longitude] */
  coordinates: [number, number];
  /** Image path in /public/images/vineyards/ */
  image?: string;
}
