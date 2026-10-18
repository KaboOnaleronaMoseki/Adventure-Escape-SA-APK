import { ActionButton, BodyText, Card, PageLayout, Section } from '@/components/SiteUI';

const moments = [
  {
    title: 'Make a splash',
    body: 'Race down an inflatable waterslide and splash into the sea.',
    image: require('../assets/site-images/waterslide.webp'),
    imageDescription: 'Adventurers riding a bright inflatable waterslide into the ocean',
    route: '/activities' as const,
    action: 'Explore activities',
  },
  {
    title: 'Above the canopy',
    body: 'Take on an elevated forest adventure with the right safety gear and a guide.',
    image: require('../assets/site-images/canopy2.jpg'),
    imageDescription: 'Two adventurers wearing helmets and harnesses on a forest canopy course',
    route: '/activities' as const,
    action: 'Explore activities',
  },
  {
    title: 'Better together',
    body: 'Share the challenge, cheer each other on, and make it a team day.',
    image: require('../assets/site-images/team-adventure.png'),
    imageDescription: 'A group enjoying an outdoor team challenge',
    route: '/packages' as const,
    action: 'Explore group packages',
  },
  {
    title: 'Reach new heights',
    body: 'Find your next challenge on a guided climb in rugged surroundings.',
    image: require('../assets/site-images/rock-climbing1.png'),
    imageDescription: 'A climber ascending a rocky cliff',
    route: '/activities' as const,
    action: 'Explore activities',
  },
  {
    title: 'Take the scenic route',
    body: 'Slow down and appreciate the natural details along the way.',
    image: require('../assets/site-images/coastal-trail.png'),
    imageDescription: 'A trail winding through coastal scenery',
    route: '/destinations' as const,
    action: 'Explore destinations',
  },
  {
    title: 'Stay a little longer',
    body: 'Make more time for the outdoors with a comfortable place to stay.',
    image: require('../assets/site-images/canopy-glamping.png'),
    imageDescription: 'Comfortable glamping accommodation in a natural setting',
    route: '/accommodation' as const,
    action: 'Explore accommodation',
  },
];

export default function GalleryScreen() {
  return (
    <PageLayout
      eyebrow="Adventure in pictures"
      title="Moments in the outdoors"
      intro="A look at the landscapes, activities, and places to stay that make an escape feel special."
      image={require('../assets/site-images/hero-landscape.png')}
    >
      <Section eyebrow="Adventure in pictures" title="Explore, unwind, reconnect">
        <BodyText>
          Browse highlights from our outdoor experiences. Availability and locations depend on
          your booking and conditions.
        </BodyText>
        {moments.map((moment) => (
          <Card
            key={moment.title}
            title={moment.title}
            body={moment.body}
            image={moment.image}
            imageDescription={moment.imageDescription}
            action={{ label: moment.action, route: moment.route }}
          />
        ))}
      </Section>

      <Section title="Picture yourself here?">
        <BodyText>Choose an experience and start planning your next Western Cape escape.</BodyText>
        <ActionButton label="Plan your adventure" route="/fees" />
      </Section>
    </PageLayout>
  );
}
