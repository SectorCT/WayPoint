import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Document Header */}
      <section className="pt-32 pb-12 bg-slate-50 border-b-2 border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 text-center">
            TERMS OF SERVICE
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
            
            {/* 1. Acceptance of Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                1. ACCEPTANCE OF TERMS
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms of Service ("Terms," "Agreement") constitute a legally binding agreement between you 
                ("User," "you," or "your") and WayPoint, Inc. ("WayPoint," "we," "us," or "our") governing your 
                access to and use of the WayPoint logistics management system, including our mobile application, 
                web dashboard, API services, and any related services (collectively, the "Services").
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                BY ACCESSING OR USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE 
                BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, YOU MAY NOT ACCESS OR USE THE SERVICES.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are entering into this Agreement on behalf of a company or other legal entity, you represent 
                that you have the authority to bind such entity to these Terms, and "you" shall refer to such entity.
              </p>
            </div>

            {/* 2. Service Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                2. SERVICE DESCRIPTION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint provides a comprehensive logistics management platform designed to optimize delivery operations, 
                fleet management, and supply chain coordination. The Services include, but are not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Mobile Application:</strong> Cross-platform mobile applications for delivery personnel 
                and logistics managers, available on iOS and Android platforms</li>
                <li><strong>Web Dashboard:</strong> Administrative web interface providing real-time visibility, 
                analytics, and operational controls</li>
                <li><strong>API Services:</strong> RESTful API for integration with third-party systems, including 
                ERP and CRM platforms</li>
                <li><strong>Route Optimization:</strong> Advanced routing and scheduling algorithms utilizing 
                OSRM (Open Source Routing Machine) technology</li>
                <li><strong>Real-time Tracking:</strong> GPS-based tracking, geofencing, and delivery status monitoring</li>
                <li><strong>Fleet Management:</strong> Vehicle tracking, capacity management, and driver assignment</li>
                <li><strong>Analytics and Reporting:</strong> Performance metrics, operational insights, and 
                customizable reports</li>
              </ul>
            </div>

            {/* 3. Account Registration and Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                3. ACCOUNT REGISTRATION AND SECURITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.1 Account Creation
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                To access the Services, you must create an account by providing accurate, current, and complete 
                information as requested in the registration process. You agree to maintain and promptly update 
                your account information to ensure its accuracy.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.2 Account Security
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Use a strong, unique password for your account</li>
                <li>Enable multi-factor authentication when available</li>
                <li>Immediately notify WayPoint of any unauthorized access or security breach</li>
                <li>Not share your account credentials with third parties</li>
                <li>Log out from your account at the end of each session</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                3.3 Account Termination
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint reserves the right to suspend or terminate your account at any time, with or without notice, 
                for violation of these Terms, illegal activity, fraud, or any other reason at our sole discretion.
              </p>
            </div>

            {/* 4. Acceptable Use Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                4. ACCEPTABLE USE POLICY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.1 Permitted Use
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may use the Services solely for lawful business purposes in accordance with these Terms. 
                You agree to comply with all applicable federal, state, local, and international laws and regulations.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                4.2 Prohibited Activities
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Use the Services for any illegal purpose or in violation of any applicable laws</li>
                <li>Attempt to gain unauthorized access to any portion of the Services or any other systems or networks</li>
                <li>Interfere with or disrupt the integrity or performance of the Services</li>
                <li>Introduce viruses, malware, or other malicious code</li>
                <li>Scrape, data mine, or use automated tools to access the Services without authorization</li>
                <li>Reverse engineer, decompile, or disassemble any component of the Services</li>
                <li>Remove, obscure, or alter any proprietary notices on the Services</li>
                <li>Use the Services to infringe upon intellectual property rights of others</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Harass, abuse, or harm other users of the Services</li>
                <li>Resell, sublicense, or transfer the Services without prior written consent</li>
              </ul>
            </div>

            {/* 5. Intellectual Property Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                5. INTELLECTUAL PROPERTY RIGHTS
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.1 WayPoint Property
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Services, including all software, technology, content, trademarks, service marks, and trade names, 
                are the exclusive property of WayPoint or its licensors and are protected by copyright, trademark, 
                patent, trade secret, and other intellectual property laws. No rights are granted to you except as 
                expressly set forth in these Terms.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.2 Limited License
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Subject to these Terms, WayPoint grants you a limited, non-exclusive, non-transferable, 
                non-sublicensable, revocable license to access and use the Services for your internal business 
                purposes during the term of your subscription.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                5.3 User Data
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You retain all rights to data you input into the Services ("User Data"). You grant WayPoint a 
                worldwide, royalty-free license to use, process, store, and transmit User Data solely to provide 
                the Services and as described in our Privacy Policy.
              </p>
            </div>

            {/* 6. Fees and Payment */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                6. FEES AND PAYMENT
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.1 Subscription Fees
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Access to the Services requires payment of subscription fees as specified in your selected pricing 
                plan. All fees are stated in U.S. Dollars unless otherwise specified and are due in advance on a 
                monthly or annual basis as selected.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.2 Payment Terms
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Payment is due upon receipt of invoice or as otherwise specified in your subscription agreement</li>
                <li>You authorize WayPoint to charge your designated payment method for all fees</li>
                <li>All fees are non-refundable except as expressly provided in these Terms or required by law</li>
                <li>Overdue payments will accrue interest at the rate of 1.5% per month or the maximum rate permitted by law</li>
                <li>WayPoint may suspend access to the Services for non-payment after thirty (30) days written notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.3 Fee Changes
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint reserves the right to modify subscription fees with sixty (60) days advance written notice. 
                Continued use of the Services after the effective date of fee changes constitutes acceptance of the 
                new fees.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                6.4 Taxes
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All fees are exclusive of applicable taxes, duties, and governmental charges. You are responsible 
                for payment of all such amounts except for taxes based on WayPoint's income.
              </p>
            </div>

            {/* 7. Service Availability and Support */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                7. SERVICE AVAILABILITY AND SUPPORT
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.1 Service Availability
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint will use commercially reasonable efforts to provide 99.9% uptime for the Services, measured 
                monthly. This uptime commitment excludes scheduled maintenance windows and circumstances beyond 
                WayPoint's reasonable control.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.2 Maintenance
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint may perform scheduled maintenance with advance notice and emergency maintenance as necessary. 
                WayPoint will use reasonable efforts to minimize service disruptions during maintenance windows.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                7.3 Technical Support
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Technical support is provided according to your subscription plan. Support hours, response times, 
                and channels vary by plan level and are detailed in your service level agreement.
              </p>
            </div>

            {/* 8. Data Protection and Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                8. DATA PROTECTION AND PRIVACY
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint's collection, use, and protection of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference. By using the Services, you consent to the 
                practices described in the Privacy Policy.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                You are responsible for ensuring that your use of the Services and any User Data complies with 
                applicable data protection laws, including obtaining necessary consents from individuals whose 
                data you process through the Services.
              </p>
            </div>

            {/* 9. Warranties and Disclaimers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                9. WARRANTIES AND DISCLAIMERS
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                9.1 Limited Warranty
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint warrants that the Services will perform materially in accordance with the documentation 
                provided. Your sole remedy for breach of this warranty is, at WayPoint's option, to repair or 
                replace the non-conforming Services or terminate your subscription and refund prepaid fees for 
                the unused portion of your subscription term.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                9.2 Disclaimer
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4 uppercase font-semibold">
                EXCEPT AS EXPRESSLY PROVIDED IN SECTION 9.1, THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" 
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, 
                WAYPOINT DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
                PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE 
                OF TRADE.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint does not warrant that the Services will be uninterrupted, error-free, or completely secure. 
                WayPoint does not warrant the accuracy or completeness of any content or data provided through the 
                Services.
              </p>
            </div>

            {/* 10. Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                10. LIMITATION OF LIABILITY
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                10.1 Exclusion of Damages
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4 uppercase font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WAYPOINT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, 
                BUSINESS INTERRUPTION, OR LOSS OF GOODWILL, ARISING OUT OF OR RELATED TO THESE TERMS OR THE 
                SERVICES, REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, 
                OR OTHERWISE) AND EVEN IF WAYPOINT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                10.2 Liability Cap
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4 uppercase font-semibold">
                WAYPOINT'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES SHALL 
                NOT EXCEED THE TOTAL AMOUNT OF FEES PAID BY YOU TO WAYPOINT IN THE TWELVE (12) MONTHS PRECEDING 
                THE EVENT GIVING RISE TO LIABILITY.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                10.3 Exceptions
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                The limitations in this Section 10 do not apply to (a) liability resulting from WayPoint's gross 
                negligence or willful misconduct, (b) death or personal injury caused by WayPoint's negligence, 
                (c) fraud or fraudulent misrepresentation, or (d) any liability that cannot be excluded or limited 
                by applicable law.
              </p>
            </div>

            {/* 11. Indemnification */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                11. INDEMNIFICATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to indemnify, defend, and hold harmless WayPoint, its affiliates, and their respective 
                officers, directors, employees, agents, and contractors from and against any claims, liabilities, 
                damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Your use or misuse of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Your User Data or any content you submit through the Services</li>
                <li>Your infringement of any third-party rights, including intellectual property rights</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint reserves the right to assume exclusive defense and control of any matter subject to 
                indemnification by you, and you agree to cooperate with WayPoint's defense of such claims.
              </p>
            </div>

            {/* 12. Term and Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                12. TERM AND TERMINATION
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.1 Term
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms commence on the date you first access the Services and continue until terminated as 
                provided herein. Your subscription term is specified in your pricing plan and will automatically 
                renew for successive periods of the same duration unless either party provides notice of 
                non-renewal at least thirty (30) days before the end of the then-current term.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.2 Termination for Convenience
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may terminate your subscription at any time by providing written notice to WayPoint. Termination 
                will be effective at the end of your then-current subscription term. No refunds will be provided 
                for early termination except as required by law.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.3 Termination for Cause
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Either party may terminate these Terms immediately upon written notice if the other party materially 
                breaches these Terms and fails to cure such breach within thirty (30) days of receiving written notice.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                12.4 Effect of Termination
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Upon termination: (a) your right to access and use the Services will immediately cease; (b) you will 
                remain liable for all fees and charges incurred through the termination date; (c) WayPoint will make 
                your User Data available for export for thirty (30) days, after which WayPoint may delete all User Data.
              </p>
            </div>

            {/* 13. Dispute Resolution */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                13. DISPUTE RESOLUTION
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                13.1 Informal Resolution
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Before initiating formal proceedings, the parties agree to attempt to resolve any dispute through 
                informal negotiation. Either party may initiate negotiation by providing written notice describing 
                the dispute to the other party.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                13.2 Arbitration
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If informal negotiation does not resolve the dispute within thirty (30) days, any dispute arising out 
                of or relating to these Terms shall be resolved through binding arbitration administered by the 
                American Arbitration Association ("AAA") in accordance with its Commercial Arbitration Rules. The 
                arbitration shall be conducted by a single arbitrator in San Francisco, California, and the arbitrator's 
                decision shall be final and binding.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                13.3 Class Action Waiver
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4 uppercase font-semibold">
                YOU AND WAYPOINT AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL 
                CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                13.4 Exceptions
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Either party may seek injunctive or other equitable relief in any court of competent jurisdiction to 
                prevent infringement of intellectual property rights or breach of confidentiality obligations.
              </p>
            </div>

            {/* 14. General Provisions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                14. GENERAL PROVISIONS
              </h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.1 Governing Law
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, 
                United States, without regard to its conflict of law provisions. The United Nations Convention on 
                Contracts for the International Sale of Goods shall not apply.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.2 Entire Agreement
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms, together with the Privacy Policy and any executed service agreements, constitute the 
                entire agreement between you and WayPoint regarding the Services and supersede all prior agreements 
                and understandings, whether written or oral.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.3 Amendments
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                WayPoint may modify these Terms at any time by posting the modified Terms on our website and updating 
                the "Last Updated" date. Material changes will be notified to you via email or through the Services. 
                Your continued use of the Services after such notification constitutes acceptance of the modified Terms.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.4 Assignment
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may not assign or transfer these Terms or any rights hereunder without WayPoint's prior written 
                consent. WayPoint may assign these Terms without restriction. Any attempted assignment in violation 
                of this provision is void.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.5 Severability
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If any provision of these Terms is found to be invalid or unenforceable, that provision shall be 
                limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain 
                in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.6 Waiver
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                No waiver of any provision of these Terms shall be deemed a further or continuing waiver of such 
                provision or any other provision. WayPoint's failure to enforce any right or provision of these 
                Terms shall not constitute a waiver of such right or provision.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.7 Force Majeure
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Neither party shall be liable for any failure or delay in performance due to circumstances beyond 
                its reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, 
                or governmental actions.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                14.8 Export Compliance
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to comply with all applicable export and import laws and regulations. You represent that 
                you are not located in, under the control of, or a national or resident of any country to which 
                the United States has embargoed goods.
              </p>
            </div>

            {/* 15. Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-300">
                15. CONTACT INFORMATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For questions or concerns regarding these Terms of Service, please contact:
              </p>
              <div className="bg-slate-50 p-6 rounded border border-slate-200 mb-4">
                <p className="text-slate-700 mb-2"><strong>WayPoint, Inc.</strong></p>
                <p className="text-slate-700 mb-2">Legal Department</p>
                <p className="text-slate-700 mb-2">Email: legal@waypoint.com</p>
                <p className="text-slate-700 mb-2">Phone: +1 (555) 123-4567</p>
                <p className="text-slate-700">Address: 123 Logistics Way, San Francisco, CA 94105, United States</p>
              </div>
            </div>

            {/* Footer Statement */}
            <div className="mt-12 pt-8 border-t-2 border-slate-300">
              <p className="text-sm text-slate-600 text-center">
                These Terms of Service were last updated on September 1, 2025 and are effective as of that date.
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

export default TermsOfService;
