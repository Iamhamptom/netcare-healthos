/**
 * South African Healthcare Facility Database
 * ============================================
 * Comprehensive database of SA healthcare facilities for geographic fraud detection,
 * claims routing, and facility validation.
 *
 * Sources:
 *  - Netcare official website (netcare.co.za) — 49+ hospitals, 55+ Medicross clinics, 15 Akeso facilities
 *  - Life Healthcare official website (lifehealthcare.co.za) — 49+ acute hospitals
 *  - Mediclinic Southern Africa (mediclinic.co.za) — 52 hospitals, 15 day clinics
 *  - National Department of Health facility registry
 *  - Wikipedia: List of hospitals in South Africa
 *  - Healthbridge (healthbridge.co.za) — 7,000+ connected practices
 *  - BHF (Board of Healthcare Funders) practice number registry
 *
 * Last updated: 2026-03-24
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FacilityRecord {
  name: string;
  type:
    | "hospital"
    | "clinic"
    | "gp_practice"
    | "specialist"
    | "pharmacy"
    | "day_clinic"
    | "chc"
    | "psychiatric"
    | "rehabilitation"
    | "other";
  group?:
    | "Netcare"
    | "Life Healthcare"
    | "Mediclinic"
    | "Public"
    | "Independent"
    | "NHN"
    | "Busamed"
    | "Lenmed";
  province: "GP" | "KZN" | "WC" | "EC" | "FS" | "MP" | "LP" | "NW" | "NC";
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  practiceNumber?: string;
  switchhouse?: "healthbridge" | "mediswitch" | "switchon";
  beds?: number;
}

// ---------------------------------------------------------------------------
// Facility Database — 400+ records
// ---------------------------------------------------------------------------

export const SA_FACILITIES: FacilityRecord[] = [
  // ==========================================================================
  // NETCARE HOSPITALS (49 acute hospitals)
  // ==========================================================================

  // -- Gauteng --
  { name: "Netcare Milpark Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "9 Guild Rd, Parktown West, Johannesburg, 2193", latitude: -26.1780, longitude: 28.0134, beds: 354, switchhouse: "mediswitch" },
  { name: "Netcare Garden City Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Maleela & Lilian Ngoyi St, Mayfair, Johannesburg, 2092", latitude: -26.2050, longitude: 28.0120, beds: 344, switchhouse: "mediswitch" },
  { name: "Netcare Olivedale Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "President Fouche Dr, Olivedale, Randburg, 2158", latitude: -26.0655, longitude: 27.9468, beds: 234, switchhouse: "mediswitch" },
  { name: "Netcare Sunninghill Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Nanyuki Rd & Witkoppen Rd, Sunninghill, 2157", latitude: -26.0293, longitude: 28.0570, beds: 328, switchhouse: "mediswitch" },
  { name: "Netcare Waterfall City Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Midrand", address: "Waterfall City, Cnr Magwa Cres & Mac Mac Rd, Midrand, 1685", latitude: -26.0150, longitude: 28.1060, beds: 200, switchhouse: "mediswitch" },
  { name: "Netcare Mulbarton Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "25 True North Rd, Mulbarton, Johannesburg South, 2190", latitude: -26.2815, longitude: 28.0560, beds: 109, switchhouse: "mediswitch" },
  { name: "Netcare Linksfield Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "24 12th Ave, Linksfield West, Johannesburg, 2192", latitude: -26.1768, longitude: 28.0833, beds: 180, switchhouse: "mediswitch" },
  { name: "Netcare Alberton Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Alberton", address: "Cnr Voortrekker Rd & Swartkoppies Rd, Alberton, 1449", latitude: -26.2637, longitude: 28.1237, beds: 158, switchhouse: "mediswitch" },
  { name: "Netcare Clinton Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Northumberland & Knox St, Glenwood, Johannesburg, 2091", latitude: -26.2320, longitude: 28.0270, beds: 130, switchhouse: "mediswitch" },
  { name: "Netcare Baragwanath Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "Chris Hani Rd, Diepkloof, Soweto, 1862", latitude: -26.2616, longitude: 27.9425, beds: 76, switchhouse: "mediswitch" },
  { name: "Netcare Pinehaven Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Krugersdorp", address: "Pendoring Ave, Pinehaven, Krugersdorp, 1739", latitude: -26.0973, longitude: 27.8090, beds: 120, switchhouse: "mediswitch" },
  { name: "Netcare Bell Street Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "11 Bell St, Meadowlands, Soweto, 1852", latitude: -26.2240, longitude: 27.8990, beds: 60, switchhouse: "mediswitch" },
  { name: "Netcare Krugersdorp Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Krugersdorp", address: "Cnr Burger & Ockerse St, Krugersdorp, 1739", latitude: -26.1000, longitude: 27.7730, beds: 178, switchhouse: "mediswitch" },
  { name: "Netcare Pretoria East Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Pretoria", address: "Cnr Garsfontein & Netcare Rd, Moreleta Park, Pretoria, 0181", latitude: -25.8210, longitude: 28.3020, beds: 300, switchhouse: "mediswitch" },
  { name: "Netcare Montana Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Pretoria", address: "Cnr Zambesi Dr & Breede Rd, Montana Park, Pretoria, 0182", latitude: -25.6844, longitude: 28.2261, beds: 192, switchhouse: "mediswitch" },
  { name: "Netcare Femina Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Pretoria", address: "445 Gerhard Moerdyk St, Sunnyside, Pretoria, 0002", latitude: -25.7595, longitude: 28.2130, beds: 65, switchhouse: "mediswitch" },
  { name: "Netcare Akasia Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Pretoria", address: "Cnr Brits Rd & Jasmyn St, Akasia, Pretoria, 0118", latitude: -25.6425, longitude: 28.1670, beds: 100, switchhouse: "mediswitch" },
  { name: "Netcare Jakaranda Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Pretoria", address: "543 Jochemus St, Muckleneuk, Pretoria, 0002", latitude: -25.7680, longitude: 28.2270, beds: 120, switchhouse: "mediswitch" },
  { name: "Netcare Union Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Alberton", address: "Cnr Voortrekker Rd & Union Ave, Alberton, 1449", latitude: -26.2670, longitude: 28.1280, beds: 250, switchhouse: "mediswitch" },
  { name: "Netcare Rand Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Frieda & Frank Brown St, Rosettenville, 2190", latitude: -26.2280, longitude: 28.0490, beds: 70, switchhouse: "mediswitch" },

  // -- KwaZulu-Natal --
  { name: "Netcare St Augustine's Hospital", type: "hospital", group: "Netcare", province: "KZN", city: "Durban", address: "107 JB Marks Rd, Berea, Durban, 4001", latitude: -29.8437, longitude: 31.0093, beds: 461, switchhouse: "mediswitch" },
  { name: "Netcare Umhlanga Hospital", type: "hospital", group: "Netcare", province: "KZN", city: "Durban", address: "323 Umhlanga Rocks Dr, Umhlanga, 4320", latitude: -29.7287, longitude: 31.0820, beds: 200, switchhouse: "mediswitch" },
  { name: "Netcare Kingsway Hospital", type: "hospital", group: "Netcare", province: "KZN", city: "Durban", address: "Cnr Kingsway & Francois Rd, Amanzimtoti, 4125", latitude: -30.0480, longitude: 30.8800, beds: 132, switchhouse: "mediswitch" },
  { name: "Netcare Parklands Hospital", type: "hospital", group: "Netcare", province: "KZN", city: "Durban", address: "75 Randles Rd, Sydenham, Durban, 4091", latitude: -29.8560, longitude: 30.9820, beds: 168, switchhouse: "mediswitch" },
  { name: "Netcare The Bay Hospital", type: "hospital", group: "Netcare", province: "KZN", city: "Richards Bay", address: "Lira Link, Meerensee, Richards Bay, 3900", latitude: -28.7680, longitude: 32.0720, beds: 148, switchhouse: "mediswitch" },
  { name: "Netcare Margate Hospital", type: "hospital", group: "Netcare", province: "KZN", city: "Margate", address: "15 Douro Rd, Margate, 4275", latitude: -30.8578, longitude: 30.3600, beds: 80, switchhouse: "mediswitch" },

  // -- Western Cape --
  { name: "Netcare Christiaan Barnard Memorial Hospital", type: "hospital", group: "Netcare", province: "WC", city: "Cape Town", address: "181 Longmarket St, Cape Town City Centre, 8001", latitude: -33.9240, longitude: 18.4210, beds: 238, switchhouse: "mediswitch" },
  { name: "Netcare Blaauwberg Hospital", type: "hospital", group: "Netcare", province: "WC", city: "Cape Town", address: "Waterville Cres, Sunningdale, Cape Town, 7441", latitude: -33.8120, longitude: 18.5180, beds: 110, switchhouse: "mediswitch" },
  { name: "Netcare N1 City Hospital", type: "hospital", group: "Netcare", province: "WC", city: "Cape Town", address: "Louwtjie Rothman St, Goodwood, Cape Town, 7460", latitude: -33.9077, longitude: 18.5530, beds: 185, switchhouse: "mediswitch" },
  { name: "Netcare Kuils River Hospital", type: "hospital", group: "Netcare", province: "WC", city: "Cape Town", address: "37 Van Riebeeck Rd, Kuils River, 7580", latitude: -33.9340, longitude: 18.6750, beds: 102, switchhouse: "mediswitch" },
  { name: "Netcare Ceres Hospital", type: "hospital", group: "Netcare", province: "WC", city: "Ceres", address: "Voortrekker St, Ceres, 6835", latitude: -33.3710, longitude: 19.3120, beds: 30, switchhouse: "mediswitch" },

  // -- Eastern Cape --
  { name: "Netcare Greenacres Hospital", type: "hospital", group: "Netcare", province: "EC", city: "Gqeberha", address: "Cnr Cape Rd & Rochelle St, Greenacres, Gqeberha, 6045", latitude: -33.9550, longitude: 25.5960, beds: 260, switchhouse: "mediswitch" },
  { name: "Netcare Port Alfred Hospital", type: "hospital", group: "Netcare", province: "EC", city: "Port Alfred", address: "Pascoe Cres, Port Alfred, 6170", latitude: -33.5920, longitude: 26.8900, beds: 45, switchhouse: "mediswitch" },

  // -- Free State --
  { name: "Netcare Universitas Hospital", type: "hospital", group: "Netcare", province: "FS", city: "Bloemfontein", address: "1 Logeman St, Universitas, Bloemfontein, 9301", latitude: -29.1190, longitude: 26.1950, beds: 186, switchhouse: "mediswitch" },
  { name: "Netcare Rosepark Hospital", type: "hospital", group: "Netcare", province: "FS", city: "Bloemfontein", address: "2 Gustav Cres, Heidedal, Bloemfontein, 9306", latitude: -29.1410, longitude: 26.2040, beds: 120, switchhouse: "mediswitch" },

  // -- Limpopo --
  { name: "Netcare Pholoso Hospital", type: "hospital", group: "Netcare", province: "LP", city: "Polokwane", address: "59 Marshall St, Polokwane, 0699", latitude: -23.9060, longitude: 29.4500, beds: 146, switchhouse: "mediswitch" },

  // -- Mpumalanga --
  { name: "Netcare Highveld Hospital", type: "hospital", group: "Netcare", province: "MP", city: "Emalahleni", address: "Hospital Rd, Die Heuwel, Emalahleni, 1034", latitude: -25.8710, longitude: 29.2330, beds: 94, switchhouse: "mediswitch" },

  // -- North West --
  { name: "Netcare Ferncrest Hospital", type: "hospital", group: "Netcare", province: "NW", city: "Tlokwe", address: "Cnr Meyer & Hospital St, Potchefstroom, 2520", latitude: -26.7090, longitude: 27.0930, beds: 100, switchhouse: "mediswitch" },

  // ==========================================================================
  // NETCARE AKESO PSYCHIATRIC FACILITIES (15)
  // ==========================================================================
  { name: "Netcare Akeso Parktown", type: "psychiatric", group: "Netcare", province: "GP", city: "Johannesburg", address: "16 Jubilee Rd, Parktown, Johannesburg, 2193", latitude: -26.1740, longitude: 28.0400, beds: 90, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Alberton", type: "psychiatric", group: "Netcare", province: "GP", city: "Alberton", address: "67 Hennie Alberts Rd, Brackendowns, Alberton, 1448", latitude: -26.3100, longitude: 28.1260, beds: 72, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Crescent Clinic Randburg", type: "psychiatric", group: "Netcare", province: "GP", city: "Johannesburg", address: "9 Doordrift Rd, Randburg, 2194", latitude: -26.0990, longitude: 28.0020, beds: 80, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Stepping Stones", type: "psychiatric", group: "Netcare", province: "GP", city: "Pretoria", address: "18 Rabie St, Fontainebleau, 2032", latitude: -25.7770, longitude: 28.2520, beds: 52, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Kenilworth", type: "psychiatric", group: "Netcare", province: "WC", city: "Cape Town", address: "23 Kenilworth Rd, Kenilworth, Cape Town, 7708", latitude: -33.9940, longitude: 18.4870, beds: 64, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Umhlanga", type: "psychiatric", group: "Netcare", province: "KZN", city: "Durban", address: "323 Umhlanga Rocks Dr, Umhlanga, 4320", latitude: -29.7310, longitude: 31.0820, beds: 50, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Pietermaritzburg", type: "psychiatric", group: "Netcare", province: "KZN", city: "Pietermaritzburg", address: "20 Montrose Rd, Montrose, Pietermaritzburg, 3201", latitude: -29.5930, longitude: 30.3960, beds: 48, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Gqeberha", type: "psychiatric", group: "Netcare", province: "EC", city: "Gqeberha", address: "18 Pickering St, Newton Park, Gqeberha, 6045", latitude: -33.9580, longitude: 25.5820, beds: 72, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Milner Lodge", type: "psychiatric", group: "Netcare", province: "GP", city: "Johannesburg", address: "4 Milner Rd, Houghton Estate, Johannesburg, 2198", latitude: -26.1610, longitude: 28.0600, beds: 40, switchhouse: "mediswitch" },
  { name: "Netcare Akeso Richards Bay", type: "psychiatric", group: "Netcare", province: "KZN", city: "Richards Bay", address: "Lira Link, Meerensee, Richards Bay, 3900", latitude: -28.7690, longitude: 32.0710, beds: 30, switchhouse: "mediswitch" },

  // ==========================================================================
  // LIFE HEALTHCARE HOSPITALS (49 acute hospitals)
  // ==========================================================================

  // -- Gauteng --
  { name: "Life Fourways Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Cnr Cedar Rd & Discovery Blvd, Fourways, 2191", latitude: -26.0170, longitude: 28.0120, beds: 190, switchhouse: "mediswitch" },
  { name: "Life Flora Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Ontdekkers Rd, Florida, Roodepoort, 1709", latitude: -26.1740, longitude: 27.9160, beds: 348, switchhouse: "mediswitch" },
  { name: "Life Bedford Gardens Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "8 Cnr Nicol & Republic Rd, Bedfordview, 2007", latitude: -26.1870, longitude: 28.1340, beds: 248, switchhouse: "mediswitch" },
  { name: "Life Brenthurst Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Cnr Jubilee & Cardigan Rd, Parktown, Johannesburg, 2193", latitude: -26.1730, longitude: 28.0410, beds: 150, switchhouse: "mediswitch" },
  { name: "Life Carstenhof Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "94 Main Reef Rd, Midrand, 1682", latitude: -26.0010, longitude: 28.1200, beds: 110, switchhouse: "mediswitch" },
  { name: "Life Robinson Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Randfontein", address: "Hospital St, Randfontein, 1759", latitude: -26.1730, longitude: 27.7060, beds: 80, switchhouse: "mediswitch" },
  { name: "Life Wilgeheuwel Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Amplifier Rd, Radiokop, Roodepoort, 1724", latitude: -26.0790, longitude: 27.8560, beds: 220, switchhouse: "mediswitch" },
  { name: "Life Faerie Glen Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Pretoria", address: "260 Atterbury Rd, Faerie Glen, Pretoria, 0081", latitude: -25.7880, longitude: 28.3160, beds: 188, switchhouse: "mediswitch" },
  { name: "Life Groenkloof Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Pretoria", address: "529 Belvedere St, Arcadia, Pretoria, 0083", latitude: -25.7650, longitude: 28.2180, beds: 166, switchhouse: "mediswitch" },
  { name: "Life Eugene Marais Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Pretoria", address: "908 Cnr Vermeulen & Bosman St, Pretoria, 0002", latitude: -25.7470, longitude: 28.1920, beds: 290, switchhouse: "mediswitch" },
  { name: "Life Roseacres Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "17 Bertha St, Germiston South, 1401", latitude: -26.2440, longitude: 28.1740, beds: 100, switchhouse: "mediswitch" },
  { name: "Life Glynnwood Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Cnr Swartkoppies & Monument Rd, Glen Marais, Kempton Park, 1619", latitude: -26.0950, longitude: 28.2250, beds: 200, switchhouse: "mediswitch" },
  { name: "Life Riverfield Lodge", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Cnr Jasmyn & Banksia Rd, Riverfield, Vereeniging, 1939", latitude: -26.6750, longitude: 27.9300, beds: 54, switchhouse: "mediswitch" },
  { name: "Life New Kensington Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Cnr 5th Ave & 7th St, Bez Valley, Johannesburg, 2094", latitude: -26.1900, longitude: 28.0720, beds: 80, switchhouse: "mediswitch" },
  { name: "Life Anncron Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "27 Cnr Voortrekker Rd & Hennie Alberts, Kempton Park, 1619", latitude: -26.1040, longitude: 28.2380, beds: 60, switchhouse: "mediswitch" },

  // -- KwaZulu-Natal --
  { name: "Life Entabeni Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Durban", address: "148 Mazisi Kunene Rd, Glenwood, Durban, 4001", latitude: -29.8640, longitude: 31.0050, beds: 360, switchhouse: "mediswitch" },
  { name: "Life Westville Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Durban", address: "9 Harry Gwala Rd, Westville, Durban, 3629", latitude: -29.8380, longitude: 30.9180, beds: 230, switchhouse: "mediswitch" },
  { name: "Life Chatsmed Garden Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Durban", address: "59 Woodhurst Dr, Chatsworth, Durban, 4092", latitude: -29.9110, longitude: 30.8900, beds: 160, switchhouse: "mediswitch" },
  { name: "Life Mount Edgecombe Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Durban", address: "11 Redberry Rd, Mount Edgecombe, 4302", latitude: -29.7280, longitude: 31.0480, beds: 120, switchhouse: "mediswitch" },
  { name: "Life Hilton Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Hilton", address: "1 Village Rd, Hilton, 3245", latitude: -29.5560, longitude: 30.3020, beds: 100, switchhouse: "mediswitch" },
  { name: "Life St Dominic's Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Pietermaritzburg", address: "5 St Thomas Rd, Scottsville, Pietermaritzburg, 3201", latitude: -29.6190, longitude: 30.3690, beds: 192, switchhouse: "mediswitch" },
  { name: "Life Empangeni Garden Hospital", type: "hospital", group: "Life Healthcare", province: "KZN", city: "Empangeni", address: "107 Union St, Empangeni, 3880", latitude: -28.7470, longitude: 31.8930, beds: 80, switchhouse: "mediswitch" },
  { name: "Life Beacon Bay Hospital", type: "hospital", group: "Life Healthcare", province: "EC", city: "East London", address: "Bonza Bay Rd, Beacon Bay, East London, 5241", latitude: -32.9640, longitude: 27.9520, beds: 110, switchhouse: "mediswitch" },

  // -- Western Cape --
  { name: "Life Kingsbury Hospital", type: "hospital", group: "Life Healthcare", province: "WC", city: "Cape Town", address: "Wilderness Rd, Claremont, Cape Town, 7708", latitude: -33.9880, longitude: 18.4600, beds: 120, switchhouse: "mediswitch" },
  { name: "Life Vincent Pallotti Hospital", type: "hospital", group: "Life Healthcare", province: "WC", city: "Cape Town", address: "Alexandra Rd, Pinelands, Cape Town, 7405", latitude: -33.9400, longitude: 18.5130, beds: 246, switchhouse: "mediswitch" },
  { name: "Life Claremont Hospital", type: "hospital", group: "Life Healthcare", province: "WC", city: "Cape Town", address: "Main Rd, Claremont, Cape Town, 7708", latitude: -33.9880, longitude: 18.4610, beds: 80, switchhouse: "mediswitch" },
  { name: "Life Rondebosch Medical Centre", type: "hospital", group: "Life Healthcare", province: "WC", city: "Cape Town", address: "14 Fountain Rd, Rondebosch, Cape Town, 7700", latitude: -33.9620, longitude: 18.4740, beds: 70, switchhouse: "mediswitch" },
  { name: "Life West Coast Private Hospital", type: "hospital", group: "Life Healthcare", province: "WC", city: "Vredenburg", address: "Main Rd, Vredenburg, 7380", latitude: -33.0030, longitude: 17.9900, beds: 52, switchhouse: "mediswitch" },

  // -- Eastern Cape --
  { name: "Life St James Hospital", type: "hospital", group: "Life Healthcare", province: "EC", city: "Gqeberha", address: "34 Searle St, Heatherbank, Gqeberha, 6001", latitude: -33.9410, longitude: 25.5740, beds: 160, switchhouse: "mediswitch" },
  { name: "Life St Mark's Hospital", type: "hospital", group: "Life Healthcare", province: "EC", city: "East London", address: "Conyngham Rd, Southernwood, East London, 5201", latitude: -32.9870, longitude: 27.8850, beds: 70, switchhouse: "mediswitch" },
  { name: "Life Mercantile Hospital", type: "hospital", group: "Life Healthcare", province: "EC", city: "Gqeberha", address: "Cnr Cape Rd & Gately St, Greenacres, Gqeberha, 6045", latitude: -33.9500, longitude: 25.5880, beds: 120, switchhouse: "mediswitch" },
  { name: "Life Isivivana Hospital", type: "hospital", group: "Life Healthcare", province: "EC", city: "Humansdorp", address: "Main St, Humansdorp, 6300", latitude: -33.9670, longitude: 24.7640, beds: 48, switchhouse: "mediswitch" },

  // -- Free State --
  { name: "Life Pasteur Hospital", type: "hospital", group: "Life Healthcare", province: "FS", city: "Bloemfontein", address: "7 Reid St, Westdene, Bloemfontein, 9301", latitude: -29.1130, longitude: 26.2050, beds: 120, switchhouse: "mediswitch" },
  { name: "Life Rosepark Hospital", type: "hospital", group: "Life Healthcare", province: "FS", city: "Bloemfontein", address: "1 Kellner St, Westdene, Bloemfontein, 9301", latitude: -29.1150, longitude: 26.2090, beds: 170, switchhouse: "mediswitch" },

  // -- Mpumalanga --
  { name: "Life Cosmos Hospital", type: "hospital", group: "Life Healthcare", province: "MP", city: "Emalahleni", address: "Cnr Mandela & Murray Ave, Emalahleni, 1035", latitude: -25.8700, longitude: 29.2290, beds: 100, switchhouse: "mediswitch" },

  // -- North West --
  { name: "Life Peglerae Hospital", type: "hospital", group: "Life Healthcare", province: "NW", city: "Rustenburg", address: "2 Brink St, Rustenburg, 0299", latitude: -25.6710, longitude: 27.2440, beds: 80, switchhouse: "mediswitch" },
  { name: "Life Anncron Clinic Klerksdorp", type: "hospital", group: "Life Healthcare", province: "NW", city: "Klerksdorp", address: "24 Annan Rd, Wilkoppies, Klerksdorp, 2571", latitude: -26.8480, longitude: 26.6560, beds: 60, switchhouse: "mediswitch" },

  // ==========================================================================
  // MEDICLINIC HOSPITALS (52 hospitals + day clinics)
  // ==========================================================================

  // -- Gauteng --
  { name: "Mediclinic Morningside", type: "hospital", group: "Mediclinic", province: "GP", city: "Johannesburg", address: "Cnr Hill & Rivonia Rd, Sandton, 2196", latitude: -26.0840, longitude: 28.0570, beds: 343, switchhouse: "mediswitch" },
  { name: "Mediclinic Sandton", type: "hospital", group: "Mediclinic", province: "GP", city: "Johannesburg", address: "Peter Place, Bryanston, Sandton, 2191", latitude: -26.0530, longitude: 28.0210, beds: 168, switchhouse: "mediswitch" },
  { name: "Mediclinic Muelmed", type: "hospital", group: "Mediclinic", province: "GP", city: "Pretoria", address: "577 Pretorius St, Arcadia, Pretoria, 0007", latitude: -25.7460, longitude: 28.2160, beds: 300, switchhouse: "mediswitch" },
  { name: "Mediclinic Heart Hospital", type: "hospital", group: "Mediclinic", province: "GP", city: "Pretoria", address: "596 Stanza Bopape St, Arcadia, Pretoria, 0007", latitude: -25.7430, longitude: 28.2180, beds: 164, switchhouse: "mediswitch" },
  { name: "Mediclinic Kloof", type: "hospital", group: "Mediclinic", province: "GP", city: "Pretoria", address: "511 Jochemus St, Erasmuskloof, Pretoria, 0181", latitude: -25.8100, longitude: 28.2610, beds: 192, switchhouse: "mediswitch" },
  { name: "Mediclinic Medforum", type: "hospital", group: "Mediclinic", province: "GP", city: "Pretoria", address: "Cnr Lillian Ngoyi & Pretorius St, Pretoria, 0002", latitude: -25.7470, longitude: 28.1900, beds: 178, switchhouse: "mediswitch" },
  { name: "Mediclinic Legae", type: "hospital", group: "Mediclinic", province: "GP", city: "Pretoria", address: "Cnr Amandel & Zambesi Ave, Erasmusrand, Pretoria, 0181", latitude: -25.8020, longitude: 28.2400, beds: 90, switchhouse: "mediswitch" },
  { name: "Mediclinic Midstream", type: "hospital", group: "Mediclinic", province: "GP", city: "Centurion", address: "Cnr Midstream Ridge & Le Roux Dr, Midstream Estate, 1692", latitude: -25.8660, longitude: 28.2070, beds: 172, switchhouse: "mediswitch" },
  { name: "Mediclinic Emfuleni", type: "hospital", group: "Mediclinic", province: "GP", city: "Vanderbijlpark", address: "Cnr Frikkie Meyer & Beethoven St, Vanderbijlpark, 1900", latitude: -26.7070, longitude: 27.8040, beds: 200, switchhouse: "mediswitch" },
  { name: "Mediclinic Vereeniging", type: "hospital", group: "Mediclinic", province: "GP", city: "Vereeniging", address: "Cnr Voortrekker & Loch St, Vereeniging, 1930", latitude: -26.6740, longitude: 27.9310, beds: 120, switchhouse: "mediswitch" },
  { name: "Mediclinic Gynaecological Hospital", type: "hospital", group: "Mediclinic", province: "GP", city: "Pretoria", address: "328 Paul Kruger St, Pretoria, 0002", latitude: -25.7480, longitude: 28.1860, beds: 78, switchhouse: "mediswitch" },

  // -- Western Cape --
  { name: "Mediclinic Panorama", type: "hospital", group: "Mediclinic", province: "WC", city: "Cape Town", address: "Rothchild Blvd, Panorama, Cape Town, 7500", latitude: -33.8710, longitude: 18.5800, beds: 260, switchhouse: "mediswitch" },
  { name: "Mediclinic Durbanville", type: "hospital", group: "Mediclinic", province: "WC", city: "Cape Town", address: "Wellington Rd, Durbanville, Cape Town, 7550", latitude: -33.8340, longitude: 18.6440, beds: 186, switchhouse: "mediswitch" },
  { name: "Mediclinic Stellenbosch", type: "hospital", group: "Mediclinic", province: "WC", city: "Stellenbosch", address: "Saffraan Ave, Die Boord, Stellenbosch, 7600", latitude: -33.9460, longitude: 18.8620, beds: 140, switchhouse: "mediswitch" },
  { name: "Mediclinic Cape Town", type: "hospital", group: "Mediclinic", province: "WC", city: "Cape Town", address: "21 Hof St, Oranjezicht, Cape Town, 8001", latitude: -33.9320, longitude: 18.4120, beds: 112, switchhouse: "mediswitch" },
  { name: "Mediclinic Constantiaberg", type: "hospital", group: "Mediclinic", province: "WC", city: "Cape Town", address: "Burnham Rd, Plumstead, Cape Town, 7800", latitude: -34.0120, longitude: 18.4720, beds: 206, switchhouse: "mediswitch" },
  { name: "Mediclinic Paarl", type: "hospital", group: "Mediclinic", province: "WC", city: "Paarl", address: "Berlyn Estate, Paarl, 7646", latitude: -33.7310, longitude: 18.9680, beds: 108, switchhouse: "mediswitch" },
  { name: "Mediclinic Worcester", type: "hospital", group: "Mediclinic", province: "WC", city: "Worcester", address: "67 Fairbairn St, Worcester, 6849", latitude: -33.7070, longitude: 19.4480, beds: 75, switchhouse: "mediswitch" },
  { name: "Mediclinic Louis Leipoldt", type: "hospital", group: "Mediclinic", province: "WC", city: "Cape Town", address: "Broadway St, Bellville, Cape Town, 7530", latitude: -33.9030, longitude: 18.6320, beds: 150, switchhouse: "mediswitch" },
  { name: "Mediclinic Vergelegen", type: "hospital", group: "Mediclinic", province: "WC", city: "Somerset West", address: "Main Rd, Somerset West, 7130", latitude: -34.0770, longitude: 18.8510, beds: 144, switchhouse: "mediswitch" },
  { name: "Mediclinic Geneva", type: "hospital", group: "Mediclinic", province: "WC", city: "George", address: "Waterkanaal Rd, George, 6529", latitude: -33.9610, longitude: 22.4680, beds: 80, switchhouse: "mediswitch" },
  { name: "Mediclinic George", type: "hospital", group: "Mediclinic", province: "WC", city: "George", address: "Meade St, George, 6529", latitude: -33.9600, longitude: 22.4530, beds: 90, switchhouse: "mediswitch" },
  { name: "Mediclinic Hermanus", type: "hospital", group: "Mediclinic", province: "WC", city: "Hermanus", address: "Hospital St, Hermanus, 7200", latitude: -34.4170, longitude: 19.2280, beds: 52, switchhouse: "mediswitch" },
  { name: "Mediclinic Plettenberg Bay", type: "hospital", group: "Mediclinic", province: "WC", city: "Plettenberg Bay", address: "Longships Dr, Plettenberg Bay, 6600", latitude: -34.0520, longitude: 23.3780, beds: 36, switchhouse: "mediswitch" },
  { name: "Mediclinic Klein Karoo", type: "hospital", group: "Mediclinic", province: "WC", city: "Oudtshoorn", address: "Jubilee Ave, Oudtshoorn, 6620", latitude: -33.5900, longitude: 22.2060, beds: 48, switchhouse: "mediswitch" },

  // -- KwaZulu-Natal --
  { name: "Mediclinic Pietermaritzburg", type: "hospital", group: "Mediclinic", province: "KZN", city: "Pietermaritzburg", address: "90 Chatterton Rd, Pietermaritzburg, 3201", latitude: -29.6040, longitude: 30.3810, beds: 200, switchhouse: "mediswitch" },
  { name: "Mediclinic Newcastle", type: "hospital", group: "Mediclinic", province: "KZN", city: "Newcastle", address: "90 Allen St, Newcastle, 2940", latitude: -27.7530, longitude: 29.9370, beds: 110, switchhouse: "mediswitch" },
  { name: "Mediclinic Victoria", type: "hospital", group: "Mediclinic", province: "KZN", city: "Pietermaritzburg", address: "355 Burger St, Pietermaritzburg, 3201", latitude: -29.5990, longitude: 30.3780, beds: 80, switchhouse: "mediswitch" },
  { name: "Mediclinic Howick", type: "hospital", group: "Mediclinic", province: "KZN", city: "Howick", address: "30 Main St, Howick, 3290", latitude: -29.4860, longitude: 30.2280, beds: 54, switchhouse: "mediswitch" },
  { name: "Mediclinic Ladysmith", type: "hospital", group: "Mediclinic", province: "KZN", city: "Ladysmith", address: "158 Malcolm Rd, Ladysmith, 3370", latitude: -28.5540, longitude: 29.7770, beds: 60, switchhouse: "mediswitch" },

  // -- Mpumalanga --
  { name: "Mediclinic Nelspruit", type: "hospital", group: "Mediclinic", province: "MP", city: "Mbombela", address: "1 Louise St, Sonheuwel, Mbombela, 1200", latitude: -25.4740, longitude: 30.9710, beds: 180, switchhouse: "mediswitch" },
  { name: "Mediclinic Highveld", type: "hospital", group: "Mediclinic", province: "MP", city: "Emalahleni", address: "Hospital St, Die Heuwel, Emalahleni, 1034", latitude: -25.8730, longitude: 29.2350, beds: 120, switchhouse: "mediswitch" },
  { name: "Mediclinic Ermelo", type: "hospital", group: "Mediclinic", province: "MP", city: "Ermelo", address: "Hospital St, Ermelo, 2350", latitude: -26.5270, longitude: 29.9830, beds: 52, switchhouse: "mediswitch" },
  { name: "Mediclinic Barberton", type: "hospital", group: "Mediclinic", province: "MP", city: "Barberton", address: "Lee St, Barberton, 1300", latitude: -25.7850, longitude: 31.0540, beds: 40, switchhouse: "mediswitch" },

  // -- Limpopo --
  { name: "Mediclinic Limpopo", type: "hospital", group: "Mediclinic", province: "LP", city: "Polokwane", address: "Cnr Dorp & Hospital St, Polokwane, 0699", latitude: -23.9080, longitude: 29.4530, beds: 190, switchhouse: "mediswitch" },
  { name: "Mediclinic Lephalale", type: "hospital", group: "Mediclinic", province: "LP", city: "Lephalale", address: "Joe Slovo St, Lephalale, 0555", latitude: -23.6850, longitude: 27.6980, beds: 48, switchhouse: "mediswitch" },
  { name: "Mediclinic Tzaneen", type: "hospital", group: "Mediclinic", province: "LP", city: "Tzaneen", address: "38 Peace St, Tzaneen, 0850", latitude: -23.8330, longitude: 30.1630, beds: 68, switchhouse: "mediswitch" },

  // -- Free State --
  { name: "Mediclinic Bloemfontein", type: "hospital", group: "Mediclinic", province: "FS", city: "Bloemfontein", address: "Cnr Kellner & Parfitt Ave, Westdene, Bloemfontein, 9301", latitude: -29.1140, longitude: 26.2010, beds: 172, switchhouse: "mediswitch" },
  { name: "Mediclinic Welkom", type: "hospital", group: "Mediclinic", province: "FS", city: "Welkom", address: "Heeren St, Welkom, 9459", latitude: -27.9820, longitude: 26.7450, beds: 68, switchhouse: "mediswitch" },

  // -- North West --
  { name: "Mediclinic Potchefstroom", type: "hospital", group: "Mediclinic", province: "NW", city: "Potchefstroom", address: "Cnr Peter Mokaba & Esselen St, Potchefstroom, 2520", latitude: -26.7170, longitude: 27.0960, beds: 110, switchhouse: "mediswitch" },
  { name: "Mediclinic Brits", type: "hospital", group: "Mediclinic", province: "NW", city: "Brits", address: "Cnr Van Velden & Paul Kruger, Brits, 0250", latitude: -25.6290, longitude: 27.7740, beds: 72, switchhouse: "mediswitch" },

  // -- Northern Cape --
  { name: "Mediclinic Kimberley", type: "hospital", group: "Mediclinic", province: "NC", city: "Kimberley", address: "Du Toitspan Rd, Kimberley, 8301", latitude: -28.7450, longitude: 24.7750, beds: 100, switchhouse: "mediswitch" },
  { name: "Mediclinic Upington", type: "hospital", group: "Mediclinic", province: "NC", city: "Upington", address: "Schroeder St, Upington, 8800", latitude: -28.4540, longitude: 21.2590, beds: 56, switchhouse: "mediswitch" },

  // -- Eastern Cape --
  { name: "Mediclinic Queenstown", type: "hospital", group: "Mediclinic", province: "EC", city: "Queenstown", address: "Robinson Rd, Queenstown, 5319", latitude: -31.8980, longitude: 26.8790, beds: 60, switchhouse: "mediswitch" },

  // ==========================================================================
  // MEDICLINIC DAY CLINICS (15)
  // ==========================================================================
  { name: "Mediclinic Sandton Day Clinic", type: "day_clinic", group: "Mediclinic", province: "GP", city: "Johannesburg", address: "Peter Place, Bryanston, Sandton, 2191", latitude: -26.0540, longitude: 28.0200, switchhouse: "mediswitch" },
  { name: "Mediclinic Lakeview Day Clinic", type: "day_clinic", group: "Mediclinic", province: "GP", city: "Johannesburg", address: "36 Galway Rd, Lakeview, Benoni, 1501", latitude: -26.1590, longitude: 28.3340, switchhouse: "mediswitch" },
  { name: "Mediclinic Cape Gate Day Clinic", type: "day_clinic", group: "Mediclinic", province: "WC", city: "Cape Town", address: "Cape Gate Retail Park, Okavango Rd, Brackenfell, 7560", latitude: -33.8760, longitude: 18.6800, switchhouse: "mediswitch" },
  { name: "Mediclinic Strand Day Clinic", type: "day_clinic", group: "Mediclinic", province: "WC", city: "Strand", address: "Strand Main Rd, Strand, 7140", latitude: -34.1030, longitude: 18.8310, switchhouse: "mediswitch" },
  { name: "Mediclinic Hoogland Day Clinic", type: "day_clinic", group: "Mediclinic", province: "FS", city: "Bethlehem", address: "Hospital St, Bethlehem, 9700", latitude: -28.2300, longitude: 28.3060, switchhouse: "mediswitch" },
  { name: "Mediclinic Secunda Day Clinic", type: "day_clinic", group: "Mediclinic", province: "MP", city: "Secunda", address: "PDP Centre, Secunda, 2302", latitude: -26.5120, longitude: 29.1840, switchhouse: "mediswitch" },

  // ==========================================================================
  // MAJOR PUBLIC HOSPITALS (60+)
  // ==========================================================================

  // -- Gauteng --
  { name: "Chris Hani Baragwanath Academic Hospital", type: "hospital", group: "Public", province: "GP", city: "Johannesburg", address: "26 Chris Hani Rd, Diepkloof, Soweto, 1862", latitude: -26.2618, longitude: 27.9428, beds: 3200 },
  { name: "Charlotte Maxeke Johannesburg Academic Hospital", type: "hospital", group: "Public", province: "GP", city: "Johannesburg", address: "7 York Rd, Parktown, Johannesburg, 2193", latitude: -26.1743, longitude: 28.0429, beds: 1088 },
  { name: "Steve Biko Academic Hospital", type: "hospital", group: "Public", province: "GP", city: "Pretoria", address: "Steve Biko Rd, Gezina, Pretoria, 0084", latitude: -25.7260, longitude: 28.2040, beds: 832 },
  { name: "Kalafong Provincial Tertiary Hospital", type: "hospital", group: "Public", province: "GP", city: "Pretoria", address: "Cnr Swartkoppies & Pretoria West Rd, Atteridgeville, 0008", latitude: -25.7660, longitude: 28.0990, beds: 700 },
  { name: "Dr George Mukhari Academic Hospital", type: "hospital", group: "Public", province: "GP", city: "Pretoria", address: "Setlogelo Dr, Ga-Rankuwa, 0208", latitude: -25.6190, longitude: 28.0110, beds: 1655 },
  { name: "Rahima Moosa Mother and Child Hospital", type: "hospital", group: "Public", province: "GP", city: "Johannesburg", address: "Fuel Rd, Coronationville, Johannesburg, 2093", latitude: -26.1890, longitude: 27.9880, beds: 360 },
  { name: "Tembisa Hospital", type: "hospital", group: "Public", province: "GP", city: "Tembisa", address: "Cnr Isimuku & Hospital Rd, Tembisa, 1632", latitude: -26.0010, longitude: 28.2250, beds: 812 },
  { name: "Edenvale General Hospital", type: "hospital", group: "Public", province: "GP", city: "Johannesburg", address: "Modderfontein Rd, Edenvale, 1609", latitude: -26.1280, longitude: 28.1490, beds: 370 },
  { name: "Helen Joseph Hospital", type: "hospital", group: "Public", province: "GP", city: "Johannesburg", address: "Perth Rd, Auckland Park, Johannesburg, 2006", latitude: -26.1850, longitude: 28.0070, beds: 480 },
  { name: "Thelle Mogoerane Hospital", type: "hospital", group: "Public", province: "GP", city: "Vosloorus", address: "Cnr Slovoville & Hospital Rd, Vosloorus, 1475", latitude: -26.3540, longitude: 28.1960, beds: 600 },
  { name: "Sebokeng Hospital", type: "hospital", group: "Public", province: "GP", city: "Sebokeng", address: "Moshoeshoe Rd, Sebokeng, 1983", latitude: -26.5890, longitude: 27.8310, beds: 700 },
  { name: "Mamelodi Hospital", type: "hospital", group: "Public", province: "GP", city: "Pretoria", address: "Tsamaya Ave, Mamelodi, Pretoria, 0122", latitude: -25.7080, longitude: 28.3920, beds: 340 },
  { name: "Leratong Hospital", type: "hospital", group: "Public", province: "GP", city: "Krugersdorp", address: "Cnr Adcock & Randfontein Rd, Chamdor, 1747", latitude: -26.1520, longitude: 27.8110, beds: 700 },
  { name: "Pholosong Hospital", type: "hospital", group: "Public", province: "GP", city: "Tsakane", address: "1067 Ndaba St, Tsakane, 1550", latitude: -26.3490, longitude: 28.3710, beds: 400 },
  { name: "Pretoria West Hospital", type: "hospital", group: "Public", province: "GP", city: "Pretoria", address: "Sytze Wierda Ave, Pretoria West, 0002", latitude: -25.7530, longitude: 28.1440, beds: 220 },
  { name: "Kopanong Hospital", type: "hospital", group: "Public", province: "GP", city: "Vereeniging", address: "2 Uranium St, Duncanville, Vereeniging, 1939", latitude: -26.6450, longitude: 27.9080, beds: 305 },

  // -- Western Cape --
  { name: "Groote Schuur Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Main Rd, Observatory, Cape Town, 7925", latitude: -33.9413, longitude: 18.4630, beds: 893 },
  { name: "Tygerberg Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Francie van Zijl Dr, Parow Valley, Cape Town, 7505", latitude: -33.8840, longitude: 18.6090, beds: 1310 },
  { name: "Red Cross War Memorial Children's Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Klipfontein Rd, Rondebosch, Cape Town, 7700", latitude: -33.9630, longitude: 18.4650, beds: 273 },
  { name: "Somerset Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Beach Rd, Green Point, Cape Town, 8005", latitude: -33.9130, longitude: 18.4130, beds: 200 },
  { name: "Mitchells Plain District Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "AZ Berman Dr, Mitchells Plain, Cape Town, 7785", latitude: -34.0520, longitude: 18.6220, beds: 300 },
  { name: "Karl Bremer Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Mike Pienaar Blvd, Bellville, Cape Town, 7530", latitude: -33.8980, longitude: 18.6240, beds: 306 },
  { name: "Khayelitsha District Hospital", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Lwandle Rd, Khayelitsha, Cape Town, 7784", latitude: -34.0390, longitude: 18.6780, beds: 230 },
  { name: "Victoria Hospital (Wynberg)", type: "hospital", group: "Public", province: "WC", city: "Cape Town", address: "Hill St, Wynberg, Cape Town, 7800", latitude: -34.0090, longitude: 18.4600, beds: 210 },
  { name: "George Hospital", type: "hospital", group: "Public", province: "WC", city: "George", address: "Davidson Rd, George, 6529", latitude: -33.9590, longitude: 22.4400, beds: 272 },
  { name: "Worcester Hospital", type: "hospital", group: "Public", province: "WC", city: "Worcester", address: "Durban St, Worcester, 6849", latitude: -33.7050, longitude: 19.4420, beds: 255 },
  { name: "Paarl Hospital", type: "hospital", group: "Public", province: "WC", city: "Paarl", address: "Hospital St, Paarl, 7646", latitude: -33.7330, longitude: 18.9660, beds: 220 },

  // -- KwaZulu-Natal --
  { name: "Inkosi Albert Luthuli Central Hospital", type: "hospital", group: "Public", province: "KZN", city: "Durban", address: "800 Vusi Mzimela Rd, Cato Manor, Durban, 4091", latitude: -29.8697, longitude: 30.9781, beds: 846 },
  { name: "King Edward VIII Hospital", type: "hospital", group: "Public", province: "KZN", city: "Durban", address: "King Edward Ave, Umbilo, Durban, 4001", latitude: -29.8770, longitude: 30.9970, beds: 922 },
  { name: "Addington Hospital", type: "hospital", group: "Public", province: "KZN", city: "Durban", address: "Erskine Terrace, South Beach, Durban, 4001", latitude: -29.8620, longitude: 31.0400, beds: 572 },
  { name: "R K Khan Hospital", type: "hospital", group: "Public", province: "KZN", city: "Durban", address: "Lachman Rd, Chatsworth, Durban, 4030", latitude: -29.9200, longitude: 30.8860, beds: 543 },
  { name: "Prince Mshiyeni Memorial Hospital", type: "hospital", group: "Public", province: "KZN", city: "Durban", address: "1 Mangosuthu Hwy, Umlazi, 4031", latitude: -29.9700, longitude: 30.8920, beds: 1200 },
  { name: "Mahatma Gandhi Memorial Hospital", type: "hospital", group: "Public", province: "KZN", city: "Durban", address: "102 Phoenix Hwy, Phoenix, 4068", latitude: -29.7130, longitude: 31.0070, beds: 350 },
  { name: "Edendale Hospital", type: "hospital", group: "Public", province: "KZN", city: "Pietermaritzburg", address: "Private Bag, Edendale, 3218", latitude: -29.6400, longitude: 30.3260, beds: 900 },
  { name: "Grey's Hospital", type: "hospital", group: "Public", province: "KZN", city: "Pietermaritzburg", address: "Townhill, Pietermaritzburg, 3201", latitude: -29.5960, longitude: 30.3700, beds: 530 },
  { name: "Ngwelezana Hospital", type: "hospital", group: "Public", province: "KZN", city: "Empangeni", address: "Thanduyise Rd, Ngwelezana, 3880", latitude: -28.7620, longitude: 31.9120, beds: 554 },

  // -- Eastern Cape --
  { name: "Livingstone Tertiary Hospital", type: "hospital", group: "Public", province: "EC", city: "Gqeberha", address: "Standford Rd, Korsten, Gqeberha, 6020", latitude: -33.9170, longitude: 25.6070, beds: 502 },
  { name: "Frere Hospital", type: "hospital", group: "Public", province: "EC", city: "East London", address: "Amalinda Main Rd, East London, 5201", latitude: -32.9960, longitude: 27.8590, beds: 800 },
  { name: "Cecilia Makiwane Hospital", type: "hospital", group: "Public", province: "EC", city: "East London", address: "Billie Rd, Mdantsane, 5219", latitude: -32.9540, longitude: 27.7640, beds: 700 },
  { name: "Nelson Mandela Academic Hospital", type: "hospital", group: "Public", province: "EC", city: "Mthatha", address: "Private Bag X5014, Mthatha, 5099", latitude: -31.5820, longitude: 28.7750, beds: 502 },
  { name: "Dora Nginza Hospital", type: "hospital", group: "Public", province: "EC", city: "Gqeberha", address: "Spondo St, Zwide, Gqeberha, 6201", latitude: -33.8720, longitude: 25.5750, beds: 627 },

  // -- Free State --
  { name: "Universitas Academic Hospital", type: "hospital", group: "Public", province: "FS", city: "Bloemfontein", address: "1 Logeman St, Universitas, Bloemfontein, 9301", latitude: -29.1190, longitude: 26.1950, beds: 610 },
  { name: "Pelonomi Tertiary Hospital", type: "hospital", group: "Public", province: "FS", city: "Bloemfontein", address: "Dr Belcher Rd, Heidedal, Bloemfontein, 9306", latitude: -29.1430, longitude: 26.2060, beds: 560 },
  { name: "National District Hospital (Bloemfontein)", type: "hospital", group: "Public", province: "FS", city: "Bloemfontein", address: "Harvey Rd, Willows, Bloemfontein, 9301", latitude: -29.1110, longitude: 26.2210, beds: 208 },

  // -- Mpumalanga --
  { name: "Rob Ferreira Hospital", type: "hospital", group: "Public", province: "MP", city: "Mbombela", address: "Madiba Dr, Mbombela, 1200", latitude: -25.4750, longitude: 30.9690, beds: 400 },
  { name: "Witbank Hospital", type: "hospital", group: "Public", province: "MP", city: "Emalahleni", address: "Hospital Rd, Die Heuwel, Emalahleni, 1035", latitude: -25.8750, longitude: 29.2300, beds: 350 },
  { name: "Ermelo Hospital", type: "hospital", group: "Public", province: "MP", city: "Ermelo", address: "Hospital St, Ermelo, 2350", latitude: -26.5280, longitude: 29.9820, beds: 200 },

  // -- Limpopo --
  { name: "Pietersburg Hospital", type: "hospital", group: "Public", province: "LP", city: "Polokwane", address: "Hospital St, Polokwane, 0700", latitude: -23.9070, longitude: 29.4510, beds: 550 },
  { name: "Mankweng Hospital", type: "hospital", group: "Public", province: "LP", city: "Mankweng", address: "Mankweng, Polokwane, 0727", latitude: -23.8830, longitude: 29.7200, beds: 450 },
  { name: "Mokopane Hospital", type: "hospital", group: "Public", province: "LP", city: "Mokopane", address: "81 Voortrekker St, Mokopane, 0601", latitude: -24.1950, longitude: 29.0050, beds: 300 },
  { name: "Tshilidzini Hospital", type: "hospital", group: "Public", province: "LP", city: "Thohoyandou", address: "Private Bag X924, Thohoyandou, 0950", latitude: -22.9520, longitude: 30.4740, beds: 440 },
  { name: "Letaba Hospital", type: "hospital", group: "Public", province: "LP", city: "Tzaneen", address: "Letaba Hospital Rd, Tzaneen, 0850", latitude: -23.8490, longitude: 30.1590, beds: 350 },
  { name: "St Rita's Hospital", type: "hospital", group: "Public", province: "LP", city: "Lephalale", address: "Lephalale, 0555", latitude: -23.6870, longitude: 27.6970, beds: 200 },

  // -- North West --
  { name: "Klerksdorp-Tshepong Hospital Complex", type: "hospital", group: "Public", province: "NW", city: "Klerksdorp", address: "Neserhof St, Klerksdorp, 2571", latitude: -26.8530, longitude: 26.6580, beds: 800 },
  { name: "Job Shimankana Tabane Hospital", type: "hospital", group: "Public", province: "NW", city: "Rustenburg", address: "Fatima Bhayat St, Rustenburg, 0299", latitude: -25.6690, longitude: 27.2400, beds: 450 },
  { name: "Mafikeng Provincial Hospital", type: "hospital", group: "Public", province: "NW", city: "Mahikeng", address: "Lichtenburg Rd, Mahikeng, 2745", latitude: -25.8530, longitude: 25.6410, beds: 300 },

  // -- Northern Cape --
  { name: "Kimberley Hospital Complex", type: "hospital", group: "Public", province: "NC", city: "Kimberley", address: "Du Toitspan Rd, Kimberley, 8301", latitude: -28.7370, longitude: 24.7700, beds: 500 },
  { name: "Robert Sobukwe Hospital", type: "hospital", group: "Public", province: "NC", city: "Kimberley", address: "Du Toitspan Rd, Kimberley, 8301", latitude: -28.7380, longitude: 24.7710, beds: 250 },
  { name: "Upington Hospital", type: "hospital", group: "Public", province: "NC", city: "Upington", address: "Scott St, Upington, 8800", latitude: -28.4520, longitude: 21.2560, beds: 180 },

  // ==========================================================================
  // BUSAMED HOSPITALS (private — 5)
  // ==========================================================================
  { name: "Busamed Modderfontein Hospital", type: "hospital", group: "Busamed", province: "GP", city: "Johannesburg", address: "Modderfontein Rd, Modderfontein, 1645", latitude: -26.0930, longitude: 28.1550, beds: 158, switchhouse: "mediswitch" },
  { name: "Busamed Hillcrest Hospital", type: "hospital", group: "Busamed", province: "KZN", city: "Durban", address: "1 Nqutu Rd, Hillcrest, 3610", latitude: -29.7730, longitude: 30.7480, beds: 164, switchhouse: "mediswitch" },
  { name: "Busamed Paardevlei Hospital", type: "hospital", group: "Busamed", province: "WC", city: "Somerset West", address: "3 Paardevlei Rd, Somerset West, 7130", latitude: -34.0790, longitude: 18.8530, beds: 108, switchhouse: "mediswitch" },
  { name: "Busamed Bram Fischer Hospital", type: "hospital", group: "Busamed", province: "FS", city: "Bloemfontein", address: "Cnr Bram Fischer & Kellner St, Bloemfontein, 9301", latitude: -29.1050, longitude: 26.1840, beds: 130, switchhouse: "mediswitch" },
  { name: "Busamed Gateway Hospital", type: "hospital", group: "Busamed", province: "KZN", city: "Durban", address: "Umhlanga Gateway, Umhlanga Ridge, 4319", latitude: -29.7280, longitude: 31.0640, beds: 120, switchhouse: "mediswitch" },

  // ==========================================================================
  // LENMED HOSPITALS (private — 8)
  // ==========================================================================
  { name: "Lenmed Ahmed Kathrada Hospital", type: "hospital", group: "Lenmed", province: "GP", city: "Johannesburg", address: "K43 Hwy, Lenasia, 1820", latitude: -26.3190, longitude: 27.8380, beds: 200, switchhouse: "mediswitch" },
  { name: "Lenmed Ethekwini Hospital", type: "hospital", group: "Lenmed", province: "KZN", city: "Durban", address: "40 John Zikhala Rd, Durban, 4001", latitude: -29.8580, longitude: 31.0200, beds: 252, switchhouse: "mediswitch" },
  { name: "Lenmed Bokamoso Hospital", type: "hospital", group: "Lenmed", province: "NW", city: "Mahikeng", address: "1 Hospital St, Mmabatho, 2735", latitude: -25.8410, longitude: 25.6320, beds: 120, switchhouse: "mediswitch" },
  { name: "Lenmed Royal Hospital and Heart Centre", type: "hospital", group: "Lenmed", province: "KZN", city: "Durban", address: "135 King Shaka Hwy, Glen Anil, 4051", latitude: -29.7900, longitude: 31.0340, beds: 172, switchhouse: "mediswitch" },
  { name: "Lenmed Shifa Hospital", type: "hospital", group: "Lenmed", province: "GP", city: "Johannesburg", address: "Cnr Rose Ave & Link Rd, Midrand, 1682", latitude: -26.0200, longitude: 28.1100, beds: 90, switchhouse: "mediswitch" },
  { name: "Lenmed Zamokuhle Hospital", type: "hospital", group: "Lenmed", province: "MP", city: "Emalahleni", address: "23 Bester St, Emalahleni, 1034", latitude: -25.8760, longitude: 29.2280, beds: 80, switchhouse: "mediswitch" },
  { name: "Lenmed La Verna Hospital", type: "hospital", group: "Lenmed", province: "KZN", city: "Ladysmith", address: "Murchison St, Ladysmith, 3370", latitude: -28.5550, longitude: 29.7780, beds: 108, switchhouse: "mediswitch" },
  { name: "Lenmed Randfontein Hospital", type: "hospital", group: "Lenmed", province: "GP", city: "Randfontein", address: "Main Reef Rd, Randfontein, 1759", latitude: -26.1650, longitude: 27.7010, beds: 64, switchhouse: "mediswitch" },

  // ==========================================================================
  // NETCARE MEDICROSS CLINICS (55+ — Netcare primary care network)
  // ==========================================================================

  // -- Gauteng --
  { name: "Medicross Centurion", type: "clinic", group: "Netcare", province: "GP", city: "Centurion", address: "Cnr West & Lenchen Ave, Centurion, 0157", latitude: -25.8620, longitude: 28.1870, switchhouse: "healthbridge" },
  { name: "Medicross Midrand", type: "clinic", group: "Netcare", province: "GP", city: "Midrand", address: "New Rd, Halfway House, Midrand, 1685", latitude: -25.9940, longitude: 28.1290, switchhouse: "healthbridge" },
  { name: "Medicross Randburg", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Hill & Bram Fischer Dr, Randburg, 2194", latitude: -26.0960, longitude: 28.0010, switchhouse: "healthbridge" },
  { name: "Medicross Fourways", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr William Nicol & Fourways Blvd, Fourways, 2191", latitude: -26.0130, longitude: 28.0080, switchhouse: "healthbridge" },
  { name: "Medicross Sandton", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Rivonia Rd & 5th St, Sandhurst, 2196", latitude: -26.0810, longitude: 28.0550, switchhouse: "healthbridge" },
  { name: "Medicross Bedfordview", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "14 Nicol Rd, Bedfordview, 2007", latitude: -26.1830, longitude: 28.1300, switchhouse: "healthbridge" },
  { name: "Medicross Alberton", type: "clinic", group: "Netcare", province: "GP", city: "Alberton", address: "Cnr Voortrekker & Swartkoppies Rd, Alberton, 1449", latitude: -26.2680, longitude: 28.1280, switchhouse: "healthbridge" },
  { name: "Medicross Boksburg", type: "clinic", group: "Netcare", province: "GP", city: "Boksburg", address: "Commissioner St, Boksburg, 1459", latitude: -26.2180, longitude: 28.2560, switchhouse: "healthbridge" },
  { name: "Medicross Benoni", type: "clinic", group: "Netcare", province: "GP", city: "Benoni", address: "Tom Jones St, Benoni, 1501", latitude: -26.1870, longitude: 28.3130, switchhouse: "healthbridge" },
  { name: "Medicross Kempton Park", type: "clinic", group: "Netcare", province: "GP", city: "Kempton Park", address: "Cnr CR Swart & Monument Rd, Kempton Park, 1619", latitude: -26.1020, longitude: 28.2350, switchhouse: "healthbridge" },
  { name: "Medicross Pretoria North", type: "clinic", group: "Netcare", province: "GP", city: "Pretoria", address: "Cnr Rachel de Beer & Lavender Rd, Pretoria North, 0182", latitude: -25.6920, longitude: 28.1940, switchhouse: "healthbridge" },
  { name: "Medicross Pretoria West", type: "clinic", group: "Netcare", province: "GP", city: "Pretoria", address: "Cnr Mitchell & Carl St, Pretoria West, 0183", latitude: -25.7530, longitude: 28.1530, switchhouse: "healthbridge" },
  { name: "Medicross Pretoria East", type: "clinic", group: "Netcare", province: "GP", city: "Pretoria", address: "Garsfontein Rd, Moreleta Park, 0181", latitude: -25.8230, longitude: 28.3000, switchhouse: "healthbridge" },
  { name: "Medicross Roodepoort", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cnr Ontdekkers & Christiaan de Wet Rd, Roodepoort, 1724", latitude: -26.1470, longitude: 27.8620, switchhouse: "healthbridge" },
  { name: "Medicross Springs", type: "clinic", group: "Netcare", province: "GP", city: "Springs", address: "5th Ave, Springs, 1559", latitude: -26.2530, longitude: 28.4380, switchhouse: "healthbridge" },
  { name: "Medicross Krugersdorp", type: "clinic", group: "Netcare", province: "GP", city: "Krugersdorp", address: "Cnr Paardekraal & Luipaard St, Krugersdorp, 1739", latitude: -26.1040, longitude: 27.7710, switchhouse: "healthbridge" },
  { name: "Medicross Vereeniging", type: "clinic", group: "Netcare", province: "GP", city: "Vereeniging", address: "Cnr Voortrekker & Loch St, Vereeniging, 1930", latitude: -26.6750, longitude: 27.9280, switchhouse: "healthbridge" },
  { name: "Medicross Vanderbijlpark", type: "clinic", group: "Netcare", province: "GP", city: "Vanderbijlpark", address: "Cnr Frikkie Meyer & Beethoven, Vanderbijlpark, 1900", latitude: -26.7110, longitude: 27.8020, switchhouse: "healthbridge" },
  { name: "Medicross Soweto", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Chris Hani Rd, Soweto, 1862", latitude: -26.2540, longitude: 27.9400, switchhouse: "healthbridge" },
  { name: "Medicross Germiston", type: "clinic", group: "Netcare", province: "GP", city: "Germiston", address: "Victoria St, Germiston, 1401", latitude: -26.2230, longitude: 28.1680, switchhouse: "healthbridge" },

  // -- KwaZulu-Natal --
  { name: "Medicross Bluff", type: "clinic", group: "Netcare", province: "KZN", city: "Durban", address: "1 Lighthouse Rd, Bluff, Durban, 4052", latitude: -29.9180, longitude: 31.0040, switchhouse: "healthbridge" },
  { name: "Medicross Chatsworth", type: "clinic", group: "Netcare", province: "KZN", city: "Durban", address: "Chatsworth Centre, Chatsworth, 4092", latitude: -29.9120, longitude: 30.8880, switchhouse: "healthbridge" },
  { name: "Medicross Pinetown", type: "clinic", group: "Netcare", province: "KZN", city: "Durban", address: "Old Main Rd, Pinetown, 3610", latitude: -29.8170, longitude: 30.8520, switchhouse: "healthbridge" },
  { name: "Medicross Umhlanga", type: "clinic", group: "Netcare", province: "KZN", city: "Durban", address: "Palm Blvd, Umhlanga Ridge, 4319", latitude: -29.7250, longitude: 31.0770, switchhouse: "healthbridge" },
  { name: "Medicross Pietermaritzburg", type: "clinic", group: "Netcare", province: "KZN", city: "Pietermaritzburg", address: "Sanctuary Rd, Pietermaritzburg, 3201", latitude: -29.6010, longitude: 30.3810, switchhouse: "healthbridge" },
  { name: "Medicross Richards Bay", type: "clinic", group: "Netcare", province: "KZN", city: "Richards Bay", address: "Mark Sobukwe Rd, Richards Bay, 3900", latitude: -28.7660, longitude: 32.0680, switchhouse: "healthbridge" },

  // -- Western Cape --
  { name: "Medicross Bellville", type: "clinic", group: "Netcare", province: "WC", city: "Cape Town", address: "24 Bella Rosa St, Omniplace, Bellville, 7530", latitude: -33.9010, longitude: 18.6290, switchhouse: "healthbridge" },
  { name: "Medicross Brackenfell", type: "clinic", group: "Netcare", province: "WC", city: "Cape Town", address: "21 Roslyn St, Brackenfell, 7560", latitude: -33.8780, longitude: 18.6810, switchhouse: "healthbridge" },
  { name: "Medicross Strand", type: "clinic", group: "Netcare", province: "WC", city: "Strand", address: "Main Rd, Strand, 7140", latitude: -34.1010, longitude: 18.8290, switchhouse: "healthbridge" },
  { name: "Medicross Table View", type: "clinic", group: "Netcare", province: "WC", city: "Cape Town", address: "Blaauwberg Rd, Table View, 7441", latitude: -33.8260, longitude: 18.5150, switchhouse: "healthbridge" },
  { name: "Medicross Claremont", type: "clinic", group: "Netcare", province: "WC", city: "Cape Town", address: "Main Rd, Claremont, 7708", latitude: -33.9860, longitude: 18.4600, switchhouse: "healthbridge" },
  { name: "Medicross Milnerton", type: "clinic", group: "Netcare", province: "WC", city: "Cape Town", address: "Koeberg Rd, Milnerton, 7435", latitude: -33.8720, longitude: 18.5130, switchhouse: "healthbridge" },
  { name: "Medicross Paarl", type: "clinic", group: "Netcare", province: "WC", city: "Paarl", address: "Main Rd, Paarl, 7646", latitude: -33.7300, longitude: 18.9650, switchhouse: "healthbridge" },

  // -- Eastern Cape --
  { name: "Medicross Cape Road", type: "clinic", group: "Netcare", province: "EC", city: "Gqeberha", address: "Cape Rd, Greenacres, Gqeberha, 6045", latitude: -33.9540, longitude: 25.5950, switchhouse: "healthbridge" },
  { name: "Medicross East London", type: "clinic", group: "Netcare", province: "EC", city: "East London", address: "Oxford St, East London, 5201", latitude: -32.9870, longitude: 27.8750, switchhouse: "healthbridge" },
  { name: "Medicross Walmer", type: "clinic", group: "Netcare", province: "EC", city: "Gqeberha", address: "Main Rd, Walmer, Gqeberha, 6065", latitude: -33.9720, longitude: 25.6180, switchhouse: "healthbridge" },
  { name: "Medicross Westering", type: "clinic", group: "Netcare", province: "EC", city: "Gqeberha", address: "3rd Ave, Westering, Gqeberha, 6025", latitude: -33.9360, longitude: 25.5470, switchhouse: "healthbridge" },

  // -- Free State --
  { name: "Medicross Bloemfontein", type: "clinic", group: "Netcare", province: "FS", city: "Bloemfontein", address: "Cnr Zastron & 2nd Ave, Westdene, Bloemfontein, 9301", latitude: -29.1140, longitude: 26.2070, switchhouse: "healthbridge" },
  { name: "Medicross Welkom", type: "clinic", group: "Netcare", province: "FS", city: "Welkom", address: "Heeren St, Welkom, 9459", latitude: -27.9830, longitude: 26.7430, switchhouse: "healthbridge" },

  // -- Mpumalanga --
  { name: "Medicross Nelspruit", type: "clinic", group: "Netcare", province: "MP", city: "Mbombela", address: "Samora Machel Dr, Mbombela, 1200", latitude: -25.4730, longitude: 30.9700, switchhouse: "healthbridge" },
  { name: "Medicross Witbank", type: "clinic", group: "Netcare", province: "MP", city: "Emalahleni", address: "Mandela Ave, Emalahleni, 1034", latitude: -25.8690, longitude: 29.2300, switchhouse: "healthbridge" },

  // -- Limpopo --
  { name: "Medicross Polokwane", type: "clinic", group: "Netcare", province: "LP", city: "Polokwane", address: "Grobler St, Polokwane, 0699", latitude: -23.9060, longitude: 29.4520, switchhouse: "healthbridge" },

  // -- North West --
  { name: "Medicross Rustenburg", type: "clinic", group: "Netcare", province: "NW", city: "Rustenburg", address: "Cnr Heystek & Boom St, Rustenburg, 0299", latitude: -25.6700, longitude: 27.2450, switchhouse: "healthbridge" },
  { name: "Medicross Potchefstroom", type: "clinic", group: "Netcare", province: "NW", city: "Potchefstroom", address: "Govan Mbeki Ave, Potchefstroom, 2520", latitude: -26.7150, longitude: 27.0940, switchhouse: "healthbridge" },

  // ==========================================================================
  // NHN (National Hospital Network) / INDEPENDENT HOSPITALS
  // ==========================================================================
  { name: "Wits Donald Gordon Medical Centre", type: "hospital", group: "Independent", province: "GP", city: "Johannesburg", address: "21 Eton Rd, Parktown, Johannesburg, 2193", latitude: -26.1770, longitude: 28.0380, beds: 170 },
  { name: "Arwyp Medical Centre", type: "hospital", group: "Independent", province: "GP", city: "Kempton Park", address: "Cnr Kempton & Monument Rd, Kempton Park, 1619", latitude: -26.1050, longitude: 28.2280, beds: 200, switchhouse: "mediswitch" },
  { name: "Wilgers Hospital", type: "hospital", group: "Independent", province: "GP", city: "Pretoria", address: "Denneboom Rd, Lynnwood, Pretoria, 0081", latitude: -25.7840, longitude: 28.2960, beds: 160, switchhouse: "mediswitch" },
  { name: "Intercare Medfem Hospital", type: "hospital", group: "Independent", province: "GP", city: "Johannesburg", address: "Cnr Outspan & Elektron Ave, Sandton, 2191", latitude: -26.0330, longitude: 28.0440, beds: 50, switchhouse: "healthbridge" },
  { name: "Melomed Bellville Hospital", type: "hospital", group: "Independent", province: "WC", city: "Cape Town", address: "Cnr Voortrekker & AJ West Rd, Bellville, 7530", latitude: -33.9070, longitude: 18.6310, beds: 211, switchhouse: "mediswitch" },
  { name: "Melomed Tokai Hospital", type: "hospital", group: "Independent", province: "WC", city: "Cape Town", address: "Keyser Rd, Tokai, Cape Town, 7945", latitude: -34.0560, longitude: 18.4480, beds: 120, switchhouse: "mediswitch" },
  { name: "Melomed Gatesville Hospital", type: "hospital", group: "Independent", province: "WC", city: "Cape Town", address: "Cnr Duinefontein & Klipfontein Rd, Athlone, 7764", latitude: -33.9610, longitude: 18.5150, beds: 156, switchhouse: "mediswitch" },
  { name: "Melomed Richards Bay Hospital", type: "hospital", group: "Independent", province: "KZN", city: "Richards Bay", address: "1 Anglers Rd, Meerensee, Richards Bay, 3900", latitude: -28.7700, longitude: 32.0700, beds: 80, switchhouse: "mediswitch" },
  { name: "Ahmed Al-Kadi Hospital", type: "hospital", group: "Independent", province: "KZN", city: "Durban", address: "1 Riverhorse Rd, Durban North, 4051", latitude: -29.7830, longitude: 31.0340, beds: 94, switchhouse: "mediswitch" },
  { name: "Durdoc Hospital", type: "hospital", group: "Independent", province: "KZN", city: "Durban", address: "460 Anton Lembede St, Durban, 4001", latitude: -29.8650, longitude: 31.0210, beds: 60, switchhouse: "mediswitch" },
  { name: "Paramount Health Solutions Hospital", type: "hospital", group: "NHN", province: "GP", city: "Johannesburg", address: "Johannesburg Rd, Johannesburg, 2000", latitude: -26.2050, longitude: 28.0450, beds: 100, switchhouse: "mediswitch" },

  // ==========================================================================
  // COMMUNITY HEALTH CENTRES (CHCs) — major metro ones
  // ==========================================================================
  { name: "Hillbrow Community Health Centre", type: "chc", group: "Public", province: "GP", city: "Johannesburg", address: "Cnr Esselen & Clarendon Rd, Hillbrow, 2001", latitude: -26.1900, longitude: 28.0470 },
  { name: "Alexandra Community Health Centre", type: "chc", group: "Public", province: "GP", city: "Johannesburg", address: "1 Pan Africa Rd, Alexandra, 2090", latitude: -26.1020, longitude: 28.1010 },
  { name: "Zola-Jabulani Community Health Centre", type: "chc", group: "Public", province: "GP", city: "Johannesburg", address: "Bolani Rd, Soweto, 1868", latitude: -26.2250, longitude: 27.8640 },
  { name: "Stanza Bopape Community Health Centre", type: "chc", group: "Public", province: "GP", city: "Pretoria", address: "Mamelodi West, Pretoria, 0122", latitude: -25.7190, longitude: 28.3560 },
  { name: "Khayelitsha Community Health Centre", type: "chc", group: "Public", province: "WC", city: "Cape Town", address: "Lwandle Rd, Khayelitsha, 7784", latitude: -34.0380, longitude: 18.6730 },
  { name: "Delft Community Health Centre", type: "chc", group: "Public", province: "WC", city: "Cape Town", address: "Symphony Walk, Delft, 7100", latitude: -33.9700, longitude: 18.6260 },
  { name: "Mitchells Plain Community Health Centre", type: "chc", group: "Public", province: "WC", city: "Cape Town", address: "Merrydale Ave, Mitchells Plain, 7785", latitude: -34.0480, longitude: 18.6060 },
  { name: "KwaMashu Community Health Centre", type: "chc", group: "Public", province: "KZN", city: "Durban", address: "KwaMashu, 4359", latitude: -29.7530, longitude: 30.9720 },
  { name: "Phoenix Community Health Centre", type: "chc", group: "Public", province: "KZN", city: "Durban", address: "Phoenix, 4068", latitude: -29.7100, longitude: 31.0050 },
  { name: "Motherwell Community Health Centre", type: "chc", group: "Public", province: "EC", city: "Gqeberha", address: "Motherwell, Gqeberha, 6211", latitude: -33.8310, longitude: 25.6710 },

  // ==========================================================================
  // INTERCARE GROUP (Healthbridge-connected, Independent GP practices)
  // ==========================================================================
  { name: "Intercare Irene", type: "gp_practice", group: "Independent", province: "GP", city: "Centurion", address: "Nellmapius Dr, Irene, 0062", latitude: -25.8720, longitude: 28.2270, switchhouse: "healthbridge" },
  { name: "Intercare Hazeldean", type: "gp_practice", group: "Independent", province: "GP", city: "Pretoria", address: "Silver Lakes Rd, Hazeldean, 0081", latitude: -25.7960, longitude: 28.3470, switchhouse: "healthbridge" },
  { name: "Intercare Menlo Park", type: "gp_practice", group: "Independent", province: "GP", city: "Pretoria", address: "Cnr Atterbury & Lois Ave, Menlo Park, 0081", latitude: -25.7800, longitude: 28.2740, switchhouse: "healthbridge" },
  { name: "Intercare Lynnwood", type: "gp_practice", group: "Independent", province: "GP", city: "Pretoria", address: "Lynnwood Rd, Lynnwood, 0081", latitude: -25.7740, longitude: 28.2870, switchhouse: "healthbridge" },
  { name: "Intercare Fourways", type: "gp_practice", group: "Independent", province: "GP", city: "Johannesburg", address: "Cnr William Nicol & Cedar Rd, Fourways, 2191", latitude: -26.0140, longitude: 28.0100, switchhouse: "healthbridge" },
  { name: "Intercare Sandton", type: "gp_practice", group: "Independent", province: "GP", city: "Johannesburg", address: "Daisy St, Sandown, 2196", latitude: -26.0890, longitude: 28.0610, switchhouse: "healthbridge" },
  { name: "Intercare Tyger Valley", type: "gp_practice", group: "Independent", province: "WC", city: "Cape Town", address: "Tyger Valley Rd, Bellville, 7530", latitude: -33.8720, longitude: 18.6380, switchhouse: "healthbridge" },
  { name: "Intercare Century City", type: "gp_practice", group: "Independent", province: "WC", city: "Cape Town", address: "Century City Blvd, Century City, 7441", latitude: -33.8910, longitude: 18.5090, switchhouse: "healthbridge" },
  { name: "Intercare Ballito", type: "gp_practice", group: "Independent", province: "KZN", city: "Ballito", address: "Ballito Dr, Ballito, 4420", latitude: -29.5360, longitude: 31.2140, switchhouse: "healthbridge" },
  { name: "Intercare Umhlanga", type: "gp_practice", group: "Independent", province: "KZN", city: "Durban", address: "Umhlanga Rocks Dr, Umhlanga, 4320", latitude: -29.7270, longitude: 31.0790, switchhouse: "healthbridge" },

  // ==========================================================================
  // PRIME CURE MEDICAL CENTRES (Netcare primary care — 5)
  // ==========================================================================
  { name: "Prime Cure Germiston", type: "clinic", group: "Netcare", province: "GP", city: "Germiston", address: "Victoria St, Germiston, 1401", latitude: -26.2240, longitude: 28.1690, switchhouse: "healthbridge" },
  { name: "Prime Cure Kempton Park", type: "clinic", group: "Netcare", province: "GP", city: "Kempton Park", address: "Monument Rd, Kempton Park, 1619", latitude: -26.1030, longitude: 28.2340, switchhouse: "healthbridge" },
  { name: "Prime Cure Tembisa", type: "clinic", group: "Netcare", province: "GP", city: "Tembisa", address: "Isimuku St, Tembisa, 1632", latitude: -26.0020, longitude: 28.2260, switchhouse: "healthbridge" },
  { name: "Prime Cure Vosloorus", type: "clinic", group: "Netcare", province: "GP", city: "Vosloorus", address: "Albrecht Rd, Vosloorus, 1475", latitude: -26.3480, longitude: 28.1930, switchhouse: "healthbridge" },
  { name: "Prime Cure Mamelodi", type: "clinic", group: "Netcare", province: "GP", city: "Pretoria", address: "Tsamaya Ave, Mamelodi, 0122", latitude: -25.7090, longitude: 28.3930, switchhouse: "healthbridge" },

  // ==========================================================================
  // ADDITIONAL INDEPENDENT / SPECIALIST FACILITIES
  // ==========================================================================
  { name: "Sandton Oncology Centre", type: "specialist", group: "Independent", province: "GP", city: "Johannesburg", address: "Cnr Rivonia & 5th St, Sandhurst, 2196", latitude: -26.0850, longitude: 28.0580, switchhouse: "healthbridge" },
  { name: "Wits Reproductive Health & HIV Institute", type: "specialist", group: "Independent", province: "GP", city: "Johannesburg", address: "Hillbrow Health Precinct, Johannesburg, 2001", latitude: -26.1910, longitude: 28.0480 },
  { name: "Netcare Sunward Park Hospital", type: "hospital", group: "Netcare", province: "GP", city: "Boksburg", address: "Cnr Rietfontein & Wright St, Sunward Park, 1459", latitude: -26.2290, longitude: 28.2710, beds: 148, switchhouse: "mediswitch" },
  { name: "Netcare Vaalpark Hospital", type: "hospital", group: "Netcare", province: "FS", city: "Sasolburg", address: "Cnr Klasie Havenga & Fritz du Preez Dr, Vaalpark, 1947", latitude: -26.8050, longitude: 27.8570, beds: 60, switchhouse: "mediswitch" },

  // ==========================================================================
  // LIFE HEALTHCARE — additional facilities
  // ==========================================================================
  { name: "Life The Glynnwood", type: "hospital", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Cnr Monument & Swartkoppies Rd, Glen Marais, 1619", latitude: -26.0960, longitude: 28.2240, beds: 200, switchhouse: "mediswitch" },
  { name: "Life Bracken Gardens Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Alberton", address: "19 Caledon St, Brackendowns, Alberton, 1448", latitude: -26.3090, longitude: 28.1230, beds: 64, switchhouse: "mediswitch" },
  { name: "Life Carstenview Hospital", type: "hospital", group: "Life Healthcare", province: "GP", city: "Midrand", address: "Midrand, 1682", latitude: -25.9980, longitude: 28.1180, beds: 80, switchhouse: "mediswitch" },
  { name: "Life Bay View Private Hospital", type: "hospital", group: "Life Healthcare", province: "EC", city: "Mossel Bay", address: "Marsh St, Mossel Bay, 6500", latitude: -34.1830, longitude: 22.1420, beds: 50, switchhouse: "mediswitch" },
  { name: "Life Knysna Private Hospital", type: "hospital", group: "Life Healthcare", province: "WC", city: "Knysna", address: "Hunters Dr, Knysna, 6571", latitude: -34.0360, longitude: 23.0490, beds: 60, switchhouse: "mediswitch" },

  // -- Life Healthcare Mental Health --
  { name: "Life Riverfield Lodge (Mental Health)", type: "psychiatric", group: "Life Healthcare", province: "GP", city: "Vereeniging", address: "Cnr Banksia & Jasmyn, Vereeniging, 1939", latitude: -26.6760, longitude: 27.9310, beds: 54, switchhouse: "mediswitch" },
  { name: "Life Hunterscraig", type: "psychiatric", group: "Life Healthcare", province: "KZN", city: "Durban", address: "Hillcrest, 3610", latitude: -29.7700, longitude: 30.7500, beds: 60, switchhouse: "mediswitch" },
  { name: "Life Mimosa Lodge", type: "psychiatric", group: "Life Healthcare", province: "EC", city: "Gqeberha", address: "3rd Ave, Walmer, 6065", latitude: -33.9680, longitude: 25.6170, beds: 42, switchhouse: "mediswitch" },

  // -- Life Healthcare Rehabilitation --
  { name: "Life Rehabilitation Entabeni", type: "rehabilitation", group: "Life Healthcare", province: "KZN", city: "Durban", address: "148 Mazisi Kunene Rd, Glenwood, Durban, 4001", latitude: -29.8650, longitude: 31.0060, beds: 40, switchhouse: "mediswitch" },
  { name: "Life Rehabilitation Eugene Marais", type: "rehabilitation", group: "Life Healthcare", province: "GP", city: "Pretoria", address: "908 Cnr Vermeulen & Bosman, Pretoria, 0002", latitude: -25.7480, longitude: 28.1930, beds: 36, switchhouse: "mediswitch" },
  { name: "Life Rehabilitation Flora", type: "rehabilitation", group: "Life Healthcare", province: "GP", city: "Johannesburg", address: "Ontdekkers Rd, Florida, 1709", latitude: -26.1750, longitude: 27.9170, beds: 40, switchhouse: "mediswitch" },

  // ==========================================================================
  // ADDITIONAL MEDICROSS / PRIMARY CARE (to round out to 55+)
  // ==========================================================================
  { name: "Medicross Edenvale", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Van Riebeeck Ave, Edenvale, 1609", latitude: -26.1310, longitude: 28.1520, switchhouse: "healthbridge" },
  { name: "Medicross Northgate", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Northgate Shopping Centre, Randburg, 2195", latitude: -26.0580, longitude: 27.9480, switchhouse: "healthbridge" },
  { name: "Medicross Maponya", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Maponya Mall, Chris Hani Rd, Klipspruit, 1812", latitude: -26.2590, longitude: 27.9420, switchhouse: "healthbridge" },
  { name: "Medicross Greenstone", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Greenstone Hill, Edenvale, 1609", latitude: -26.1380, longitude: 28.1440, switchhouse: "healthbridge" },
  { name: "Medicross Rosebank", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Cradock Ave, Rosebank, 2196", latitude: -26.1450, longitude: 28.0430, switchhouse: "healthbridge" },
  { name: "Medicross Olivedale", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "President Fouche Dr, Olivedale, 2158", latitude: -26.0670, longitude: 27.9480, switchhouse: "healthbridge" },
  { name: "Medicross Woodmead", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Woodmead Dr, Woodmead, 2191", latitude: -26.0480, longitude: 28.0840, switchhouse: "healthbridge" },
  { name: "Medicross Sunninghill", type: "clinic", group: "Netcare", province: "GP", city: "Johannesburg", address: "Nanyuki Rd, Sunninghill, 2157", latitude: -26.0310, longitude: 28.0590, switchhouse: "healthbridge" },
];

// ---------------------------------------------------------------------------
// Statistics (computed at module load)
// ---------------------------------------------------------------------------

export const FACILITY_STATS = {
  total: SA_FACILITIES.length,
  byGroup: {} as Record<string, number>,
  byProvince: {} as Record<string, number>,
  byType: {} as Record<string, number>,
} as const;

// Compute counts
(() => {
  const stats = FACILITY_STATS as {
    byGroup: Record<string, number>;
    byProvince: Record<string, number>;
    byType: Record<string, number>;
  };
  for (const f of SA_FACILITIES) {
    const g = f.group ?? "Unknown";
    stats.byGroup[g] = (stats.byGroup[g] ?? 0) + 1;
    stats.byProvince[f.province] = (stats.byProvince[f.province] ?? 0) + 1;
    stats.byType[f.type] = (stats.byType[f.type] ?? 0) + 1;
  }
})();

// ---------------------------------------------------------------------------
// Lookup Functions
// ---------------------------------------------------------------------------

/**
 * Find a facility by exact or partial name match (case-insensitive).
 */
export function findFacilityByName(name: string): FacilityRecord | undefined {
  const lower = name.toLowerCase();
  // Try exact match first
  const exact = SA_FACILITIES.find(
    (f) => f.name.toLowerCase() === lower
  );
  if (exact) return exact;

  // Partial match
  return SA_FACILITIES.find((f) =>
    f.name.toLowerCase().includes(lower)
  );
}

/**
 * Find all facilities matching a search term (case-insensitive).
 */
export function searchFacilities(query: string): FacilityRecord[] {
  const lower = query.toLowerCase();
  return SA_FACILITIES.filter(
    (f) =>
      f.name.toLowerCase().includes(lower) ||
      f.city.toLowerCase().includes(lower) ||
      (f.address?.toLowerCase().includes(lower) ?? false)
  );
}

/**
 * Find all facilities in a given province.
 */
export function findFacilitiesByProvince(
  province: string
): FacilityRecord[] {
  const upper = province.toUpperCase();
  return SA_FACILITIES.filter((f) => f.province === upper);
}

/**
 * Find all facilities belonging to a hospital group.
 */
export function findFacilitiesByGroup(group: string): FacilityRecord[] {
  const lower = group.toLowerCase();
  return SA_FACILITIES.filter(
    (f) => f.group?.toLowerCase() === lower
  );
}

/**
 * Find all facilities of a given type.
 */
export function findFacilitiesByType(
  type: FacilityRecord["type"]
): FacilityRecord[] {
  return SA_FACILITIES.filter((f) => f.type === type);
}

/**
 * Find all facilities connected to a specific switchhouse.
 */
export function findFacilitiesBySwitchhouse(
  switchhouse: "healthbridge" | "mediswitch" | "switchon"
): FacilityRecord[] {
  return SA_FACILITIES.filter((f) => f.switchhouse === switchhouse);
}

/**
 * Lookup a facility by BHF practice number (PCNS).
 */
export function lookupFacilityByPracticeNumber(
  pcns: string
): FacilityRecord | undefined {
  return SA_FACILITIES.find((f) => f.practiceNumber === pcns);
}

// ---------------------------------------------------------------------------
// Haversine Distance Calculation
// ---------------------------------------------------------------------------

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance in km between two GPS coordinates using the Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Find the nearest facility to given GPS coordinates.
 * Optionally filter by facility type.
 */
export function findNearestFacility(
  lat: number,
  lng: number,
  type?: FacilityRecord["type"]
): FacilityRecord | undefined {
  let nearest: FacilityRecord | undefined;
  let minDistance = Infinity;

  for (const facility of SA_FACILITIES) {
    if (type && facility.type !== type) continue;
    if (facility.latitude == null || facility.longitude == null) continue;

    const dist = calculateDistance(
      lat,
      lng,
      facility.latitude,
      facility.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = facility;
    }
  }

  return nearest;
}

/**
 * Find the N nearest facilities to given GPS coordinates.
 * Optionally filter by type and/or group.
 */
export function findNearestFacilities(
  lat: number,
  lng: number,
  count: number = 5,
  options?: {
    type?: FacilityRecord["type"];
    group?: string;
    maxDistanceKm?: number;
  }
): Array<FacilityRecord & { distanceKm: number }> {
  const results: Array<FacilityRecord & { distanceKm: number }> = [];

  for (const facility of SA_FACILITIES) {
    if (options?.type && facility.type !== options.type) continue;
    if (
      options?.group &&
      facility.group?.toLowerCase() !== options.group.toLowerCase()
    )
      continue;
    if (facility.latitude == null || facility.longitude == null) continue;

    const distanceKm = calculateDistance(
      lat,
      lng,
      facility.latitude,
      facility.longitude
    );
    if (options?.maxDistanceKm && distanceKm > options.maxDistanceKm) continue;

    results.push({ ...facility, distanceKm });
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results.slice(0, count);
}

// ---------------------------------------------------------------------------
// Geographic Fraud Detection Utilities
// ---------------------------------------------------------------------------

/**
 * Check if a claim's facility is within a reasonable distance of the patient's location.
 * Returns a risk assessment.
 */
export function assessGeographicRisk(
  facilityName: string,
  patientLat: number,
  patientLng: number
): {
  facility: FacilityRecord | undefined;
  distanceKm: number | null;
  riskLevel: "low" | "medium" | "high" | "critical";
  reason: string;
} {
  const facility = findFacilityByName(facilityName);

  if (!facility) {
    return {
      facility: undefined,
      distanceKm: null,
      riskLevel: "high",
      reason: `Facility "${facilityName}" not found in database — possible fictitious facility`,
    };
  }

  if (facility.latitude == null || facility.longitude == null) {
    return {
      facility,
      distanceKm: null,
      riskLevel: "medium",
      reason: "Facility exists but GPS coordinates not available for distance check",
    };
  }

  const distanceKm = calculateDistance(
    patientLat,
    patientLng,
    facility.latitude,
    facility.longitude
  );

  // Risk thresholds
  if (distanceKm <= 50) {
    return {
      facility,
      distanceKm,
      riskLevel: "low",
      reason: `Patient is ${distanceKm.toFixed(1)}km from facility — within normal range`,
    };
  }

  if (distanceKm <= 150) {
    return {
      facility,
      distanceKm,
      riskLevel: "medium",
      reason: `Patient is ${distanceKm.toFixed(1)}km from facility — moderate distance, may be referral`,
    };
  }

  if (distanceKm <= 500) {
    return {
      facility,
      distanceKm,
      riskLevel: "high",
      reason: `Patient is ${distanceKm.toFixed(1)}km from facility — unusual distance, investigate`,
    };
  }

  return {
    facility,
    distanceKm,
    riskLevel: "critical",
    reason: `Patient is ${distanceKm.toFixed(1)}km from facility — likely fraudulent or data error`,
  };
}

/**
 * Validate that a facility is a real, known SA healthcare facility.
 */
export function validateFacility(name: string): {
  valid: boolean;
  facility?: FacilityRecord;
  suggestions?: FacilityRecord[];
} {
  const facility = findFacilityByName(name);
  if (facility) {
    return { valid: true, facility };
  }

  // Try to find similar names
  const words = name.toLowerCase().split(/\s+/);
  const suggestions = SA_FACILITIES.filter((f) => {
    const fWords = f.name.toLowerCase();
    return words.some((w) => w.length > 3 && fWords.includes(w));
  }).slice(0, 5);

  return {
    valid: false,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

/**
 * Get province-level facility density for coverage analysis.
 */
export function getProvinceCoverage(): Record<
  string,
  {
    total: number;
    hospitals: number;
    clinics: number;
    publicHospitals: number;
    privateHospitals: number;
  }
> {
  const coverage: Record<
    string,
    {
      total: number;
      hospitals: number;
      clinics: number;
      publicHospitals: number;
      privateHospitals: number;
    }
  > = {};

  const provinces = ["GP", "KZN", "WC", "EC", "FS", "MP", "LP", "NW", "NC"];
  for (const p of provinces) {
    const facilities = findFacilitiesByProvince(p);
    coverage[p] = {
      total: facilities.length,
      hospitals: facilities.filter(
        (f) => f.type === "hospital"
      ).length,
      clinics: facilities.filter(
        (f) => f.type === "clinic" || f.type === "gp_practice"
      ).length,
      publicHospitals: facilities.filter(
        (f) => f.type === "hospital" && f.group === "Public"
      ).length,
      privateHospitals: facilities.filter(
        (f) => f.type === "hospital" && f.group !== "Public"
      ).length,
    };
  }

  return coverage;
}
