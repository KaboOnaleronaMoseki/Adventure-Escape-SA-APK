import { ActionButton, BodyText, BulletList, Card, PageLayout, Section } from '@/components/SiteUI';

const preparationTips = [
  {
    title: 'Tell us what you need',
    body: 'Share relevant mobility, health, swimming-confidence, age, or dietary information before booking. Our team can discuss activity requirements and suitability.',
  },
  {
    title: 'Follow the activity briefing',
    body: 'Listen to your guide, use equipment as instructed, and ask questions whenever something is unclear. Requirements and equipment vary by activity.',
  },
  {
    title: 'Dress for the conditions',
    body: 'Wear practical clothing and footwear for your activity. Check your confirmation for what to bring, including water, sun protection, or spare layers.',
  },
  {
    title: 'Check weather and meeting details',
    body: 'Outdoor plans may change when conditions are unsuitable. Confirm your meeting point, arrival time, and the latest weather arrangements before you leave.',
  },
];

export default function SafetyScreen() {
  return (
    <PageLayout
      eyebrow="Before you set out"
      title="Adventure with care"
      intro="A little preparation helps everyone enjoy the outdoors with respect for the people around us and the places we visit."
      image={require('../assets/site-images/guide-team.png')}
    >
      <Section eyebrow="Before you set out" title="Be ready for your experience">
        <BodyText>
          Requirements vary by activity and location. Follow your guide&apos;s current instructions
          and check your booking details before travelling.
        </BodyText>
        {preparationTips.map((tip) => (
          <Card key={tip.title} title={tip.title} body={tip.body} />
        ))}
      </Section>

      <Section eyebrow="Leave the outdoors better" title="Respect the places we explore">
        <Card
          title="Travel responsibly"
          body="Access rules can vary by location. Your guide will share the relevant guidance for your activity."
          image={require('../assets/site-images/coastal-trail.png')}
          imageDescription="A marked coastal route through the natural landscape"
        />
        <BulletList
          items={[
            'Follow your guide and stay on permitted routes.',
            'Take your rubbish with you and avoid disturbing wildlife or plants.',
            'Respect other visitors, local communities, and site access rules.',
            'Use water and other resources thoughtfully during your visit.',
          ]}
        />
      </Section>

      <Section title="Have a question before booking?">
        <BodyText>
          Contact us about activity requirements, accessibility needs, or current conditions.
        </BodyText>
        <ActionButton label="Contact our team" route="/contact" />
        <ActionButton label="Review activities" route="/activities" />
      </Section>
    </PageLayout>
  );
}
