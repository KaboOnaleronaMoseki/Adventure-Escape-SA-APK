import { ActionButton, Card, PageLayout, Section } from '@/components/SiteUI';
import { activities, formatRand } from '@/constants/booking';

const descriptions: Record<string, string> = {
  kayaking:
    "Paddle through glassy bays and explore hidden coves along the Western Cape's most spectacular coastline. Perfect for all experience levels.",
  ziplining:
    "Soar through forest canopies on thrilling zip lines while taking in panoramic views. An exhilarating experience you'll never forget.",
  climbing:
    'Challenge yourself on stunning coastal cliff faces with professional belaying, safety equipment, and expert instruction every step of the way.',
  team:
    'Build trust and communication through engaging, outdoor group activities. Perfect for corporate events, families, and friend groups.',
  hiking:
    'Trek scenic clifftop trails through indigenous fynbos flora with panoramic ocean vistas and expert naturalist guiding.',
  snorkeling:
    'Explore vibrant marine life and calm tidal kelp forests in protected coastal coves with certified dive guides and gear included.',
  sup: 'Glide peacefully across calm coastal lagoons and sheltered estuaries with stable touring boards and introductory coaching.',
  fatbike: 'Cruise effortlessly over rolling white sand dunes and along hard-packed beach shorelines on premium balloon-tire fat bikes.',
  caving: 'Venture into ancient sea-carved limestone caverns and tidal caves with headlamps, helmets, and expert speleology guides.',
};

const activityMeta: Record<string, string> = {
  kayaking: '3–4 hours  •  2–8 per guide  •  Age 6+  •  Moderate fitness',
  ziplining: '2–3 hours  •  4–12 per guide  •  Age 8+  •  Max 120 kg',
  climbing: '3–4 hours  •  2–4 per guide  •  Age 12+  •  Beginner to advanced',
  team: '2–4 hours  •  Groups of 6+  •  All ages  •  Customizable',
  hiking: '2–3 hours  •  2–10 per guide  •  All ages  •  Easy to moderate',
  snorkeling: '2–3 hours  •  2–6 per guide  •  Age 8+  •  Basic swimming ability',
  sup: '2 hours  •  2–8 per instructor  •  All ages  •  Beginner-friendly',
  fatbike: '2–3 hours  •  2–8 per leader  •  Age 10+  •  Moderate',
  caving: '3 hours  •  2–6 per guide  •  Age 10+  •  Moderate',
};

const activityDetails: Record<string, string> = {
  kayaking:
    'Includes: Experienced guide, kayak and paddle, PFD, safety briefing and instruction, water and snacks, and a waterproof bag.\n\nImportant information: Duration includes the briefing. Suitable for beginner to intermediate paddlers.',
  ziplining:
    'Includes: Certified guides, harness, helmet and safety gear, 6–8 zipline runs and suspension bridges, safety briefing, and harness checks.\n\nImportant information: Duration includes the briefing. Intermediate activity; maximum participant weight is 120 kg.',
  climbing:
    'Includes: Certified SAMCT/FGASA guides, climbing shoes, harness, ropes and helmets, routes tailored to fitness, belaying, and safety support.\n\nImportant information: Duration includes instruction. Requires high strength and endurance.',
  team:
    'Includes: Facilitator and props, 4–6 customized problem-solving challenges, safety gear and debrief, refreshments, and hydration.\n\nImportant information: Duration is customizable. Teamwork and communication are the focus.',
  hiking:
    'Includes: Certified FGASA guide, botanical and ecological interpretation, trekking poles and daypacks, trail snacks, energy bars, and water.\n\nImportant information: Guided clifftop and fynbos trails; easy to moderate difficulty.',
  snorkeling:
    'Includes: Certified divemaster or marine guide, wetsuit, mask, snorkel and fins, safety buoy and in-water supervision, hot drinks, and snacks.\n\nImportant information: Beginner-friendly; basic swimming ability is required.',
  sup: 'Includes: Touring SUP board and paddle, PFD and safety leash, introductory lesson, and guide photos.\n\nImportant information: Beginner-friendly paddling on a calm lagoon or estuary.',
  fatbike:
    'Includes: Fat bike and helmet, trail leader and mechanic support, tide-timed route, hydration backpack, and snack.\n\nImportant information: Moderate ride on sand dunes and packed beach.',
  caving:
    'Includes: Specialist guide, helmet and LED headlamp, knee pads, gloves and protective gear, safety briefing, and navigation support.\n\nImportant information: Moderate activity involving some crawling and walking; gear is provided.',
};

const activityTitles: Record<string, string> = {
  hiking: 'Coastal Hiking & Trail',
  caving: 'Caving & Coastal Grotto Exploration',
};

export default function ActivitiesScreen() {
  return (
    <PageLayout
      eyebrow="Pick your adventure"
      title="Nine ways to escape the ordinary"
      intro="Choose from professionally guided outdoor adventures designed to excite, challenge, and inspire. All experiences are beginner-friendly and led by certified guides."
      image={require('../assets/site-images/hero-landscape.png')}
    >
      <Section eyebrow="Find your next adventure" title="Activities">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            title={activityTitles[activity.id] ?? activity.name}
            body={`${descriptions[activity.id]}\n\n${activityDetails[activity.id]}`}
            image={activity.image}
            meta={`${formatRand(activity.price)} per person  •  ${activityMeta[activity.id]}`}
            action={{ label: 'Add to a booking', route: '/fees' }}
          />
        ))}
      </Section>
      <Section title="Ready to book your adventure?">
        <ActionButton label="Calculate your fees" route="/fees" />
      </Section>
    </PageLayout>
  );
}
