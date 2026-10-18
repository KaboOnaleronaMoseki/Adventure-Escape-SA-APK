import { ActionButton, BodyText, Card, PageLayout, Section } from '@/components/SiteUI';

const presetPackages = [
  {
    name: 'Coastal Explorer',
    price: 'R950',
    image: require('../assets/site-images/summit.png'),
    description:
      'A refreshing mix of coastal discovery and outdoor activity for a memorable day by the sea.',
  },
  {
    name: 'Summit Challenge',
    price: 'R1,100',
    image: require('../assets/site-images/coastal.png'),
    description:
      'A rewarding challenge for guests who want to explore the region’s rugged landscapes.',
  },
  {
    name: 'Surf & Cliff Expedition',
    price: 'R1,000',
    image: require('../assets/site-images/surf-cliff-expedition.png'),
    description:
      'Pair an ocean-side escape with a guided cliff adventure along the Western Cape coast.',
  },
  {
    name: 'Water & Sky Adrenaline',
    price: 'R1,440',
    image: require('../assets/site-images/waterzip.png'),
    description:
      'A high-energy combination of water-based fun and soaring canopy views.',
  },
  {
    name: 'Team Adventure Quest',
    price: 'R805',
    image: require('../assets/site-images/Group-design.png'),
    description:
      'A group-focused adventure designed to build communication and shared memories.',
  },
  {
    name: 'Ultimate Escape (All-in-One)',
    price: 'R1,700',
    image: require('../assets/site-images/fullactivities.png'),
    description:
      'A full day of varied outdoor experiences for guests who want to make the most of their escape.',
  },
];

const groupOffers = [
  {
    title: 'Family Adventure',
    description:
      'A flexible outdoor experience planned around your family and the ages and interests of your group.',
    image: require('../assets/site-images/team-adventure.png'),
  },
  {
    title: 'Corporate Retreat',
    description:
      'A guided retreat with shared challenges and space for teams to connect outside the workplace.',
    image: require('../assets/site-images/Corporate-Retreat.png'),
  },
  {
    title: 'Custom Group Adventure',
    description:
      'Tell us about your group and we can help shape a tailored Western Cape adventure.',
    image: require('../assets/site-images/Custom-Group-Adventure.png'),
  },
];

export default function PackagesScreen() {
  return (
    <PageLayout
      eyebrow="Build your own package or choose a preset"
      title="Adventure packages"
      intro="Curated combinations make it easy to plan a great-value day out, whether you are travelling solo, with family, or with a team."
      image={require('../assets/site-images/team-adventure.png')}
    >
      <Section eyebrow="Choose a preset package" title="Ready-made escapes">
        {presetPackages.map((item) => (
          <Card
            key={item.name}
            title={item.name}
            body={item.description}
            image={item.image}
            meta={`${item.price} per person`}
            action={{ label: 'Add to booking', route: '/fees' }}
          />
        ))}
      </Section>

      <Section eyebrow="Made for your group" title="Perfect for teams and families">
        {groupOffers.map((offer) => (
          <Card
            key={offer.title}
            title={offer.title}
            body={offer.description}
            image={offer.image}
            meta="Custom pricing"
            action={{ label: 'Contact us', route: '/contact' }}
          />
        ))}
      </Section>

      <Section eyebrow="Package questions" title="Good to know">
        <Card
          title="Do discounts apply automatically?"
          body="When you build your own booking, multi-activity discounts are calculated automatically in the fees calculator."
        />
        <Card
          title="What if someone in our group cannot do one activity?"
          body="Contact our team to talk through suitable alternatives for your group and its participants."
        />
      </Section>

      <Section title="Start planning your package today">
        <BodyText>
          Choose a preset or contact us about a group adventure tailored to your plans.
        </BodyText>
        <ActionButton label="Calculate fees" route="/fees" />
      </Section>
    </PageLayout>
  );
}
