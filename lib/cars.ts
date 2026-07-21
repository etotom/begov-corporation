export type CarSource = "США" | "Европа" | "ОАЭ";
export type CarBody = "Седан" | "Кроссовер" | "Внедорожник";
export type CarStatus = "В наличии в Грузии" | "В пути" | "Под заказ";

export const CAR_SOURCES: CarSource[] = ["США", "Европа", "ОАЭ"];
export const CAR_BODIES: CarBody[] = ["Седан", "Кроссовер", "Внедорожник"];
export const CAR_STATUSES: CarStatus[] = ["В наличии в Грузии", "В пути", "Под заказ"];

export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number; // USD, до Грузии (Поти), без доставки в страну клиента
  mileageKm: number;
  engine: string;
  fuel: string;
  gearbox: string;
  drive: string;
  body: CarBody;
  color: string;
  source: CarSource;
  status: CarStatus;
  photoUrl: string | null;
  visible: boolean;
}

export type CarInput = Omit<Car, "id">;

export const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;
export const formatKm = (n: number) => `${n.toLocaleString("ru-RU")} км`;
