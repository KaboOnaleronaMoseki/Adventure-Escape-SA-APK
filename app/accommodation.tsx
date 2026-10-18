import { ActionButton, BodyText, BulletList, Card, PageLayout, Section } from '@/components/SiteUI';
import { accommodations, formatRand } from '@/constants/booking';

const descriptions: Record<string, string> = {
  cabins:
    'Comfortable, low-impact coastal accommodation with a peaceful connection to the surrounding landscape.',
  glamping:
    'A comfortable way to sleep beneath the canopy and wake up close to the adventure.',
  lodge:
    'A scenic mountain base for groups looking to relax after a day outdoors.',
  camp:
    'A relaxed, affordable seaside base for solo travellers, families, and groups.',
};

export default function AccommodationScreen() {
  return (
    <PageLayout
      eyebrow="Rest, recharge, explore"
      title="Stay in the heart of the wild"
      intro="Choose a comfortable Western Cape base for your outdoor escape, from coastal cabins and canopy glamping to relaxed seaside camping."
      image={require('../assets/site-images/coastal-eco-cabin.png')}
    >
      <Section eyebrow="Find your stay" title="Accommodation">
        {accommodations.map((stay) => (
          <Card
            key={stay.id}
            title={stay.name}
            body={descriptions[stay.id]}
            image={stay.image}
            meta={`${formatRand(stay.price)} ${stay.unit}`}
            action={{ label: 'Add to a booking', route: '/fees' }}
          />
        ))}
      </Section>

      <Section eyebrow="Stay and play" title="Adventure stay packages">
        <Card
          title="Coastal Safari & Hospitality Retreat"
          body="Pair a guided coastal experience with a welcoming place to stay and time to unwind."
          image={require('../assets/site-images/fullactivities.png')}
          meta="R3,450 per person  •  3 days / 2 nights"
          action={{ label: 'Explore packages', route: '/packages' }}
        />
        <Card
          title="Canopy Adrenaline & Bush Retreat"
          body="Combine canopy thrills and outdoor adventures with a night close to nature."
          image={require('../assets/site-images/waterzip.png')}
          meta="R2,350 per person  •  2 days / 1 night"
          action={{ label: 'Explore packages', route: '/packages' }}
        />
        <Card
          title="Wilderness Lodge & Expedition"
          body="Pair a comfortable lodge stay with a guided expedition through the surrounding landscape."
          image={require('../assets/site-images/summit.png')}
          meta="R5,800 per person  •  4 days / 3 nights"
          action={{ label: 'Explore packages', route: '/packages' }}
        />
      </Section>

      <Section eyebrow="Every stay" title="Comforts that matter">
        <BulletList
          items={[
            'Secure gear storage for your outdoor equipment.',
            '100% eco-friendly accommodation options.',
            'Activity shuttles to help you get to your adventure.',
          ]}
        />
      </Section>

      <Section title="Bundle your stay & save">
        <BodyText>Plan your stay and activities together to make the most of your escape.</BodyText>
        <ActionButton label="Build your booking" route="/fees" />
      </Section>
    </PageLayout>
  );
}
