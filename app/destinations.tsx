import { ActionButton, BodyText, Card, PageLayout, Section } from '@/components/SiteUI';

const destinations = [
  {
    title: 'Coastline & sheltered bays',
    image: require('../assets/site-images/coastal1.png'),
    description:
      'Breathe in the fresh ocean air while kayaking or exploring coastal routes. Your guide selects a suitable launch point for the conditions.',
    action: 'Explore water activities',
  },
  {
    title: 'Mountain trails & fynbos',
    image: require('../assets/site-images/summit.png'),
    description:
      'Take a guided tour through scenic landscapes along a route with a pace and challenge suited to your group.',
    action: 'Explore hiking',
  },
  {
    title: 'Forest & canopy',
    image: require('../assets/site-images/waterzip.png'),
    description:
      'Experience an elevated outdoor course among the trees, with a guide to explain the route and safety requirements.',
    action: 'Explore ziplining',
  },
  {
    title: 'Cliffs & rugged terrain',
    image: require('../assets/site-images/rock-climbing1.png'),
    description:
      'Challenge yourself on a guided climb with routes and requirements suited to the activity and group.',
    action: 'Explore rock climbing',
  },
];

export default function DestinationsScreen() {
  return (
    <PageLayout
      eyebrow="Find your setting"
      title="Explore the Western Cape"
      intro="From open water to rugged trails, discover the kinds of landscapes that make each guided escape memorable."
      image={require('../assets/site-images/coastal.png')}
    >
      <Section eyebrow="Find your setting" title="A new view for every adventure">
        <BodyText>
          Adventure locations and conditions depend on the activity, season, and weather. Contact
          our team to confirm the meeting point and travel details for your date.
        </BodyText>
        {destinations.map((destination) => (
          <Card
            key={destination.title}
            title={destination.title}
            body={destination.description}
            image={destination.image}
            action={{ label: destination.action, route: '/activities' }}
          />
        ))}
      </Section>

      <Section title="Planning your visit?">
        <BodyText>
          Location, access, and transportation vary by reservation. Contact us before you travel
          for the latest information.
        </BodyText>
        <ActionButton label="Ask about locations" route="/contact" />
      </Section>
    </PageLayout>
  );
}
