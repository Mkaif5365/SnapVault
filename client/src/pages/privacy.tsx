import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center gap-2" 
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: June 15, 2023</p>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
          <p>
            At SnapVault, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you 
            use our application.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p>We collect several types of information from and about users of our application, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Information:</strong> Email address, name, and other details you provide 
              when creating an account or profile.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our application, including 
              events created, photos taken, and interaction with features.
            </li>
            <li>
              <strong>Device Information:</strong> Information about the device you use to access our 
              application, including device type, operating system, and browser type.
            </li>
            <li>
              <strong>Photos and Content:</strong> Images and other content you upload or create within 
              the application.
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Develop new products and services</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize your experience</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing and Disclosure</h2>
          <p>We may share your information in the following situations:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>With Event Participants:</strong> Photos and content shared within an event are 
              visible to other participants of that event.
            </li>
            <li>
              <strong>Service Providers:</strong> We may share your information with third-party vendors 
              who provide services on our behalf.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your information if required by law 
              or in response to valid requests by public authorities.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, 
              financing, or acquisition of all or a portion of our business.
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share your information for any other purpose 
              disclosed by us when you provide your consent.
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, 
            no method of transmission over the Internet or electronic storage is 100% secure, and we 
            cannot guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access your personal information</li>
            <li>The right to rectify inaccurate information</li>
            <li>The right to request deletion of your information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
          <p>
            Our application is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you are a parent or guardian and 
            believe your child has provided us with personal information, please contact us.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            <a href="mailto:punisherkaif@gmail.com" className="text-primary hover:underline">
              punisherkaif@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 