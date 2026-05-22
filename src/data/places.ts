import ella from "@/assets/places/ella.jpg";
import galle from "@/assets/places/galle.jpg";
import sigiriya from "@/assets/places/sigiriya.jpg";
import kandy from "@/assets/places/kandy.jpg";
import mirissa from "@/assets/places/mirissa.jpg";
import nuwara from "@/assets/places/nuwara.jpg";
import hero from "@/assets/hero-srilanka.jpg";

export type Place = {
  slug: string;
  name: string;
  caption: string;       // shown on the card
  hero: string;          // image
  region: string;
  bestTime: string;
  searchCity: string;    // city name that the home page will auto-search
  intro: string;
  spots: { name: string; description: string }[];
};

export const PLACES: Record<string, Place> = {
  ella: {
    slug: "ella",
    name: "Ella",
    caption: "Ella Nine Arch Bridge",
    hero: ella,
    region: "Uva Province · Hill Country",
    bestTime: "January – March",
    searchCity: "Ella",
    intro:
      "Tucked into cloud-forest mountains at 1,041 m, Ella is the spiritual heart of Sri Lanka's hill country — a tiny village ringed by tea plantations, waterfalls and viewpoints reached by a single, scenic train.",
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
    slug: "galle",
    name: "Galle Fort",
    caption: "Galle Fort",
    hero: galle,
    region: "Southern Province · Coast",
    bestTime: "November – April",
    searchCity: "Galle",
    intro:
      "A 17th-century Dutch-built walled town jutting into the Indian Ocean — cobbled lanes, art galleries, boutique cafés, lighthouse, and 3 km of ramparts you can walk at sunset.",
    spots: [
      { name: "Galle Fort Ramparts", description: "The complete circuit takes ~45 min on foot. Time it for the golden hour and stay for kids cliff-jumping into the sea." },
      { name: "Galle Lighthouse", description: "The oldest light station in Sri Lanka, built in 1939, with a coconut-palm-fringed beach at its base." },
      { name: "Dutch Reformed Church", description: "Built in 1755 with original tombstones still set in the floor — a quiet, beautiful interior." },
      { name: "Unawatuna Beach", description: "Crescent-shaped swimming beach 6 km east — calm waters, beach cafés and snorkelling at the Japanese Peace Pagoda." },
      { name: "Jungle Beach", description: "Hidden cove backed by jungle, reachable by 10-min walk from Rumassala — bring snorkel gear." },
      { name: "Stilt Fishermen of Koggala", description: "20 minutes south — the ancient fishing tradition Sri Lanka is famous for; visit early morning or late afternoon." },
    ],
  },
  sigiriya: {
    slug: "sigiriya",
    name: "Sigiriya",
    caption: "Sigiriya — The Lion Rock",
    hero: sigiriya,
    region: "Central Province · Cultural Triangle",
    bestTime: "January – March",
    searchCity: "Sigiriya",
    intro:
      "A 200-metre column of magma rising from the central plains, crowned with the ruins of King Kashyapa's 5th-century sky-palace. UNESCO World Heritage and possibly the most dramatic single sight in South Asia.",
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
    slug: "kandy",
    name: "Kandy",
    caption: "Kandy — Sacred hill capital",
    hero: kandy,
    region: "Central Province · Hill Country",
    bestTime: "January – April & July – September",
    searchCity: "Kandy",
    intro:
      "The last royal capital of Sri Lanka, set around a serene lake and home to the Temple of the Sacred Tooth Relic — one of Buddhism's most important pilgrimage sites.",
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
    slug: "mirissa",
    name: "Mirissa",
    caption: "Mirissa — Whale-watching cove",
    hero: mirissa,
    region: "Southern Province · Coast",
    bestTime: "November – April",
    searchCity: "Mirissa",
    intro:
      "A crescent of palm-shaded sand on the deep south coast — the launch point for some of the best blue-whale watching on Earth and a relaxed surfer's beach town.",
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
    slug: "nuwara",
    name: "Nuwara Eliya",
    caption: "Nuwara Eliya — Little England",
    hero: nuwara,
    region: "Central Province · Hill Country",
    bestTime: "February – April",
    searchCity: "Nuwara Eliya",
    intro:
      "At 1,868 m, Sri Lanka's highest town — colonial bungalows, rose gardens, race-course, and cool air. Tea was invented here; you'll smell it in the morning mist.",
    spots: [
      { name: "Pedro Tea Estate", description: "Working factory established in 1885 — guided tour ends with a tasting of single-origin Ceylon BOP." },
      { name: "Horton Plains & World's End", description: "Pre-dawn drive to walk the 9 km loop past Baker's Falls to a 870-metre sheer cliff at sunrise." },
      { name: "Gregory Lake", description: "Pedal-boats, horse rides and lakeside picnics — the heart of Nuwara Eliya's colonial-era hill-station charm." },
      { name: "Hakgala Botanical Gardens", description: "The cooler, higher cousin to Peradeniya — famous for its rose, orchid and cloud-forest collections." },
      { name: "Ramboda Falls", description: "A 109-metre tiered waterfall on the road up from Kandy — best stop for tea and a viewpoint photo." },
      { name: "Train to Ella", description: "The most beautiful 6½-hour train ride in the world — book a 2nd-class reserved seat with the window open." },
    ],
  },
};

export const PLACE_LIST = Object.values(PLACES);
