export interface IranProvince {
  id: string;
  name: string;
}

export interface IranLocations {
  provinces: IranProvince[];
  getCities(provinceId: string): string[];
}

interface RawRow {
  provinceId: string;
  provinceName: string;
  cityName: string;
}

let _cache: IranLocations | null = null;

function buildIndex(rows: RawRow[]): IranLocations {
  const provincesMap = new Map<string, string>();
  const citiesByProvince = new Map<string, Set<string>>();

  rows.forEach((row) => {
    provincesMap.set(row.provinceId, row.provinceName);
    if (!citiesByProvince.has(row.provinceId)) {
      citiesByProvince.set(row.provinceId, new Set());
    }
    citiesByProvince.get(row.provinceId)!.add(row.cityName);
  });

  const provinces = [...provincesMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fa'));

  return {
    provinces,
    getCities(provinceId: string): string[] {
      const cities = citiesByProvince.get(provinceId);
      if (!cities) return [];
      return [...cities.values()].sort((a, b) => a.localeCompare(b, 'fa'));
    },
  };
}

export async function loadIranLocations(url: string): Promise<IranLocations> {
  if (_cache) return _cache;
  const res = await fetch(url);
  if (!res.ok) throw new Error('بارگذاری لیست استان‌ها ناموفق بود');
  const rows = (await res.json()) as RawRow[];
  _cache = buildIndex(rows);
  return _cache;
}
