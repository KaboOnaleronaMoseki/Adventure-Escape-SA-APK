import {
  ActionButton,
  BodyText,
  Card,
  PageLayout,
  Section,
} from '@/components/SiteUI';

export default function HomeScreen() {
  return (
    <PageLayout
      eyebrow="Western Cape  •  Since 2024"
      title="Adventure awaits beyond the everyday"
      intro="Adventure Escape SA offers guided outdoor adventures and eco-tourism across the Western Cape, led by experienced professional guides."
      image={require('../assets/site-images/hero-landscape.png')}
    >
      <Section eyebrow="Who we are" title="Outdoor experiences that bring people together">
        <BodyText>
          Founded by Liam Daniels in 2024, Adventure Escape SA is an adventure tourism company
          operating across the Western Cape, South Africa. We create professionally guided
          experiences that promote teamwork, fitness, and a genuine appreciation for nature.
        </BodyText>
        <BodyText>
          Whether you are chasing your next thrill, planning a family escape, or organising a team
          outing, our adventures are beginner-friendly and backed by qualified guides.
        </BodyText>
        <ActionButton label="More about us" route="/about" />
      </Section>

      <Section eyebrow="Start planning" title="Choose how you want to explore">
        <Card
          title="Individual Activities"
          body="Explore kayaking, ziplining, rock climbing, coastal trails, and more."
          image={require('../assets/site-images/kayaking1.png')}
          action={{ label: 'Browse activities', route: '/activities' }}
        />
        <Card
          title="Adventure Packages"
          body="Curated combos that bundle multiple activities into one great-value day out."
          image={require('../assets/site-images/Group-design.png')}
          action={{ label: 'Browse packages', route: '/packages' }}
        />
      </Section>

      <Section eyebrow="Why Adventure Escape SA" title="Guided, safe and unforgettable">
        <Card
          title="Safety First"
          body="Certified guides, inspected equipment, and clear safety briefings mean you can focus on having fun."
          image={require('../assets/site-images/Design3.png')}
        />
        <Card
          title="Eco-Friendly"
          body="We tread lightly and protect the coastlines, forests, and fynbos that make this region special."
          image={require('../assets/site-images/coastal.png')}
        />
        <Card
          title="Built for Teams"
          body="Our experiences build trust, communication, and lasting memories for families and groups."
          image={require('../assets/site-images/team-adventure.png')}
        />
      </Section>

      <Section title="Ready to escape the ordinary?">
        <BodyText>
          Build an adventure with activities and accommodation, and see your total update as you
          plan.
        </BodyText>
        <ActionButton label="Calculate your fees" route="/fees" />
      </Section>
    </PageLayout>
  );
}
