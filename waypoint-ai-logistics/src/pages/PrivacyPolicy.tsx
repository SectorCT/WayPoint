import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Document Header */}
      <section className="pt-32 pb-12 bg-slate-50 border-b-2 border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 text-center">
            PRIVACY POLICY
          </h1>
          <div className="text-center text-sm text-slate-600 space-y-1">
            <p>WayPoint Logistics Management System</p>
            <p>Effective Date: September 1, 2025</p>
            <p>Last Updated: September 1, 2025</p>
          </div>
        </div>
      </section>

      {/* Document Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-slate max-w-none">
            
            {/* 1. Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                1. INTRODUCTION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Privacy Policy ("Policy") describes how WayPoint, Inc. ("WayPoint," "we," "us," or "our") collects, 
                uses, discloses, and protects personal information obtained through our logistics management system, 
                including our mobile application, web dashboard, and API services (collectively, the "Services").
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                By accessing or using our Services, you acknowledge that you have read, understood, and agree to be 
                bound by this Privacy Policy. If you do not agree with this Policy, please do not use our Services.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                2. INFORMATION WE COLLECT
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We collect the following categories of personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, company name, business address, 
                and other information you provide during account registration.</li>
                <li><strong>User Profile:</strong> Role designation (Manager/Trucker), employee ID, verification status, 
                company affiliation, and organizational hierarchy information.</li>
                <li><strong>Authentication Data:</strong> Login credentials, password (encrypted), security questions, 
                session tokens, and device authentication information.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                2.2 Operational Data
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Package Information:</strong> Delivery addresses, recipient names and contact information, 
                package dimensions and weight, delivery instructions, package status, and delivery confirmation data 
                including digital signatures.</li>
                <li><strong>Fleet Data:</strong> Vehicle identification numbers, license plate numbers, truck capacity 
                specifications, maintenance records, availability status, and driver assignments.</li>
                <li><strong>Location Data:</strong> Real-time GPS coordinates, delivery routes, geofenced office locations, 
                tracking information, route history, and movement patterns.</li>
                <li><strong>Performance Metrics:</strong> Delivery completion times, route efficiency measurements, 
                cost analysis data, and operational statistics.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                2.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Device Information:</strong> Device type, operating system version, unique device identifiers, 
                mobile network information, browser type and version.</li>
                <li><strong>Usage Analytics:</strong> Application usage patterns, feature utilization statistics, 
                session duration, user interaction data.</li>
                <li><strong>Log Data:</strong> Server logs, error reports, API request logs, system performance data, 
                security event logs.</li>
              </ul>
            </div>

            {/* 3. How We Use Your Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                3. HOW WE USE YOUR INFORMATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We use the collected information for the following purposes:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.1 Service Provision
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Account creation, authentication, and management</li>
                <li>Processing and managing delivery operations</li>
                <li>Route optimization and navigation services</li>
                <li>Real-time tracking and status updates</li>
                <li>Performance analytics and reporting</li>
                <li>Customer support and technical assistance</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.2 Communication
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Service-related notifications and updates</li>
                <li>Delivery status alerts and confirmations</li>
                <li>System maintenance announcements</li>
                <li>Account security notifications</li>
                <li>Marketing communications (with consent where required)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.3 System Improvement and Security
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Performance monitoring and optimization</li>
                <li>Feature development and enhancement</li>
                <li>Security threat detection and prevention</li>
                <li>Fraud prevention and investigation</li>
                <li>Compliance with legal obligations</li>
              </ul>
            </div>

            {/* 4. Data Sharing and Disclosure */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                4. DATA SHARING AND DISCLOSURE
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.1 Within Your Organization
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Information is shared with authorized users within your organization according to role-based access controls.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.2 Service Providers
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We engage third-party service providers to perform functions on our behalf, including cloud hosting, 
                data analytics, payment processing, and customer support. These providers have access to personal 
                information only as necessary to perform their functions and are contractually obligated to maintain 
                confidentiality and security.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.3 Legal Requirements
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may disclose information when required by law, regulation, legal process, or governmental request, 
                or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.4 Business Transfers
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a merger, acquisition, reorganization, or sale of assets, your information may be 
                transferred as part of that transaction. We will provide notice before your information is transferred 
                and becomes subject to a different privacy policy.
              </p>
            </div>

            {/* 5. Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                5. DATA SECURITY
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Encryption of data in transit and at rest using industry-standard protocols (TLS 1.3, AES-256)</li>
                <li>Multi-factor authentication for user accounts</li>
                <li>Role-based access controls and principle of least privilege</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Secure software development lifecycle practices</li>
                <li>Network security measures including firewalls and intrusion detection systems</li>
                <li>Employee security training and confidentiality agreements</li>
                <li>Incident response and business continuity plans</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                While we strive to protect your personal information, no method of transmission over the Internet or 
                electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            {/* 6. Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                6. DATA RETENTION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain personal information for as long as necessary to fulfill the purposes outlined in this Policy, 
                unless a longer retention period is required or permitted by law. Specific retention periods include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Active Accounts:</strong> Data is retained for the duration of your active account</li>
                <li><strong>Inactive Accounts:</strong> Data is retained for two (2) years following account deactivation</li>
                <li><strong>Transaction Records:</strong> Retained for seven (7) years for tax and financial compliance</li>
                <li><strong>Log Data:</strong> Retained for ninety (90) days unless required for security investigations</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                Upon expiration of applicable retention periods, we will securely delete or anonymize personal information 
                in accordance with our data retention policies.
              </p>
            </div>

            {/* 7. Your Rights and Choices */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                7. YOUR RIGHTS AND CHOICES
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Subject to applicable law, you have the following rights regarding your personal information:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.1 Access and Portability
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may request access to your personal information and receive a copy in a structured, commonly used, 
                machine-readable format.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.2 Correction and Update
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may request correction of inaccurate personal information and update your account information 
                through the Services.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.3 Deletion
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may request deletion of your personal information, subject to certain legal exceptions such as 
                compliance with legal obligations or resolution of disputes.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.4 Restriction and Objection
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may request restriction of processing or object to processing of your personal information in 
                certain circumstances.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.5 Withdrawal of Consent
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Where processing is based on consent, you may withdraw consent at any time without affecting the 
                lawfulness of processing based on consent before its withdrawal.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4 mt-6">
                To exercise these rights, please contact us at privacy@waypoint.com. We will respond to your request 
                within thirty (30) days or as otherwise required by applicable law.
              </p>
            </div>

            {/* 8. International Data Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                8. INTERNATIONAL DATA TRANSFERS
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have data protection laws that differ from those in your country. We ensure that 
                such transfers comply with applicable data protection laws through appropriate safeguards, including 
                Standard Contractual Clauses approved by relevant authorities.
              </p>
            </div>

            {/* 9. Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                9. CHILDREN'S PRIVACY
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our Services are not directed to individuals under the age of eighteen (18). We do not knowingly collect 
                personal information from children. If we become aware that we have collected personal information from 
                a child without parental consent, we will take steps to delete such information.
              </p>
            </div>

            {/* 10. Changes to This Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                10. CHANGES TO THIS PRIVACY POLICY
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting 
                the updated Policy on our website and updating the "Last Updated" date. Your continued use of the 
                Services after such notification constitutes acceptance of the updated Policy.
              </p>
            </div>

            {/* 11. Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                11. CONTACT INFORMATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact:
              </p>
              <div className="bg-slate-50 p-6 rounded border border-slate-200 mb-4">
                <p className="text-slate-700 mb-2"><strong>WayPoint, Inc.</strong></p>
                <p className="text-slate-700 mb-2">Privacy Officer</p>
                <p className="text-slate-700 mb-2">Email: privacy@waypoint.com</p>
                <p className="text-slate-700 mb-2">Phone: +1 (555) 123-4567</p>
                <p className="text-slate-700">Address: 123 Logistics Way, San Francisco, CA 94105, United States</p>
              </div>
            </div>

            {/* 12. Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                12. GOVERNING LAW AND JURISDICTION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Privacy Policy shall be governed by and construed in accordance with the laws of the State of 
                California, United States, without regard to its conflict of law provisions. Any disputes arising from 
                or relating to this Policy shall be subject to the exclusive jurisdiction of the courts located in 
                San Francisco County, California.
              </p>
            </div>

            {/* Footer Statement */}
            <div className="mt-12 pt-8 border-t-2 border-slate-300">
              <p className="text-sm text-slate-600 text-center">
                This Privacy Policy was last updated on September 1, 2025 and is effective as of that date.
              </p>
              <p className="text-sm text-slate-600 text-center mt-2">
                © 2025 WayPoint, Inc. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
