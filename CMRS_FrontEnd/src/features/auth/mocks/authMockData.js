export const authMockUsers = [
  {
    id: 1,
    fullName: 'أحمد محمد',
    phone: '01012345678',
    email: 'test@test.com',
    city: 'القاهرة',
    password: '12345678',
    role: 'user',
    location: {
      lat: 30.04442,
      lng: 31.235712,
    },
  },
  {
    id: 2,
    fullName: 'سارة علي',
    phone: '01198765432',
    email: 'sara@test.com',
    city: 'الجيزة',
    password: '12345678',
    role: 'user',
    location: {
      lat: 30.013056,
      lng: 31.208853,
    },
  },
  {
    id: 3,
    fullName: 'محمد خالد',
    phone: '01255555555',
    email: 'mohamed@test.com',
    city: 'الإسكندرية',
    password: '12345678',
    role: 'user',
    location: {
      lat: 31.200092,
      lng: 29.918739,
    },
  },
];

export const authMockCities = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'المنصورة',
  'طنطا',
  'الزقازيق',
  'أسيوط',
  'المنيا',
  'سوهاج',
  'قنا',
];

export const authMockServiceOptions = [
  { label: 'كهرباء', value: 'electricity' },
  { label: 'مياه', value: 'water' },
  { label: 'غاز', value: 'gas' },
  { label: 'طرق', value: 'roads' },
  { label: 'شبكات', value: 'networks' },
  { label: 'نظافة وتجميل', value: 'cleaning' },
];

export const authMockGovernorates = [
  'القاهرة',
  'الجيزة',
  'القليوبية',
];

export const authMockCompanies = [
  {
    id: 101,
    companyName: 'شركة كهرباء القاهرة',
    officialEmail: 'cairo-electric@test.com',
    commercialRegistration: 'CR-100200',
    serviceType: 'electricity',
    governorate: 'القاهرة',
    city: 'القاهرة',
    password: '12345678',
    role: 'company',
  },
  {
    id: 102,
    companyName: 'شركة مياه الجيزة',
    officialEmail: 'giza-water@test.com',
    commercialRegistration: 'CR-100201',
    serviceType: 'water',
    governorate: 'الجيزة',
    city: 'الجيزة',
    password: '12345678',
    role: 'company',
  },
  {
    id: 103,
    companyName: 'شركة غاز القليوبية',
    officialEmail: 'qaliubia-gas@test.com',
    commercialRegistration: 'CR-100202',
    serviceType: 'gas',
    governorate: 'القليوبية',
    city: 'بنها',
    password: '12345678',
    role: 'company',
  },
];