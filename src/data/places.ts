import ella from "@/assets/places/ella.jpg";
import galle from "@/assets/places/galle.jpg";
import sigiriya from "@/assets/places/sigiriya.jpg";
import kandy from "@/assets/places/kandy.jpg";
import mirissa from "@/assets/places/mirissa.jpg";
import nuwara from "@/assets/places/nuwara.jpg";
import arugam from "@/assets/places/gems/arugam.jpg";
import jaffna from "@/assets/places/gems/jaffna.jpg";
import trinco from "@/assets/places/gems/trinco.jpg";
import haputale from "@/assets/places/gems/haputale.jpg";
import kalpitiya from "@/assets/places/gems/kalpitiya.jpg";
import meemure from "@/assets/places/gems/meemure.jpg";

export type Place = {
  slug: string;
  name: string;
  caption: string;
  hero: string;
  region: string;
  bestTime: string;
  searchCity: string;
  intro: string;
  summary: string; // short blurb for listing card
  spots: { name: string; description: string }[];
};

export const PLACES: Record<string, Place> = {
  ella: {
    slug: "ella", name: "Ella", caption: "Ella Nine Arch Bridge", hero: ella,
    region: "Uva Province · Hill Country", bestTime: "January – March", searchCity: "Ella",
    summary: "Cloud-forest village with a famous railway bridge, tea estates and easy mountain hikes.",
    intro: "Tucked into cloud-forest mountains at 1,041 m, Ella is the spiritual heart of Sri Lanka's hill country — a tiny village ringed by tea plantations, waterfalls and viewpoints reached by a single, scenic train.",
    spots: [
      { name: "Nine Arch Bridge", description: "Iconic 91-metre colonial-era stone railway viaduct curling through the jungle. Arrive 30 min before the Kandy–Ella train passes for the famous shot." },
      { name: "Little Adam's Peak", description: "Easy 45-min hike rewarded with a panoramic ridge over Ella Gap and the Ravana waterfalls in the distance." },
      { name: "Ella Rock", description: "More serious 4-hour return trek through tea estates, eucalyptus forest and along live railway tracks." },
      { name: "Ravana Falls", description: "25-metre cascade plunging beside the main road — best after the southwest monsoon (June–September)." },
      { name: "Diyaluma Falls", description: "Sri Lanka's 2nd-tallest waterfall with natural infinity pools at the top — a 90-min drive south." },
      { name: "Lipton's Seat", description: "Sir Thomas Lipton's favourite lookout above his Dambatenne estate — sunrise here is unforgettable." },
    ],
  },
  galle: {
    slug: "galle", name: "Galle Fort", caption: "Galle Fort", hero: galle,
    region: "Southern Province · Coast", bestTime: "November – April", searchCity: "Galle",
    summary: "17th-century Dutch fort by the sea — cobbled lanes, boutique cafés and rampart sunsets.",
    intro: "A 17th-century Dutch-built walled town jutting into the Indian Ocean — cobbled lanes, art galleries, boutique cafés, lighthouse, and 3 km of ramparts you can walk at sunset.",
    spots: [
      { name: "Galle Fort Ramparts", description: "The complete circuit takes ~45 min on foot. Time it for golden hour and stay for kids cliff-jumping into the sea." },
      { name: "Galle Lighthouse", description: "The oldest light station in Sri Lanka, built in 1939, with a coconut-palm-fringed beach at its base." },
      { name: "Dutch Reformed Church", description: "Built in 1755 with original tombstones still set in the floor — a quiet, beautiful interior." },
      { name: "Unawatuna Beach", description: "Crescent-shaped swimming beach 6 km east — calm waters, beach cafés and snorkelling at the Japanese Peace Pagoda." },
      { name: "Jungle Beach", description: "Hidden cove backed by jungle, reachable by 10-min walk from Rumassala — bring snorkel gear." },
      { name: "Stilt Fishermen of Koggala", description: "20 minutes south — the ancient fishing tradition Sri Lanka is famous for; visit early morning or late afternoon." },
    ],
  },
  sigiriya: {
    slug: "sigiriya", name: "Sigiriya", caption: "Sigiriya — The Lion Rock", hero: sigiriya,
    region: "Central Province · Cultural Triangle", bestTime: "January – March", searchCity: "Sigiriya",
    summary: "A 200 m magma column crowned with a 5th-century sky-palace — UNESCO heritage at its most dramatic.",
    intro: "A 200-metre column of magma rising from the central plains, crowned with the ruins of King Kashyapa's 5th-century sky-palace. UNESCO World Heritage and possibly the most dramatic single sight in South Asia.",
    spots: [
      { name: "Sigiriya Rock Fortress", description: "Climb 1,200 steps past the Mirror Wall and Lion's Paws to palace ruins on the summit. Go at 7 AM to beat heat and crowds." },
      { name: "Pidurangala Rock", description: "The lookout opposite — easier climb, smaller crowds, and the only place to actually photograph Sigiriya from above." },
      { name: "Dambulla Cave Temple", description: "2,000-year-old rock temple with 153 Buddha statues across 5 painted caves — 30-min drive south." },
      { name: "Minneriya National Park", description: "World-famous elephant 'Gathering' July–September; year-round leopards, sloth bears and 170+ bird species." },
      { name: "Polonnaruwa Ancient City", description: "Sri Lanka's 12th-century capital — ruins of palaces, stupas and the colossal Gal Vihara rock Buddhas; 1 hr away." },
      { name: "Hiriwadunna Village Tour", description: "Bullock-cart ride, dugout canoe across a tank, and a traditional Sri Lankan lunch cooked over firewood." },
    ],
  },
  kandy: {
    slug: "kandy", name: "Kandy", caption: "Kandy — Sacred hill capital", hero: kandy,
    region: "Central Province · Hill Country", bestTime: "January – April & July – September", searchCity: "Kandy",
    summary: "The last royal capital — sacred Temple of the Tooth, serene lake and emerald tea-hill surrounds.",
    intro: "The last royal capital of Sri Lanka, set around a serene lake and home to the Temple of the Sacred Tooth Relic — one of Buddhism's most important pilgrimage sites.",
    spots: [
      { name: "Temple of the Tooth Relic", description: "Visit during evening puja (6:30 PM) when drums echo through the inner sanctum. Dress modestly — shoulders and knees covered." },
      { name: "Kandy Lake", description: "Built in 1807 by the last king — a 3.4 km stroll around the lake at sunset is the city's defining ritual." },
      { name: "Royal Botanical Gardens, Peradeniya", description: "147 acres of palm avenues, orchid house and a 40-metre Java fig — 6 km west of the city." },
      { name: "Kandy Cultural Show", description: "Nightly performance of fire-walking, low-country drumming and traditional Kandyan dance at the YMBA." },
      { name: "Bahirawakanda Buddha", description: "26-metre white Buddha statue with the best panoramic view of the city — climb at sunset." },
      { name: "Esala Perahera", description: "If you're here in late July or August: the grandest Buddhist procession in Asia — 100+ caparisoned elephants, fire dancers, drummers." },
    ],
  },
  mirissa: {
    slug: "mirissa", name: "Mirissa", caption: "Mirissa — Whale-watching cove", hero: mirissa,
    region: "Southern Province · Coast", bestTime: "November – April", searchCity: "Mirissa",
    summary: "Palm-fringed crescent beach and Sri Lanka's launchpad for blue-whale watching.",
    intro: "A crescent of palm-shaded sand on the deep south coast — the launch point for some of the best blue-whale watching on Earth and a relaxed surfer's beach town.",
    spots: [
      { name: "Blue Whale Watching", description: "Boats leave Mirissa Harbour at 6:30 AM (December–April) — Sri Lanka has the world's highest concentration of blue whales just offshore." },
      { name: "Coconut Tree Hill", description: "A photogenic palm-crowned headland on the eastern end of the beach — sunrise is magic, sunset is busy." },
      { name: "Secret Beach", description: "Three small coves north of the main bay — calm swimming, beach bars, fewer crowds." },
      { name: "Parrot Rock", description: "A small islet you can wade out to at low tide — 360° views of Mirissa Bay." },
      { name: "Weligama Surfing", description: "Sri Lanka's most beginner-friendly surf break, 10 min west — board rental and lessons from $15." },
      { name: "Turtle Hatchery, Kosgoda", description: "Ethical conservation project releasing baby turtles to sea — a worthwhile day trip up the coast." },
    ],
  },
  nuwara: {
    slug: "nuwara", name: "Nuwara Eliya", caption: "Nuwara Eliya — Little England", hero: nuwara,
    region: "Central Province · Hill Country", bestTime: "February – April", searchCity: "Nuwara Eliya",
    summary: "Sri Lanka's highest town — cool air, colonial bungalows, rose gardens and endless tea.",
    intro: "At 1,868 m, Sri Lanka's highest town — colonial bungalows, rose gardens, race-course, and cool air. Tea was invented here; you'll smell it in the morning mist.",
    spots: [
      { name: "Pedro Tea Estate", description: "Working factory established in 1885 — guided tour ends with a tasting of single-origin Ceylon BOP." },
      { name: "Horton Plains & World's End", description: "Pre-dawn drive to walk the 9 km loop past Baker's Falls to a 870-metre sheer cliff at sunrise." },
      { name: "Gregory Lake", description: "Pedal-boats, horse rides and lakeside picnics — the heart of Nuwara Eliya's colonial-era hill-station charm." },
      { name: "Hakgala Botanical Gardens", description: "The cooler, higher cousin to Peradeniya — famous for its rose, orchid and cloud-forest collections." },
      { name: "Ramboda Falls", description: "A 109-metre tiered waterfall on the road up from Kandy — best stop for tea and a viewpoint photo." },
      { name: "Train to Ella", description: "The most beautiful 6½-hour train ride in the world — book a 2nd-class reserved seat with the window open." },
    ],
  },

  // Hidden gems
  arugam: {
    slug: "arugam", name: "Arugam Bay", caption: "Arugam Bay — Surf paradise", hero: arugam,
    region: "Eastern Province · Coast", bestTime: "May – September", searchCity: "Arugam Bay",
    summary: "Sri Lanka's surf capital — a laid-back bay with consistent right-hand point breaks for all levels.",
    intro: "A sleepy crescent bay on the east coast that wakes up between May and September, when offshore winds turn its right-hand point breaks into one of the best surfing setups in Asia. Outside surf season it's a quiet swim-and-yoga town.",
    spots: [
      { name: "Main Point", description: "The world-famous right-hand break — long, peeling waves best at dawn before the wind picks up." },
      { name: "Whiskey Point", description: "Mellower point break 10 min north — perfect for intermediate surfers and surf-school progression." },
      { name: "Peanut Farm", description: "Two waves, palm-backed beach, simple shacks for fresh coconut and grilled fish — go on a tuk-tuk." },
      { name: "Elephant Rock", description: "Climb the headland at sunset for a 180° view of the bay and the elephants at the waterhole below." },
      { name: "Kumana National Park", description: "Yala's quieter eastern half — leopards, sloth bears and waterbirds in lagoons and mangroves." },
      { name: "Pottuvil Lagoon", description: "Mangrove safari at dawn — crocodiles, elephants on the bank, and over a hundred bird species." },
    ],
  },
  jaffna: {
    slug: "jaffna", name: "Jaffna", caption: "Jaffna — Tamil heartland", hero: jaffna,
    region: "Northern Province", bestTime: "February – September", searchCity: "Jaffna",
    summary: "Sri Lanka's Tamil cultural capital — bright kovils, palmyra palms and untouched northern islands.",
    intro: "The cultural capital of Sri Lanka's Tamil north — a sun-bleached peninsula of palmyra palms, vivid Hindu temples, brilliant Jaffna crab curry, and an archipelago of empty islands waiting offshore.",
    spots: [
      { name: "Nallur Kandaswamy Kovil", description: "The most important Hindu temple in northern Sri Lanka — golden gopuram, daily pujas, August festival." },
      { name: "Jaffna Fort", description: "17th-century Portuguese-then-Dutch star fort on the lagoon — beautifully restored, free to walk." },
      { name: "Casuarina Beach", description: "Shallow, calm turquoise water on Karainagar Island — the safest swimming beach in the north." },
      { name: "Delft Island", description: "Wild ponies, baobab trees and coral-stone walls on a remote island reached by free public ferry." },
      { name: "Point Pedro", description: "The northernmost tip of Sri Lanka — windswept, end-of-the-world atmosphere with a working lighthouse." },
      { name: "Jaffna Crab Curry", description: "Try Mangos, Cosy or Rio for the rich, dark-red Jaffna-style crab curry — eat with your hands." },
    ],
  },
  trinco: {
    slug: "trinco", name: "Trincomalee", caption: "Trincomalee — East-coast beaches", hero: trinco,
    region: "Eastern Province · Coast", bestTime: "May – September", searchCity: "Trincomalee",
    summary: "One of the world's deepest natural harbours — white-sand beaches, dive sites and a clifftop temple.",
    intro: "A historic deep-water harbour on the east coast, with some of the calmest, clearest swimming beaches in Sri Lanka. The dry season runs opposite the rest of the country — May to September is peak.",
    spots: [
      { name: "Nilaveli & Uppuveli Beach", description: "Two long sweeps of white sand north of the city — quiet, palm-shaded, perfect for snorkelling." },
      { name: "Pigeon Island National Park", description: "20-min boat ride from Nilaveli to coral reef teeming with reef sharks, turtles and tropical fish." },
      { name: "Koneswaram Temple", description: "Ancient Hindu temple perched on a 130 m sheer cliff above the ocean — sunset is unforgettable." },
      { name: "Fort Frederick", description: "Portuguese fort still in use by the army — wander up to the temple via the deer-filled grounds." },
      { name: "Marble Beach", description: "Glass-still, military-protected swimming beach — one of the most beautiful coves in Sri Lanka." },
      { name: "Whale Watching", description: "May–October sperm whales and blue whales gather offshore — boats leave from Uppuveli." },
    ],
  },
  haputale: {
    slug: "haputale", name: "Haputale", caption: "Haputale — Misty ridgeline", hero: haputale,
    region: "Uva Province · Hill Country", bestTime: "January – April", searchCity: "Haputale",
    summary: "A wind-blown hill town on the southern ridge — Lipton tea estates, star-filled skies and World's End below.",
    intro: "A small railway town strung along a 1,400-metre escarpment with vertiginous southern views all the way to the coast on a clear morning. Quieter than Ella, with tea estates that descend hundreds of metres below town.",
    spots: [
      { name: "Lipton's Seat", description: "Sir Thomas Lipton's personal viewpoint — arrive at dawn before the cloud rolls in to see seven provinces at once." },
      { name: "Dambatenne Tea Factory", description: "Built in 1890 by Lipton himself — guided tours through the original machinery." },
      { name: "Diyaluma Falls", description: "Sri Lanka's 2nd-tallest waterfall with a series of natural infinity pools at the top — 45 min drive." },
      { name: "Horton Plains", description: "Pre-dawn taxi to the Worlds-End cliff via Baker's Falls — a 9 km cloud-forest loop walk." },
      { name: "Adisham Bungalow", description: "1931 English country house with rose gardens, monastery and home-made jams — open weekends." },
      { name: "Idalgashinna Railway Walk", description: "Walk the empty tracks at sunrise as cloud rivers fill the valleys below — one of Sri Lanka's most magical hours." },
    ],
  },
  kalpitiya: {
    slug: "kalpitiya", name: "Kalpitiya", caption: "Kalpitiya — Kitesurfing lagoon", hero: kalpitiya,
    region: "North Western Province · Coast", bestTime: "May – October & December – March", searchCity: "Kalpitiya",
    summary: "Sri Lanka's kitesurfing capital — flat lagoon, steady wind, dolphin pods and quiet wild beaches.",
    intro: "A narrow peninsula north of Negombo where steady cross-shore winds and a vast flat lagoon have turned the coast into a world-class kitesurfing destination — plus pods of spinner dolphins offshore and wild beaches all to yourself.",
    spots: [
      { name: "Kalpitiya Lagoon", description: "Knee-deep, butter-flat water for 5 km — perfect for learning kitesurfing or freestyle progression." },
      { name: "Dolphin Watching", description: "November–April, thousand-strong pods of spinner dolphins gather offshore — boats leave at dawn." },
      { name: "Vella Island", description: "A sandbar in the middle of the lagoon that appears at low tide — barbecue lunch on your own island." },
      { name: "Bar Reef Marine Sanctuary", description: "Sri Lanka's largest coral reef — boat snorkel trip with reef sharks, turtles and barracuda." },
      { name: "Wilpattu National Park", description: "Sri Lanka's largest park — leopards, sloth bears, elephants around natural sand-rimmed lakes; 45 min drive." },
      { name: "Talawila Church", description: "Atmospheric old Portuguese-era coastal church — pilgrimage festival in March." },
    ],
  },
  meemure: {
    slug: "meemure", name: "Meemure", caption: "Meemure — Hidden village", hero: meemure,
    region: "Central Province · Knuckles Range", bestTime: "January – April", searchCity: "Meemure",
    summary: "A village at the foot of the sacred Lakegala — Knuckles Range hikes, rice paddies and zero phone signal.",
    intro: "A village of fewer than 400 people hidden in the Knuckles Mountain Range, only accessible by a rough 16 km jeep track. No mobile signal, just rice paddies, jungle waterfalls and the dramatic spire of sacred Lakegala mountain above.",
    spots: [
      { name: "Lakegala Climb", description: "Demanding 8-hour return trek up a sacred granite spire — local guide required; legendary views of three provinces." },
      { name: "Knuckles Range Trails", description: "UNESCO-listed cloud forest with leopards, langur monkeys and 1,000+ plant species — overnight camping permitted." },
      { name: "Village Homestays", description: "Stay with farming families — cook a curry on a wood fire, learn to harvest rice and cardamom." },
      { name: "Meemure Falls", description: "A short jungle walk to a hidden waterfall and natural swimming pool surrounded by virgin forest." },
      { name: "Nitro Cave Camping", description: "Hike to a remote rock-shelter for sunrise over the Knuckles — guided expedition only." },
      { name: "Pitawala Pathana", description: "10-acre 'mini world's-end' grassland plateau ending in a 600 m sheer drop — 90 min from Meemure." },
    ],
  },
};

export const PLACE_LIST = Object.values(PLACES);
