// Sri Lankan cities — deduped, stripped of trailing numbers/parens, sorted A→Z.
const RAW = [
  "Ahangama","Ahungalla","Aluthgama","Ambalangoda","Ambepussa","Anuradhapura","Arugam Bay","Avissawella",
  "Badulla","Balapitiya","Bandaragama","Bandarawela","Batticaloa","Belihuloya","Bentota","Beruwala","Bopitiya","Buduruwagala",
  "Chilaw","Colombo",
  "Dambadeniya","Dambana","Dambulla","Debarawewa","Dehiwala-Mount Lavinia","Demodara","Digana","Dikwella","Diyatalawa","Dodanduwa","Dondra",
  "Elakanda","Ella","Embekka",
  "Gadaladeniya","Galkadawala","Galle","Galoya","Gampaha","Gampola","Giragama","Girithale",
  "Habaraduwa","Habarana","Hambantota","Haputale","Hatton","Hikkaduwa","Hingurakgoda","Hiriwadunna","Hunnasgiriya",
  "Idalgashinna","Induruwa",
  "Ja-Ela","Jaffna",
  "Kalaoya","Kalametiya","Kalkudah","Kalpitiya","Kalutara","Kandalama","Kandy","Kataragama","Katugastota","Katunayake","Kirinda","Kithalella","Kitulgala","Koggala","Kosgoda","Kudawa","Kurunegala",
  "Lukasgoda",
  "Maha Induruwa","Maggona","Mahiyanganaya","Maho","Mannar","Maragahawewa","Matale","Matara","Meemure","Meetiyagoda","Minneriya","Mirissa","Moratuwa",
  "Nallathanniya","Nanuoya","Negombo","Nilaveli","Nivithigala","Nuwara Eliya",
  "Ohiya",
  "Pahala Maragahawewa","Palatupana","Pallewela","Panadura","Pasikuda","Pinnawala","Polonnaruwa","Pottuvil","Puttalam",
  "Ramboda","Ranna","Rathgama","Ratnapura",
  "Seeduwa","Sigiriya","Sinharagama","Sri Jayawardenepura Kotte",
  "Talalla","Talpe","Tangalle","Tissamaharama","Trincomalee",
  "Udawalawa","Unawatuna","Uppuveli","Uswetakeiyawa",
  "Vavuniya",
  "Wadduwa","Waikkal","Waskaduwa","Wattala","Weerawila","Weligama","Weligatta","Wennappuwa",
  "Yala","Yatiyanthota","Yoda Kandiya",
];

export const SRI_LANKA_CITIES: string[] = Array.from(new Set(RAW)).sort((a, b) =>
  a.localeCompare(b, "en", { sensitivity: "base" })
);
