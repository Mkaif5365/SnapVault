import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
      
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: June 15, 2023</p>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
          <p>
            Welcome to SnapVault. These Terms of Service ("Terms") govern your access to and use of 
            the SnapVault application, including any content, functionality, and services offered on 
            or through the application.
          </p>
          <p>
            By accessing or using our application, you agree to be bound by these Terms. If you do not 
            agree to these Terms, you must not access or use the application.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current 
            information. You are responsible for safeguarding your account and for all activities that 
            occur under your account.
          </p>
          <p>
            You agree to notify us immediately of any unauthorized access to or use of your account. 
            We cannot and will not be liable for any loss or damage arising from your failure to comply 
            with this section.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">User Content</h2>
          <p>
            Our application allows you to create, upload, and share content, including photos and text 
            ("User Content"). You retain all rights to your User Content, but you grant us a non-exclusive, 
            transferable, sub-licensable, royalty-free, worldwide license to use, modify, publicly display, 
            and distribute such User Content on and through the application.
          </p>
          <p>
            You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You own or have the necessary rights to your User Content</li>
            <li>Your User Content does not violate the privacy rights, publicity rights, copyrights, 
                contract rights, or any other rights of any person or entity</li>
            <li>Your User Content does not contain any material that is defamatory, obscene, indecent, 
                abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Uses</h2>
          <p>
            You may use our application only for lawful purposes and in accordance with these Terms. 
            You agree not to use the application:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including 
                any "junk mail," "chain letter," "spam," or any other similar solicitation</li>
            <li>To impersonate or attempt to impersonate another user or person</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of 
                the application, or which may harm us or users of the application</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
          <p>
            The application and its entire contents, features, and functionality (including but not limited 
            to all information, software, text, displays, images, video, and audio, and the design, selection, 
            and arrangement thereof) are owned by us, our licensors, or other providers of such material and 
            are protected by copyright, trademark, patent, trade secret, and other intellectual property or 
            proprietary rights laws.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
          <p>
            We may terminate or suspend your account and access to the application immediately, without prior 
            notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </p>
          <p>
            Upon termination, your right to use the application will immediately cease. If you wish to terminate 
            your account, you may simply discontinue using the application or contact us to request account deletion.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Disclaimer of Warranties</h2>
          <p>
            The application is provided on an "as is" and "as available" basis, without any warranties of any kind, 
            either express or implied. We disclaim all warranties, including but not limited to implied warranties 
            of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
          <p>
            In no event will we, our affiliates, or their licensors, service providers, employees, agents, officers, 
            or directors be liable for damages of any kind, under any legal theory, arising out of or in connection 
            with your use, or inability to use, the application, including any direct, indirect, special, incidental, 
            consequential, or punitive damages.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
            we operate, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
          <p>
            We may revise and update these Terms from time to time at our sole discretion. All changes are effective 
            immediately when we post them. Your continued use of the application following the posting of revised Terms 
            means that you accept and agree to the changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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