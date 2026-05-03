import React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Section,
  Hr,
  Preview,
} from '@react-email/components';

interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactEmail: React.FC<Readonly<ContactEmailProps>> = ({
  name,
  email,
  subject,
  message,
}) => (
  <Html>
    <Head />
    <Preview>New Message from TripNext Contact Form</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New Message Received</Heading>
        <Text style={paragraph}>You have a new submission from your website&apos;s contact form.</Text>
        <Hr style={hr} />
        <Section>
          <Text><strong>From:</strong> {name}</Text>
          <Text><strong>Email:</strong> {email}</Text>
          <Text><strong>Subject:</strong> {subject}</Text>
        </Section>
        <Heading as="h2" style={subHeading}>Message:</Heading>
        <Text style={messageBox}>{message}</Text>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#111111',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  color: '#ffffff',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '30px',
};

const subHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginTop: '20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#cccccc',
};

const messageBox = {
  border: '1px solid #333333',
  borderRadius: '5px',
  padding: '20px',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
};

const hr = {
  borderColor: '#333333',
  margin: '20px 0',
};